<script setup lang="ts">
import { toast } from "vue-sonner";
import { updateUserSchema } from "@/schemas/user";
import { toTypedSchema } from "@vee-validate/zod";
import { PlusIcon } from "lucide-vue-next";
definePageMeta({
  layout: "app",
});
const { user, updateUser } = useUser();
const formSchema = toTypedSchema(updateUserSchema);
const onSubmit = async (values: Record<string, string>) => {
  if (!user.value) return;
  try {
    await updateUser(values);
    toast.success("Account information updated successfully");
  } catch (e: any) {
    toast.error("Something went wrong", { description: e.data.message });
  }
};
</script>
<template>
  <AppMainContainer class="max-w-5xl">
    <div class="flex flex-col gap-y-2">
      <h3 class="text-xl font-bold">Account Information</h3>
      <p class="text-muted-foreground">
        Manage your account information, including your display name, profile
        picture, and current plan.
      </p>
      <hr class="my-2 bg-muted" />
    </div>
    <Form
      class="mb-8 grid max-w-lg gap-4"
      v-slot="{ isSubmitting }"
      @submit="onSubmit"
      :initial-values="{
        name: user?.name,
        email: user?.email,
        picture: user?.picture,
      }"
      :validation-schema="formSchema"
    >
      <FormField name="name" v-slot="{ componentField }">
        <FormItem>
          <FormLabel class="font-semibold">Display Name</FormLabel>
          <FormControl>
            <Input type="text" placeholder="Name" v-bind="componentField" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
      <FormField name="email" v-slot="{ componentField }">
        <FormItem>
          <FormLabel class="font-semibold">Email</FormLabel>
          <FormControl>
            <Input
              type="email"
              placeholder="Email"
              v-bind="componentField"
              disabled
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
      <div class="mb-4 space-y-1 text-sm">
        <p class="font-semibold">Current plan</p>
        <p class="text-muted-foreground">
          You are currently on the
          <span class="font-semibold capitalize">{{ user?.accountType }}</span>
          plan.
          <NuxtLink
            to="/pricing"
            class="underline underline-offset-4 hover:text-primary"
            >Switch to a different plan</NuxtLink
          >
        </p>
      </div>
      <Button :loading="isSubmitting" class="font-semibold"
        >Update Account</Button
      >
    </Form>
    <div class="flex flex-col gap-y-2">
      <div class="flex items-end justify-between">
        <div class="space-y-2">
          <h3 class="text-xl font-bold">Label Management</h3>
          <p class="text-muted-foreground">
            Manage your labels, create new ones, update or delete existing ones.
          </p>
        </div>
        <AppLabelCreate>
          <template #trigger="{ disabled }">
            <Button :disabled="disabled" size="icon" variant="ghost"
              ><PlusIcon class="size-5"
            /></Button>
          </template>
        </AppLabelCreate>
      </div>
      <hr class="my-2 bg-muted" />
    </div>
  </AppMainContainer>
</template>
