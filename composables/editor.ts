import { toast } from "vue-sonner";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import StarterKit from "@tiptap/starter-kit";
import { getDataUrl } from "@/lib/image-utils";
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
  if (!files.length || !files[0])
    return { valid: false, message: "No file found." };
  if (files.length > 1)
    return { valid: false, message: "You can only upload one file at a time." };
  const { user } = useUser();
  if (!user.value) return { valid: false, message: "User not found." };
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
  editor.commands.insertContentAt(pos, {
    type: "image",
    attrs: {
      src: "https://placehold.co/800x400",
    },
  });
  getDataUrl(file)
    .then((dataUrl) => {
      editor
        .chain()
        .deleteRange({ from: pos, to: pos + 1 })
        .insertContentAt(pos, {
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
      editor
        .chain()
        .focus()
        .deleteRange({ from: pos, to: pos + 1 })
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
        currentEditor.state.selection.anchor,
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

  return { convertToText, convertToHtml };
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
