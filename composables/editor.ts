import * as Y from "yjs";
import { toast } from "vue-sonner";
import { extensions } from "@/lib/tiptap";
import YPartyKitProvider from "y-partykit/provider";
import Collaboration from "@tiptap/extension-collaboration";
import FileHandler from "@tiptap-pro/extension-file-handler";
import { getDataUrl, imagePreProcessChecks } from "@/lib/image-utils";
import { Editor, generateHTML, type JSONContent } from "@tiptap/vue-3";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";

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
