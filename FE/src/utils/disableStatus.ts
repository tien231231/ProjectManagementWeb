export const disableStatus = (
  status: string,
  currentStatus: string
): boolean => {
  switch (status) {
    case "open":
      if (currentStatus === "open") {
        return false;
      }
      return true;
    case "inprogress":
      if (currentStatus === "open" || currentStatus === "reopen") {
        return false;
      }
      return true;
    case "review":
      if (currentStatus === "inprogress") {
        return false;
      }
      return true;
    case "reopen":
      if (currentStatus === "review") {
        return false;
      }
      return true;
    case "done":
      if (currentStatus === "review") {
        return false;
      }
      return true;
    case "cancel":
      if (currentStatus === "done") {
        return true;
      }
      return false;
    default:
      return false;
  }
};
