import { PARTIES } from "@/lib/sync/constants";
import { toCompressedDataUrl, validateImageFiles } from "@/lib/image-utils";
import { extensions } from "@/lib/tiptap";
import { AI, type AIProvider } from "@/lib/tiptap/custom-extensions";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCaret from "@tiptap/extension-collaboration-caret";
import FileHandler from "@tiptap/extension-file-handler";
import { Editor, findChildren } from "@tiptap/vue-3";
import { toast } from "vue-sonner";
import YProvider from "y-partyserver/provider";
import type * as Y from "yjs";

const PLACEHOLDER_IMAGE = "/image-placeholder.jpg";
const EDITOR_CLASS =
  "px-1 h-full max-w-none prose dark:prose-invert outline-none overflow-y-auto scrollbar-thin text-primary scrollbar-track-transparent scrollbar-thumb-secondary";

const endOfSelection = (editor: Editor) =>
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
  const placeholder = `${PLACEHOLDER_IMAGE}?upload=${crypto.randomUUID()}`;
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

const handleImageFiles = (editor: Editor, files: File[], position: number) => {
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

const aiProvider = (): AIProvider => {
  const tokens = useUser().user.value?.tokens ?? 0;
  return {
    permissions: {
      refine: tokens >= CONSTANTS.rates.refine,
      suggest: tokens >= CONSTANTS.rates.suggest,
    },
    getSuggestion: async (text) =>
      (
        await requestAI<{ suggestion: string | null }>("/api/ai/suggest", {
          text,
        })
      ).suggestion,
    refine: async (text, mode) =>
      (
        await requestAI<{ refined: string | null }>("/api/ai/refine", {
          text,
          mode,
        })
      ).refined,
    onError: (action, message) =>
      toast.error(`Failed to ${action}`, { description: message }),
  };
};

const connectNote = (noteId: string, doc: Y.Doc) =>
  new YProvider(useRuntimeConfig().public.syncUrl, noteId, doc, {
    party: PARTIES.note,
    params: async () => ({ token: await useUser().getToken() }),
  });

export const useNoteEditor = async (noteId: string, editable: boolean) => {
  const doc = await useNoteStore().loadNoteDoc(noteId);
  const provider = connectNote(noteId, doc);
  return new Editor({
    autofocus: true,
    editable,
    editorProps: { attributes: { class: EDITOR_CLASS } },
    extensions: [
      ...extensions,
      Collaboration.configure({ document: doc }),
      CollaborationCaret.configure({
        provider,
        user: { name: useUser().user.value?.name || "Guest", color: "#00ffaa" },
      }),
      FileHandler.configure({
        allowedMimeTypes: [
          "image/png",
          "image/jpeg",
          "image/gif",
          "image/svg+xml",
        ],
        onDrop: (editor, files, position) =>
          handleImageFiles(editor as Editor, files, position),
        onPaste: (editor, files, html) => {
          if (!html)
            handleImageFiles(
              editor as Editor,
              files,
              endOfSelection(editor as Editor),
            );
        },
      }),
      AI.configure({ provider: aiProvider() }),
    ],
    onFocus: ({ event }) => event.preventDefault(),
    onDestroy: () => provider.destroy(),
  });
};
