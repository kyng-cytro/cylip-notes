import { DOMSerializer, type Fragment, type Schema } from "@tiptap/pm/model";
import type { Selection } from "@tiptap/pm/state";
import { Extension } from "@tiptap/vue-3";
import { htmlToMarkdown } from "@/lib/turndown";

const copiedContent = (selection: Selection): Fragment => {
  const { $from, $to } = selection;
  const withinOneBlock = $from.sameParent($to) && $from.parent.isTextblock;
  return withinOneBlock
    ? $from.parent.content.cut($from.parentOffset, $to.parentOffset)
    : selection.content().content;
};

const toHtml = (fragment: Fragment, schema: Schema) => {
  const container = document.createElement("div");
  container.appendChild(
    DOMSerializer.fromSchema(schema).serializeFragment(fragment),
  );
  return container.innerHTML;
};

export const MarkDownCopy = Extension.create({
  name: "markDownCopy",
  onCreate() {
    const { editor } = this;
    editor.view.dom.addEventListener("copy", (event) => {
      const { selection, schema } = editor.state;
      if (selection.empty) return;
      event.preventDefault();
      const html = toHtml(copiedContent(selection), schema);
      event.clipboardData?.setData("text/plain", htmlToMarkdown(html));
    });
  },
});
