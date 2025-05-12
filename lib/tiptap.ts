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
import StarterKit from "@tiptap/starter-kit";
import { DOMSerializer } from "prosemirror-model";

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
];
