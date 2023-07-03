import ActivityForm from "./ActivityForm";
import { IUserBase } from "./TaskForm";
import Loading from "../../components/support/Loading";
import taskApi from "../../services/api/taskApi";
import { Button, Col, Modal, Row, Steps } from "antd";
import parse from "html-react-parser";
import moment from "moment";
import "moment/locale/vi";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router";
import { v4 as uuid } from "uuid";

interface IActivities {
  _id: string;
  userId: IUserBase;
  action: {
    actionType: string;
    from: any;
    to: any;
  };
  timestamp: Date;
}

interface IProps {
  taskCurrentId?: string;
}

const TaskHistory: React.FC<IProps> = ({ taskCurrentId }) => {
  const [activities, setActivities] = useState<IActivities[] | any>(null);
  const [loading, setLoading] = useState(true);
  const [modalDetail, setModalDetail] = useState<boolean>(false);
  const [activityDetail, setActivityDetail] = useState<IActivities | any>(null);
  const [width, setWidth] = useState(window.innerWidth);

  const params = useParams();
  const { t, i18n } = useTranslation(["content", "base"]);
  moment.locale(i18n.language);

  // lấy all hoạt động
  useEffect(() => {
    taskApi
      .getActivities(taskCurrentId || (params.taskId as string))
      .then((res: any) => {
        setActivities(res?.activities);
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
      });
  }, [params.taskId, taskCurrentId]);
  // thay đổi mã màu dựa theo type công viềc
  const colorTitle = (title: string) => {
    switch (title) {
      case "create":
        return "#32a852 ";
      case "update":
        return "#007aff ";
      case "comment":
        return "#AAAAAA ";
      case "complete":
        return "#ff9500 ";
      case "cancel":
        return "#ff3b30 ";
      default:
        return "#333";
    }
  };

  const stepItem = (listStep: IActivities[]) => {
    const newListStep =
      activities &&
      listStep.map((step: IActivities) => {
        return {
          title: (
            <p
              className="title"
              style={{
                color: colorTitle(step.action.actionType),
                textTransform: "capitalize",
              }}
            >
              {t(`content:task.${step.action.actionType}` as keyof typeof t)}{" "}
              {t("content:task.task")}
            </p>
          ),
          description: (
            <div className="history__des">
              <div className="history__user">
                <p>
                  {step?.userId?.fullName.length < 20
                    ? step?.userId?.fullName
                    : `${step?.userId?.fullName.substring(0, 15)}...`}
                </p>
                <time>
                  {moment(step?.timestamp).format("DD MMMM, YYYY - hh:mm A")}
                </time>
              </div>
              {step.action.actionType !== "create" &&
                step.action.actionType !== "complete" &&
                step.action.actionType !== "delete" && (
                  <div className="history__status">
                    <div className="fields__change">
                      {Object.keys(step?.action?.to)
                        .filter((item, index) => {
                          if (
                            step?.action?.to?.assignee ===
                            step?.action?.from?.assignee
                          ) {
                            return item !== "assignee";
                          } else return true;
                        })
                        .map((activity, index) => (
                          <span key={index}>
                            {index !== 0 && ", "}
                            {t(`content:form.${activity}` as keyof typeof t)}
                          </span>
                        ))}
                    </div>

                    <div className="arrow__wrapper">
                      <div className="arrow-1"></div>
                    </div>
                    <Button
                      onClick={() => {
                        setActivityDetail(step);
                        setModalDetail(true);
                      }}
                    >
                      {t("base:detail")}
                    </Button>
                  </div>
                )}
            </div>
          ),
        };
      });
    return newListStep;
  };
  // cancel modal
  const handleCancel = () => {
    setModalDetail(false);
  };
  // phần xác định chiều rộng màn hình hiện tại để làm đóng mở sidebar
  useEffect(() => {
    const handleResize = () => {
      setWidth(window.innerWidth);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  return (
    <div className="task__history">
      <Modal
        title=""
        width={
          activityDetail && activityDetail?.action?.actionType === "comment"
            ? "60%"
            : "90%"
        }
        open={modalDetail}
        onCancel={handleCancel}
        maskClosable={false}
        style={{ top: "50px", minHeight: "500px" }}
        footer={[]}
        className="modal__activity--detail"
      >
        {activityDetail && (
          <>
            {activityDetail?.action?.actionType !== "comment" ? (
              <>
                <Row key={uuid()}>
                  <Col span={width < 700 ? 24 : 11}>
                    <strong className="title__activity">
                      {t("base:before")}
                    </strong>
                    <ActivityForm activity={activityDetail?.action?.from} />
                  </Col>
                  <Col span={width < 700 ? 4 : 1}>
                    <div className="arrow__wrapper--2">
                      <div className="arrow-1"></div>
                    </div>
                  </Col>
                  <Col span={width < 700 ? 24 : 12}>
                    <strong className="title__activity">
                      {t("base:after")}
                    </strong>
                    <ActivityForm activity={activityDetail?.action?.to} />
                  </Col>
                </Row>
              </>
            ) : (
              <div className="comment_content">
                <img
                  src={activityDetail?.userId?.avatar || ""}
                  alt=""
                  className="img_user"
                />
                <div className="comment-container">
                  <p className="title">
                    {activityDetail?.userId?.fullName.length < 30
                      ? activityDetail?.userId?.fullName
                      : `${activityDetail?.userId?.fullName.substring(
                          0,
                          25
                        )}...`}
                    <span>
                      {moment(
                        activityDetail?.action?.to?.comment?.createdDate
                      ).format("DD/MM/YYYY hh:mm")}
                    </span>
                  </p>
                  <div className="content">
                    {parse(activityDetail?.action?.to?.comment?.content)}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </Modal>
      {loading ? (
        <Loading />
      ) : (
        <div className="task__history--main scroll_custom">
          <Steps
            current={-1}
            progressDot
            direction="vertical"
            items={stepItem(activities)}
          />
        </div>
      )}
    </div>
  );
};

export default TaskHistory;
