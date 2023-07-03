import ProjectForm from "../../components/projectForm/ProjectForm";
import { IProject } from "../../components/sidebar/Sidebar";
import Loading from "../../components/support/Loading";
import { useAppSelector } from "../../redux/hook";
import { RootState } from "../../redux/store";
import { DeleteFilled, EditFilled } from "@ant-design/icons";
import axios from "axios";
import moment from "moment";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import {
  getAllProjectError,
  getAllProjectStart,
  getAllProjectSuccess,
} from "../../redux/slice/projectSlice";

import {
  useSearchParams,
  useNavigate,
  createSearchParams,
} from "react-router-dom";
import {
  Button,
  Input,
  Select,
  Space,
  Table,
  Modal,
  Popconfirm,
  Typography,
  Skeleton,
} from "antd";

import type { ColumnsType, TableProps } from "antd/es/table";
import type { SizeType } from "antd/es/config-provider/SizeContext";

import { deleteQuery, setQuery } from "../../redux/slice/paramsSlice";
import useMessageApi, {
  UseMessageApiReturnType,
} from "../../components/support/Message";

// import { TablePaginationPosition } from 'antd/lib/table';
export interface DataType {
  key: string;
  name: string;
  code: string;
  status: string;
  startDate: Date;
  endDate: Date;
}
type DataIndex = keyof DataType;
const { Search } = Input;
const { Text } = Typography;

