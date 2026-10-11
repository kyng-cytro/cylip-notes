const OPEN_LAYERS = "[data-dismissable-layer], [data-floating-menu]";

const hasOpenLayer = () =>
  [...document.querySelectorAll<HTMLElement>(OPEN_LAYERS)].some((layer) =>
    layer.checkVisibility({ visibilityProperty: true, opacityProperty: true }),
  );

const isOnBackdrop = (event: Event) => event.target === event.currentTarget;

export const useBackdropClose = (close: () => void) => {
  let pressedBackdrop = false;

  const onPointerdown = (event: PointerEvent) => {
    pressedBackdrop = isOnBackdrop(event) && !hasOpenLayer();
  };

  const onClick = (event: MouseEvent) => {
    if (pressedBackdrop && isOnBackdrop(event)) close();
    pressedBackdrop = false;
  };

  onKeyStroke("Escape", (event) => {
    if (!event.defaultPrevented && !hasOpenLayer()) close();
  });

  return { onPointerdown, onClick };
};
