export const useNoteUnlock = (
  noteId: MaybeRefOrGetter<string>,
  { onUnlocked = () => {} } = {},
) => {
  const noteStore = useNoteStore();
  const remember = ref(noteStore.passkeyRegistered);

  const passkey = computed(() => {
    if (!noteStore.passkeySupported) return undefined;
    const id = toValue(noteId);
    const saved = noteStore.hasSavedPassword(id);
    const failed = noteStore.passkeyFailed(id);
    return {
      saved,
      failed,
      canRemember: !saved || failed,
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
      remember: !!passkey.value?.canRemember && remember.value,
    });
    onUnlocked();
  };

  return { unlock, passkey, remember };
};
