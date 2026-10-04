import type { ChainedCommands, Editor } from "@tiptap/core";
import { TextSelection } from "@tiptap/pm/state";
import type { Node } from "@tiptap/pm/model";
import {
  ChevronRight,
  Code,
  Heading,
  ImagePlus,
  Lightbulb,
  List,
  ListOrdered,
  ListTodo,
  Minus,
  Pilcrow,
  Quote,
  Type,
} from "lucide-vue-next";
import { HEADING_LEVELS, type SlashItem } from "@/lib/tiptap/custom-extensions";
import { pickImage } from "@/lib/tiptap/images";

export type EditorBlock = SlashItem & {
  keywords: string[];
  convertible: boolean;
};

export type BlockTarget = { node: Node; pos: number };

const convert =
  (run: (chain: ChainedCommands) => ChainedCommands) => (editor: Editor) =>
    run(editor.chain().focus().clearNodes()).run();

const heading = (level: 3 | 4) =>
  convert((chain) => chain.setHeading({ level }));

export const editorBlocks: EditorBlock[] = [
  {
    id: "text",
    title: "Text",
    icon: Pilcrow,
    keywords: ["paragraph", "plain"],
    convertible: true,
    apply: convert((chain) => chain),
  },
  {
    id: "heading",
    title: "Heading",
    icon: Heading,
    keywords: ["h1", "title", "header"],
    convertible: true,
    apply: heading(HEADING_LEVELS.heading),
  },
  {
    id: "subheading",
    title: "Subheading",
    icon: Type,
    keywords: ["h2", "subtitle"],
    convertible: true,
    apply: heading(HEADING_LEVELS.subheading),
  },
  {
    id: "todo",
    title: "To-do list",
    icon: ListTodo,
    keywords: ["task", "checkbox", "check"],
    convertible: true,
    apply: convert((chain) => chain.toggleTaskList()),
  },
  {
    id: "bullet-list",
    title: "Bulleted list",
    icon: List,
    keywords: ["ul", "unordered"],
    convertible: true,
    apply: convert((chain) => chain.toggleBulletList()),
  },
  {
    id: "numbered-list",
    title: "Numbered list",
    icon: ListOrdered,
    keywords: ["ol", "ordered"],
    convertible: true,
    apply: convert((chain) => chain.toggleOrderedList()),
  },
  {
    id: "toggle",
    title: "Toggle",
    icon: ChevronRight,
    keywords: ["details", "collapse", "fold"],
    convertible: true,
    apply: convert((chain) => chain.setDetails()),
  },
  {
    id: "callout",
    title: "Callout",
    icon: Lightbulb,
    keywords: ["note", "tip", "info"],
    convertible: true,
    apply: convert((chain) => chain.setCallout()),
  },
  {
    id: "quote",
    title: "Quote",
    icon: Quote,
    keywords: ["blockquote", "citation"],
    convertible: true,
    apply: convert((chain) => chain.toggleBlockquote()),
  },
  {
    id: "code",
    title: "Code",
    icon: Code,
    keywords: ["snippet", "pre"],
    convertible: true,
    apply: convert((chain) => chain.toggleCodeBlock()),
  },
  {
    id: "divider",
    title: "Divider",
    icon: Minus,
    keywords: ["hr", "line", "separator"],
    convertible: false,
    apply: (editor) => editor.chain().focus().setHorizontalRule().run(),
  },
  {
    id: "image",
    title: "Image",
    icon: ImagePlus,
    keywords: ["picture", "photo", "upload"],
    convertible: false,
    apply: pickImage,
  },
];

const normalize = (text: string) =>
  text.toLowerCase().replace(/[^a-z0-9]/g, "");

const matches = (block: EditorBlock, query: string) =>
  [block.title, ...block.keywords].some((word) =>
    normalize(word).includes(normalize(query)),
  );

export const filterBlocks = (query: string) =>
  editorBlocks.filter((block) => matches(block, query));

const selectBlock = (editor: Editor, { node, pos }: BlockTarget) =>
  editor.commands.setTextSelection({
    from: pos + 1,
    to: pos + node.nodeSize - 1,
  });

export const turnBlockInto = (
  editor: Editor,
  target: BlockTarget,
  block: EditorBlock,
) => {
  selectBlock(editor, target);
  block.apply(editor);
};

const isEmptyParagraph = (node: Node) =>
  node.type.name === "paragraph" && node.content.size === 0;

export const insertBlockAfter = (
  editor: Editor,
  { node, pos }: BlockTarget,
) => {
  if (isEmptyParagraph(node)) {
    editor
      .chain()
      .focus(pos + 1)
      .insertContent("/")
      .run();
    return;
  }
  const after = pos + node.nodeSize;
  editor
    .chain()
    .insertContentAt(after, {
      type: "paragraph",
      content: [{ type: "text", text: "/" }],
    })
    .focus(after + 2)
    .run();
};

const charBeforeCursor = (editor: Editor) => {
  const { $from } = editor.state.selection;
  return $from.parent.textBetween(
    Math.max(0, $from.parentOffset - 1),
    $from.parentOffset,
  );
};

export const openBlockMenu = (editor: Editor) => {
  const needsSpace = /\S/.test(charBeforeCursor(editor));
  editor
    .chain()
    .focus()
    .insertContent(needsSpace ? " /" : "/")
    .run();
};

export const duplicateBlock = (editor: Editor, { node, pos }: BlockTarget) =>
  editor
    .chain()
    .focus()
    .insertContentAt(pos + node.nodeSize, node.toJSON())
    .run();

export const deleteBlock = (editor: Editor, { node, pos }: BlockTarget) =>
  editor
    .chain()
    .focus()
    .deleteRange({ from: pos, to: pos + node.nodeSize })
    .run();

export const blockAtCursor = (editor: Editor): BlockTarget | null => {
  const { $from } = editor.state.selection;
  if ($from.depth === 0) return null;
  return { node: $from.node(1), pos: $from.before(1) };
};

type Direction = -1 | 1;

const siblingIndex = (editor: Editor, pos: number, direction: Direction) =>
  editor.state.doc.resolve(pos).index(0) + direction;

export const canMoveBlock = (
  editor: Editor,
  { pos }: BlockTarget,
  direction: Direction,
) => {
  const index = siblingIndex(editor, pos, direction);
  return index >= 0 && index < editor.state.doc.childCount;
};

export const moveBlock = (
  editor: Editor,
  target: BlockTarget,
  direction: Direction,
) => {
  if (!canMoveBlock(editor, target, direction)) return;
  const { node, pos } = target;
  const { state } = editor;
  const sibling = state.doc.child(siblingIndex(editor, pos, direction));
  const newPos =
    direction === -1 ? pos - sibling.nodeSize : pos + sibling.nodeSize;
  const cursorOffset = Math.max(1, state.selection.from - pos);
  const tr = state.tr.delete(pos, pos + node.nodeSize).insert(newPos, node);
  tr.setSelection(TextSelection.near(tr.doc.resolve(newPos + cursorOffset)));
  editor.view.dispatch(tr.scrollIntoView());
  editor.commands.focus();
};
