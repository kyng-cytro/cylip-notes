const userColumns = { id: true, name: true, email: true, image: true } as const;

export default defineAuthenticatedEventHandler(async (event) => {
  const id = getRouterParam(event, "id")!;
  await requireNoteRole(id, event.context.user.id, [
    "owner",
    "editor",
    "viewer",
  ]);
  const note = await useDrizzle().query.note.findFirst({
    columns: {},
    where: eq(tables.note.id, id),
    with: {
      user: { columns: userColumns },
      members: {
        columns: { role: true },
        with: { user: { columns: userColumns } },
      },
    },
  });
  if (!note) throw createError({ statusCode: 404 });
  return [
    { ...note.user, role: "owner" as const },
    ...note.members.map((member) => ({ ...member.user, role: member.role })),
  ];
});
