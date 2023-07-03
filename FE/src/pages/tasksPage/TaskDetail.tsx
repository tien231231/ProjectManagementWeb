import { ITask, IUser } from "./TaskForm";
import TaskHistory from "./TaskHistory";
import TaskInfo from "./TaskInfo";
import Loading from "../../components/support/Loading";
import NotResult from "../../components/support/NotResult";
import TinyMce from "../../components/tinyMce/TinyMce";
import { useAxios } from "../../hooks";
import useIsBoss from "../../hooks/useIsBoss";
import { useAppDispatch, useAppSelector } from "../../redux/hook";
import { reloadSidebar, setTaskIdCurrent } from "../../redux/slice/menuSlice";
import { RootState } from "../../redux/store";
import taskApi from "../../services/api/taskApi";
import { changeMsgLanguage } from "../../utils/changeMsgLanguage";
import { disableStatus } from "../../utils/disableStatus";
import { LoadingOutlined } from "@ant-design/icons";
import EN from "antd/es/date-picker/locale/en_US";
import VN from "antd/es/date-picker/locale/vi_VN";
import axios from "axios";
import dayjs from "dayjs";
import "dayjs/locale/zh-cn";
import parse from "html-react-parser";
import moment from "moment";
import "moment/locale/vi";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";
import { Link } from "react-router-dom";

import useMessageApi, {
  UseMessageApiReturnType,
} from "../../components/support/Message";

import {
  Breadcrumb,
  Button,
  Input,
  Select,
  Tabs,
  DatePicker,
  Form,
  Popconfirm,
  Descriptions,
  Skeleton,
  Result,
} from "antd";
import type { TabsProps } from "antd";

