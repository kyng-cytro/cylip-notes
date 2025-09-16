import { DOMSerializer } from "@tiptap/pm/model";
import { Extension } from "@tiptap/vue-3";
import { convertToMarkDown } from "~/lib/turndown";

export const MarkDownCopy = Extension.create({
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
