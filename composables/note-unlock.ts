export const useNoteUnlock = (
  noteId: MaybeRefOrGetter<string>,
  { onUnlocked = () => {} } = {},
) => {
  const noteStore = useNoteStore();
  const remember = ref(noteStore.passkeyRegistered);

  const passkey = computed(() => {
    if (!noteStore.passkeySupported) return undefined;
    const id = toValue(noteId);
    return {
      saved: noteStore.hasSavedPassword(id),
      failed: noteStore.passkeyFailed(id),
      forget: () => noteStore.forgetSavedPassword(id),
      unlock: async () => {
        const unlocked = await noteStore.tryPasskeyUnlock(id);
        if (unlocked) onUnlocked();
        return unlocked;
      },
    };
  });

  const unlock = async (password: string) => {
    await noteStore.unlockNote(toValue(noteId), password, {
      remember: !!passkey.value && !passkey.value.saved && remember.value,
    });
    onUnlocked();
  };

  return { unlock, passkey, remember };
};
