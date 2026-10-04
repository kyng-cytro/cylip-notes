import SlashMenu from "@/components/editor/slash-menu.vue";
import type { SlashItem } from "@/lib/tiptap/custom-extensions";
import { computePosition, flip, offset, shift, size } from "@floating-ui/dom";
import type { SuggestionOptions, SuggestionProps } from "@tiptap/suggestion";
import { VueRenderer } from "@tiptap/vue-3";

type MenuProps = SuggestionProps<SlashItem>;

const fitHeight = ({
  availableHeight,
  elements,
}: {
  availableHeight: number;
  elements: { floating: HTMLElement };
}) =>
  elements.floating.style.setProperty(
    "--available-height",
    `${availableHeight}px`,
  );

const place = async (element: Element | null, props: MenuProps) => {
  const rect = props.clientRect?.();
  if (!(element instanceof HTMLElement) || !rect) return;
  const { x, y } = await computePosition(
    { getBoundingClientRect: () => rect },
    element,
    {
      placement: "bottom-start",
      strategy: "fixed",
      middleware: [
        offset(6),
        flip({ padding: 8 }),
        shift({ padding: 8 }),
        size({ padding: 8, apply: fitHeight }),
      ],
    },
  );
  Object.assign(element.style, { left: `${x}px`, top: `${y}px` });
};

export const slashMenuRenderer: SuggestionOptions<SlashItem>["render"] = () => {
  const menu: { renderer?: VueRenderer } = {};
  return {
    onStart: (props) => {
      menu.renderer = new VueRenderer(SlashMenu, {
        props,
        editor: props.editor,
      });
      if (menu.renderer.element) document.body.append(menu.renderer.element);
      place(menu.renderer.element, props);
    },
    onUpdate: (props) => {
      menu.renderer?.updateProps(props);
      place(menu.renderer?.element ?? null, props);
    },
    onKeyDown: ({ event }) => menu.renderer?.ref?.onKeyDown(event) ?? false,
    onExit: () => {
      menu.renderer?.element?.remove();
      menu.renderer?.destroy();
    },
  };
};
