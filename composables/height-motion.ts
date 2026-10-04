const TRANSITION = "height 0.3s ease-in-out, opacity 0.3s ease-in-out";

export const useHeightMotion = () => {
  const beforeEnter = (element: Element) => {
    const el = element as HTMLElement;
    el.style.height = "0";
    el.style.opacity = "0";
    void el.offsetHeight;
  };
  const enter = (element: Element) => {
    const el = element as HTMLElement;
    el.style.transition = TRANSITION;
    el.style.height = `${el.scrollHeight}px`;
    el.style.opacity = "1";
  };
  const leave = (element: Element) => {
    const el = element as HTMLElement;
    el.style.transition = TRANSITION;
    el.style.height = "0";
    el.style.opacity = "0";
  };
  return { beforeEnter, enter, leave };
};
