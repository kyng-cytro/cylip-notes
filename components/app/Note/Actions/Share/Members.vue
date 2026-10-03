<script setup lang="ts">
import type { ClientNote } from "@/lib/types";
import { XIcon } from "lucide-vue-next";
import { toast } from "vue-sonner";

type Role = "editor" | "viewer";

type Member = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: Role | "owner";
};

const props = defineProps<{ note: ClientNote }>();

const { user } = useUser();
const { methods } = useNoteStore();
const isOwner = computed(() => props.note.role === "owner");
const membersUrl = computed(() => `/api/notes/${props.note.id}/members`);

const {
  data: members,
  refresh,
  error,
} = useFetch<Member[]>(membersUrl, { server: false });

const email = ref("");
const role = ref<Role>("editor");
const inviting = ref(false);

const showError = (title: string, e: any) =>
  toast.error(title, {
    description: e.data?.message || "Check your connection and try again.",
  });

const invite = async () => {
  inviting.value = true;
  try {
    await $fetch(membersUrl.value, {
      method: "POST",
      body: { email: email.value, role: role.value },
    });
    email.value = "";
    await refresh();
  } catch (e) {
    showError("Couldn't share the note", e);
  } finally {
    inviting.value = false;
  }
};

const changeRole = async (userId: string, newRole: Role) => {
  try {
    await $fetch(`${membersUrl.value}/${userId}`, {
      method: "PATCH",
      body: { role: newRole },
    });
    await refresh();
  } catch (e) {
    showError("Couldn't change access", e);
  }
};

const remove = async (userId: string) => {
  try {
    await $fetch(`${membersUrl.value}/${userId}`, { method: "DELETE" });
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
    <form v-if="isOwner && !error" class="flex gap-2" @submit.prevent="invite">
      <Input
        v-model="email"
        type="email"
        required
        placeholder="Email address"
        class="flex-1"
      />
      <Select v-model="role">
        <SelectTrigger class="w-24"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="editor">Editor</SelectItem>
          <SelectItem value="viewer">Viewer</SelectItem>
        </SelectContent>
      </Select>
      <Button type="submit" size="sm" :loading="inviting">Share</Button>
    </form>
    <ul class="flex flex-col gap-2">
      <li
        v-for="member in members"
        :key="member.id"
        class="flex items-center gap-2 text-sm"
      >
        <Avatar class="size-7">
          <AvatarImage :src="member.image || ''" />
          <AvatarFallback class="text-xs">{{
            getTwoChars(member.name)
          }}</AvatarFallback>
        </Avatar>
        <div class="min-w-0 flex-1">
          <p class="truncate font-medium">{{ member.name }}</p>
          <p class="text-muted-foreground truncate text-xs">
            {{ member.email }}
          </p>
        </div>
        <span
          v-if="member.role === 'owner' || !isOwner"
          class="text-muted-foreground capitalize"
        >
          {{ member.role }}
        </span>
        <Select
          v-else
          :model-value="member.role"
          @update:model-value="changeRole(member.id, $event as Role)"
        >
          <SelectTrigger class="h-8 w-24"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="editor">Editor</SelectItem>
            <SelectItem value="viewer">Viewer</SelectItem>
          </SelectContent>
        </Select>
        <Button
          v-if="isOwner && member.role !== 'owner'"
          size="icon"
          variant="ghost"
          @click="remove(member.id)"
        >
          <XIcon class="size-4" />
        </Button>
        <Button
          v-else-if="member.id === user?.id && !isOwner"
          size="xs"
          variant="ghost"
          @click="methods.deleteNoteForever(note)"
        >
          Leave
        </Button>
      </li>
    </ul>
  </div>
</template>
