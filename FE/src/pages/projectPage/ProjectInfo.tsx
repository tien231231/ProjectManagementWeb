import React from "react";
import { Descriptions, Typography, Button } from "antd";
import dayjs from "dayjs";
import { ProjectType } from "./ProjectDetail";
import { useTranslation } from "react-i18next";
import { setStatusLabel } from "../../utils/setStatusLabel";

const { Title, Text } = Typography;

interface PropTypes {
  projectDetail?: ProjectType;
}

const ProjectInfo: React.FC<PropTypes> = ({ projectDetail }) => {
  const { t, i18n } = useTranslation(["content", "base"]);
  const { bgColor, statusLabel, fontColor } = setStatusLabel(
    projectDetail?.status as string
  );

  return (
    <div className="project-info">
      <Descriptions
        bordered
        layout="vertical"
        column={{ xs: 1, sm: 2 }}
        title={
          <div className="description_title">
            <Title level={3}>{projectDetail?.name}</Title>
          </div>
        }
      >
        <Descriptions.Item label={`${t("content:form.project code")}`}>
          {projectDetail?.code}
        </Descriptions.Item>
        <Descriptions.Item label={`${t("content:form.status")}`}>
          <Button
            type="primary"
            shape="round"
            style={{ backgroundColor: bgColor }}
          >
            <Text strong style={{ color: fontColor }}>
              {statusLabel}
            </Text>
          </Button>
        </Descriptions.Item>
        <Descriptions.Item label={`${t("content:form.description")}`} span={2}>
          {projectDetail?.description}
        </Descriptions.Item>
        <Descriptions.Item label={`${t("content:startingDate")}`}>
          {dayjs(projectDetail?.startDate).format("DD-MM-YYYY")}
        </Descriptions.Item>
        <Descriptions.Item label={`${t("content:endDateExpected")}`}>
          {dayjs(projectDetail?.estimatedEndDate).format("DD-MM-YYYY")}
        </Descriptions.Item>
      </Descriptions>
    </div>
  );
};

export default ProjectInfo;
