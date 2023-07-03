import { ITask } from "../../pages/tasksPage/TaskForm";
import { useAppDispatch, useAppSelector } from "../../redux/hook";
import { changeMenu } from "../../redux/slice/menuSlice";
import { RootState } from "../../redux/store";
import taskApi from "../../services/api/taskApi";
import { Button, Input, InputRef, Menu, Select, Skeleton } from "antd";
import React, { memo, useEffect, useMemo, useRef, useState } from "react";
import Highlighter from "react-highlight-words";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { v4 as uuid } from "uuid";
import {
  BookOutlined,
  CloseOutlined,
  LeftOutlined,
  RightOutlined,
  SearchOutlined,
} from "@ant-design/icons";

import type { MenuProps } from "antd";
type MenuItem = Required<MenuProps>["items"][number];
function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[],
  type?: "group",
  className?: string
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
    type,
    className,
  } as MenuItem;
}

interface IStage {
  name: string;
  _id: string;
}

export interface IProject {
  name: string;
  _id: string;
  stages?: IStage[];
  code: string;
  createdDate: Date;
  startDate: Date;
  estimatedEndDate: Date;
  status: string;
}

interface ITaskData extends ITask {
  project: {
    id: string;
    name: string;
    code: string;
  };
  stage: {
    id: string;
    name: string;
  };
}

