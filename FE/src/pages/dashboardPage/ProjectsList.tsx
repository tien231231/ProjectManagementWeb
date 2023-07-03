import {
  DeleteOutlined,
  EditOutlined,
  EllipsisOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Button,
  Popconfirm,
  Table,
  Tooltip,
  Typography,
  Input,
  Checkbox,
  Dropdown,
  Skeleton,
} from "antd";
import { ColumnsType } from "antd/es/table";
import axios from "axios";
import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link } from "react-router-dom";
import useMessageApi, {
  UseMessageApiReturnType,
} from "../../components/support/Message";
import { useAppDispatch, useAppSelector } from "../../redux/hook";
import { RootState } from "../../redux/store";
import projectApi from "../../services/api/projectApi";
import {
  deleteProject,
  getAllProjectSuccess,
} from "../../redux/slice/projectSlice";
import { NoticeType } from "antd/es/message/interface";
import { useTranslation } from "react-i18next";
import { changeMsgLanguage } from "../../utils/changeMsgLanguage";
import { PageType } from "./Dashboard";
import { useDispatch } from "react-redux";
import { CheckboxValueType } from "antd/es/checkbox/Group";
import { setQuery } from "../../redux/slice/paramsSlice";
import { setStatusLabel } from "../../utils/setStatusLabel";

const { Text } = Typography;
const { Search } = Input;

interface ProjectsListType {
  setProjectDetail: Dispatch<any>;
  setOpenEditProject: Dispatch<SetStateAction<boolean>>;
  projectPagination: PageType;
  setProjectPagination: Dispatch<SetStateAction<PageType>>;
}

interface ProjectsDataType {
  key: string;
  name: string;
  status: string;
  members: any[];
}

interface DeleteConfirmPropsType {
  record: ProjectsDataType;
  showMessage: (type: NoticeType, content: string, duration?: number) => void;
  handleEditProject: (record: ProjectsDataType) => void;
  projectPagination: PageType;
  setProjectPagination: Dispatch<SetStateAction<PageType>>;
  searchResult: any[];
  setSearchResult: Dispatch<SetStateAction<any[]>>;
}

const Action: React.FC<DeleteConfirmPropsType> = ({
  record,
  showMessage,
  handleEditProject,
  projectPagination,
  setProjectPagination,
  searchResult,
  setSearchResult,
}) => {
  const [confirmLoading, setConfirmLoading] = useState<boolean>(false);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [isDelete, setIsDelete] = useState<boolean>(false);
  const user = useAppSelector((state: RootState) => state.auth.userInfo);
  const { t } = useTranslation(["content", "base"]);
  const dispatch = useAppDispatch();
  const [openDropdown, setOpenDropdown] = useState<boolean>(false);

  //Chỉ Leader và manager mới thực hiện được edit/delete
  useEffect(() => {
    record?.members?.forEach((member: any) => {
      if (
        member.data.email === user.email &&
        member.role !== "member" &&
        member.role !== "supervisor"
      ) {
        setIsEdit(true);
      }
      if (member.data.email === user.email && member.role === "manager") {
        setIsDelete(true);
      }
    });
  }, [record, user]);

  const handleDeleteProject = (project: ProjectsDataType) => {
    projectApi
      .deleteProject(project.key)
      .then((res: any) => {
        showMessage(
          "success",
          changeMsgLanguage(res?.message, "Xóa thành công"),
          2
        );
        if (searchResult && searchResult?.length > 0) {
          const newResult = searchResult.filter((item: any) => {
            return item._id !== project.key;
          });
          setSearchResult(newResult);
        }
        dispatch(deleteProject(project));
        setProjectPagination?.({
          total: (projectPagination?.total as number) - 1,
          pageIndex: projectPagination?.pageIndex as number,
        });
        setConfirmLoading(false);
      })
      .catch((err: any) => {
        showMessage(
          "error",
          changeMsgLanguage(err.response.data?.message, "Xóa thất bại"),
          2
        );
      });
  };

  return (
    <>
      <div className="project_name_column">
        <Link to={`project/${record.key}`}>{record.name}</Link>
        <div className="project_name_action">
          <Button
            disabled={!isEdit}
            onClick={() => handleEditProject(record)}
            icon={<EditOutlined />}
          />
          <Popconfirm
            placement="topRight"
            title={`${t("content:titleDeleteProject")}`}
            description={`${t("content:desDeleteProject")}`}
            onConfirm={() => handleDeleteProject(record)}
            okText={t("base:ok")}
            cancelText={t("base:cancel")}
          >
            <Button icon={<DeleteOutlined />} disabled={!isDelete} />
          </Popconfirm>
        </div>
      </div>
    </>
  );
};

