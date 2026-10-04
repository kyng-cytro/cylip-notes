import lowlight from "@/lib/lowlight";
import {
  Callout,
  CodeBlock,
  MarkDownCopy,
} from "@/lib/tiptap/custom-extensions";
import {
  Details,
  DetailsContent,
  DetailsSummary,
} from "@tiptap/extension-details";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import NodeRange from "@tiptap/extension-node-range";
import Placeholder from "@tiptap/extension-placeholder";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import StarterKit from "@tiptap/starter-kit";
import { generateHTML, type JSONContent } from "@tiptap/vue-3";
import type { Node } from "@tiptap/pm/model";

const placeholderFor = ({ node }: { node: Node }) => {
  if (node.type.name === "heading") return `Heading ${node.attrs.level}`;
  if (node.type.name === "detailsSummary") return "Toggle";
  return "Type '/' for commands";
};

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
  Callout,
  Details,
  DetailsSummary,
  DetailsContent,
  Placeholder.configure({ placeholder: placeholderFor, includeChildren: true }),
  StarterKit.configure({
    undoRedo: false,
    codeBlock: false,
    link: {
      linkOnPaste: true,
    },
    heading: { levels: [1, 2, 3, 4] },
    dropcursor: { color: false, width: 2, class: "drop-cursor" },
    horizontalRule: { HTMLAttributes: { class: "bg-primary border-1" } },
  }),
  NodeRange.configure({
    key: null,
  }),
];

export const contentToHtml = (content: JSONContent | null) =>
  content ? generateHTML(content, extensions) : "";