const Sidebar = () => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation(["sidebar", "base", "content"]);
  const inputSearchRef = useRef<InputRef>(null);

  const statusMenu = useAppSelector((state: RootState) => state.menu?.status);
  const reloadSidebar = useAppSelector(
    (state: RootState) => state?.menu?.reload
  );
  const currentTaskId = useAppSelector((state: RootState) => state.menu.taskId);

  const [search, setSearch] = useState<boolean>(false);
  const [width, setWidth] = useState(window.innerWidth);

  const [searchValue, setSearchValue] = useState<string>("");
  const [filterProject, setFilterProject] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("allType");
  const [loading, setLoading] = useState(true);
  const [tasksData, setTasksData] = useState<{
    tasks: ITaskData[];
    total: number;
  } | null>(null);

  // đóng mở sidebar
  const toggleCollapsed = () => {
    dispatch(changeMenu());
  };

  const IconIssues = (issue: string) => {
    return (
      <div
        style={{
          width: "16px",
          height: "5px",
          backgroundColor: issue === "issue" ? "#EC2B2B" : "#44CB39",
          borderRadius: "12px",
        }}
      ></div>
    );
  };

  // lấy all task
  useEffect(() => {
    setLoading(true);
    taskApi
      .getTasks()
      .then((res: any) => {
        setTasksData(res);
        setLoading(false);
      })
      .catch((err: any) => {
        setLoading(false);
        console.log(err);
      });
  }, [reloadSidebar]);

  const listProject = useMemo(() => {
    if (tasksData) {
      const arr = tasksData?.tasks.map((task) => task.project.name);
      const optionsProject = [...new Set(arr)].map((project) => {
        return { label: project, value: project };
      });
      return optionsProject;
    } else return [];
  }, [tasksData]);

  const listTask: MenuProps["items"] = tasksData
    ? tasksData?.tasks
        ?.filter((t) => {
          if (filterProject === "all") {
            return true;
          } else {
            return t?.project?.name.trim() === filterProject.trim();
          }
        })
        ?.filter((t) => {
          if (filterType === "allType") {
            return true;
          } else {
            return t?.type === filterType;
          }
        })
        ?.filter(
          (t) =>
            t.title.toLowerCase().includes(searchValue.toLowerCase()) ||
            (t.code &&
              t?.code.toLowerCase().includes(searchValue.toLowerCase()))
        )
        ?.map((task: ITaskData, index) => {
          return getItem(
            <Link
              onClick={() => {
                if (width < 768) {
                  !statusMenu && toggleCollapsed();
                }
              }}
              key={task._id}
              // key={uuid()}
              to={`/project/${task.project.id}/${task.stage.id}/${task._id}`}
            >
              {/* {task?.title} */}
              <Highlighter
                highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
                searchWords={[searchValue]}
                autoEscape
                textToHighlight={
                  task.title ? `${task.title} - ${task?.code}` : ""
                }
              />
            </Link>,
            task?._id,
            IconIssues(task?.type)
          );
        })
    : [];

  const items: MenuProps["items"] = [
    ...(listTask.length > 0 ? listTask : [getItem(t("base:empty"), "28")]),

    { type: "divider" },
    getItem(t("contact"), "grp", null, [getItem("PMW", "14")], "group"),
  ];

  const handleChangeStatus = (value: string) => {
    setFilterType(value);
  };
  const handleChangeProject = (value: string) => {
    setFilterProject(value);
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
  // phần tự động đóng sidebar khi ở màn hình nhỏ
  useEffect(() => {
    if (window.innerWidth < 768) {
      !statusMenu && toggleCollapsed();
    }
  }, []);

  // options task type
  const typeOptions = [
    {
      label: t("sidebar:type"),
      options: [
        {
          label: t("sidebar:typeAll"),
          value: "allType",
        },
        {
          label: (
            <div className="task__type--main">
              {t("content:form.assignment")}
              <div
                className="task_type"
                style={{
                  backgroundColor: "#44CB39",
                }}
              ></div>
            </div>
          ),
          value: "assignment",
        },
        {
          label: (
            <div className="task__type--main">
              {t("content:form.issue")}
              <div
                className="task_type"
                style={{
                  backgroundColor: "#EC2B2B",
                }}
              ></div>
            </div>
          ),
          value: "issue",
        },
      ],
    },
  ];

  return (
    <aside
      className={`container_sidebar`}
      style={{
        left: statusMenu
          ? `${width && width > 768 ? "-324px" : `calc(-${width}px + 16px)`}`
          : "0px",
        // left: !statusMenu ? `calc(-100% + 16px)` : "0px",
        boxShadow: statusMenu ? "rgba(0, 0, 0, 0.4) 0px 0px 10px" : "none",
      }}
    >
      <div className="sidebar__title ">
        <h4>{t("title")}</h4>
        <div
          className={!statusMenu ? "btn btn_sidebar" : "btn btn_sidebar active"}
          onClick={toggleCollapsed}
        >
          {!statusMenu ? (
            <LeftOutlined
              style={{
                fontWeight: 600,
                fontSize: "24px",
                strokeWidth: "30",
              }}
            />
          ) : (
            <RightOutlined
              style={{
                fontWeight: 600,
                fontSize: "24px",
                strokeWidth: "30",
              }}
            />
          )}
        </div>
      </div>
      <div className="sidebar__action">
        <div className="sidebar__action--select">
          <Select
            defaultValue="all"
            value={filterProject}
            style={{ width: width > 768 ? 100 : 120 }}
            dropdownStyle={{
              minWidth: "200px",
            }}
            onChange={handleChangeProject}
            options={[
              {
                label: t("sidebar:projectList"),
                options: [
                  {
                    label: t("sidebar:projectAll"),
                    value: "all",
                  },
                  ...listProject,
                ],
              },
            ]}
          />{" "}
          <Select
            defaultValue="allType"
            value={filterType}
            // value={`${t("content:task.type")}: ${
            //   t<any>(`content:form.${filterType}`) ||
            //   typeOptions[0].options[0].label
            // }`}
            style={{ width: width > 768 ? 100 : 120 }}
            onChange={handleChangeStatus}
            dropdownStyle={{
              minWidth: "200px",
            }}
            options={typeOptions}
          />
        </div>
        <div className="sidebar__action--search">
          <Button
            onClick={() => {
              setSearch(!search);

              inputSearchRef.current &&
                inputSearchRef.current!.focus({
                  cursor: "start",
                });
            }}
          >
            {search ? <CloseOutlined /> : <SearchOutlined />}
          </Button>
        </div>
      </div>
      <div
        className="search__input"
        style={{
          height: !search ? 0 : "auto",
          padding: !search ? "0 16px" : "0 16px 5px",
        }}
      >
        <Input
          ref={inputSearchRef}
          style={{ display: "flex", gap: "6px" }}
          value={searchValue}
          onChange={(e) => {
            setSearchValue(e.target.value);
          }}
          placeholder={t("sidebar:placeholder")}
          prefix={<BookOutlined />}
        />
      </div>

      <div
        className="sidebar__menu"
        style={{
          overflowY: statusMenu ? "hidden" : "auto",
        }}
      >
        {loading ? (
          <div className="sidebar__skeleton">
            {Array(10)
              .fill(null)
              .map((item, index) => (
                <Skeleton.Input
                  key={index}
                  active={true}
                  size={"small"}
                  block={true}
                />
              ))}
          </div>
        ) : (
          <Menu
            style={{
              width: "100%",
              height: "100%",
            }}
            selectedKeys={[currentTaskId]}
            mode="inline"
            items={items}
          />
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
