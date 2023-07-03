import { Descriptions } from "antd";
import parse from "html-react-parser";
import moment from "moment";
import "moment/locale/vi";
import React from "react";
import { useTranslation } from "react-i18next";

type Props = {
  activity: any;
};

const ActivityForm = ({ activity }: Props) => {
  const { t, i18n } = useTranslation(["content", "base"]);
  moment.locale(i18n.language);

  return (
    <div className="activity__form">
      <Descriptions
        bordered
        column={2}
        labelStyle={{
          width: "15%",
          textAlign: "start",
          verticalAlign: "top",
          fontSize: "12px",
        }}
        contentStyle={{
          textAlign: "start",
          verticalAlign: "top",
          width: "35%",
          fontSize: "12px",
          fontWeight: "bold",
        }}
      >
        <Descriptions.Item label={t("content:form.title")} span={2}>
          {activity?.title || ""}
        </Descriptions.Item>
        <Descriptions.Item label={t("content:form.job code")}>
          {activity?.code || ""}
        </Descriptions.Item>
        <Descriptions.Item label={t("content:form.status")}>
          {activity?.status
            ? t(`content:form.${activity?.status}` as keyof typeof t)
            : ""}
        </Descriptions.Item>
        <Descriptions.Item label={t("content:form.type")}>
          {activity?.type ? (
            <div className="task__type--main">
              {t(`content:form.${activity?.type}` as keyof typeof t)}
              <div
                className="task_type"
                style={{
                  backgroundColor:
                    activity?.type === "issue" ? "#EC2B2B" : "#44CB39",
                }}
              ></div>
            </div>
          ) : (
            ""
          )}
        </Descriptions.Item>
        <Descriptions.Item label={t("content:form.priority")}>
          {activity?.priority
            ? t(`content:form.${activity?.priority}` as keyof typeof t)
            : ""}
        </Descriptions.Item>
        <Descriptions.Item label={t("content:form.creator")}>
          {activity?.createdBy?.fullName || ""}
        </Descriptions.Item>
        <Descriptions.Item label={t("content:form.assignee")}>
          {activity?.assignee || ""}
        </Descriptions.Item>

        <Descriptions.Item label={t("content:form.date created")}>
          {activity?.createdDate
            ? moment(activity?.createdDate).format("DD MMMM, YYYY - hh:mm A")
            : ""}
        </Descriptions.Item>
        <Descriptions.Item label={t("content:startDate")} span={1}>
          {activity?.startDate
            ? moment(activity?.startDate).format("DD MMMM, YYYY - hh:mm A")
            : ""}
        </Descriptions.Item>

        <Descriptions.Item label={t("content:form.deadline")}>
          {activity?.deadline
            ? moment(activity?.deadline).format("DD MMMM, YYYY - hh:mm A")
            : ""}
        </Descriptions.Item>
        <Descriptions.Item label={t("content:endDateActual")} span={1}>
          {activity?.endDate
            ? moment(activity?.endDate).format("DD MMMM, YYYY - hh:mm A")
            : ""}
        </Descriptions.Item>

        <Descriptions.Item
          span={2}
          style={{
            textAlign: "start",
            verticalAlign: "top",
            fontWeight: "unset",
          }}
          label={t("content:form.description")}
        >
          <div className="task__form--description">
            {parse(activity?.description || "")}
          </div>
        </Descriptions.Item>
      </Descriptions>
    </div>
  );
};

export default ActivityForm;
