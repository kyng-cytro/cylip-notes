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
const onSubmit = async (values: Record<string, string | File>) => {
  if (!user.value) return;
  try {
    await updateUser(values);
    toast.success("Account information updated successfully");
  } catch (e: any) {
    toast.error("Something went wrong", { description: e.data.message });
  }
};

const getImage = (value?: File | string | null) => {
  if (!value) return "";
  if (value instanceof File) {
    return URL.createObjectURL(value);
  }
  return value;
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
      <hr class="bg-muted my-2" />
    </div>
    <Form
      class="mb-8 grid max-w-lg gap-6"
      v-slot="{ isSubmitting }"
      @submit="onSubmit"
      :initial-values="{
        name: user?.name,
        email: user?.email,
        picture: user?.picture,
      }"
      :validation-schema="formSchema"
    >
      <FormField name="picture" v-slot="{ value, handleChange, handleBlur }">
        <FormItem class="flex-start">
          <FormLabel class="flex flex-col">
            <span class="font-semibold">Display Picture</span>
            <Avatar class="mt-3 size-24 cursor-pointer rounded-lg" tabindex="0">
              <AvatarImage :src="getImage(value)" alt="Display Picture" />
              <AvatarFallback
                class="bg-muted text-muted-foreground text-lg font-semibold"
              >
                {{ user?.name ? getTwoChars(user.name) : "C|N" }}
              </AvatarFallback>
            </Avatar>
          </FormLabel>
          <FormControl>
            <Input
              type="file"
              class="hidden"
              accept="image/*"
              @blur="handleBlur"
              @change="handleChange"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
      <FormField name="name" v-slot="{ componentField }">
        <FormItem>
          <FormLabel class="font-semibold">Display Name</FormLabel>
          <FormControl>
            <Input
              type="text"
              placeholder="Name"
              v-bind="componentField"
              autocomplete="name"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
      <FormField name="email" v-slot="{ componentField }">
        <FormItem>
          <FormLabel class="font-semibold">Email</FormLabel>
          <FormControl>
            <Input
              disabled
              type="email"
              autocomplete="email"
              placeholder="Email"
              v-bind="componentField"
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
            class="hover:text-primary underline underline-offset-4"
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
      <hr class="bg-muted my-2" />
    </div>
  </AppMainContainer>
</template>
