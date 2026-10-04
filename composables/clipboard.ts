import { htmlToMarkdown } from "@/lib/turndown";
import { toast } from "vue-sonner";

export const useCustomClipboard = () => {
  const { copy } = useClipboard();

  const copyText = async (
    text: string | null | undefined,
    asMarkdown = false,
  ) => {
    const data = text && (asMarkdown ? htmlToMarkdown(text) : text);
    if (!data) return toast.warning("No content to copy");
    await copy(data);
    toast.success("Copied to clipboard");
  };

  return { copy: copyText };
};
