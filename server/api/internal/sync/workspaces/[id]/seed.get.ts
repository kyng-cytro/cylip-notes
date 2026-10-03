export default defineSyncEventHandler((event) =>
  buildWorkspaceSeed(getRouterParam(event, "id")!),
);
