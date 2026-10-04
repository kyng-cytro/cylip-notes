import { PARTIES } from "@/lib/sync/constants";
import { extensions } from "@/lib/tiptap";
import {
  AI,
  BlockFocus,
  SlashCommand,
  type AIProvider,
} from "@/lib/tiptap/custom-extensions";
import { endOfSelection, handleImageFiles } from "@/lib/tiptap/images";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCaret from "@tiptap/extension-collaboration-caret";
import FileHandler from "@tiptap/extension-file-handler";
import { Editor } from "@tiptap/vue-3";
import { toast } from "vue-sonner";
import YProvider from "y-partyserver/provider";
import type * as Y from "yjs";

const EDITOR_CLASS =
  "-mx-2 px-2 h-full max-w-none prose dark:prose-invert outline-none overflow-y-auto scrollbar-thin text-primary scrollbar-track-transparent scrollbar-thumb-secondary";

const hasFinePointer = () => window.matchMedia("(pointer: fine)").matches;

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
          handleImageFiles(editor, files, position),
        onPaste: (editor, files, html) => {
          if (!html) handleImageFiles(editor, files, endOfSelection(editor));
        },
      }),
      AI.configure({ provider: aiProvider() }),
      BlockFocus,
      SlashCommand.configure({
        items: filterBlocks,
        render: slashMenuRenderer,
      }),
    ],
    onCreate: ({ editor }) => {
      if (editable && hasFinePointer()) {
        editor.commands.focus("end", { scrollIntoView: false });
      }
    },
    onDestroy: () => provider.destroy(),
  });
};
