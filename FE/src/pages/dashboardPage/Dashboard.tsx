import { useState } from "react";
import { Col, Divider, Row, Typography, Button, Tooltip, Modal } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import ProjectForm from "../../components/projectForm/ProjectForm";
import useMessageApi, {
  UseMessageApiReturnType,
} from "../../components/support/Message";
import ProjectsList from "./ProjectsList";
import TasksList from "./TasksList";
import { useTranslation } from "react-i18next";

const { Title } = Typography;

export interface UserInfo {
  avatar: string;
  fullName: string;
  username: string;
  email: string;
  _id: string;
}

export interface TasksType {
  code: string;
  title: string;
  status: string;
  deadline: Date;
  priority: string;
  assignee: UserInfo;
  createdBy: UserInfo;
  description?: string;
  startDate: Date;
  type: string;
  _id: string;
  createdDate: Date;
}

export interface PageType {
  pageIndex: number;
  total: number;
  initialTotal?: number;
}

const Dashboard: React.FC = () => {
  const [openCreateProject, setOpenCreateProject] = useState<boolean>(false);
  const { showMessage, contextHolder }: UseMessageApiReturnType =
    useMessageApi();
  const [openEditProject, setOpenEditProject] = useState<boolean>(false);

  const [projectDetail, setProjectDetail] = useState<any>();
  const [tasksList, setTasksList] = useState<TasksType[]>([]);
  const { t, i18n } = useTranslation(["content", "base"]);
  const [projectPagination, setProjectPagination] = useState<PageType>({
    pageIndex: 1,
    total: null as unknown as number,
  });

  return (
    <>
      {/* Modal Form Tạo Project */}
      <Modal
        open={openCreateProject}
        footer={null}
        onCancel={() => setOpenCreateProject(false)}
      >
        <ProjectForm
          title={`${t("content:form.create project")}`}
          useCase="create"
          closeModal={setOpenCreateProject}
          projectPagination={projectPagination}
          setProjectPagination={setProjectPagination}
        />
      </Modal>

      {/* Modal Form Edit Project */}
      <Modal
        open={openEditProject}
        footer={null}
        onCancel={() => setOpenEditProject(false)}
      >
        <ProjectForm
          title={`${t("content:form.edit project")}`}
          useCase="edit"
          setProjectDetail={setProjectDetail}
          closeModal={setOpenEditProject}
          projectDetail={{ ...projectDetail }}
          key={projectDetail?._id}
        />
      </Modal>
      {contextHolder}

      {/* Main content */}
      <Row className="dashboard" justify="space-between">
        <Col className="projects_list" xl={10} sm={24}>
          <div className="projects_list_header">
            <Title level={4}>{t("content:dashboardProjectsListTitle")}</Title>
            <Tooltip title="Create new project">
              <Button
                onClick={() => setOpenCreateProject(true)}
                size="small"
                type="primary"
                shape="circle"
                icon={<PlusOutlined />}
              />
            </Tooltip>
          </div>

          <ProjectsList
            setOpenEditProject={setOpenEditProject}
            setProjectDetail={setProjectDetail}
            projectPagination={projectPagination}
            setProjectPagination={setProjectPagination}
          />
        </Col>

        <Divider type="horizontal" className="horizontal_divider" />
        <Col className="tasks_list" xl={12} sm={24}>
          <div className="tasks_list_header">
            <Title level={4}>{t("content:dashbaordTasksListTitle")}</Title>
          </div>
          <TasksList
            tasksList={tasksList}
            setTasksList={setTasksList}
            showMessage={showMessage}
          />
        </Col>
      </Row>
    </>
  );
};

export default Dashboard;
