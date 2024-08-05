import { toast } from "vue-sonner";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import StarterKit from "@tiptap/starter-kit";
import { getDataUrl, isValidImage } from "@/lib/image-utils";
import { common, createLowlight } from "lowlight";
import TaskList from "@tiptap/extension-task-list";
import { convertToMarkDown } from "@/lib/turndown";
import Underline from "@tiptap/extension-underline";
import TaskItem from "@tiptap/extension-task-item";
import Highlight from "@tiptap/extension-highlight";
import ts from "highlight.js/lib/languages/typescript";
import Placeholder from "@tiptap/extension-placeholder";
import FileHandler from "@tiptap-pro/extension-file-handler";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { Editor, generateHTML, type JSONContent } from "@tiptap/vue-3";

const lowlight = createLowlight(common);
lowlight.register({ ts });

type EditorOpts = {
  disabled?: boolean;
  autofocus?: boolean;
  placeholder?: string;
  initialValue?: JSONContent | null;
};

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

const preCheck = (
  editor: Editor,
  files: File[],
): { valid: true; file: File } | { valid: false; message: string } => {
  // Cheking if the file list is empty
  if (!files.length || !files[0])
    return { valid: false, message: "No file found." };
  // Cheking if the file list has more than one file
  if (files.length > 1)
    return { valid: false, message: "You can only upload one file at a time." };
  // Cheking if any of the files is not an image
  if (files.some((file) => !isValidImage(file)))
    return {
      valid: false,
      message: "Only image files are allowed.",
    };
  // Cheking if the user is not logged in
  const { user } = useUser();
  if (!user.value) return { valid: false, message: "User not found." };
  // Cheking if the user has reached the max image limit
  const images = editor.$nodes("image");
  const max = CONSTANTS.maxImagePerNote[user.value.accountType];
  if (images && images.length >= max)
    return {
      valid: false,
      message: `Notes under the ${user.value.accountType} plan can only have ${max} image at a time.`,
    };
  return { valid: true, file: files[0] };
};

const proccessImage = async (editor: Editor, file: File, pos: number) => {
  // Inserting a placehold image
  editor.commands.insertContentAt(
    pos,
    {
      type: "image",
      attrs: {
        src: "https://placehold.co/800x400",
      },
    },
    { updateSelection: true },
  );
  // Get position of the placehold image
  const placeholdPos = editor.state.selection.anchor;
  console.log(pos, placeholdPos);
  // Get the data url of the image
  getDataUrl(file)
    .then((dataUrl) => {
      // Replace the placehold image with the actual image
      editor
        .chain()
        .deleteRange({ from: placeholdPos, to: placeholdPos + 1 })
        .insertContentAt(placeholdPos, {
          type: "image",
          attrs: {
            src: dataUrl,
          },
        })
        .focus()
        .run();
    })
    .catch((err) => {
      toast.error("Something went wrong", {
        description: err.message,
      });
      // Remove the placehold image
      editor
        .chain()
        .deleteRange({ from: placeholdPos, to: placeholdPos + 1 })
        .focus()
        .run();
    });
};

const extensions = [
  Image,
  TaskList,
  Underline,
  Highlight,
  TaskItem.configure({
    nested: true,
  }),
  Link.configure({
    linkOnPaste: true,
  }),
  CustomCodeBlock.configure({
    lowlight,
  }),
  Placeholder.configure({ placeholder: "Note it down..." }),
  StarterKit.configure({ heading: { levels: [4] }, codeBlock: false }),
  FileHandler.configure({
    allowedMimeTypes: ["image/png", "image/jpeg", "image/gif", "image/svg+xml"],
    onDrop: (currentEditor, files, pos) => {
      const result = preCheck(currentEditor as Editor, files);
      if (!result.valid) return toast.warning(result.message);
      proccessImage(currentEditor as Editor, result.file, pos);
    },
    onPaste: (currentEditor, files, htmlContent) => {
      if (htmlContent) return;
      const result = preCheck(currentEditor as Editor, files);
      if (!result.valid) return toast.warning(result.message);
      proccessImage(
        currentEditor as Editor,
        result.file,
        currentEditor.state.doc.resolve(currentEditor.state.selection.to).end(),
      );
    },
  }),
];

export const useEditorUtils = () => {
  const convertToText = (doc: JSONContent) => {
    return convertToMarkDown(convertToHtml(doc));
  };
  const convertToHtml = (doc: JSONContent) => {
    if (!doc) return "";
    return generateHTML(doc, extensions);
  };
  const addImage = (editor: Editor) => {
    const { open, onChange } = useFileDialog({
      accept: "image/*",
      multiple: false,
    });
    open();
    onChange((filelist) => {
      if (!filelist) return;
      const files = Array.from(filelist);
      if (!files.length) return;
      const result = preCheck(editor, files);
      if (!result.valid) return toast.warning(result.message);
      proccessImage(
        editor,
        result.file,
        editor.state.doc.resolve(editor.state.selection.to).end(),
      );
    });
  };
  return { addImage, convertToText, convertToHtml };
};

export const useEditor = ({
  disabled,
  autofocus,
  initialValue = {},
}: EditorOpts = {}) => {
  const content = ref(initialValue);
  const editor = new Editor({
    autofocus,
    editable: !disabled,
    content: content.value,
    editorProps: {
      attributes: {
        class: "min-h-[200px] prose dark:prose-invert outline-none",
      },
    },
    extensions,
    onUpdate: ({ editor }) => {
      const value = editor.getJSON();
      if (value !== content.value) {
        content.value = value;
      }
    },
  });
  return { content, editor };
};
