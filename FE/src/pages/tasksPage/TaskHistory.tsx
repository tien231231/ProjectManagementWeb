import { IUser, IUserBase } from "./TaskForm";
import Loading from "../../components/support/Loading";
import taskApi from "../../services/api/taskApi";
import { Button, List, Modal, Popover, Skeleton, Steps } from "antd";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import type { StepsProps } from "antd";

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
interface IDataTableActivity {
  from: string[];
  to: string[];
  field: string[];
}

const TaskHistory: React.FC<IProps> = ({ taskCurrentId }) => {
  const [activities, setActivities] = useState<IActivities[] | any>(null);
  const [loading, setLoading] = useState(true);
  const [modalDetail, setModalDetail] = useState<boolean>(false);
  const [activityDetail, setActivityDetail] = useState<IActivities | any>(null);
  const [DataTableActivity, setDataTableActivity] =
    useState<IDataTableActivity>({
      from: [],
      to: [],
      field: [],
    });
  const params = useParams();

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
        return "#5856d6 ";
      case "complete":
        return "#ff9500 ";
      case "cancel":
        return "#ff3b30 ";
      default:
        return "#333";
    }
  };

  useEffect(() => {
    if (activityDetail) {
      setDataTableActivity({
        from: Object.values(activityDetail.action.from),
        to: Object.values(activityDetail.action.to),
        field: Object.keys(activityDetail.action.from),
      });
    }
  }, [activityDetail]);
  console.log(activityDetail);
  const stepItem = (listStep: IActivities[]) => {
    const newListStep =
      activities &&
      listStep.map((step: IActivities) => {
        return {
          title: (
            <p
              className="title"
              style={{ color: colorTitle(step.action.actionType) }}
            >
              {step.action.actionType} task
            </p>
          ),
          description: (
            <div className="history__des">
              <div className="history__user">
                <p>{step?.userId?.fullName}</p>
                <time>
                  {moment(step?.timestamp).format("DD/MM/YYYY hh:mm")}
                </time>
              </div>
              <div className="history__status">
                {/* {step.comment ? (
                <p className="comment">{step.comment}</p>
              ) : (
                <>
                  <span>{step.actionFrom}</span>
                  <div className="arrow__wrapper">
                    <div className="arrow-1"></div>
                  </div>
                  <span>{step.actionTo}</span>
                </>
              )} */}
                <div className="arrow__wrapper">
                  <div className="arrow-1"></div>
                </div>
                <Button
                  onClick={() => {
                    setActivityDetail(step);
                    setModalDetail(true);
                  }}
                >
                  Xem chi tiết
                </Button>
              </div>
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

  return (
    <div className="task__history">
      <Modal
        title=""
        width="80%"
        open={modalDetail}
        onCancel={handleCancel}
        maskClosable={false}
        style={{ top: "50px" }}
        footer={[]}
      >
        {/* {activityDetail && JSON.stringify(activityDetail.action)} */}

        {activityDetail && DataTableActivity && (
          <>
            <div className="activity__Detail">
              <div className="activity__Detail--item">
                <List
                  size="small"
                  bordered
                  dataSource={DataTableActivity?.from}
                  renderItem={(item) => <List.Item>{item}</List.Item>}
                />
              </div>
              <div className="wide">
                <List
                  size="small"
                  bordered
                  dataSource={DataTableActivity?.field}
                  renderItem={(item) => <List.Item>{item}</List.Item>}
                />
              </div>
              <div className="activity__Detail--item">
                <List
                  size="small"
                  bordered
                  dataSource={DataTableActivity?.to}
                  renderItem={(item) => <List.Item>{item}</List.Item>}
                />
              </div>
            </div>
          </>
        )}
      </Modal>
      {loading ? (
        <Loading />
      ) : (
        <Steps
          current={-1}
          progressDot
          direction="vertical"
          items={stepItem(activities)}
        />
      )}
    </div>
  );
};

export default TaskHistory;
