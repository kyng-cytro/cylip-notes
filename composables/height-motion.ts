export const useHeightMotion = () => {
  const beforeEnter = (el: any) => {
    el.style.height = "0";
    el.style.opacity = "0";
    void el.offsetHeight;
  };
  const enter = (el: any) => {
    const height = el.scrollHeight;
    el.style.transition = "height 0.3s ease-in-out, opacity 0.3s ease-in-out";
    el.style.height = `${height}px`;
    el.style.opacity = "1";
  };
  const leave = (el: any) => {
    el.style.transition = "height 0.3s ease-in-out, opacity 0.3s ease-in-out";
    el.style.height = "0";
    el.style.opacity = "0";
  };
  return { enter, leave, beforeEnter };
};
