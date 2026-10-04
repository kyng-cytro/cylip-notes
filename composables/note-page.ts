import { canEdit as canEditRole } from "@/lib/sync/protocol";
import { extensions } from "@/lib/tiptap";
import { renderToMarkdown } from "@tiptap/static-renderer/pm/markdown";
import type { Editor } from "@tiptap/vue-3";

export const useNotePage = async (noteId: string) => {
  const noteStore = useNoteStore();
  await noteStore.ensureStarted();

  const note = computed(() => noteStore.getNoteById(noteId));
  const canEdit = computed(
    () => canEditRole(note.value?.role) && !note.value?.trashed,
  );
  const editor = shallowRef<Editor | null>(null);
  const loading = computed(
    () => !editor.value && (!noteStore.caughtUp || !!note.value),
  );
  const disposed = { value: false };
  onScopeDispose(() => (disposed.value = true));
  const createEditor = async () => {
    const created = await useNoteEditor(noteId, canEdit.value);
    if (disposed.value) return created.destroy();
    editor.value = created;
  };
  watch(
    () => !!note.value,
    (found) => {
      if (found && !editor.value) createEditor();
    },
    { immediate: true },
  );
  watch(canEdit, (editable) => editor.value?.setEditable(editable));

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
      content: editor.value?.getJSON() ?? {},
    });
    if (!text) return [];
    const { titles } = await requestAI<{ titles: string[] }>("/api/ai/title", {
      text,
    });
    return titles;
  };

  return { note, editor, loading, title, canEdit, background, suggestTitle };
};
