import { Bell, Notebook, Archive, Trash, Settings } from "lucide-vue-next";
export const routes = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: Notebook,
  },
  {
    name: "Reminders",
    path: "/dashboard/reminders",
    icon: Bell,
  },
  {
    name: "Archive",
    path: "/dashboard/archive",
    icon: Archive,
  },
  {
    name: "Trash",
    path: "/dashboard/trash",
    icon: Trash,
  },
  {
    name: "Settings",
    path: "/dashboard/settings",
    icon: Settings,
  },
];
