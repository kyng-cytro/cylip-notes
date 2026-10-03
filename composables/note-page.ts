import { canEdit as canEditRole } from "@/lib/sync/protocol";
import { extensions } from "@/lib/tiptap";
import { renderToMarkdown } from "@tiptap/static-renderer/pm/markdown";

export const useNotePage = async (noteId: string) => {
  const noteStore = useNoteStore();
  await noteStore.ensureStarted();

  const note = computed(() => noteStore.getNoteById(noteId));
  const canEdit = computed(
    () => canEditRole(note.value?.role) && !note.value?.trashed,
  );
  const editor = note.value ? await useNoteEditor(noteId, canEdit.value) : null;
  watch(canEdit, (editable) => editor?.setEditable(editable));

  const title = ref(note.value?.title ?? "");
  watch(
    () => note.value?.title,
    (remoteTitle) => {
      if (remoteTitle !== undefined) title.value = remoteTitle;
    },
  );
  watchDebounced(
    title,
    (value) => {
      if (canEdit.value && value !== note.value?.title) {
        noteStore.updateTitle(noteId, value);
      }
    },
    { debounce: 500 },
  );

  const isDark = computed(() => useColorMode().value === "dark");
  const background = computed(() =>
    note.value ? applyBackground(isDark.value, note.value.background) : "",
  );

  const suggestTitle = async () => {
    const text = renderToMarkdown({
      extensions,
      content: editor?.getJSON() ?? {},
    });
    if (!text) return [];
    const { titles } = await $fetch("/api/ai/title", {
      method: "POST",
      body: { text },
    });
    return titles;
  };

  return { note, editor, title, canEdit, background, suggestTitle };
};
