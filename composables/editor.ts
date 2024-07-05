import { Editor } from "@tiptap/vue-3";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import StarterKit from "@tiptap/starter-kit";
import { common, createLowlight } from "lowlight";
import TaskList from "@tiptap/extension-task-list";
import Underline from "@tiptap/extension-underline";
import ts from "highlight.js/lib/languages/typescript";
import TaskItem from "@tiptap/extension-task-item";
import Highlight from "@tiptap/extension-highlight";
import Placeholder from "@tiptap/extension-placeholder";
import FileHandler from "@tiptap-pro/extension-file-handler";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";

const lowlight = createLowlight(common);
lowlight.register({ ts });

type EditorOpts = {
  initialValue?: string;
  placeholder?: string;
};

export const useEditor = ({
  initialValue = "",
  placeholder = "Note it down...",
}: EditorOpts = {}) => {
  const content = ref(initialValue ?? "");
  const editor = new Editor({
    content: content.value,
    editorProps: {
      attributes: {
        class: "min-h-[200px] prose dark:prose-invert outline-none",
      },
    },
    extensions: [
      Image,
      TaskList,
      Underline,
      Highlight.configure({
        multicolor: true,
      }),
      TaskItem.configure({
        nested: true,
      }),
      Link.configure({
        linkOnPaste: true,
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
      StarterKit.configure({ heading: { levels: [3] }, codeBlock: false }),
      Placeholder.configure({ placeholder: placeholder }),
      FileHandler.configure({
        allowedMimeTypes: [
          "image/png",
          "image/jpeg",
          "image/gif",
          "image/svg+xml",
        ],
        onDrop: (currentEditor, files, pos) => {
          console.log(files);
        },
        onPaste: (currentEditor, files, htmlContent) => {
          console.log(files);
        },
      }),
    ],
    onUpdate: ({ editor }) => {
      const value = editor.getHTML();
      if (value !== content.value) {
        content.value = value;
      }
    },
  });
  return { content, editor };
};
