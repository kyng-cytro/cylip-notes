import { convertToMarkDown } from "@/lib/turndown";
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
import { Editor, generateHTML, type JSONContent } from "@tiptap/vue-3";

const lowlight = createLowlight(common);
lowlight.register({ ts });

type EditorOpts = {
  disabled?: boolean;
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
      console.log(files);
    },
    onPaste: (currentEditor, files, htmlContent) => {
      console.log(files);
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

export const useEditor = ({ disabled, initialValue = {} }: EditorOpts = {}) => {
  const content = ref(initialValue);
  const editor = new Editor({
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
