import { ColumnData } from "./TasksPage";
import TinyMce from "../../components/tinyMce/TinyMce";
import { useAxios } from "../../hooks";
import useIsBoss from "../../hooks/useIsBoss";
import { useAppDispatch, useAppSelector } from "../../redux/hook";
import { reloadSidebar } from "../../redux/slice/menuSlice";
import { RootState } from "../../redux/store";
import taskApi from "../../services/api/taskApi";
import { changeMsgLanguage } from "../../utils/changeMsgLanguage";
import { disableStatus } from "../../utils/disableStatus";
import { TasksType } from "../dashboardPage/Dashboard";
import { LoadingOutlined } from "@ant-design/icons";
import EN from "antd/es/date-picker/locale/en_US";
import VN from "antd/es/date-picker/locale/vi_VN";
import { NoticeType } from "antd/es/message/interface";
import axios from "axios";
import dayjs from "dayjs";
import parse from "html-react-parser";
import _ from "lodash";
import moment from "moment";
import "moment/locale/vi";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { useParams } from "react-router";

import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Breadcrumb,
  Button,
  DatePicker,
  Descriptions,
  Form,
  Input,
  Popconfirm,
  Select,
  Skeleton,
} from "antd";
import { setQuery } from "../../redux/slice/paramsSlice";

export interface ITask {
  _id: string;
  title: string;
  jobCode?: string;
  code?: string;
  status: string;
  type: string;
  priority: string;
  creator: any;
  createdBy: any;
  assignee: any;
  createdDate?: Date;
  startDate: Date;
  deadline: Date;
  endDateActual?: Date;
  endDate: Date;
  description?: string;
}
interface ITaskForm {
  title: string;
  statusForm: boolean;
  taskInfo: {
    status: boolean;
    data?: ITask;
  };
  taskCurrent?: any;
  edit: boolean;
  button?: string;
  handleEditTask: () => void;
  setIsModalOpen: Dispatch<SetStateAction<boolean>>;
  setCountReloadTasks: Dispatch<SetStateAction<number>>;
  setEdit?: Dispatch<SetStateAction<boolean>>;
  setStatusForm: Dispatch<SetStateAction<boolean>>;
  showMessage: (type: NoticeType, content: string, duration?: number) => void;
  setTasksColumns?: React.Dispatch<React.SetStateAction<ColumnData[]>>;
  tasksColumns?: ColumnData[];
  allTasks?: ITask[];
  setAllTasks?: React.Dispatch<React.SetStateAction<ITask[]>>;
  tasksList?: TasksType[];
  setTasksList?: Dispatch<SetStateAction<TasksType[]>>;
}
export interface IUserBase {
  _id: string;
  fullName: string;
  avatar: string;
  email: string;
  username: string;
}
export interface IUser {
  data: IUserBase;
  role: string;
  joiningDate: Date;
}

