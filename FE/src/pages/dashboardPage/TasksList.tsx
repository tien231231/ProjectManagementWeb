import {
  Button,
  Checkbox,
  Input,
  Modal,
  Skeleton,
  Table,
  Tabs,
  TabsProps,
  Tooltip,
  Typography,
} from "antd";
import { TasksType, UserInfo } from "./Dashboard";
import { setPriority } from "../../utils/setPriority";
import TaskForm from "../tasksPage/TaskForm";
import TaskHistory from "../tasksPage/TaskHistory";
import TaskInfo from "../tasksPage/TaskInfo";
import { NoticeType } from "antd/es/message/interface";
import { ColumnsType } from "antd/es/table";
import _ from "lodash";
import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { SearchOutlined, SortAscendingOutlined } from "@ant-design/icons";
import { CheckboxValueType } from "antd/es/checkbox/Group";
import { CheckboxChangeEvent } from "antd/es/checkbox";
import { useAppDispatch, useAppSelector } from "../../redux/hook";
import { setQuery } from "../../redux/slice/paramsSlice";
import taskApi from "../../services/api/taskApi";
import { changeMsgLanguage } from "../../utils/changeMsgLanguage";
import moment from "moment";
import { useTranslation } from "react-i18next";
import { useSortPrio } from "../../hooks/useSortPrio";
import { setStatusLabel } from "../../utils/setStatusLabel";

const { Title, Text } = Typography;
const { Search } = Input;

interface TasksListPropsType {
  tasksList: TasksType[];
  showMessage: (
    type: NoticeType,
    content: string,
    duration?: number | undefined
  ) => void;
  setTasksList: Dispatch<SetStateAction<TasksType[]>>;
}

interface TasksTableData {
  assignee: UserInfo;
  code: string;
  deadline: Date;
  key: string;
  priority: string;
  status: string;
  title: string;
}

