import lowlight from "@/lib/lowlight";
import { CodeBlock, MarkDownCopy } from "@/lib/tiptap/custom-extensions";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import NodeRange from "@tiptap/extension-node-range";
import Placeholder from "@tiptap/extension-placeholder";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import StarterKit from "@tiptap/starter-kit";

export const extensions = [
  TaskList,
  MarkDownCopy,
  Highlight.configure({ multicolor: true }),
  TaskItem.configure({
    nested: true,
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
    undoRedo: false,
    codeBlock: false,
    link: {
      linkOnPaste: true,
    },
    heading: { levels: [4] },
    horizontalRule: { HTMLAttributes: { class: "bg-primary border-1" } },
  }),
  NodeRange.configure({
    key: null,
  }),
];