const TaskForm = (props: ITaskForm) => {
  const {
    title,
    statusForm,
    setIsModalOpen,
    setStatusForm,
    handleEditTask,
    edit,
    setEdit,
    taskInfo,
    button,
    taskCurrent,
    showMessage,
    setTasksColumns,
    tasksColumns,
    allTasks,
    setAllTasks,
    setCountReloadTasks,
    tasksList,
    setTasksList,
  } = props;
  const [width, setWidth] = useState(window.innerWidth);
  const [description, setDescription] = useState<string>("");
  const [reloadData, setReloadData] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingAll, setLoadingAll] = useState<boolean>(false);
  const [taskData, setTaskData] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>();
  const [breadcrumb, setBreadcrumb] = useState({
    project: "",
    stages: "",
    task: "",
  });

  const params = useParams();
  const [form] = Form.useForm();
  const user = useAppSelector((state: RootState) => state.auth?.userInfo);
  const dispatch = useDispatch();
  const { isBoss } = useIsBoss([], 2, taskCurrent?.project?.id);
  const queryParams = useAppSelector((state: any) => state.queryParams);
  const { t, i18n } = useTranslation(["content", "base", "message"]);
  moment.locale(i18n.language);

  // lấy all user trong project
  const { responseData, isLoading } = useAxios(
    "get",
    `/project/members/all/${params.projectId || taskCurrent.project?.id}`,
    []
  );

  // xác định dữ liệu user hiện tại
  useEffect(() => {
    if (responseData && user) {
      const currentUserArr = responseData?.members?.filter((member: any) => {
        return member.data.username === user.username;
      });
      currentUserArr &&
        currentUserArr.length > 0 &&
        setCurrentUser(currentUserArr[0]?.data);
    }
  }, [responseData, user]);

  //lấy thông tin công việc
  useEffect(() => {
    if (taskCurrent) {
      setLoadingAll(true);
      taskApi
        .getTask(taskCurrent._id)
        .then((res: any) => {
          setTaskData(res.task);
          setLoadingAll(false);
        })
        .catch((err) => {
          setLoadingAll(false);
        });
    }
  }, [taskCurrent, reloadData]);
  //hàm xóa taks
  const handleDelete = () => {
    showMessage("loading", `${t("content:loading")}...`);
    taskApi
      .deleteTask(taskInfo.data?._id as string)
      .then((res: any) => {
        if (tasksList) {
          let newList = tasksList.filter((task: TasksType) => {
            return task._id !== taskInfo.data?._id;
          });
          setTasksList?.(newList);
          dispatch(
            setQuery({
              ...queryParams,
              taskTableParams: {
                ...queryParams.taskTableParams,
                total: queryParams.taskTableParams.total - 1,
              },
            })
          );
        }
        if (tasksColumns && allTasks) {
          let newTasks = allTasks.filter((task: any) => {
            return task._id !== taskInfo.data?._id;
          });
          setAllTasks?.(newTasks);
          let newState = tasksColumns.map((column: any) => {
            column.items = newTasks.filter((task: any) => {
              return task.status === column.id;
            });
            return column;
          });
          setTasksColumns?.(newState);
        }
        showMessage(
          "success",
          changeMsgLanguage(res?.message, "Xóa thành công"),
          2
        );
        setCountReloadTasks((prev) => prev + 1);
        setIsModalOpen(false);
        dispatch(reloadSidebar());
      })
      .catch((err: any) => {
        showMessage(
          "error",
          changeMsgLanguage(err.response?.data?.message, "Xóa thất bại"),
          2
        );
      });
  };
  // hàm submit form
  //statusForm false là tạo mới ,true là chỉnh sửa
  const onFinish = (data: any) => {
    showMessage("loading", `${t("content:loading")}...`);
    //tạo mới
    if (!statusForm) {
      const task = {
        stageId: params.stagesId || taskCurrent?.stage.id,
        title: data.title,
        type: data.type,
        priority: data.priority,
        assignee: data.assignee,
        startDate: data.startDate,
        deadline: data.deadline,
        description: description,
      };
      taskApi
        .addTask(task)
        .then((res: any) => {
          if (tasksColumns && allTasks) {
            let newState = tasksColumns.map((task: any) => {
              if (task.id === "open") {
                return { ...task, items: [res.task, ...task.items] };
              } else return task;
            });
            setAllTasks?.([...allTasks, res.task]);
            setTasksColumns?.(newState);
          }

          showMessage(
            "success",
            changeMsgLanguage(res?.message, "Tạo mới thành công"),
            2
          );
          dispatch(reloadSidebar());
          setIsModalOpen(false);
          setEdit?.(false);
          form.resetFields();
          setCountReloadTasks((prev) => prev + 1);
          setDescription("");
        })
        .catch((err) => {
          showMessage(
            "error",
            changeMsgLanguage(err.response.data?.message, "Tạo mới thất bại"),
            2
          );
        });
    } else {
      // chỉnh sửa
      const task = {
        stageId: params.stagesId || taskCurrent?.stage.id,
        title: data.title,
        type: data.type,
        startDate: data.startDate,
        deadline: data.deadline,
        status: data.status,
        priority: data.priority,
        description: description,
        assignee: data.assignee?.value || data.assignee,
        ...(data.endDate && {
          endDate: data.endDate,
        }),
      };
      taskApi
        .editTask(taskCurrent._id, task)
        .then((res: any) => {
          if (res?.message === "No changes were made") {
            showMessage(
              "success",
              changeMsgLanguage(res?.message, "Bạn chưa thay đổi gì"),
              2
            );
            setEdit?.(false);
            setStatusForm(false);
            return;
          }
          setReloadData((prev) => prev + 1);
          setCountReloadTasks((prev) => prev + 1);
          showMessage(
            "success",
            changeMsgLanguage(res?.message, "Chỉnh sửa thành công"),
            2
          );
          dispatch(reloadSidebar());
          setEdit?.(false);
          setStatusForm(false);
          if (tasksList) {
            let newList = tasksList.map((task: TasksType) => {
              if (task?._id === res?.task?._id) {
                return res.task;
              } else {
                return task;
              }
            });
            setTasksList?.(newList);
          }
        })
        .catch((err) => {
          console.log(err);
          showMessage(
            "error",
            changeMsgLanguage(err.response.data?.message, "Chỉnh sửa thất bại"),
            2
          );
        });
    }
  };

  // lấy dữ liệu cho breadcrumb
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const project = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/project/details/${
            params.projectId || taskCurrent?.project.id
          }`,
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
        const stages = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/stage/details/${
            params.stagesId || taskCurrent?.stage.id
          }`,
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
        setBreadcrumb({
          ...breadcrumb,
          project: project.data.project.name,
          stages: stages.data.stage.name,
        });
        setLoading(false);
      } catch (error) {}
    })();
  }, []);

  const breadcrumbItem = useMemo(() => {
    if (statusForm || taskInfo.status) {
      return [
        {
          title:
            breadcrumb?.project.length < 13
              ? breadcrumb?.project
              : `${breadcrumb?.project.substring(0, 13)}...`,
        },
        {
          title:
            breadcrumb?.stages.length < 13
              ? breadcrumb?.stages
              : `${breadcrumb?.stages.substring(0, 13)}...`,
        },
        {
          title:
            taskData?.title.length < 13
              ? taskData?.title
              : `${taskData?.title.substring(0, 13)}...` || "",
        },
      ];
    } else {
      return [
        { title: breadcrumb.project },
        {
          title: breadcrumb.stages,
        },
      ];
    }
  }, [breadcrumb, taskData]);
  const initialValues = useMemo(() => {
    return statusForm && taskData
      ? {
          title: taskData?.title,
          type: taskData?.type,
          status: taskData?.status,
          priority: taskData?.priority,
          assignee: taskData.assignee?._id,
          startDate: dayjs(taskData?.startDate),
          deadline: dayjs(taskData?.deadline),
          ...(taskData?.endDate && {
            endDate: dayjs(taskData?.endDate),
          }),
          description: taskData?.description,
        }
      : {
          assignee: currentUser?.data?._id,
          type: "assignment",
          priority: "medium",
        };
  }, [statusForm, taskData, currentUser]);

  useEffect(() => {
    if (currentUser) {
      form.setFieldsValue(initialValues);
    }
  }, [initialValues, currentUser]);
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

  return loadingAll ? (
    <Skeleton active />
  ) : (
    <div className="form_task" id="form_task">
      {taskData ? (
        <div className="action__wrapper">
          <div className="action__btn">
            {loading ? (
              <div className="" style={{ height: "19px" }}></div>
            ) : (
              <Breadcrumb
                items={breadcrumbItem}
                style={{ fontSize: "12px", zIndex: 11 }}
              />
            )}

            {currentUser &&
              // Chủ dự án, quản lý dự án, người tạo công việc có thể sửa tất cả thông tin của công việc đã tạo.
              //	Người thực hiện công việc chỉ được phép cập nhật trạng thái công việc.
              (isBoss ||
                currentUser?._id === taskData?.assignee?._id ||
                currentUser?._id === taskCurrent?.createdBy?._id ||
                currentUser?.username === taskData?.assignee?.username) && (
                <div className="task__action--form">
                  <Button type="primary" onClick={handleEditTask}>
                    {edit ? t("base:cancel") : t("base:edit")}
                  </Button>
                  <Popconfirm
                    placement="right"
                    title={t("content:titleDeleteComment")}
                    description={t("content:desDeleteComment")}
                    onConfirm={() => handleDelete()}
                    okText={t("base:ok")}
                    cancelText={t("base:cancel")}
                  >
                    <Button type="primary" danger>
                      {t("base:delete")}
                    </Button>
                  </Popconfirm>
                </div>
              )}
          </div>
        </div>
      ) : loading ? (
        <div className="" style={{ height: "19px" }}></div>
      ) : (
        <Breadcrumb
          items={breadcrumbItem}
          style={{ fontSize: "12px", height: "25px" }}
        />
      )}
      <Form
        initialValues={initialValues}
        size="large"
        layout="vertical"
        name={params.stagesId || taskCurrent?.stage?.id || "form"}
        form={form}
        onFinish={onFinish}
      >
        <Descriptions
          title={title}
          bordered
          column={width < 600 ? 1 : 2}
          labelStyle={{
            width: "15%",
            textAlign: "start",
            verticalAlign: "top",
          }}
          contentStyle={{
            textAlign: "start",
            verticalAlign: "top",
            width: "35%",
          }}
        >
          <Descriptions.Item
            label={t("content:form.title")}
            span={width < 600 ? 1 : 2}
          >
            {!taskInfo.status ? (
              <Form.Item
                name="title"
                rules={[
                  {
                    required: true,
                    message: t("message:task.Please input your task name"),
                  },
                ]}
              >
                <Input
                  disabled={
                    !isBoss &&
                    currentUser?._id === taskCurrent?.assignee?._id &&
                    currentUser?._id !== taskCurrent?.createdBy?._id
                  }
                  placeholder={t("content:form.title") + "..."}
                  maxLength={80}
                />
              </Form.Item>
            ) : (
              taskData?.title
            )}
          </Descriptions.Item>
          <Descriptions.Item label={t("content:form.job code")}>
            {taskData?.code || (
              <span style={{ opacity: 0.4 }}>{t("content:task.jobCode")}</span>
            )}
          </Descriptions.Item>
          <Descriptions.Item label={t("content:form.status")}>
            {!taskInfo.status ? (
              <Form.Item name="status">
                <Select
                  disabled={!statusForm}
                  style={{ width: "100%" }}
                  options={[
                    {
                      value: "open",
                      label: t("content:form.open"),
                      disabled: disableStatus("open", taskData?.status),
                    },
                    {
                      value: "inprogress",
                      label: t("content:form.inprogress"),
                      disabled: disableStatus("inprogress", taskData?.status),
                    },
                    {
                      value: "reopen",
                      label: t("content:form.reopen"),
                      disabled: disableStatus("reopen", taskData?.status),
                    },
                    {
                      value: "review",
                      label: t("content:form.review"),
                      disabled: disableStatus("review", taskData?.status),
                    },
                    {
                      value: "done",
                      label: t("base:done"),
                      disabled: disableStatus("done", taskData?.status),
                    },
                    {
                      value: "cancel",
                      label: t("base:cancel"),
                      disabled: disableStatus("cancel", taskData?.status),
                    },
                  ]}
                />
              </Form.Item>
            ) : (
              t(`content:form.${taskData?.status}` as keyof typeof t)
            )}
          </Descriptions.Item>
          <Descriptions.Item label={t("content:form.type")}>
            {!taskInfo.status ? (
              <Form.Item name="type">
                <Select
                  disabled={
                    !isBoss &&
                    currentUser?._id === taskCurrent?.assignee?._id &&
                    currentUser?._id !== taskCurrent?.createdBy?._id
                  }
                  style={{ width: "100%" }}
                  options={[
                    {
                      value: "assignment",
                      label: (
                        <div className="task__type--main">
                          {t("content:form.assignment")}{" "}
                          <div
                            className="task_type"
                            style={{
                              backgroundColor: "#44CB39",
                            }}
                          ></div>
                        </div>
                      ),
                    },
                    {
                      value: "issue",
                      label: (
                        <div className="task__type--main">
                          {t("content:form.issue")}{" "}
                          <div
                            className="task_type"
                            style={{
                              backgroundColor: "#EC2B2B",
                            }}
                          ></div>
                        </div>
                      ),
                    },
                  ]}
                />
              </Form.Item>
            ) : (
              <div className="task__type--main">
                {t(`content:form.${taskData?.type}` as keyof typeof t)}
                <div
                  className="task_type"
                  style={{
                    backgroundColor:
                      taskData?.type === "issue" ? "#EC2B2B" : "#44CB39",
                  }}
                ></div>
              </div>
            )}
          </Descriptions.Item>
          <Descriptions.Item label={t("content:form.priority")}>
            {!taskInfo.status ? (
              <Form.Item name="priority">
                <Select
                  disabled={
                    !isBoss &&
                    currentUser?._id === taskCurrent?.assignee?._id &&
                    currentUser?._id !== taskCurrent?.createdBy?._id
                  }
                  style={{ width: "100%" }}
                  options={[
                    { value: "highest", label: t("content:form.highest") },
                    { value: "high", label: t("content:form.high") },
                    { value: "medium", label: t("content:form.medium") },
                    { value: "low", label: t("content:form.low") },
                    { value: "lowest", label: t("content:form.lowest") },
                  ]}
                />
              </Form.Item>
            ) : (
              t(`content:form.${taskData?.priority}` as keyof typeof t)
            )}
          </Descriptions.Item>
          <Descriptions.Item label={t("content:form.creator")}>
            {!taskInfo.status ? (
              <span style={{ opacity: 0.4 }}>
                {statusForm && user
                  ? taskData?.createdBy.fullName
                  : user?.fullName}
              </span>
            ) : (
              taskData?.createdBy?.fullName
            )}
          </Descriptions.Item>
          <Descriptions.Item label={t("content:form.assignee")}>
            {!taskInfo.status ? (
              <Form.Item
                name="assignee"
                rules={[
                  {
                    required: true,
                    message: t("message:task.please select assignee"),
                  },
                ]}
              >
                <Select
                  disabled={
                    !isBoss &&
                    currentUser?._id === taskCurrent?.assignee?._id &&
                    currentUser?._id !== taskCurrent?.createdBy?._id
                  }
                  showSearch
                  placeholder={t("message:task.Select a person")}
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    typeof option?.label === "string" &&
                    option.label.toLowerCase().includes(input.toLowerCase())
                  }
                  dropdownRender={(menu) =>
                    isLoading ? (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          padding: "10px 0",
                        }}
                      >
                        <LoadingOutlined />
                      </div>
                    ) : (
                      menu
                    )
                  }
                  options={responseData?.members?.map((item: IUser) => ({
                    label: `${item.data?.fullName}-${item?.role}`,
                    value: item.data?._id,
                  }))}
                />
              </Form.Item>
            ) : (
              taskData?.assignee?.fullName
            )}
          </Descriptions.Item>

          <Descriptions.Item label={t("content:form.date created")}>
            {!taskInfo.status ? (
              <span style={{ opacity: 0.4 }}>
                {statusForm
                  ? moment(taskData?.createdDate).format("DD/MM/YYYY hh:mm")
                  : moment(Date.now()).format("DD/MM/YYYY ")}
              </span>
            ) : (
              moment(taskData?.createdDate).format("DD MMMM, YYYY - hh:mm A")
            )}
          </Descriptions.Item>
          <Descriptions.Item label={t("content:startDate")} span={1}>
            {!taskInfo.status ? (
              <Form.Item
                name="startDate"
                rules={[
                  {
                    required: true,
                    message: t("message:stage.Please fill it out completely"),
                  },
                ]}
              >
                <DatePicker
                  disabled={
                    !isBoss &&
                    currentUser?._id === taskCurrent?.assignee?._id &&
                    currentUser?._id !== taskCurrent?.createdBy?._id
                  }
                  disabledDate={(current) => {
                    const endDateExpected = form.getFieldValue("deadline");
                    return endDateExpected && current
                      ? current < dayjs(Date.now()) ||
                          current > dayjs(endDateExpected)
                      : current < dayjs(Date.now());
                  }}
                  locale={i18n.language === "en" ? EN : VN}
                  style={{ width: "100%" }}
                  showTime
                  showSecond={false}
                />
              </Form.Item>
            ) : (
              moment(taskData?.startDate).format("DD MMMM, YYYY - hh:mm A")
            )}
          </Descriptions.Item>

          <Descriptions.Item label={t("content:form.deadline")}>
            {!taskInfo.status ? (
              <Form.Item
                name="deadline"
                rules={[
                  {
                    required: true,
                    message: t("message:stage.Please fill it out completely"),
                  },
                ]}
              >
                <DatePicker
                  disabled={
                    !isBoss &&
                    currentUser?._id === taskCurrent?.assignee?._id &&
                    currentUser?._id !== taskCurrent?.createdBy?._id
                  }
                  disabledDate={(current) => {
                    const startDate = form.getFieldValue("startDate");
                    return (
                      current &&
                      (current < dayjs(Date.now()) ||
                        current <= dayjs(startDate))
                    );
                  }}
                  locale={i18n.language === "en" ? EN : VN}
                  style={{ width: "100%" }}
                  showTime
                  showSecond={false}
                />
              </Form.Item>
            ) : (
              moment(taskData?.deadline).format("DD MMMM, YYYY - hh:mm A")
            )}
          </Descriptions.Item>
          <Descriptions.Item label={t("content:endDateActual")} span={1}>
            {!taskInfo.status ? (
              <Form.Item name="endDate">
                <DatePicker
                  disabledDate={(current) => {
                    const startDate = form.getFieldValue("startDate");
                    return current && current < dayjs(startDate);
                  }}
                  locale={i18n.language === "en" ? EN : VN}
                  style={{ width: "100%" }}
                  disabled={
                    !statusForm ||
                    (!isBoss &&
                      currentUser?._id === taskCurrent?.assignee?._id &&
                      currentUser?._id !== taskCurrent?.createdBy?._id)
                  }
                  showTime
                  showSecond={false}
                />
              </Form.Item>
            ) : taskData?.endDate ? (
              moment(taskData?.endDate).format("DD MMMM, YYYY - hh:mm A")
            ) : (
              ""
            )}
          </Descriptions.Item>

          <Descriptions.Item
            span={width < 600 ? 1 : 2}
            style={{ textAlign: "start", verticalAlign: "top" }}
            label={t("content:form.description")}
          >
            {!taskInfo.status ? (
              <>
                {!taskData && (
                  <TinyMce
                    description={description}
                    setContentMce={setDescription}
                    defaultValue={taskData?.description || ""}
                  />
                )}
                {taskData && isBoss ? (
                  <TinyMce
                    description={description}
                    setContentMce={setDescription}
                    defaultValue={taskData?.description || ""}
                  />
                ) : (
                  <div className="task__form--description">
                    {parse(taskData?.description || "")}
                  </div>
                )}
              </>
            ) : (
              <div className="task__form--description">
                {parse(taskData?.description || "")}
              </div>
            )}
          </Descriptions.Item>
        </Descriptions>

        {!taskInfo.status && (
          <Form.Item
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: 0,
            }}
          >
            <Button type="primary" htmlType="submit">
              {button}
            </Button>
          </Form.Item>
        )}
      </Form>
    </div>
  );
};

export default TaskForm;
