import { markdownToHTML } from "@/lib/marked";
import { hasEnoughContent } from "@/utils/helpers";
import { Editor, Extension, type JSONContent } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import { renderToMarkdown } from "@tiptap/static-renderer/pm/markdown";
import { extensions } from "..";

export interface AIProvider {
  permissions?: { refine?: boolean; suggest?: boolean };
  onError?: (action: string, message: string) => void;
  getSuggestion: (text: string) => Promise<string | null>;
  refine: (text: string, mode: string) => Promise<string | null>;
}

type Storage = {
  loading: boolean;
  suggestion: string;
  key: PluginKey;
  decorations: DecorationSet;
};

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    ai: {
      accept: () => ReturnType;
      discard: () => ReturnType;
      suggest: () => ReturnType;
      refine: (mode: string) => ReturnType;
    };
  }
}

const toMarkdown = (content: JSONContent) =>
  renderToMarkdown({ content, extensions });

const errorMessage = (error: any) =>
  error?.data?.message ?? error?.message ?? String(error);

const showDecorations = (
  editor: Editor,
  storage: Storage,
  decorations: Decoration[],
) => {
  storage.decorations = DecorationSet.create(editor.state.doc, decorations);
  editor.view.dispatch(
    editor.state.tr.setMeta(storage.key, storage.decorations),
  );
};

const clearDecorations = (editor: Editor, storage: Storage) =>
  showDecorations(editor, storage, []);

const hintElement = (text: string, classes: string[]) => {
  const span = document.createElement("span");
  span.innerText = text;
  span.classList.add(
    "ai-hint",
    "ml-.5",
    "rainbow-animation",
    "pointer-events-none",
    ...classes,
  );
  return span;
};

const loadingWidget = (from: number) =>
  Decoration.widget(from, () =>
    hintElement("getting suggestion...", ["opacity-50"]),
  );

const loadingSelection = (from: number, to: number) =>
  Decoration.inline(from, to, {
    nodeName: "span",
    class: "opacity-50 rainbow-animation",
  });

const suggestionWidget = (from: number, text: string) =>
  Decoration.widget(from, () => hintElement(`${text} ↹`, []));

const insertMarkdown = (editor: Editor, markdown: string) =>
  editor.chain().focus().insertContent(markdownToHTML(markdown)).run();

const withLeadingSpace = (editor: Editor, from: number, text: string) => {
  const previous = editor.state.doc.textBetween(Math.max(0, from - 1), from);
  return /\S/.test(previous) && /^\w/.test(text) ? ` ${text}` : text;
};

export const AI = Extension.create<{ provider: AIProvider }, Storage>({
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
    const { provider } = this.options;
    const storage = this.storage;

    const run = async (
      editor: Editor,
      action: string,
      task: () => Promise<void>,
    ) => {
      storage.loading = true;
      try {
        await task();
      } catch (error) {
        provider.onError?.(action, errorMessage(error));
        clearDecorations(editor, storage);
      } finally {
        storage.loading = false;
      }
    };

    const fetchSuggestion = async (
      editor: Editor,
      from: number,
      text: string,
    ) => {
      const suggestion = await provider.getSuggestion(text);
      storage.suggestion = suggestion
        ? withLeadingSpace(editor, from, suggestion)
        : "";
      if (!suggestion) {
        clearDecorations(editor, storage);
        provider.onError?.(
          "suggest",
          "Couldn't suggest a continuation. Keep typing for more context.",
        );
        return;
      }
      showDecorations(editor, storage, [
        suggestionWidget(from, storage.suggestion),
      ]);
    };

    const fetchRefinement = async (
      editor: Editor,
      text: string,
      mode: string,
    ) => {
      const refined = await provider.refine(text, mode);
      clearDecorations(editor, storage);
      if (!refined) {
        provider.onError?.(
          "refine",
          "Couldn't refine the text. Please try again.",
        );
        return;
      }
      insertMarkdown(editor, refined);
    };

    return {
      suggest:
        () =>
        ({ editor, dispatch }) => {
          const { from } = editor.state.selection;
          const text = toMarkdown(editor.state.doc.toJSON());
          const allowed =
            !!provider.permissions?.suggest && hasEnoughContent(text);
          if (!dispatch) return allowed;
          if (!allowed) {
            provider.onError?.(
              "suggest",
              "Suggestion is disabled or the content is too short",
            );
            return false;
          }
          showDecorations(editor, storage, [loadingWidget(from)]);
          run(editor, "suggest", () =>
            fetchSuggestion(editor, from, text),
          ).finally(() => editor.commands.focus());
          return true;
        },
      accept:
        () =>
        ({ editor, dispatch }) => {
          const { suggestion } = storage;
          if (!dispatch || !suggestion) return !!suggestion;
          storage.suggestion = "";
          clearDecorations(editor, storage);
          setTimeout(() => insertMarkdown(editor, suggestion));
          return true;
        },
      discard:
        () =>
        ({ editor, dispatch }) => {
          if (!dispatch || !storage.suggestion) return !!storage.suggestion;
          storage.suggestion = "";
          clearDecorations(editor, storage);
          return true;
        },
      refine:
        (mode: string) =>
        ({ editor, dispatch }) => {
          const { from, to } = editor.state.selection;
          const text = toMarkdown(editor.state.doc.cut(from, to).toJSON());
          const allowed =
            !!provider.permissions?.refine &&
            from !== to &&
            hasEnoughContent(text);
          if (!dispatch) return allowed;
          if (!allowed) {
            provider.onError?.(
              "refine",
              "Refinement is disabled or the content is too short",
            );
            return false;
          }
          showDecorations(editor, storage, [loadingSelection(from, to)]);
          run(editor, "refine", () => fetchRefinement(editor, text, mode));
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
});
