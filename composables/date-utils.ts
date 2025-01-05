export const useDateUtils = () => {
  const formatToTimeAgo = (
    date: Date | string | number,
    opts?: { sentence?: boolean },
  ) => {
    const value = useTimeAgo(date).value;
    if (opts?.sentence) return value.charAt(0).toUpperCase() + value.slice(1);
    return value;
  };
  const format = (
    date: Date | string | number,
    format = "ddd D, MMM, YYYY hh:mm a",
  ) => {
    return useDateFormat(date, format).value;
  };

  return { format, formatToTimeAgo };
};
