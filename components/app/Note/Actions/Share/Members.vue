<script setup lang="ts">
import type { SharedRole } from "@/lib/sync/protocol";
import type { ClientNote } from "@/lib/types";
import type { NotePerson } from "@/server/utils/note-sharing";
import { XIcon } from "lucide-vue-next";
import { toast } from "vue-sonner";

const props = defineProps<{ note: ClientNote }>();

const { user } = useUser();
const noteStore = useNoteStore();
const isOwner = computed(() => props.note.role === "owner");
const peopleUrl = computed(() => `/api/notes/${props.note.id}/members`);
const personUrl = (email: string) =>
  `${peopleUrl.value}/${encodeURIComponent(email)}`;
const isYou = (person: NotePerson) => person.email === user.value?.email;

const {
  data: people,
  refresh,
  error,
} = useFetch<NotePerson[]>(peopleUrl, { server: false });

const email = ref("");
const role = ref<SharedRole>("editor");
const sharing = ref(false);

const showError = (title: string, e: any) =>
  toast.error(title, {
    description: e.data?.message || "Check your connection and try again.",
  });

const share = async () => {
  sharing.value = true;
  try {
    await $fetch(peopleUrl.value, {
      method: "POST",
      body: { email: email.value, role: role.value },
    });
    toast.success("Note shared", {
      description: `We emailed ${email.value} a link to open it.`,
    });
    email.value = "";
    await refresh();
  } catch (e) {
    showError("Couldn't share the note", e);
  } finally {
    sharing.value = false;
  }
};

const changeRole = async (person: NotePerson, newRole: SharedRole) => {
  try {
    await $fetch(personUrl(person.email), {
      method: "PATCH",
      body: { role: newRole },
    });
    await refresh();
  } catch (e) {
    showError("Couldn't change access", e);
  }
};

const remove = async (person: NotePerson) => {
  try {
    await $fetch(personUrl(person.email), { method: "DELETE" });
    await refresh();
  } catch (e) {
    showError("Couldn't remove access", e);
  }
};
</script>

<template>
  <div class="flex flex-col gap-3">
    <Label class="font-semibold">People with access</Label>
    <p v-if="error" class="text-muted-foreground text-sm">
      Sharing needs an internet connection.
    </p>
    <form
      v-if="isOwner && !error"
      class="flex flex-col gap-3"
      @submit.prevent="share"
    >
      <Input
        v-model="email"
        type="email"
        required
        autocomplete="off"
        placeholder="Email address"
      />
      <Select v-model="role">
        <SelectTrigger class="w-full"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="editor">Editor</SelectItem>
          <SelectItem value="viewer">Viewer</SelectItem>
        </SelectContent>
      </Select>
      <Button type="submit" :loading="sharing">Share</Button>
    </form>
    <ul class="flex flex-col gap-2">
      <li
        v-for="person in people"
        :key="person.email"
        class="flex items-center gap-2 text-sm"
      >
        <Avatar class="size-7">
          <AvatarFallback class="text-xs uppercase">
            {{ getTwoChars(person.email) }}
          </AvatarFallback>
        </Avatar>
        <p class="min-w-0 flex-1 truncate">
          {{ person.email }}
          <span v-if="isYou(person)" class="text-muted-foreground">(you)</span>
        </p>
        <span
          v-if="person.role === 'owner' || !isOwner"
          class="text-muted-foreground capitalize"
        >
          {{ person.role }}
        </span>
        <Select
          v-else
          :model-value="person.role"
          @update:model-value="changeRole(person, $event as SharedRole)"
        >
          <SelectTrigger class="h-8 w-24"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="editor">Editor</SelectItem>
            <SelectItem value="viewer">Viewer</SelectItem>
          </SelectContent>
        </Select>
        <Button
          v-if="isOwner && person.role !== 'owner'"
          size="icon"
          variant="ghost"
          aria-label="Remove access"
          @click="remove(person)"
        >
          <XIcon class="size-4" />
        </Button>
        <Button
          v-else-if="isYou(person) && !isOwner"
          size="xs"
          variant="ghost"
          @click="noteStore.deleteNoteForever(note)"
        >
          Leave
        </Button>
      </li>
    </ul>
  </div>
</template>
