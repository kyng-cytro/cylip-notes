import { HEADERS } from "@/constants";
import type { JSONContent } from "@tiptap/core";
import type { Editor } from "@tiptap/vue-3";
import { toast } from "vue-sonner";

type VersionSummary = {
  id: string;
  updatedAt: number;
  current: boolean;
  available: boolean;
  editors: string[];
};

type VersionPreview = {
  id: string;
  title: string | null;
  changes: JSONContent;
};

type RestoredVersion = { title: string | null; content: JSONContent };

export const useVersionDate = () => {
  const { format } = useDateUtils();
  const formatVersionDate = (version: VersionSummary) =>
    version.current
      ? "Current version"
      : format(version.updatedAt, "MMM D, h:mm A");
  return { formatVersionDate };
};

export const useNoteHistory = (noteId: string) => {
  const noteStore = useNoteStore();
  const open = useState(`note-history-${noteId}`, () => false);
  const versions = useState<VersionSummary[]>(
    `note-history-versions-${noteId}`,
    () => [],
  );
  const selected = useState<VersionPreview | null>(
    `note-history-selected-${noteId}`,
    () => null,
  );

  const request = <T>(path = "", options: Record<string, unknown> = {}) =>
    $fetch<T>(`/api/notes/${noteId}/versions${path}`, {
      ...options,
      headers: { [HEADERS.unlock]: noteStore.unlockToken(noteId) },
    });

  const close = () => {
    open.value = false;
    versions.value = [];
    selected.value = null;
  };

  const showError = (title: string, error: any) =>
    toast.error(title, { description: error.data?.message });

  const select = async (versionId: string) => {
    try {
      selected.value = await request<VersionPreview>(`/${versionId}`);
    } catch (error) {
      showError("Couldn't open this version", error);
    }
  };

  const load = async () => {
    try {
      versions.value = await request<VersionSummary[]>();
    } catch (error) {
      showError("Couldn't load version history", error);
      return close();
    }
    const [current] = versions.value;
    if (!current) {
      toast("This note has no history yet.");
      return close();
    }
    await select(current.id);
  };

  const restore = async (editor: Editor) => {
    if (!selected.value) return;
    try {
      const version = await request<RestoredVersion>(
        `/${selected.value.id}/restore`,
        {
          method: "POST",
          body: {
            title: noteStore.getNoteById(noteId)?.title || null,
            content: editor.getJSON(),
          },
        },
      );
      editor.commands.setContent(version.content);
      noteStore.updateTitle(noteId, version.title ?? "");
      toast.success("Version restored.");
      close();
    } catch (error) {
      showError("Couldn't restore this version", error);
    }
  };

  return { open, versions, selected, load, select, restore, close };
};
