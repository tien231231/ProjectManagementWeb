const _ = require("lodash");

export const setStatusLabel = (data: string) => {
  let bgColor: string = "";
  let statusLabel: string = "";
  let fontColor: string = "";
  switch (data) {
    case "open":
      bgColor = "#2E55DE";
      statusLabel = _.capitalize(data);
      fontColor = "#f2f3f7";
      break;
    case "inprogress":
      bgColor = "#F0E155";
      statusLabel = "In Progress";
      break;
    case "review":
      bgColor = "#E6883f";
      statusLabel = _.capitalize(data);
      break;
    case "reopen":
      bgColor = "#8544d4";
      statusLabel = "Re-Open";
      break;
    case "done":
      bgColor = "#44CB39";
      statusLabel = _.capitalize(data);
      break;
    case "cancel":
      bgColor = "#EC2B2B";
      statusLabel = _.capitalize(data);
      break;
    case "ongoing":
      bgColor = "#F0E155";
      statusLabel = "On-Going";
      break;
    case "completed":
      bgColor = "#44CB39";
      statusLabel = _.capitalize(data);
      break;
    case "suspended":
      bgColor = "#EC2B2B";
      statusLabel = _.capitalize(data);
      break;
    case "preparing":
      bgColor = "#2E55DE";
      fontColor = "#f2f3f7";
      statusLabel = _.capitalize(data);
      break;
    default:
      bgColor = "transparent";
      break;
  }
  return { bgColor, statusLabel, fontColor };
};
