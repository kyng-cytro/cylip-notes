import { canEdit as canEditRole } from "@/lib/sync/protocol";
import { extensions } from "@/lib/tiptap";
import { renderToMarkdown } from "@tiptap/static-renderer/pm/markdown";
import type { Editor } from "@tiptap/vue-3";

export const useNotePage = async (noteId: string) => {
  const noteStore = useNoteStore();
  await noteStore.ensureStarted();

  const note = computed(() => noteStore.getNoteById(noteId));
  const locked = computed(() => !!note.value?.locked);
  const canEdit = computed(
    () => canEditRole(note.value?.role) && !note.value?.trashed,
  );
  const editor = shallowRef<Editor | null>(null);
  const history = useNoteHistory(noteId);
  onScopeDispose(history.close);
  const loading = computed(() => {
    if (editor.value || locked.value) return false;
    return !!note.value || !noteStore.caughtUp;
  });

  const page = { unmounted: false };
  onScopeDispose(() => (page.unmounted = true));
  const createEditor = async () => {
    const created = await useNoteEditor(noteId, canEdit.value);
    if (page.unmounted) return created.destroy();
    editor.value = created;
  };
  whenever(() => note.value && !locked.value && !editor.value, createEditor, {
    immediate: true,
  });
  whenever(locked, () => {
    history.close();
    editor.value?.destroy();
    editor.value = null;
  });

  const { unlock, passkey, remember } = useNoteUnlock(noteId);
  const reset = (password: string) => noteStore.lockNote(noteId, password);
  watch(canEdit, (editable) => editor.value?.setEditable(editable));

  const draftTitle = ref(note.value?.title ?? "");
  watch(
    () => note.value?.title,
    (remoteTitle) => {
      if (remoteTitle !== undefined) draftTitle.value = remoteTitle;
    },
  );
  watchDebounced(
    draftTitle,
    (value) => {
      if (canEdit.value && value !== note.value?.title) {
        noteStore.updateTitle(noteId, value);
      }
    },
    { debounce: 500 },
  );

  const canEditTitle = computed(() => canEdit.value && !history.open.value);
  const title = computed({
    get: () =>
      history.open.value
        ? (history.selected.value?.title ?? "")
        : draftTitle.value,
    set: (value: string) => (draftTitle.value = value),
  });

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

  return {
    note,
    editor,
    loading,
    locked,
    historyOpen: history.open,
    unlock,
    passkey,
    remember,
    reset,
    title,
    canEdit,
    canEditTitle,
    background,
    suggestTitle,
  };
};
