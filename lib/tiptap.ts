import lowlight from "@/lib/lowlight";
import { convertToMarkDown } from "@/lib/turndown";
import NodeRange from "@tiptap-pro/extension-node-range";
import { Extension } from "@tiptap/core";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import Underline from "@tiptap/extension-underline";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import StarterKit from "@tiptap/starter-kit";
import { DOMSerializer } from "prosemirror-model";
import { toast } from "vue-sonner";

const CustomCodeBlock = CodeBlockLowlight.extend({
  addKeyboardShortcuts() {
    return {
      Tab: ({ editor }) => {
        if (editor.isActive("codeBlock")) {
          return editor.commands.insertContent("\t");
        }
        return false;
      },
    };
  },
});

const MarkDownCopy = Extension.create({
  name: "markDownCopy",
  onCreate() {
    const { editor } = this;
    editor.view.dom.addEventListener("copy", (event) => {
      const { state } = editor;
      const { selection } = state;
      if (selection.empty) return;
      event.preventDefault();
      const slice = selection.content();
      const fragment = DOMSerializer.fromSchema(state.schema).serializeFragment(
        slice.content,
      );
      const div = document.createElement("div");
      div.appendChild(fragment);
      const html = div.innerHTML;
      event.clipboardData?.setData("text/plain", convertToMarkDown(html));
    });
  },
});

export interface AIProvider {
  onError?(feature: string, message: string): void;
  getSuggestion(text: string): Promise<string | null>;
  refine(text: string, mode: string): Promise<string>;
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

const AIExtension = Extension.create<{
  provider: AIProvider;
}>({
  name: "aiExtension",
  addStorage() {
    return {
      suggestion: "",
      decorations: DecorationSet.empty,
      key: new PluginKey("aiExtension"),
    };
  },
  addOptions() {
    return {
      provider: {
        async getSuggestion(_text: string) {
          return null;
        },
        async refine(text: string, _mode: string) {
          return text;
        },
      },
    };
  },
  addCommands() {
    return {
      ...this.parent?.(),
      suggest:
        () =>
        ({ editor, dispatch }) => {
          try {
            const { from } = editor.state.selection;
            const text = editor.state.doc.textBetween(0, from, " ");
            const isValid = text.trim().length > 0;
            if (!dispatch) return isValid;
            if (!isValid) return false;
            this.options.provider
              .getSuggestion(text)
              .then((suggestion) => {
                if (!suggestion) {
                  this.storage.suggestion = "";
                  this.storage.decorations = DecorationSet.empty;
                  editor.view.dispatch(
                    editor.state.tr.setMeta(
                      this.storage.key,
                      this.storage.decorations,
                    ),
                  );
                  return false;
                }
                const deco = Decoration.widget(from, () => {
                  const span = document.createElement("span");
                  span.style.opacity = "0.5";
                  span.style.pointerEvents = "none";
                  span.style.marginLeft = "2px";
                  span.innerText = suggestion + " ↹";
                  return span;
                });
                this.storage.suggestion = suggestion;
                this.storage.decorations = DecorationSet.create(
                  editor.state.doc,
                  [deco],
                );
                editor.view.dispatch(
                  editor.state.tr.setMeta(
                    this.storage.key,
                    this.storage.decorations,
                  ),
                );
                return true;
              })
              .catch((error) => {
                this.options.provider.onError?.("suggestion", error);
              });
            return true;
          } catch (e: any) {
            this.options.provider.onError?.("suggestion", e.message);
            return false;
          }
        },
      accept:
        () =>
        ({ editor, dispatch }) => {
          try {
            const isValid = !!this.storage.suggestion;
            if (!dispatch) return isValid;
            if (!isValid) return false;
            const suggestion = this.storage.suggestion;
            this.storage.suggestion = "";
            this.storage.decorations = DecorationSet.empty;
            setTimeout(() => {
              editor.chain().focus().insertContent(suggestion).run();
            }, 0);
            return true;
          } catch (e: any) {
            this.options.provider.onError?.("accept", e.message);
            return false;
          }
        },
      discard:
        () =>
        ({ editor, dispatch }) => {
          try {
            const isValid = !!this.storage.suggestion;
            if (!dispatch) return isValid;
            if (!isValid) return false;
            this.storage.suggestion = "";
            this.storage.decorations = DecorationSet.empty;
            editor.view.dispatch(
              this.editor.state.tr.setMeta(
                this.storage.key,
                this.storage.decorations,
              ),
            );
            return true;
          } catch (e: any) {
            this.options.provider.onError?.("discard", e.message);
            return false;
          }
        },
      refine:
        (mode: string) =>
        ({ editor, dispatch }) => {
          try {
            const { from, to } = editor.state.selection;
            const text = editor.state.doc.textBetween(from, to, " ");
            const isValid = from !== to && text.length > 0;
            if (!dispatch) return isValid;
            if (!isValid) return false;
            this.options.provider
              .refine(text, mode)
              .then((refined) => {
                editor.chain().focus().insertContent(refined).run();
              })
              .catch((error) => {
                this.options.provider.onError?.("refine", error);
              });
            return true;
          } catch (e: any) {
            this.options.provider.onError?.("refine", e.message);
            return false;
          }
        },
    };
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: this.storage.key,
        props: {
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

export const extensions = [
  TaskList,
  Underline,
  MarkDownCopy,
  Highlight.configure({ multicolor: true }),
  TaskItem.configure({
    nested: true,
  }),
  Link.configure({
    linkOnPaste: true,
  }),
  Image.configure({
    HTMLAttributes: {
      "max-height": "300px",
    },
  }),
  CustomCodeBlock.configure({
    lowlight,
  }),
  Placeholder.configure({ placeholder: "Note it down..." }),
  StarterKit.configure({
    horizontalRule: { HTMLAttributes: { class: "bg-primary border-1" } },
    heading: { levels: [4] },
    codeBlock: false,
    history: false,
  }),
  NodeRange.configure({
    key: null,
  }),
  AIExtension.configure({
    provider: {
      async getSuggestion(text) {
        return " sample suggestion";
      },
      async refine(text, mode) {
        return "totally new text";
      },
      onError(feature, message) {
        toast.error(`[${feature}] ${message}`);
      },
    },
  }),
];
