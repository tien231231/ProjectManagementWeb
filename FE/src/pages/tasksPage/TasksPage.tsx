import TaskForm, { ITask } from "./TaskForm";
import TaskHistory from "./TaskHistory";
import TaskInfo from "./TaskInfo";
import { descriptionTest } from "../../data/statges";
import { useAppSelector } from "../../redux/hook";
import { setQuery } from "../../redux/slice/paramsSlice";
import { RootState } from "../../redux/store";
import taskApi from "../../services/api/taskApi";
import axios from "axios";
import _ from "lodash";
import moment from "moment";
import React, { useEffect, useMemo, useState } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams, useSearchParams } from "react-router-dom";
import * as Scroll from "react-scroll";
import {
  EyeOutlined,
  ClockCircleOutlined,
  DoubleRightOutlined,
  DownOutlined,
  UpOutlined,
  PauseOutlined,
} from "@ant-design/icons";

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
} from "antd";
import type { TabsProps } from "antd";

const { Text, Title } = Typography;
const { Search } = Input;

interface ColumnData {
  id: string;

  title: string;
  items: any[];
}

interface TaskItemProp {
  task: any;
  handleOpenInfoTask?: (task: ITask) => void;
}

const TaskItem: React.FC<TaskItemProp> = ({ task, handleOpenInfoTask }) => {
  let priority = null;
  switch (task.priority) {
    case "lowest":
      priority = <DoubleRightOutlined style={{ transform: "rotate(90deg)" }} />;
      break;
    case "low":
      priority = <DownOutlined />;
      break;
    case "medium":
      priority = <PauseOutlined style={{ transform: "rotate(90deg)" }} />;
      break;
    case "high":
      priority = <UpOutlined />;
      break;
    case "highest":
      priority = (
        <DoubleRightOutlined style={{ transform: "rotate(270deg)" }} />
      );
      break;
  }
  return (
    <>
      <div
        className="task_info"
        onClick={() => {
          handleOpenInfoTask?.(task);
        }}
      >
        <Title className="task_title" level={5}>
          {task.title}
        </Title>
        <div className="task_description">
          <Tooltip title={`Type: ${_.capitalize(task.type)}`}>
            <div
              className="task_type"
              style={{
                backgroundColor: task.type === "issue" ? "#EC2B2B" : "#44CB39",
              }}
            ></div>
          </Tooltip>
          <Tooltip title={`Priority: ${_.capitalize(task.priority)}`}>
            <div>{priority}</div>
          </Tooltip>
          <Tooltip title={task.assignee.fullName}>
            <img src={task.assignee.avatar} alt="user-avatar" />
          </Tooltip>
        </div>
        <div className="task_deadline">
          <ClockCircleOutlined />
          <span>{moment(task.deadline).format("DD/MM/YYYY")}</span>
        </div>
      </div>
    </>
  );
};

