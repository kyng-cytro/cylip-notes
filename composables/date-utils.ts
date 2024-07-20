export const useDateUtils = () => {
  const formatToTimeAgo = (date: Date | string | number) => {
    return useTimeAgo(date).value;
  };

  return { formatToTimeAgo };
};
