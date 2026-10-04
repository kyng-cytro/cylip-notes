import { createId } from "@/lib/id";
import { toCompressedDataUrl, validateImageFiles } from "@/lib/image-utils";
import { findChildren, type Editor } from "@tiptap/core";
import { useFileDialog } from "@vueuse/core";
import { toast } from "vue-sonner";

const PLACEHOLDER_IMAGE = "/image-placeholder.jpg";

export const endOfSelection = (editor: Editor) =>
  editor.state.doc.resolve(editor.state.selection.to).end();

const findImage = (editor: Editor, src: string) =>
  findChildren(
    editor.state.doc,
    (node) => node.type.name === "image" && node.attrs.src === src,
  )[0];

const replacePlaceholder = (
  editor: Editor,
  placeholder: string,
  src: string | null,
) => {
  const image = findImage(editor, placeholder);
  if (!image) return;
  const transaction = src
    ? editor.state.tr.setNodeMarkup(image.pos, undefined, {
        ...image.node.attrs,
        src,
      })
    : editor.state.tr.delete(image.pos, image.pos + image.node.nodeSize);
  editor.view.dispatch(transaction);
};

const insertImage = async (editor: Editor, file: File, position: number) => {
  const placeholder = `${PLACEHOLDER_IMAGE}?upload=${createId()}`;
  editor.commands.insertContentAt(position, {
    type: "image",
    attrs: { src: placeholder },
  });
  try {
    replacePlaceholder(editor, placeholder, await toCompressedDataUrl(file));
  } catch (error) {
    toast.error("Something went wrong", {
      description: (error as Error).message,
    });
    replacePlaceholder(editor, placeholder, null);
  }
};

export const handleImageFiles = (
  editor: Editor,
  files: File[],
  position: number,
) => {
  const result = validateImageFiles(editor, files);
  if (!result.valid) return toast.warning(result.message);
  insertImage(editor, result.file, position);
};

export const pickImage = (editor: Editor) => {
  const { open, onChange } = useFileDialog({
    accept: "image/*",
    multiple: false,
  });
  onChange((files) => {
    if (files)
      handleImageFiles(editor, Array.from(files), endOfSelection(editor));
  });
  open();
};