const TasksPage = () => {
  const params = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { showMessage, contextHolder }: UseMessageApiReturnType =
    useMessageApi();
  const queryParams = useSelector((state: any) => state.queryParams);
  const user = useAppSelector((state: RootState) => state.auth?.userInfo);
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation(["content", "base"]);

  const [tasksColumns, setTasksColumns] = useState<ColumnData[]>([]);
  const [dragLoading, setDragLoading] = useState<boolean>(false);
  const [historyOrForm, setHistoryOrForm] = useState<boolean>(false);
  const [taskCurrent, setTaskCurrent] = useState<any>(null);
  const [breadcrumb, setBreadcrumb] = useState({
    project: "",
    stages: "",
  });
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [statusForm, setStatusForm] = useState<boolean>(false);
  const [openInfo, setOpenInfo] = useState<boolean>(false);
  const [countReloadTasks, setCountReloadTasks] = useState<number>(1);
  const [edit, setEdit] = useState<boolean>(false);

  useEffect(() => {
    let query = Object.fromEntries([...searchParams]);
    dispatch(setQuery(query));
  }, []);
  const taskTypeOptions = [
    {
      label: `Type`,
      options: [
        { label: `All`, value: `all` },
        { label: `Issue`, value: `issue` },
        { label: `Task`, value: `task` },
      ],
    },
  ];

  const priorityOptions = [
    {
      label: `Priority`,
      options: [
        { label: `Asc`, value: `asc` },
        { label: `Desc`, value: `desc` },
      ],
    },
  ];

  const breadcrumItems = useMemo(
    () => [
      { title: <Link to="/">Home</Link> },
      { title: <Link to={`/${params.projectId}`}>{breadcrumb?.project}</Link> },
      {
        title: breadcrumb.stages,
      },
    ],
    [breadcrumb]
  );

  useEffect(() => {
    (async () => {
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
      } catch (error) {}
    })();
  }, []);

  const initialData = [
    {
      id: "open",
      title: "Open",
      items: [],
      dropAllow: true,
    },
    {
      id: "inprogress",
      title: "In Progress",
      items: [],
      dropAllow: true,
    },
    {
      id: "review",
      title: "In Review",
      items: [],
      dropAllow: true,
    },
    {
      id: "reopen",
      title: "Re-Open",
      items: [],
      dropAllow: true,
    },
    {
      id: "done",
      title: "Done",
      items: [],
      dropAllow: true,
    },
    {
      id: "cancel",
      title: "Cancel",
      items: [],
      dropAllow: true,
    },
  ];

  useEffect(() => {
    taskApi
      .getAllTask(params.stagesId as string)
      .then((res: any) => {
        initialData.map((data: any) => {
          data.items = res.tasks.filter((task: any) => {
            return task.status === data.id;
          });
        });
        setTasksColumns(initialData);
      })
      .catch((err: any) => {
        console.error(err);
      });
  }, [countReloadTasks]);

  const selectTaskTypes = (value: string) => {
    dispatch(setQuery({ ...queryParams, type: value }));
    setSearchParams({ ...queryParams, type: value });
  };

  const sortPriority = (value: string) => {
    dispatch(setQuery({ ...queryParams, priority: value }));
    setSearchParams({ ...queryParams, priority: value });
  };

  const handleDragStart = (result: any) => {
    const startCol = tasksColumns.filter(
      (column: any, index: number) => column.id === result.source.droppableId
    )[0];
    if (startCol.id === "done") {
      const newState = tasksColumns.map((column: any) => {
        if (column.id === "done") {
          return { ...column, dropAllow: true };
        } else return { ...column, dropAllow: false };
      });
      setTasksColumns(newState);
      return;
    }

    if (startCol.id === "cancel") {
      const newState = tasksColumns.map((column: any) => {
        return { ...column, dropAllow: false };
      });
      setTasksColumns(newState);
      return;
    }

    if (startCol.id === "review") {
      const newState = tasksColumns.map((column: any) => {
        if (column.id !== "open" && column.id !== "inprogress") {
          return { ...column, dropAllow: true };
        } else return { ...column, dropAllow: false };
      });
      setTasksColumns(newState);
      return;
    }

    if (startCol.id === "reopen") {
      const newState = tasksColumns.map((column: any) => {
        if (
          column.id === "inprogress" ||
          column.id === "reopen" ||
          column.id === "cancel"
        ) {
          return { ...column, dropAllow: true };
        } else return { ...column, dropAllow: false };
      });
      setTasksColumns(newState);
      return;
    }

    let colIndex = tasksColumns.indexOf(startCol);
    let newState = tasksColumns.map((column: any, index: number) => {
      if (
        index !== colIndex &&
        index !== colIndex + 1 &&
        column.id !== "cancel"
      ) {
        return { ...column, dropAllow: false };
      } else return column;
    });
    setTasksColumns(newState);
  };

  const handleDragEnd = (result: any) => {
    const { destination, source } = result;

    // Check nếu kéo và không thả vào bảng
    if (!destination) {
      const newState = tasksColumns.map((column) => {
        return { ...column, dropAllow: true };
      });
      setTasksColumns(newState);
      return;
    }

    // Check nếu kéo và thả lại vào vị trí cũ
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      const newState = tasksColumns.map((column) => {
        return { ...column, dropAllow: true };
      });
      setTasksColumns(newState);
      return;
    }

    //Lấy thông tin 2 column mà item được kéo ra và thả đến để cập nhật lại
    const sourceCol = tasksColumns.filter(
      (column) => column.id === source.droppableId
    )[0];
    const desCol = tasksColumns.filter(
      (column) => column.id === destination.droppableId
    )[0];

    // Check nếu kéo và thả trong cùng 1 cột

    if (sourceCol.id === desCol.id) {
      const newTasks = Array.from(sourceCol.items);
      const [removedItem] = newTasks.splice(source.index, 1);
      newTasks.splice(destination.index, 0, removedItem);
      const newColumn = { ...sourceCol, items: newTasks };
      const newState = tasksColumns.map((column) => {
        if (column.id === newColumn.id) {
          return { ...newColumn, dropAllow: true };
        } else {
          return { ...column, dropAllow: true };
        }
      });
      setTasksColumns(newState);
    }
    // Check nếu kéo và thả sang các cột khác
    else {
      showMessage("loading", `${t("content:loading")}...`);
      const newSourceTasks = Array.from(sourceCol.items);
      const [removedItem] = newSourceTasks.splice(source.index, 1);
      removedItem.status = destination.droppableId;
      taskApi
        .editTask(removedItem._id, { ...removedItem, stageId: params.stagesId })
        .then((res: any) => {
          const sourceTasks = Array.from(sourceCol.items);
          const newSourceTasksTest = sourceTasks.filter((task: any) => {
            return task._id !== res.task._id;
          });
          const newSourceColTest = { ...sourceCol, items: newSourceTasksTest };
          const newDesTasksTest = Array.from(desCol.items);
          newDesTasksTest.splice(destination.index, 0, res.task);
          const newDesColTest = { ...desCol, items: newDesTasksTest };
          const newState = tasksColumns.map((column) => {
            if (column.id === newSourceColTest.id) {
              return { ...newSourceColTest, dropAllow: true };
            } else if (column.id === newDesColTest.id) {
              return { ...newDesColTest, dropAllow: true };
            } else {
              return { ...column, dropAllow: true };
            }
          });
          setTasksColumns(newState);
          showMessage("success", res?.message, 2);
        })
        .catch((err: any) => {
          showMessage("error", err.response.data?.message, 2);
        });
    }
  };
  // tạo task
  const handleCreateTask = () => {
    setIsModalOpen(true);
    setStatusForm(false);
    setEdit(false);
  };

  // chỉnh sửa task
  const handleEditTask = () => {
    setIsModalOpen(true);
    setStatusForm(!statusForm);
    setEdit(!edit);
  };
  // cancel modal
  const handleCancel = () => {
    setIsModalOpen(false);
    setStatusForm(false);
    setEdit(false);
    setOpenInfo(false);
    setTaskCurrent(null);
  };

  // mở tab thông tin task
  const handleOpenInfoTask = (task: ITask) => {
    setIsModalOpen(true);
    setOpenInfo(true);
    setTaskCurrent(task);
  };

  // cuộn xuống phần tử khi nháy vào( sẽ cố gắng để thay đổi khi cuộn trang luôn)
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
  // phần tùy chọn modal task
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
    <div className="tasks_page">
      {contextHolder}

      {/* modal create-info-edit */}
      <Modal
        title=""
        width="70%"
        open={isModalOpen}
        onCancel={handleCancel}
        maskClosable={false}
        style={{ top: "50px" }}
        footer={[]}
      >
        {!statusForm && !openInfo && (
          <TaskForm
            setCountReloadTasks={setCountReloadTasks}
            edit={edit}
            handleEditTask={handleEditTask}
            showMessage={showMessage}
            key={statusForm ? t("base:create") : t("base:update")}
            title={t("content:form.create task")}
            setIsModalOpen={setIsModalOpen}
            statusForm={false}
            setStatusForm={setStatusForm}
            taskInfo={{
              status: false,
            }}
            button={t("base:create")}
          />
        )}

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

                <TaskInfo taskCurrent={taskCurrent} showMessage={showMessage} />
              </>
            )}
          </div>
        )}
      </Modal>
      <Space direction="vertical" size="large">
        <Breadcrumb items={breadcrumItems} />
        <div className="tool_bar">
          <Button size="large" type="primary" onClick={handleCreateTask}>
            {t("content:form.create task")}
          </Button>

          <Select
            size="large"
            value={`Type: ${
              _.capitalize(queryParams.type) ||
              taskTypeOptions[0].options[0].label
            }`}
            options={taskTypeOptions}
            dropdownMatchSelectWidth={false}
            onChange={selectTaskTypes}
          />
          <Select
            size="large"
            value={`Priority: ${
              _.capitalize(queryParams.priority) ||
              priorityOptions[0].options[0].label
            }`}
            dropdownMatchSelectWidth={false}
            options={priorityOptions}
            onChange={sortPriority}
          />
          <Select size="large" defaultValue="Filter Member" />
          <Search size="large" placeholder="Task Name" />
        </div>
        <Divider />
        <div className="tasks_board">
          <DragDropContext
            onDragEnd={handleDragEnd}
            onDragStart={handleDragStart}
          >
            {tasksColumns?.map((column: any, index: number) => {
              return (
                <Droppable
                  droppableId={column.id}
                  key={column.id}
                  isDropDisabled={!column.dropAllow}
                >
                  {(provided, snapshot) => {
                    return (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="column_container"
                        style={{
                          cursor: column.dropAllow ? "" : "not-allowed",
                        }}
                      >
                        <Title level={4} className="column_containter_title">
                          {column.title}
                        </Title>
                        <div className="task_container">
                          {column.items?.map((task: any, index: number) => {
                            return (
                              <Draggable
                                key={task._id}
                                draggableId={task._id}
                                index={index}
                              >
                                {(provided, snapshot) => {
                                  return (
                                    <div
                                      className="task_item"
                                      ref={provided.innerRef}
                                      {...provided.dragHandleProps}
                                      {...provided.draggableProps}
                                    >
                                      <TaskItem
                                        task={task}
                                        handleOpenInfoTask={handleOpenInfoTask}
                                      />
                                    </div>
                                  );
                                }}
                              </Draggable>
                            );
                          })}
                          {provided.placeholder}
                        </div>
                      </div>
                    );
                  }}
                </Droppable>
              );
            })}
          </DragDropContext>
        </div>
      </Space>
    </div>
  );
};
export default TasksPage;
