import lowlight from "@/lib/lowlight";
import { CodeBlock, MarkDownCopy } from "@/lib/tiptap/custom-extensions";
import NodeRange from "@tiptap-pro/extension-node-range";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import Underline from "@tiptap/extension-underline";
import StarterKit from "@tiptap/starter-kit";

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
  CodeBlock.configure({
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
