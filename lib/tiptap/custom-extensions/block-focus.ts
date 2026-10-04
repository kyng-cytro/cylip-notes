import { Extension } from "@tiptap/core";
import {
  NodeSelection,
  Plugin,
  PluginKey,
  type EditorState,
} from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    blockFocus: {
      hoverBlock: (pos: number | null) => ReturnType;
      selectBlock: () => ReturnType;
    };
  }
}

const hoverKey = new PluginKey<number | null>("blockHover");

const hoverDecorations = (state: EditorState) => {
  const pos = hoverKey.getState(state);
  if (typeof pos !== "number") return DecorationSet.empty;
  const node = state.doc.nodeAt(pos);
  if (!node) return DecorationSet.empty;
  return DecorationSet.create(state.doc, [
    Decoration.node(pos, pos + node.nodeSize, { class: "is-block-hovered" }),
  ]);
};

export const BlockFocus = Extension.create({
  name: "blockFocus",
  priority: 50,
  addCommands: () => ({
    hoverBlock:
      (pos) =>
      ({ tr, dispatch }) => {
        if (dispatch) tr.setMeta(hoverKey, pos);
        return true;
      },
    selectBlock:
      () =>
      ({ state, tr, dispatch }) => {
        const { $from } = state.selection;
        if ($from.depth === 0) return false;
        if (dispatch) {
          tr.setSelection(NodeSelection.create(state.doc, $from.before(1)));
        }
        return true;
      },
  }),
  addKeyboardShortcuts() {
    return {
      Escape: () => this.editor.commands.selectBlock(),
    };
  },
  addProseMirrorPlugins: () => [
    new Plugin<number | null>({
      key: hoverKey,
      state: {
        init: () => null,
        apply: (tr, pos) => {
          const meta: number | null | undefined = tr.getMeta(hoverKey);
          if (meta !== undefined) return meta;
          if (pos === null) return null;
          const mapped = tr.mapping.mapResult(pos);
          return mapped.deleted ? null : mapped.pos;
        },
      },
      props: { decorations: hoverDecorations },
    }),
  ],
});
