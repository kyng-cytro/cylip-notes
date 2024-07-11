import { Bell, Notebook, Archive, Trash, Settings } from "lucide-vue-next";
export const routes = [
  {
    name: "Notes",
    path: "/app",
    icon: Notebook,
  },
  {
    name: "Reminders",
    path: "/app/reminders",
    icon: Bell,
  },
  {
    name: "Archive",
    path: "/app/archive",
    icon: Archive,
  },
  {
    name: "Trash",
    path: "/app/trash",
    icon: Trash,
  },
  {
    name: "Settings",
    path: "/app/settings",
    icon: Settings,
  },
];
