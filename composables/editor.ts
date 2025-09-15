import { getDataUrl, imagePreProcessChecks } from "@/lib/image-utils";
import { extensions } from "@/lib/tiptap";
import { AI, type AIProvider } from "@/lib/tiptap/custom-extensions";
import FileHandler from "@tiptap-pro/extension-file-handler";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import { Editor, generateHTML, type JSONContent } from "@tiptap/vue-3";
import { toast } from "vue-sonner";
import YPartyKitProvider from "y-partykit/provider";
import * as Y from "yjs";

type EditorOpts = {
  roomId: string;
  disabled?: boolean;
  autofocus?: boolean;
  placeholder?: string;
  initialValue?: JSONContent | null;
};

const proccessImage = async (editor: Editor, file: File, pos: number) => {
  editor.commands.insertContentAt(
    pos,
    {
      type: "image",
      attrs: {
        src: "/image-placeholder.jpg",
      },
    },
    { updateSelection: true },
  );
  const placeholdPos = editor.state.selection.anchor;
  getDataUrl(file)
    .then((dataUrl) => {
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
      editor
        .chain()
        .deleteRange({ from: placeholdPos, to: placeholdPos + 1 })
        .focus()
        .run();
    });
};

const getAIProvider = (): AIProvider => {
  const user = useUser().user.value;
  const tokens = user?.tokens ?? 0;
  return {
    permissions: {
      refine: tokens >= CONSTANTS.rates.refine,
      suggest: tokens >= CONSTANTS.rates.suggest,
    },
    async getSuggestion(text) {
      const { suggestion } = await $fetch("/api/ai/suggest", {
        method: "POST",
        body: JSON.stringify({ text }),
      });
      return suggestion;
    },
    async refine(text, mode) {
      const { refined } = await $fetch("/api/ai/refine", {
        method: "POST",
        body: JSON.stringify({ text, mode }),
      });
      return refined;
    },
    onError(action, message) {
      toast.error(`[${action}] ${message}`);
    },
  };
};

export const useEditorUtils = () => {
  const convertToHtml = (doc: JSONContent | null) => {
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
      const result = imagePreProcessChecks(editor, files);
      if (!result.valid) return toast.warning(result.message);
      proccessImage(
        editor,
        result.file,
        editor.state.doc.resolve(editor.state.selection.to).end(),
      );
    });
  };
  return { addImage, convertToHtml };
};

export const useEditor = async ({
  roomId,
  disabled,
  autofocus,
}: EditorOpts) => {
  const initialized = ref(false);
  const yDoc = new Y.Doc();
  const provider = new YPartyKitProvider(
    useRuntimeConfig().public.webSocketUrl,
    roomId,
    yDoc,
    { params: { auth_session: await useUser().getToken() } },
  );
  const editor = new Editor({
    autofocus,
    editable: !disabled,
    editorProps: {
      attributes: {
        class:
          "px-1 h-full max-w-none prose dark:prose-invert outline-none overflow-y-auto scrollbar-thin text-primary",
      },
    },
    extensions: [
      ...extensions,
      Collaboration.configure({ document: yDoc }),
      CollaborationCursor.configure({
        provider: provider,
        user: {
          name: `${useUser().user.value?.name || "Guest"}`,
          color: "#00ffaa",
        },
      }),
      FileHandler.configure({
        allowedMimeTypes: [
          "image/png",
          "image/jpeg",
          "image/gif",
          "image/svg+xml",
        ],
        onDrop: (currentEditor, files, pos) => {
          const result = imagePreProcessChecks(currentEditor as Editor, files);
          if (!result.valid) return toast.warning(result.message);
          proccessImage(currentEditor as Editor, result.file, pos);
        },
        onPaste: (currentEditor, files, htmlContent) => {
          if (htmlContent) return;
          const result = imagePreProcessChecks(currentEditor as Editor, files);
          if (!result.valid) return toast.warning(result.message);
          proccessImage(
            currentEditor as Editor,
            result.file,
            currentEditor.state.doc
              .resolve(currentEditor.state.selection.to)
              .end(),
          );
        },
      }),
      AI.configure({
        provider: getAIProvider(),
      }),
    ],
    onFocus: ({ event }) => {
      event.preventDefault();
    },
    onCreate: () => {
      provider.on("synced", () => {
        initialized.value = true;
      });
    },
    onDestroy: () => {
      provider.destroy();
      yDoc.destroy();
    },
  });
  return { editor, initialized };
};