const TasksList: React.FC<TasksListPropsType> = ({
  tasksList,
  showMessage,
  setTasksList,
}) => {
  const dispatch = useAppDispatch();
  const titleTimer = useRef<any>(null);
  const assigneeTimer = useRef<any>(null);
  const sortPrio = useSortPrio();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [statusForm, setStatusForm] = useState<boolean>(false);
  const [edit, setEdit] = useState<boolean>(false);
  const [openInfo, setOpenInfo] = useState<boolean>(false);
  const [taskCurrent, setTaskCurrent] = useState<any>(null);
  const [historyOrForm, setHistoryOrForm] = useState<boolean>(false);
  const [countReloadTasks, setCountReloadTasks] = useState<number>(1);
  const { t, i18n } = useTranslation(["content", "base"]);
  const [checkAll, setCheckAll] = useState<boolean>(false);
  const [indeterminate, setIndeterminate] = useState<boolean>(true);
  const [filterStatus, setFilterStatus] = useState<any[]>([]);
  const queryParams = useAppSelector((state: any) => state.queryParams);
  const [tableLoading, setTableLoading] = useState<boolean>(false);

  const plainOptions = [
    { label: "Open", value: "open" },
    { label: "In Progress", value: "inprogress" },
    { label: "Review", value: "review" },
    { label: "Re-Open", value: "reopen" },
    { label: "Done", value: "done" },
    { label: "Cancel", value: "cancel" },
  ];

  //Xử lý event khi click filter status
  const onCheckAllChange = (e: CheckboxChangeEvent) => {
    let filter = e.target.checked
      ? plainOptions.map((option: any) => option.value)
      : [];
    setFilterStatus(filter);
    setIndeterminate(false);
    setCheckAll(e.target.checked);
    dispatch(
      setQuery({
        ...queryParams,
        taskTableParams: { ...queryParams.taskTableParams, status: filter },
      })
    );
  };

  const handleStatusFilter = (list: CheckboxValueType[]) => {
    setFilterStatus(list);
    setIndeterminate(!!list?.length && list?.length < plainOptions?.length);
    setCheckAll(list?.length === plainOptions?.length);
    dispatch(
      setQuery({
        ...queryParams,
        taskTableParams: { ...queryParams.taskTableParams, status: list },
      })
    );
  };
  //Kết thúc xử lý

  //Xử lý event khi search tên tasks và assignee
  const handleSearchTasks = (event: any) => {
    let value = event.target.value;
    clearTimeout(titleTimer.current);
    titleTimer.current = setTimeout(() => {
      dispatch(
        setQuery({
          ...queryParams,
          taskTableParams: { ...queryParams.taskTableParams, title: value },
        })
      );
    }, 500);
  };

  const handleSearchAssignee = (event: any) => {
    let value = event.target.value;
    clearTimeout(assigneeTimer.current);
    assigneeTimer.current = setTimeout(() => {
      dispatch(
        setQuery({
          ...queryParams,
          taskTableParams: { ...queryParams.taskTableParams, assignee: value },
        })
      );
    }, 500);
  };
  //kết thúc xử lý

  //Xử lý event khi sort dữ liệu
  const handleSortPrio = () => {
    sortPrio("prioAsc", "prioDesc");
  };

  const handleSortDeadline = () => {
    sortPrio("deadlineAsc", "deadlineDesc");
  };
  //kết thúc xử lý

  //Xử lý event khi chuyển trang
  const handlePageChange = async (page: number, pageSize: number) => {
    setTableLoading(true);
    taskApi
      .getTasksByUser({ ...queryParams.taskTableParams, page })
      .then((res: any) => {
        setTasksList(res.tasks);
        dispatch(
          setQuery({
            ...queryParams,
            taskTableParams: {
              ...queryParams.taskTableParams,
              page,
              total: res.total,
            },
          })
        );
        setTableLoading(false);
      })
      .catch((err: any) => {
        setTasksList([]);
        showMessage(
          "error",
          changeMsgLanguage(
            err.response.data?.message,
            "Gặp sự cố khi chuyển trang"
          ),
          2
        );
        setTableLoading(false);
      });
  };

  // Gọi API khi filter, sort
  useEffect(() => {
    setTableLoading(true);
    taskApi
      .getTasksByUser(queryParams.taskTableParams)
      .then((res: any) => {
        setTasksList(res.tasks);
        setTableLoading(false);
        dispatch(
          setQuery({
            ...queryParams,
            taskTableParams: {
              ...queryParams.taskTableParams,
              total: res.total,
              page: Number(res.currentPage),
            },
          })
        );
      })
      .catch((err: any) => {
        setTasksList([]);
        showMessage(
          "error",
          changeMsgLanguage(
            err.response.data?.message,
            "Không tìm thấy kết quả"
          ),
          2
        );
        setTableLoading(false);
      });
  }, [
    queryParams.taskTableParams?.status,
    queryParams.taskTableParams?.sort,
    queryParams.taskTableParams?.title,
    queryParams.taskTableParams?.assignee,
  ]);

  const showTaskDetail = (record: TasksTableData) => {
    let filteredTask = tasksList.filter((task: TasksType) => {
      return task._id === record.key;
    })[0];
    setIsModalOpen(true);
    setOpenInfo(true);
    setTaskCurrent(filteredTask);
  };

  const handleEditTask = () => {
    setIsModalOpen(true);
    setStatusForm(!statusForm);
    setEdit(!edit);
  };

  const handleTabLick = (tabLabel: string) => {
    if (tabLabel === "info") {
      setHistoryOrForm(false);
      const element = document.getElementById("form_task");
      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "start",
          inline: "nearest",
        });
      }
    } else if (tabLabel === "comments") {
      setHistoryOrForm(false);
      const element = document.getElementById("task_info");
      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "start",
          inline: "nearest",
        });
      }
    } else if (tabLabel === "activity") {
      setHistoryOrForm(true);
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setStatusForm(false);
    setEdit(false);
    setOpenInfo(false);
    setTaskCurrent(null);
  };

  const columns: ColumnsType<TasksTableData> = [
    {
      title: `${t("content:form.job code")}`,
      dataIndex: "code",
      key: "code",
      render: (_, record: TasksTableData) => {
        return <Text strong>{record.code}</Text>;
      },
    },
    {
      title: `${t("content:name")}`,
      dataIndex: "name",
      key: "name",
      render: (_, record: TasksTableData) => {
        return (
          <Text
            strong
            className="task_name"
            onClick={() => {
              showTaskDetail(record);
            }}
          >
            {record.title}
          </Text>
        );
      },
      filterDropdown: () => (
        <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
          <Search
            allowClear
            placeholder="Search Tasks"
            onChange={handleSearchTasks}
          />
        </div>
      ),
      filterIcon: <SearchOutlined />,
      width: "20%",
    },
    {
      title: `${t("content:form.status")}`,
      dataIndex: "status",
      key: "status",
      render: (_, record: TasksTableData) => {
        const { bgColor, statusLabel, fontColor } = setStatusLabel(
          record.status
        );
        return (
          <Button
            type="primary"
            shape="round"
            style={{ backgroundColor: bgColor }}
          >
            <Text style={{ color: fontColor }} strong>
              {statusLabel}
            </Text>
          </Button>
        );
      },
      filters: [
        { text: "Open", value: "open" },
        { text: "In Progress", value: "inprogress" },
        { text: "Review", value: "review" },
        { text: "Re-Open", value: "reopen" },
        { text: "Done", value: "done" },
        { text: "Cancel", value: "cancel" },
      ],
      filterDropdown: () => (
        <div
          className="table_filter_dropdown"
          onKeyDown={(e) => e.stopPropagation()}
        >
          <Checkbox
            checked={checkAll}
            onChange={onCheckAllChange}
            indeterminate={indeterminate}
          >
            All
          </Checkbox>
          <Checkbox.Group
            style={{ display: "flex", flexDirection: "column" }}
            options={plainOptions}
            onChange={handleStatusFilter}
            value={filterStatus}
          />
        </div>
      ),
    },
    {
      title: (
        <div className="table_header_container">
          {`${t("content:form.priority")}`}
          <div className="icon_container" onClick={handleSortPrio}>
            <SortAscendingOutlined />
          </div>
        </div>
      ),
      dataIndex: "priority",
      key: "priority",
      render: (text, record: TasksTableData) => {
        let priority = setPriority(record.priority);
        return (
          <div className="task_priority">
            <Tooltip title={_.capitalize(record.priority)}>
              <span className="icon">{priority}</span>
            </Tooltip>
            <Text strong className="content">
              {_.capitalize(record.priority)}
            </Text>
          </div>
        );
      },
    },
    {
      title: (
        <div className="table_header_container">
          {`${t("content:form.deadline")}`}
          <div className="icon_container" onClick={handleSortDeadline}>
            <SortAscendingOutlined />
          </div>
        </div>
      ),
      dataIndex: "deadline",
      key: "deadline",
      render: (_, record: TasksTableData) => {
        return (
          <Text strong>
            {moment(record.deadline).format("DD/MM/YYYY - HH:MM")}
          </Text>
        );
      },
    },
    {
      title: `${t("content:form.assignee")}`,
      dataIndex: "assignee",
      key: "assignee",
      render: (_, record: TasksTableData) => {
        return <Title level={5}>{record.assignee?.fullName}</Title>;
      },

      filterDropdown: () => (
        <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
          <Search
            value={queryParams.taskTableParams?.assignee || ""}
            allowClear
            placeholder="Search Assignee"
            onChange={handleSearchAssignee}
          />
        </div>
      ),
      filterIcon: <SearchOutlined />,
    },
  ];
  const data: TasksTableData[] = useMemo(() => {
    let tasks =
      tasksList && TasksList?.length > 0
        ? [
            ...tasksList.map((task: TasksType, index: number) => {
              return {
                key: task._id,
                code: task.code,
                title: task.title,
                status: task.status,
                priority: task.priority,
                deadline: task.deadline,
                assignee: task.assignee,
              };
            }),
          ]
        : [];
    return tasks;
  }, [tasksList]);

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

  return (
    <>
      <div className="tasks_container" style={{ height: "100%" }}>
        {/* modal create-info-edit */}
        <Modal
          title=""
          width="70%"
          open={isModalOpen}
          onCancel={handleCancel}
          maskClosable={false}
          style={{ top: "50px" }}
          footer={[]}
          className="task__modal__responsive"
        >
          {/* phần modal thông tin task */}
          {openInfo && (
            <div className="task__info--container">
              <Tabs
                defaultActiveKey="1"
                items={items}
                onTabClick={handleTabLick}
              />
              {historyOrForm ? (
                <>
                  <TaskHistory taskCurrentId={taskCurrent?._id} />
                </>
              ) : (
                <>
                  {statusForm && edit ? (
                    <TaskForm
                      tasksList={tasksList}
                      setTasksList={setTasksList}
                      setCountReloadTasks={setCountReloadTasks}
                      edit={edit}
                      handleEditTask={handleEditTask}
                      showMessage={showMessage}
                      key={statusForm ? t("base:create") : t("base:update")}
                      title={t("content:form.edit task")}
                      setIsModalOpen={setIsModalOpen}
                      statusForm={statusForm}
                      setEdit={setEdit}
                      setStatusForm={setStatusForm}
                      taskInfo={{
                        status: false,
                        data: taskCurrent,
                      }}
                      button={t("base:update")}
                      taskCurrent={taskCurrent}
                    />
                  ) : (
                    <TaskForm
                      tasksList={tasksList}
                      setTasksList={setTasksList}
                      setCountReloadTasks={setCountReloadTasks}
                      handleEditTask={handleEditTask}
                      edit={edit}
                      showMessage={showMessage}
                      key={statusForm ? t("base:create") : t("base:update")}
                      title=""
                      setIsModalOpen={setIsModalOpen}
                      statusForm={statusForm}
                      setStatusForm={setStatusForm}
                      taskInfo={{
                        status: true,
                        data: taskCurrent,
                      }}
                      taskCurrent={taskCurrent}
                    />
                  )}

                  <TaskInfo
                    taskCurrent={taskCurrent}
                    showMessage={showMessage}
                  />
                </>
              )}
            </div>
          )}
        </Modal>
        {tableLoading ? (
          <Skeleton active />
        ) : (
          <Table
            getPopupContainer={(trigger) => {
              return trigger.parentElement as HTMLElement;
            }}
            scroll={{ x: 850 }}
            className="tasks_table"
            loading={tableLoading}
            bordered
            dataSource={data}
            columns={columns}
            pagination={{
              position: ["bottomCenter"],
              pageSize: 10,
              total: queryParams.taskTableParams?.total,
              current: queryParams.taskTableParams?.page,
              onChange: handlePageChange,
            }}
          />
        )}
      </div>
    </>
  );
};

export default TasksList;
