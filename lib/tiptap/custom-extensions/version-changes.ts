import { VERSION_CHANGE } from "@/constants";
import { Extension, Mark, mergeAttributes } from "@tiptap/core";

const UNMARKED_NODES = new Set(["doc", "text"]);

const changeAttribute = {
  default: null,
  renderHTML: (attributes: Record<string, unknown>) =>
    attributes[VERSION_CHANGE]
      ? { "data-version-change": attributes[VERSION_CHANGE] }
      : {},
};

const VersionChangeMark = Mark.create({
  name: VERSION_CHANGE,
  addAttributes: () => ({
    kind: {
      default: "added",
      renderHTML: ({ kind }) => ({ "data-version-change": kind }),
    },
  }),
  renderHTML: ({ HTMLAttributes }) => [
    "span",
    mergeAttributes(HTMLAttributes),
    0,
  ],
});

export const VersionChanges = Extension.create({
  name: "versionChanges",
  addExtensions: () => [VersionChangeMark],
  addGlobalAttributes() {
    return [
      {
        types: this.extensions
          .filter(
            (extension) =>
              extension.type === "node" && !UNMARKED_NODES.has(extension.name),
          )
          .map((extension) => extension.name),
        attributes: { [VERSION_CHANGE]: changeAttribute },
      },
    ];
  },
});