const ProjectsList: React.FC<ProjectsListType> = ({
  setProjectDetail,
  setOpenEditProject,
  projectPagination,
  setProjectPagination,
}) => {
  const dispatch = useDispatch();
  const [loadingSearch, setLoadingSearch] = useState<boolean>(false);
  const timeOutRef = useRef<any>(null);
  const token = useAppSelector((state: RootState) => state.auth.userInfo.token);
  const [searchResult, setSearchResult] = useState<any[]>([]);
  const { showMessage, contextHolder }: UseMessageApiReturnType =
    useMessageApi();
  const { t } = useTranslation(["content", "base"]);
  const [filterValue, setFilterValue] = useState<CheckboxValueType[]>([]);
  const [checkAll, setCheckAll] = useState<boolean>(false);
  const [indeterminate, setIndeterminate] = useState<boolean>(true);
  const queryParams = useAppSelector((state: any) => state.queryParams);
  const listProject = useAppSelector(
    (state: any) => state.project?.listProject
  );

  const plainOptions = [
    {
      label: "Preparing",
      value: "preparing",
    },
    {
      label: "On Going",
      value: "ongoing",
    },
    {
      label: "Completed",
      value: "completed",
    },
    {
      label: "Suspended",
      value: "suspended",
    },
  ];

  //Xử lý event khi click filter status
  const selectFilter = async (status: CheckboxValueType[]) => {
    setIndeterminate(!!status?.length && status?.length < plainOptions?.length);
    setFilterValue(status);
    setCheckAll(status?.length === plainOptions?.length);
    dispatch(
      setQuery({
        ...queryParams,
        projectTableParams: {
          ...queryParams.projectTableParams,
          status,
        },
      })
    );
  };

  const onCheckAllChange = async (e: any) => {
    let filter = e.target.check
      ? plainOptions.map((option: any) => option.value)
      : [];
    setFilterValue(filter);
    setIndeterminate(false);
    setCheckAll(e.target.checked);
    dispatch(
      setQuery({
        ...queryParams,
        projectTableParams: {
          ...queryParams.projectTableParams,
          status: filter,
        },
      })
    );
  };
  //Kết thúc xử lý

  //handle search input
  const handleSearchProject = (event: any) => {
    let value = event.target.value;
    clearTimeout(timeOutRef.current);
    timeOutRef.current = setTimeout(() => {
      dispatch(
        setQuery({
          ...queryParams,
          projectTableParams: {
            ...queryParams.projectTableParams,
            name: value,
          },
        })
      );
    }, 500);
  };
  //Kết thúc xử lý

  //Gọi API khi search, filter thay đổi

  useEffect(() => {
    const filterProject = async () => {
      setLoadingSearch(true);
      try {
        const response = await axios({
          method: "get",
          url: `${process.env.REACT_APP_BACKEND_URL}/project/search`,
          params: queryParams.projectTableParams,
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data.projects?.length === 0) {
          showMessage(
            "error",
            changeMsgLanguage(
              "No projects were found",
              "Không tìm thấy kết quả"
            ),
            2
          );
        }
        dispatch(getAllProjectSuccess(response.data));
        setProjectPagination({
          ...projectPagination,
          total: response.data.total,
          pageIndex: response.data.currentPage,
        });
        setLoadingSearch(false);
      } catch (err: any) {
        showMessage(
          "error",
          changeMsgLanguage(
            err.response.data?.message,
            "Không tìm thấy kết quả"
          ),
          2
        );
        setLoadingSearch(false);
      }
    };
    filterProject();
  }, [
    queryParams.projectTableParams?.status,
    queryParams.projectTableParams?.name,
    token,
  ]);

  //Xử lý event khi chuyển trang
  const handlePageChange = async (page: number) => {
    setLoadingSearch(true);
    try {
      const response = await axios({
        method: "get",
        url: `${process.env.REACT_APP_BACKEND_URL}/project/search`,
        headers: { Authorization: `Bearer ${token}` },
        params: { ...queryParams.projectTableParams, page },
      });
      dispatch(getAllProjectSuccess(response.data));
      setLoadingSearch(false);
      setProjectPagination({
        ...projectPagination,
        total: response.data.total,
        pageIndex: response.data.currentPage,
      });
    } catch (err: any) {
      showMessage(
        "error",
        changeMsgLanguage(
          err.response.data?.message,
          "Gặp sự cố khi chuyển trang"
        ),
        2
      );
      setLoadingSearch(false);
    }
  };

  //Truyền Project Info khi click vào project
  const handleEditProject = (record: ProjectsDataType) => {
    let projectDetail = listProject.projects.filter((project: any) => {
      return project._id === record.key;
    });
    setProjectDetail(projectDetail[0]);
    setOpenEditProject(true);
  };

  const columns: ColumnsType<ProjectsDataType> = [
    {
      title: `${t("content:name")}`,
      dataIndex: "name",
      key: "name",
      render: (_, record: ProjectsDataType, index: number) => {
        return (
          <>
            <Action
              record={record}
              showMessage={showMessage}
              handleEditProject={handleEditProject}
              projectPagination={projectPagination}
              setProjectPagination={setProjectPagination}
              searchResult={searchResult}
              setSearchResult={setSearchResult}
            />
          </>
        );
      },

      filterIcon: <SearchOutlined />,
      filterDropdown: () => (
        <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
          <Search
            allowClear
            placeholder="Search Project"
            onChange={handleSearchProject}
          />
        </div>
      ),
      width: "50%",
    },
    {
      title: `${t("content:form.status")}`,
      dataIndex: "status",
      key: "status",
      filters: [
        { text: "Preparing", value: "preparing" },
        { text: "On Going", value: "ongoing" },
        { text: "Completed", value: "completed" },
        { text: "Suspended", value: "suspended" },
      ],
      filterDropdown: () => (
        <div className="table_filter_dropdown">
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
            onChange={selectFilter}
            value={filterValue}
          />
        </div>
      ),
      render: (_, { status }) => {
        const { bgColor, statusLabel, fontColor } = setStatusLabel(status);
        return (
          <>
            <Button
              type="primary"
              shape="round"
              style={{ backgroundColor: bgColor }}
            >
              <Text className="btn_status" strong style={{ color: fontColor }}>
                {statusLabel}
              </Text>
            </Button>
          </>
        );
      },
    },
    {
      title: `${t("content:form.members")}`,
      dataIndex: "members",
      key: "members",
      render: (_, record: ProjectsDataType) => {
        return (
          <>
            <Avatar.Group
              maxCount={4}
              maxStyle={{ cursor: "pointer", backgroundColor: "#4e5658" }}
            >
              {record.members?.map((member: any) => {
                return (
                  <Tooltip title={member.data.fullName} key={member.data._id}>
                    <Avatar
                      style={{ cursor: "pointer" }}
                      src={member.data.avatar}
                    />
                  </Tooltip>
                );
              })}
            </Avatar.Group>
          </>
        );
      },
    },
  ];

  const data: ProjectsDataType[] = useMemo(() => {
    let newProject: ProjectsDataType[] = [];
    if (listProject.projects && listProject.projects?.length > 0) {
      newProject = [
        ...listProject.projects.map((project: any) => {
          return {
            key: project._id,
            name: project.name,
            status: project.status,
            members: project.members,
          };
        }),
      ];
    } else {
      newProject = [];
    }
    return newProject;
  }, [listProject]);

  return (
    <>
      {contextHolder}
      <div className="projects_list_item">
        {loadingSearch ? (
          <Skeleton active/>
        ) : (
          <Table
            id="projects"
            getPopupContainer={(trigger) => {
              return trigger.parentElement as HTMLElement;
            }}
            scroll={{ x: 600 }}
            className="projects_table"
            columns={columns}
            dataSource={data}
            loading={loadingSearch}
            bordered
            pagination={{
              position: ["bottomCenter"],
              total: projectPagination.total,
              pageSize: 10,
              current: projectPagination.pageIndex,
              onChange: handlePageChange,
            }}
          />
        )}
      </div>
    </>
  );
};

export default ProjectsList;