const ListProject: React.FC = () => {
  const navigate = useNavigate();
  const timeOutRef = useRef<any>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const listProject = useSelector((state: any) => state.project?.listProject);
  const queryParams = useSelector((state: any) => state.queryParams);
  const loading = useSelector((state: any) => state.project?.isFetching);
  const [size, setSize] = useState<SizeType>("large");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchResult, setSearchResult] = useState<any[]>([]);
  const [loadingSearch, setLoadingSearch] = useState<boolean>(false);
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const [openCreateProject, setOpenCreateProject] = useState<boolean>(false);
  const [projectDetail, setProjectDetail] = useState<any>();
  const [openEditProject, setOpenEditProject] = useState<boolean>(false);
  const token = useAppSelector((state: RootState) => state.auth.userInfo.token);
  const { showMessage, contextHolder }: UseMessageApiReturnType =
    useMessageApi();
  const dispatch = useDispatch();
  // useEffect(() => {
  //   projectApi.getAll().then((res) => console.log(res));
  // }, []);

  useEffect(() => {
    let query = Object.fromEntries([...searchParams]);
    dispatch(setQuery({ ...query }));
  }, []);

  useEffect(() => {
    (async () => {
      dispatch(getAllProjectStart());

      try {
        const res = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/project/all`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        dispatch(getAllProjectSuccess(res.data));
      } catch (error) {
        dispatch(getAllProjectError());
      }
    })();
  }, [token]);

  const handleEditProject = (indexValue: number) => {
    let projectDetail = listProject.projects.filter(
      (project: DataType, index: number) => {
        return indexValue === index;
      }
    );
    setProjectDetail(projectDetail[0]);
    setOpenEditProject(true);
  };

  const handleDeleteProject = (project: DataType) => {
    console.log(project);
  };

  //Search Project theo tên
  useEffect(() => {
    const searchProject = async () => {
      if (queryParams.search) {
        setLoadingSearch(true);
        try {
          const response = await axios({
            method: "get",
            url: `${process.env.REACT_APP_BACKEND_URL}/project/search`,
            params: {
              name: queryParams.search,
            },
            headers: { Authorization: `Bearer ${token}` },
          });
          setSearchResult(response.data.projects);
          setLoadingSearch(false);
        } catch (err: any) {
          showMessage("error", err.response.data?.message, 2);
          setLoadingSearch(false);
        }
      }
    };
    timeOutRef.current = setTimeout(searchProject, 500);
    return () => {
      clearTimeout(timeOutRef.current);
    };
  }, [queryParams.search]);

  //Set search input lên query
  const handleInputChange = (event: any) => {
    let value = event.target.value;
    if (value === "" && searchParams.has("search")) {
      let query = searchParams.get("search");
      if (query) {
        searchParams.delete("search");
        const newParams: { [key: string]: string } = {};
        searchParams.forEach((value: string, key: string) => {
          newParams[key] = value;
        });
        setSearchResult([]);
        setSearchParams(newParams);
        dispatch(deleteQuery("search"));
      }
    } else {
      dispatch(setQuery({ ...queryParams, search: value }));
      setSearchParams({ ...queryParams, search: value });
    }
  };

  const navigateProject = (record: any) => {
    navigate({
      pathname: `${record.key}`,
      search: `${createSearchParams({ currentTab: "General Information" })}`,
    });
  };

  const columns: ColumnsType<DataType> = useMemo(
    () => [
      {
        title: "Name",
        dataIndex: "name",
        key: "name",

        sorter: (a, b) => a.name.localeCompare(b.name),
        render: (_, record: DataType) => {
          return (
            <>
              <Text
                className="project_name"
                onClick={() => navigateProject(record)}
              >
                {record.name}
              </Text>
            </>
          );
        },
      },
      {
        title: "Code",
        dataIndex: "code",
        key: "code",
        sorter: (a, b) => a.code.localeCompare(b.code),
      },
      {
        title: "Status",
        key: "status",
        dataIndex: "status",
        sorter: (a, b) => a.status.localeCompare(b.status),

        render: (_, { status }) => {
          let bgColor: string = "";
          switch (status) {
            //   case "open":
            //     bgColor = "#44CB39";
            //     break;
            case "ongoing":
              bgColor = "#F0E155";
              break;
            case "completed":
              bgColor = "#44CB39";
              break;
            case "suspended":
              bgColor = "#EC2B2B";
              break;
            case "preparing":
              bgColor = "#2E55DE";
              break;
            default:
              bgColor = "transparent";
              break;
          }
          return (
            <div className="project_status">
              <Button
                className="btn btn_status"
                type="primary"
                shape="round"
                // icon={<DownloadOutlined />}
                style={{ backgroundColor: bgColor }}
                size={"small"}
              >
                <span className=""> {status.toUpperCase()}</span>
              </Button>
            </div>
          );
        },
      },
      {
        title: "Start date",
        dataIndex: "startDate",
        key: "startDate",
        sorter: (a, b) => {
          const startDateA = moment(a.startDate, "DD/MM/YYYY").toDate();
          const startDateB = moment(b.startDate, "DD/MM/YYYY").toDate();
          return startDateA.getTime() - startDateB.getTime();
        },
      },
      {
        title: "End date",
        dataIndex: "endDate",
        key: "endDate",
        sorter: (a, b) => {
          const startDateA = moment(a.endDate, "DD/MM/YYYY").toDate();
          const startDateB = moment(b.endDate, "DD/MM/YYYY").toDate();
          return startDateA.getTime() - startDateB.getTime();
        },
      },
      {
        title: "Action",
        key: "action",
        render: (_, record: DataType, index: number) => (
          <Space size="middle">
            <span onClick={() => handleEditProject(index)}>
              <EditFilled style={{ fontSize: "16px", cursor: "pointer" }} />
            </span>
            <Popconfirm
              placement="topRight"
              title="Delete the project"
              description="Are you sure to delete this project?"
              onConfirm={() => handleDeleteProject(record)}
            >
              <DeleteFilled style={{ fontSize: "16px", cursor: "pointer" }} />
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [searchText, listProject]
  );

  const data: DataType[] = useMemo(() => {
    let newProject =
      searchResult && searchResult.length > 0
        ? [
            ...searchResult
              .filter((project: IProject) => {
                if (statusFilter === "all") {
                  return true;
                } else {
                  return project.status === statusFilter;
                }
              })
              .map((project: IProject, index: number) => {
                return {
                  key: project._id,
                  name: project.name,
                  code: project.code,
                  status: project.status,
                  startDate: moment(project.startDate).format("DD/MM/YYYY "),
                  endDate: moment(project.estimatedEndDate).format(
                    "DD/MM/YYYY "
                  ),
                };
              }),
          ]
        : listProject.projects && listProject.projects.length > 0
        ? [
            ...listProject.projects
              .filter((project: IProject) => {
                if (statusFilter === "all") {
                  return true;
                } else {
                  return project.status === statusFilter;
                }
              })
              .map((project: IProject, index: number) => {
                return {
                  key: project._id,
                  name: project.name,
                  code: project.code,
                  status: project.status,
                  startDate: moment(project.startDate).format("DD/MM/YYYY "),
                  endDate: moment(project.estimatedEndDate).format(
                    "DD/MM/YYYY "
                  ),
                };
              }),
          ]
        : [];
    return newProject;
  }, [listProject, statusFilter, searchResult]);

  const pagination: TableProps<any>["pagination"] = {
    position: ["bottomCenter"],
  };
  const handleChange = (value: string) => {
    setStatusFilter(value);
  };
  return (
    <div className="content_project-page">
      {contextHolder}
      {loading && <Loading />}
      {/* {loading && <Loading />} */}
      <div className="project_page-header">
        {/* Create New Project Modal */}
        <Modal
          open={openCreateProject}
          footer={null}
          onCancel={() => setOpenCreateProject(false)}
        >
          <ProjectForm
            title="Create New Project"
            useCase="create"
            closeModal={setOpenCreateProject}
          />
        </Modal>

        {/* Edit Project Info Modal */}
        <Modal
          open={openEditProject}
          footer={null}
          onCancel={() => setOpenEditProject(false)}
        >
          <ProjectForm
            title="Edit Project Info"
            useCase="edit"
            closeModal={setOpenEditProject}
            projectDetail={{ ...projectDetail }}
            key={projectDetail?._id}
          />
        </Modal>

        {/* Project List Main Content */}
        <div className="header_left">
          <Button
            onClick={() => setOpenCreateProject(true)}
            type="primary"
            size={size}
          >
            Create Project
          </Button>
        </div>
        <div className="header_right">
          <Space wrap>
            <Search
              loading={loadingSearch}
              value={queryParams.search}
              allowClear
              onChange={handleInputChange}
              // onSearch={handleSearchMember}
              placeholder="Enter name or code..."
              size="large"
              style={{ width: "300px" }}
            />
            <Select
              defaultValue="all"
              size={size}
              style={{ width: 120 }}
              onChange={handleChange}
              options={[
                { value: "all", label: "All" },
                { value: "completed", label: "Completed" },
                { value: "suspended", label: "Suspended" }, //tạm đình chỉ
                { value: "preparing", label: "Preparing" }, //Chuẩn bị
                { value: "ongoing", label: "On Going" }, //đang thực hiện
                // { value: "processing", label: "Processing" }, //đang thực hiện
                // { value: "preparing", label: "Preparing" }, //chuẩn bị
              ]}
            />
          </Space>
        </div>
      </div>
      <div className="project_page-table">
        {loadingSearch ? (
          <Skeleton active />
        ) : (
          <Table columns={columns} dataSource={data} pagination={pagination} />
        )}
      </div>
    </div>
  );
};

export default ListProject;