const TaskDetail: React.FC = () => {
  const [form] = Form.useForm();
  const params = useParams();
  const dispatch = useAppDispatch();
  const [width, setWidth] = useState(window.innerWidth);
  const [loading, setLoading] = useState<boolean>(false);
  const [taskCurrent, setTaskCurrent] = useState<ITask | null>(null);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<any>();
  const [reloadCurrentTask, setReloadCurrentTask] = useState<number>(1);
  const [description, setDescription] = useState<string>("");
  const [historyTab, setHistoryTab] = useState(false);
  const [breadcrumb, setBreadcrumb] = useState({
    project: "",
    stages: "",
    task: "",
  });

  const { showMessage, contextHolder }: UseMessageApiReturnType =
    useMessageApi();
  const user = useAppSelector((state: RootState) => state.auth?.userInfo);
  const { t, i18n } = useTranslation(["content", "base"]);
  const navigate = useNavigate();
  const { isBoss } = useIsBoss([], 2);

  // lấy all user trong project
  const { responseData, isLoading } = useAxios(
    "get",
    `/project/members/all/${params.projectId}`,
    []
  );

  // lấy thông tin task hiệnt tại
  useEffect(() => {
    setLoading(true);
    taskApi
      .getTask(params?.taskId as string)
      .then((res: any) => {
        setTaskCurrent(res?.task);
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
      });
  }, [reloadCurrentTask, params]);

  // xác định id task hiện tại dựa theo params
  useEffect(() => {
    dispatch(setTaskIdCurrent(params.taskId as string));
    return () => {
      dispatch(setTaskIdCurrent(""));
    };
  }, [params]);

  useEffect(() => {
    setHistoryTab(false);
  }, [taskCurrent, params?.taskId]);

  const items: TabsProps["items"] = [
    {
      key: "info",
      label: t("content:form.information"),
      children: "",
    },
    {
      key: "comments",
      label: t("content:form.comments"),
      children: "",
    },
    {
      key: "activity",
      label: t("content:task.activity"),
      children: "",
    },
  ];

  // cuộn xuống phần tử khi nháy vào( sẽ cố gắng để thay đổi khi cuộn trang luôn)
  const handleTabLick = (tabLabel: string) => {
    if (tabLabel === "info") {
      setHistoryTab(false);
      const element = document.getElementById("form_task");
      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "start",
          inline: "nearest",
        });
      }
    } else if (tabLabel === "comments") {
      setHistoryTab(false);
      const element = document.getElementById("task_info");
      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "start",
          inline: "nearest",
        });
      }
    } else if (tabLabel === "activity") {
      setHistoryTab(true);
    }
  };

  // lấy  của user hiện tại
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

  // hàm xử lí form
  const onFinish = (data: any) => {
    showMessage("loading", `${t("content:loading")}...`);
    const task = {
      stageId: params.stagesId,
      title: data.title,
      type: data.type,
      startDate: data.startDate,
      deadline: data.deadline,
      status: data.status,
      priority: data.priority,
      description: description,
      assignee: data.assignee?.value || data.assignee,
      ...(data.endDateActual && {
        endDateActual: data.endDateActual,
      }),
    };
    taskCurrent &&
      taskApi
        .editTask(taskCurrent._id, task)
        .then((res: any) => {
          showMessage(
            "success",
            changeMsgLanguage(res?.message, "Thay đổi thành công"),
            2
          );
          setIsEdit?.(false);
          dispatch(reloadSidebar());
          setReloadCurrentTask((prev) => prev + 1);
        })
        .catch((err) => {
          showMessage(
            "error",
            changeMsgLanguage(err.response?.data?.message, "Thay đổi thất bại"),
            2
          );
        });
  };
  const initialValues = useMemo(() => {
    return (
      taskCurrent && {
        title: taskCurrent?.title,
        type: taskCurrent?.type,
        status: taskCurrent?.status,
        priority: taskCurrent?.priority,
        assignee: taskCurrent.assignee?._id,
        startDate: dayjs(taskCurrent?.startDate),
        deadline: dayjs(taskCurrent?.deadline),
        ...(taskCurrent?.endDateActual && {
          endDateActual: dayjs(taskCurrent?.endDateActual),
        }),
        description: taskCurrent?.description,
      }
    );
  }, [taskCurrent]);
  // lấy dữ liệu cho breadcrumb
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const project = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/project/details/${params.projectId}`,
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
        const stages = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/stage/details/${params.stagesId}`,
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
  }, [params]);

  const breadcrumbItem = useMemo(() => {
    return [
      { title: <Link to="/">{t("base:home")}</Link> },
      {
        title: (
          <Link to={`/project/${params.projectId}`}>
            {breadcrumb?.project.length < 13
              ? breadcrumb?.project
              : `${breadcrumb?.project.substring(0, 13)}...`}
          </Link>
        ),
      },
      {
        title: (
          <Link to={`/project/${params.projectId}/${params.stagesId}`}>
            {breadcrumb?.stages.length < 13
              ? breadcrumb?.stages
              : `${breadcrumb?.stages.substring(0, 13)}...`}
          </Link>
        ),
      },
      {
        title:
          taskCurrent?.title && taskCurrent?.title.length < 13
            ? taskCurrent?.title
            : `${taskCurrent?.title.substring(0, 13)}...` || "",
      },
    ];
  }, [breadcrumb, taskCurrent, i18n.language]);

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

  useEffect(() => {
    if (taskCurrent) {
      form.setFieldsValue(initialValues);
    }
  }, [initialValues, taskCurrent]);

  //hàm xóa tasks
  const handleDelete = () => {
    showMessage("loading", `${t("content:loading")}...`);
    taskApi
      .deleteTask(taskCurrent?._id as string)
      .then((res: any) => {
        showMessage(
          "success",
          changeMsgLanguage(res?.message, "Xóa thành công"),
          2
        );
        navigate("/");
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

  return (
    <>
      {contextHolder}
      {loading || !taskCurrent ? (
        <div style={{ padding: "20px" }}>
          {!loading ? (
            <NotResult title={t("base:task")} />
          ) : (
            <Skeleton active />
          )}
        </div>
      ) : (
        <div className="task__Detail--page">
          <Tabs defaultActiveKey="1" items={items} onTabClick={handleTabLick} />
          {historyTab ? (
            <TaskHistory />
          ) : (
            <>
              {taskCurrent && (
                <div className="form_task" id="form_task">
                  {taskCurrent ? (
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
                            currentUser?._id === taskCurrent?.assignee?._id ||
                            currentUser?._id === taskCurrent?.createdBy?._id ||
                            currentUser?.username ===
                              taskCurrent?.assignee?.username) && (
                            <div className="task__action--form">
                              <Button
                                type="primary"
                                onClick={() => setIsEdit(!isEdit)}
                              >
                                {isEdit ? t("base:cancel") : t("base:edit")}
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
                    initialValues={initialValues || {}}
                    size="large"
                    layout="vertical"
                    name={params.stagesId}
                    form={form}
                    onFinish={onFinish}
                  >
                    <Descriptions
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
                        {isEdit ? (
                          <Form.Item
                            name="title"
                            rules={[
                              {
                                required: true,
                                message: "Please input your task name!",
                              },
                            ]}
                          >
                            <Input placeholder="Title..." />
                          </Form.Item>
                        ) : (
                          taskCurrent?.title
                        )}
                      </Descriptions.Item>
                      <Descriptions.Item label={t("content:form.job code")}>
                        {taskCurrent?.code || (
                          <span style={{ opacity: 0.4 }}>
                            {t("content:task.jobCode")}
                          </span>
                        )}
                      </Descriptions.Item>
                      <Descriptions.Item label={t("content:form.status")}>
                        {isEdit ? (
                          <Form.Item name="status">
                            <Select
                              style={{ width: "100%" }}
                              options={[
                                {
                                  value: "open",
                                  label: t("content:form.open"),
                                  disabled: disableStatus(
                                    "open",
                                    taskCurrent?.status
                                  ),
                                },
                                {
                                  value: "inprogress",
                                  label: t("content:form.inprogress"),
                                  disabled: disableStatus(
                                    "inprogress",
                                    taskCurrent?.status
                                  ),
                                },
                                {
                                  value: "reopen",
                                  label: t("content:form.reopen"),
                                  disabled: disableStatus(
                                    "reopen",
                                    taskCurrent?.status
                                  ),
                                },
                                {
                                  value: "review",
                                  label: t("content:form.review"),
                                  disabled: disableStatus(
                                    "review",
                                    taskCurrent?.status
                                  ),
                                },
                                {
                                  value: "done",
                                  label: t("base:done"),
                                  disabled: disableStatus(
                                    "done",
                                    taskCurrent?.status
                                  ),
                                },
                                {
                                  value: "cancel",
                                  label: t("base:cancel"),
                                  disabled: disableStatus(
                                    "cancel",
                                    taskCurrent?.status
                                  ),
                                },
                              ]}
                            />
                          </Form.Item>
                        ) : (
                          t(
                            `content:form.${taskCurrent?.status}` as keyof typeof t
                          )
                        )}
                      </Descriptions.Item>
                      <Descriptions.Item label={t("content:form.type")}>
                        {isEdit ? (
                          <Form.Item name="type">
                            <Select
                              style={{ width: "100%" }}
                              options={[
                                {
                                  value: "assignment",
                                  label: t("content:form.assignment"),
                                },
                                {
                                  value: "issue",
                                  label: t("content:form.issue"),
                                },
                              ]}
                            />
                          </Form.Item>
                        ) : (
                          <div className="task__type--main">
                            {t(
                              `content:form.${taskCurrent?.type}` as keyof typeof t
                            )}
                            <div
                              className="task_type"
                              style={{
                                backgroundColor:
                                  taskCurrent?.type === "issue"
                                    ? "#EC2B2B"
                                    : "#44CB39",
                              }}
                            ></div>
                          </div>
                        )}
                      </Descriptions.Item>
                      <Descriptions.Item label={t("content:form.priority")}>
                        {isEdit ? (
                          <Form.Item name="priority">
                            <Select
                              style={{ width: "100%" }}
                              options={[
                                {
                                  value: "highest",
                                  label: t("content:form.highest"),
                                },
                                {
                                  value: "high",
                                  label: t("content:form.high"),
                                },
                                {
                                  value: "medium",
                                  label: t("content:form.medium"),
                                },
                                { value: "low", label: t("content:form.low") },
                                {
                                  value: "lowest",
                                  label: t("content:form.lowest"),
                                },
                              ]}
                            />
                          </Form.Item>
                        ) : (
                          t(
                            `content:form.${taskCurrent?.priority}` as keyof typeof t
                          )
                        )}
                      </Descriptions.Item>
                      <Descriptions.Item label={t("content:form.creator")}>
                        {taskCurrent?.createdBy?.fullName}
                      </Descriptions.Item>
                      <Descriptions.Item label={t("content:form.assignee")}>
                        {isEdit ? (
                          <Form.Item
                            name="assignee"
                            rules={[
                              {
                                required: true,
                                message: "please select assignee!",
                              },
                            ]}
                          >
                            <Select
                              showSearch
                              placeholder="Select a person"
                              optionFilterProp="children"
                              filterOption={(input, option) =>
                                typeof option?.label === "string" &&
                                option.label
                                  .toLowerCase()
                                  .includes(input.toLowerCase())
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
                              options={responseData?.members?.map(
                                (item: IUser) => ({
                                  label: `${item.data?.fullName}-${item?.role}`,
                                  value: item.data?._id,
                                })
                              )}
                            />
                          </Form.Item>
                        ) : (
                          taskCurrent?.assignee?.fullName
                        )}
                      </Descriptions.Item>

                      <Descriptions.Item label={t("content:form.date created")}>
                        {moment(taskCurrent?.createdDate).format(
                          "DD MMMM, YYYY - hh:mm A"
                        )}
                      </Descriptions.Item>
                      <Descriptions.Item
                        label={t("content:startDate")}
                        span={1}
                      >
                        {isEdit ? (
                          <Form.Item
                            name="startDate"
                            rules={[
                              {
                                required: true,
                                message: " Please fill it out completely",
                              },
                            ]}
                          >
                            <DatePicker
                              disabledDate={(current) => {
                                const endDateExpected =
                                  form.getFieldValue("deadline");
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
                          moment(taskCurrent?.startDate).format(
                            "DD MMMM, YYYY - hh:mm A"
                          )
                        )}
                      </Descriptions.Item>

                      <Descriptions.Item label={t("content:form.deadline")}>
                        {isEdit ? (
                          <Form.Item
                            name="deadline"
                            rules={[
                              {
                                required: true,
                                message: " Please fill it out completely",
                              },
                            ]}
                          >
                            <DatePicker
                              disabledDate={(current) => {
                                const startDate =
                                  form.getFieldValue("startDate");
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
                          moment(taskCurrent?.deadline).format(
                            "DD MMMM, YYYY - hh:mm A"
                          )
                        )}
                      </Descriptions.Item>
                      <Descriptions.Item
                        label={t("content:endDateActual")}
                        span={1}
                      >
                        {isEdit ? (
                          <Form.Item name="endDateActual">
                            <DatePicker
                              disabledDate={(current) => {
                                const startDate =
                                  form.getFieldValue("startDate");
                                return current && current < dayjs(startDate);
                              }}
                              locale={i18n.language === "en" ? EN : VN}
                              style={{ width: "100%" }}
                              showTime
                              showSecond={false}
                            />
                          </Form.Item>
                        ) : taskCurrent?.endDateActual ? (
                          moment(taskCurrent?.endDateActual).format(
                            "DD MMMM, YYYY - hh:mm A"
                          )
                        ) : (
                          ""
                        )}
                      </Descriptions.Item>

                      <Descriptions.Item
                        span={width < 600 ? 1 : 2}
                        style={{ textAlign: "start", verticalAlign: "top" }}
                        label={t("content:form.description")}
                      >
                        {isEdit ? (
                          <TinyMce
                            description={description}
                            setContentMce={setDescription}
                            defaultValue={taskCurrent?.description || ""}
                          />
                        ) : (
                          <div className="task__form--description">
                            {parse(taskCurrent?.description || "")}
                          </div>
                        )}
                      </Descriptions.Item>
                    </Descriptions>

                    {isEdit && (
                      <Form.Item
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          marginBottom: 0,
                        }}
                      >
                        <Button type="primary" htmlType="submit">
                          cập nhật
                        </Button>
                      </Form.Item>
                    )}
                  </Form>
                </div>
              )}
              {taskCurrent ? (
                <TaskInfo taskCurrent={taskCurrent} showMessage={showMessage} />
              ) : (
                <p>{t("content:task.includes")}</p>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
};

export default TaskDetail;
