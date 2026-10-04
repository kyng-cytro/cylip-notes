import type { PendingInvite } from "@/server/utils/note-sharing";
import { toast } from "vue-sonner";

const toastId = (invite: PendingInvite) => `invite-${invite.noteId}`;

export const useInvites = () => {
  const invites = useState<PendingInvite[]>("invites", () => []);

  const respond = async (invite: PendingInvite, accept: boolean) => {
    try {
      await $fetch(`/api/invites/${invite.noteId}${accept ? "/accept" : ""}`, {
        method: accept ? "POST" : "DELETE",
      });
      invites.value = invites.value.filter(
        (item) => item.noteId !== invite.noteId,
      );
      toast.success(accept ? "Invite accepted" : "Invite declined");
    } catch {
      toast.error("Couldn't respond to the invite", {
        description: "Check your connection and try again.",
      });
    }
  };

  const showInvite = (invite: PendingInvite) =>
    toast(`${invite.sharer.name} invited you to “${invite.note.title}”`, {
      id: toastId(invite),
      description: `${invite.sharer.email} · ${invite.role}`,
      duration: Infinity,
      action: { label: "Accept", onClick: () => respond(invite, true) },
      cancel: { label: "Decline", onClick: () => respond(invite, false) },
    });

  const showAll = () => invites.value.forEach(showInvite);

  const refresh = async () => {
    const latest = await $fetch<PendingInvite[]>("/api/invites").catch(
      () => invites.value,
    );
    const latestIds = new Set(latest.map(toastId));
    invites.value
      .filter((invite) => !latestIds.has(toastId(invite)))
      .forEach((invite) => toast.dismiss(toastId(invite)));
    invites.value = latest;
    showAll();
  };

  return { invites, refresh, showAll };
};
