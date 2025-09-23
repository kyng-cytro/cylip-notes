import { Editor, Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import { convertToEditorJSON } from "~/lib/marked";

export interface AIProvider {
  permissions?: {
    refine?: boolean;
    suggest?: boolean;
  };
  onError?: (action: string, message: string) => void;
  getSuggestion: (text: string) => Promise<string | null>;
  refine: (text: string, mode: string) => Promise<string | null>;
}

declare module "@tiptap/core" {
  interface Editor {
    ai: {
      accept: () => boolean;
      suggest: () => boolean;
      discard: () => boolean;
      refine: (mode: string) => boolean;
    };
  }
  interface Commands<ReturnType> {
    accept: {
      accept: () => ReturnType;
    };
    discard: {
      discard: () => ReturnType;
    };
    suggest: {
      suggest: () => ReturnType;
    };
    refine: {
      refine: (mode: string) => ReturnType;
    };
  }
}

const setDecorations = ({
  editor,
  storage,
  decorations,
}: {
  editor: Editor;
  storage: any;
  decorations: Decoration[];
}) => (
  (storage.decorations = DecorationSet.create(editor.state.doc, decorations)),
  editor.view.dispatch(
    editor.state.tr.setMeta(storage.key, storage.decorations),
  )
);

const clearDecorations = ({
  editor,
  storage,
}: {
  editor: Editor;
  storage: any;
}) => setDecorations({ editor, storage, decorations: [] });

const safeCall = async ({
  action,
  provider,
  run,
  clearDecorations,
}: {
  action: string;
  provider: AIProvider;
  run: () => Promise<void>;
  clearDecorations?: () => void;
}) => {
  try {
    await run();
  } catch (e: any) {
    provider.onError?.(action, e.data.message ?? String(e));
    clearDecorations?.();
  }
};

const createLoadingWidget = (
  opts:
    | { type: "inline"; from: number; to: number }
    | { type: "widget"; from: number },
) => {
  switch (opts.type) {
    case "inline":
      return Decoration.inline(opts.from, opts.to, {
        nodeName: "span",
        class: "opacity-50 rainbow-animation",
      });
    case "widget":
      return Decoration.widget(opts.from, () => {
        const span = document.createElement("span");
        span.innerText = "getting suggestion...";
        span.classList.add(
          "ml-.5",
          "opacity-50",
          "rainbow-animation",
          "pointer-events-none",
        );
        return span;
      });
  }
};

const createSuggestionWidget = ({
  from,
  text,
}: {
  from: number;
  text: string;
}) => {
  return Decoration.widget(from, () => {
    const span = document.createElement("span");
    span.classList.add("ml-.5", "rainbow-animation", "pointer-events-none");
    span.innerText = text + " ↹";
    return span;
  });
};

export const AI = Extension.create<{ provider: AIProvider }>({
  name: "ai",
  addStorage: () => ({
    loading: false,
    suggestion: "",
    key: new PluginKey("ai"),
    decorations: DecorationSet.empty,
  }),
  addOptions: () => ({
    provider: {
      permissions: { refine: true, suggest: true },
      getSuggestion: async () => null,
      refine: async (text) => text,
    },
  }),
  addCommands() {
    return {
      suggest:
        () =>
        ({ editor, dispatch }) => {
          const { from } = editor.state.selection;
          const text = editor.state.doc.textBetween(0, from, " ");
          const can =
            !!this.options.provider.permissions?.suggest &&
            hasEnoughContent(text);
          if (!dispatch) return can;
          if (!can) {
            this.options.provider.onError?.(
              "suggest",
              "Suggestion is disabled or the content is too short",
            );
            return false;
          }
          this.storage.loading = true;
          setDecorations({
            editor,
            storage: this.storage,
            decorations: [createLoadingWidget({ type: "widget", from })],
          });
          safeCall({
            action: "suggest",
            provider: this.options.provider,
            run: async () => {
              const suggestion =
                await this.options.provider.getSuggestion(text);
              if (!suggestion) {
                this.storage.suggestion = "";
                clearDecorations({ editor, storage: this.storage });
                this.options.provider.onError?.(
                  "suggest",
                  "Couldn't suggest a continuation. Keep typing for more context.",
                );
                return;
              }
              this.storage.suggestion = suggestion;
              setDecorations({
                editor,
                storage: this.storage,
                decorations: [
                  createSuggestionWidget({ from, text: suggestion }),
                ],
              });
            },
            clearDecorations: () =>
              clearDecorations({ editor, storage: this.storage }),
          }).finally(() => {
            this.storage.loading = false;
            editor.commands.focus();
          });
          return true;
        },
      accept:
        () =>
        ({ editor, dispatch }) => {
          const can = !!this.storage.suggestion;
          if (!dispatch) return can;
          if (!can) return false;
          const suggestion = this.storage.suggestion;
          this.storage.suggestion = "";
          clearDecorations({ editor, storage: this.storage });
          // HACK: to make sure it's set in the next tick
          setTimeout(
            () =>
              editor
                .chain()
                .focus()
                .insertContent(convertToEditorJSON(suggestion))
                .run(),
            0,
          );
          return true;
        },
      discard:
        () =>
        ({ editor, dispatch }) => {
          const can = !!this.storage.suggestion;
          if (!dispatch) return can;
          if (!can) return false;
          this.storage.suggestion = "";
          clearDecorations({ editor, storage: this.storage });
          return true;
        },
      refine:
        (mode: string) =>
        ({ editor, dispatch }) => {
          const { from, to } = editor.state.selection;
          const text = editor.state.doc.textBetween(from, to, " ");
          const can =
            !!this.options.provider.permissions?.refine &&
            from !== to &&
            hasEnoughContent(text);
          if (!dispatch) return can;
          if (!can) {
            this.options.provider.onError?.(
              "refine",
              "Refinement is disabled or the content is too short",
            );
            return false;
          }
          this.storage.loading = true;
          setDecorations({
            editor,
            storage: this.storage,
            decorations: [createLoadingWidget({ type: "inline", from, to })],
          });
          safeCall({
            action: "refine",
            provider: this.options.provider,
            run: async () => {
              const refined = await this.options.provider.refine(text, mode);
              if (!refined) {
                return this.options.provider.onError?.(
                  "refine",
                  "Couldn't refine the text. Please try again.",
                );
              }
              editor
                .chain()
                .focus()
                .insertContent(convertToEditorJSON(refined))
                .run();
            },
          }).finally(() => {
            this.storage.loading = false;
            clearDecorations({ editor, storage: this.storage });
          });
          return true;
        },
    };
  },
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: this.storage.key,
        props: {
          editable: () => !this.storage.loading,
          decorations: () => this.storage.decorations,
        },
      }),
    ];
  },
  addKeyboardShortcuts() {
    return {
      Tab: () => this.editor.commands.accept(),
      Escape: () => this.editor.commands.discard(),
      "Mod-Space": () => this.editor.commands.suggest(),
      "Mod-Alt-r": () => this.editor.commands.refine("refine"),
      "Mod-Alt-f": () => this.editor.commands.refine("formal"),
      "Mod-Alt-s": () => this.editor.commands.refine("shorten"),
      "Mod-Alt-l": () => this.editor.commands.refine("lengthen"),
    };
  },
  onCreate() {
    this.editor.ai = {
      accept: () => this.editor.commands.accept(),
      discard: () => this.editor.commands.discard(),
      suggest: () => this.editor.commands.suggest(),
      refine: (mode: string) => this.editor.commands.refine(mode),
    };
  },
});
