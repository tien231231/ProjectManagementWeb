var dayjs = require("dayjs");

export function formatDate(date: string) {
  let newDate = date.split("/").reverse().join("/");
  return dayjs(newDate);
}
