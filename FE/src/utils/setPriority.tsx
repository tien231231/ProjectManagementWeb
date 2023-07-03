import {
  DoubleRightOutlined,
  DownOutlined,
  PauseOutlined,
  UpOutlined,
} from "@ant-design/icons";

export const setPriority = (priorityData: string) => {
  let priority = null;
  switch (priorityData) {
    case "lowest":
      priority = (
        <DoubleRightOutlined rotate={90} style={{ color: "#3d5cd7" }} />
      );
      break;
    case "low":
      priority = <DownOutlined style={{ color: "#3d5cd7" }} />;
      break;
    case "medium":
      priority = <PauseOutlined rotate={90} style={{ color: "#C59a10" }} />;
      break;
    case "high":
      priority = <UpOutlined style={{ color: "#F07c6f" }} />;
      break;
    case "highest":
      priority = (
        <DoubleRightOutlined rotate={270} style={{ color: "#Ee240c" }} />
      );
      break;
  }
  return priority;
};
