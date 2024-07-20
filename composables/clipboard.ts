import { toast } from "vue-sonner";
import { convertToMarkDown } from "@/lib/turndown";

export const useCustomClipboard = () => {
  const { copy } = useClipboard();

  const copyToClipboard = async (
    text?: string | null,
    convert?: boolean,
    messages?: {
      suceess?: string;
      warning?: string;
    },
  ) => {
    if (!text) return toast.warning(messages?.warning ?? "No content to copy");
    const data = convert ? convertToMarkDown(text) : text;
    if (!data) return toast.warning(messages?.warning ?? "No content to copy");
    await copy(data);
    toast.success(messages?.suceess ?? "Copied to clipboard");
  };

  return { copy: copyToClipboard };
};
