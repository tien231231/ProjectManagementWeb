import { ITask, IUser } from './TaskForm';
import TaskHistory from './TaskHistory';
import TaskInfo from './TaskInfo';
import Loading from '../../components/support/Loading';
import TinyMce from '../../components/tinyMce/TinyMce';
import { useAxios } from '../../hooks';
import useIsBoss from '../../hooks/useIsBoss';
import { useAppSelector } from '../../redux/hook';
import { RootState } from '../../redux/store';
import taskApi from '../../services/api/taskApi';
import { disableStatus } from '../../utils/disableStatus';
import { ProjectType } from '../projectPage/ProjectDetail';
import { CloseOutlined, LoadingOutlined } from '@ant-design/icons';
import EN from 'antd/es/date-picker/locale/en_US';
import VN from 'antd/es/date-picker/locale/vi_VN';
import axios from 'axios';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import parse from 'html-react-parser';
import moment from 'moment';
import 'moment/locale/vi';
import {
    Dispatch,
    SetStateAction,
    useEffect,
    useMemo,
    useState
    } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import useMessageApi, {
  UseMessageApiReturnType,
} from "../../components/support/Message";

import {
  Breadcrumb,
  Button,
  Divider,
  Input,
  Modal,
  Select,
  Space,
  Tabs,
  Typography,
  Tooltip,
  message,
  Col,
  DatePicker,
  Form,
  Row,
  Popconfirm,
  Descriptions,
} from "antd";
import type { TabsProps } from "antd";

const { TextArea } = Input;
const { Title } = Typography;

const TaskDetail: React.FC = () => {
  const [form] = Form.useForm();
  const params = useParams();

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
    taskApi.getTask(params.taskId as string).then((res: any) => {
      setTaskCurrent(res?.task);
      setLoading(false);
    });
  }, [reloadCurrentTask]);

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
        setCurrentUser(currentUserArr[0]);
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
          showMessage("success", res.message, 2);
          setIsEdit?.(false);
          setReloadCurrentTask((prev) => prev + 1);
        })
        .catch((err) => {
          showMessage("error", err.response.data?.message, 2);
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
  }, []);

  const breadcrumbItem = useMemo(() => {
    return [
      { title: breadcrumb.project },
      {
        title: breadcrumb.stages,
      },
      {
        title: taskCurrent?.title || "",
      },
    ];
  }, [breadcrumb, taskCurrent]);
  useEffect(() => {
    if (taskCurrent) {
      form.setFieldsValue(initialValues);
    }
  }, [initialValues, taskCurrent]);

  const handleDelete = () => {};

  return (
    <>
      {loading && !taskCurrent ? (
        <Loading />
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
                            style={{ fontSize: "12px" }}
                          />
                        )}

                        {currentUser &&
                          // Chủ dự án, quản lý dự án, người tạo công việc có thể sửa tất cả thông tin của công việc đã tạo.
                          //	Người thực hiện công việc chỉ được phép cập nhật trạng thái công việc.
                          (isBoss ||
                            // currentUser?.data._id === taskCurrent?.assignee?._id ||
                            currentUser?.data.username ===
                              taskCurrent?.createdBy?.username) && (
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
                      column={2}
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
                        span={2}
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
                          <span style={{ opacity: 0.4 }}>Auto generated</span>
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
                        span={2}
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
                          parse(taskCurrent?.description || "")
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

          {contextHolder}
        </div>
      )}
    </>
  );
};

export default TaskDetail;
