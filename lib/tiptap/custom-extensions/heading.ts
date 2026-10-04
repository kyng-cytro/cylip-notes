import { textblockTypeInputRule } from "@tiptap/core";
import BaseHeading from "@tiptap/extension-heading";

export const HEADING_LEVELS = { heading: 3, subheading: 4 } as const;

export const Heading = BaseHeading.extend({
  addInputRules() {
    return [
      textblockTypeInputRule({
        find: /^(#{1,2})\s$/,
        type: this.type,
        getAttributes: (match) => ({
          level:
            match[1]!.length === 1
              ? HEADING_LEVELS.heading
              : HEADING_LEVELS.subheading,
        }),
      }),
    ];
  },
}).configure({
  levels: [HEADING_LEVELS.heading, HEADING_LEVELS.subheading],
});
