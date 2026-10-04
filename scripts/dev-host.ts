import { networkInterfaces } from "node:os";

const lanAddress = Object.values(networkInterfaces())
  .flat()
  .find((entry) => entry?.family === "IPv4" && !entry.internal)?.address;

if (!lanAddress) {
  console.error("No LAN address found. Connect to a network and try again.");
  process.exit(1);
}

const appUrl = `http://${lanAddress}:3000`;
const syncUrl = `http://${lanAddress}:8787`;

const env = {
  ...process.env,
  NUXT_PUBLIC_BASE_URL: appUrl,
  NUXT_PUBLIC_SYNC_URL: syncUrl,
};

const run = (command: string[]) =>
  Bun.spawn(command, { env, stdio: ["inherit", "inherit", "inherit"] });

const processes = [
  run(["bunx", "nuxt", "dev", "--host", "0.0.0.0"]),
  run([
    "bunx",
    "wrangler",
    "dev",
    "-c",
    "sync/wrangler.jsonc",
    "--ip",
    "0.0.0.0",
    "--var",
    `APP_URL:${appUrl}`,
  ]),
];

const stopAll = () => processes.forEach((child) => child.kill());

process.on("SIGINT", stopAll);
process.on("SIGTERM", stopAll);

console.log(`\nOpen ${appUrl} on your phone and this computer.\n`);

await Promise.race(processes.map((child) => child.exited));
stopAll();
