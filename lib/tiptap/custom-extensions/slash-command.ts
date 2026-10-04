import { Extension, type Editor } from "@tiptap/core";
import { PluginKey } from "@tiptap/pm/state";
import Suggestion, { type SuggestionOptions } from "@tiptap/suggestion";
import type { Component } from "vue";

export type SlashItem = {
  id: string;
  title: string;
  icon: Component;
  apply: (editor: Editor) => void;
};

type SlashCommandOptions = {
  items: (query: string) => SlashItem[];
  render: SuggestionOptions<SlashItem>["render"];
};

const slashCommandKey = new PluginKey("slashCommand");

export const SlashCommand = Extension.create<SlashCommandOptions>({
  name: "slashCommand",
  addOptions: () => ({ items: () => [], render: undefined }),
  addProseMirrorPlugins() {
    return [
      Suggestion<SlashItem>({
        editor: this.editor,
        pluginKey: slashCommandKey,
        char: "/",
        allow: ({ state, range }) =>
          !state.doc.resolve(range.from).parent.type.spec.code,
        items: ({ query }) => this.options.items(query),
        command: ({ editor, range, props }) => {
          editor.chain().focus().deleteRange(range).run();
          props.apply(editor);
        },
        render: this.options.render,
      }),
    ];
  },
});
