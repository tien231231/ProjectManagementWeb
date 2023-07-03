import { LoadingOutlined } from "@ant-design/icons";
import { addNewProject, editProject } from "../../redux/slice/projectSlice";
import axios from "axios";
import dayjs from "dayjs";
import _ from "lodash";
import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useSelector, useDispatch } from "react-redux";
import useMessageApi, { UseMessageApiReturnType } from "../support/Message";
import {
  Typography,
  Form,
  Input,
  Select,
  Row,
  Col,
  DatePicker,
  Button,
  notification,
} from "antd";
import { useTranslation } from "react-i18next";
import { changeMsgLanguage } from "../../utils/changeMsgLanguage";
import { PageType } from "../../pages/dashboardPage/Dashboard";

const { Title } = Typography;
const { TextArea } = Input;

interface PropsType {
  title?: string;
  useCase: "create" | "edit" | "info";
  data?: object;
  key?: any;
  closeModal: React.Dispatch<React.SetStateAction<boolean>>;
  projectDetail?: any;
  setProjectDetail?: Dispatch<any>;
  projectPagination?: PageType;
  setProjectPagination?: Dispatch<SetStateAction<PageType>>;
}

const ProjectForm: React.FC<PropsType> = ({
  title,
  useCase,
  closeModal,
  projectDetail,
  setProjectDetail,
  projectPagination,
  setProjectPagination,
}) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const token = useSelector((state: any) => state.auth.userInfo.token);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { showMessage, contextHolder }: UseMessageApiReturnType =
    useMessageApi();
  const [startDate, setStartDate] = useState<string>();
  const [endDate, setEndDate] = useState<string>();
  const { t, i18n } = useTranslation(["content", "base"]);

  const statusOptions = [
    { label: "Preparing", value: "preparing" },
    { label: "On Going", value: "ongoing" },
    { label: "Suspension", value: "suspended" },
    { label: "Complete", value: "completed" },
  ];

  const initialValue = useMemo(() => {
    return projectDetail
      ? {
          name: projectDetail?.name,
          status: projectDetail?.status.toUpperCase(),
          startDate: dayjs(projectDetail?.startDate),
          estimatedEndDate: dayjs(projectDetail?.estimatedEndDate),
          code: projectDetail?.code,
          description: projectDetail?.description,
        }
      : {};
  }, [projectDetail]);

  useEffect(() => {
    form.resetFields();
  }, [form, initialValue]);

  // Gửi Request tạo project mới
  const handleCreate = async (data: any) => {
    try {
      setIsLoading(true);
      if (!_.isEmpty(data)) {
        const response = await axios.post(
          `${process.env.REACT_APP_BACKEND_URL}/project/new`,
          { ...data },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        dispatch(addNewProject(response.data.project));
        showMessage(
          "success",
          changeMsgLanguage(response.data?.message, "Tạo mới thành công"),
          2
        );
        setProjectPagination?.({
          total: (projectPagination?.total as number) + 1,
          initialTotal: (projectPagination?.initialTotal as number) + 1,
          pageIndex: projectPagination?.pageIndex as number,
        });
        setIsLoading(false);
        setStartDate("");
        setEndDate("");
        form.resetFields();
        closeModal(false);
      }
    } catch (err: any) {
      showMessage(
        "error",
        changeMsgLanguage(err.response.data?.message, "Tạo mới thất bại"),
        2
      );
      form.resetFields();
      setIsLoading(false);
    }
  };

  // Gửi Request edit thông tin project
  const handleEdit = async (data: any) => {
    try {
      setIsLoading(true);
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/project/update/${projectDetail._id}`,
        { ...data },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      dispatch(editProject(response.data.project));
      showMessage(
        "success",
        changeMsgLanguage(response.data?.message, "Chỉnh sửa thành công"),
        2
      );
      setIsLoading(false);
      if (closeModal) {
        closeModal(false);
      }
    } catch (err: any) {
      showMessage(
        "error",
        changeMsgLanguage(err.response.data?.message, "Chỉnh sửa thất bại"),
        2
      );
      setIsLoading(false);
    }
  };

  const handleSubmit = (value: any) => {
    if (useCase === "create") {
      handleCreate(value);
    } else {
      handleEdit(value);
    }
  };

  return (
    <div className="project-form">
      {contextHolder}
      <Title level={3}>{title}</Title>
      <Form
        initialValues={initialValue}
        size="large"
        layout="vertical"
        name="projectInfo"
        form={form}
        onFinish={handleSubmit}
      >
        {/* Project Name Field */}
        <Form.Item
          label={`${t("content:form.project name")}`}
          name="name"
          rules={[
            {
              required: true,
              message: `${t("content:message.requiredUsername")}`,
            },
          ]}
        >
          <TextArea autoSize />
        </Form.Item>

        {/* Code Name and Status Field: Chỉ hiển thị khi show Info và Edit */}
        <Form.Item hidden={useCase === "create" && true}>
          <Row>
            <Col span={24} sm={{ span: 11 }}>
              <Form.Item
                label={`${t("content:form.project code")}`}
                name="code"
              >
                <Input disabled />
              </Form.Item>
            </Col>
            <Col span={24} sm={{ span: 11, offset: 2 }}>
              <Form.Item label="Status" name="status">
                <Select options={statusOptions} />
              </Form.Item>
            </Col>
          </Row>
        </Form.Item>

        {/* Description Field */}
        <Form.Item
          label={`${t("content:form.description")}`}
          name="description"
          rules={[
            {
              required: true,
              message: `${t("content:message.requiredDes")}`,
            },
          ]}
        >
          <TextArea autoSize={{ minRows: 4 }} />
        </Form.Item>

        {/* Start Date - End Date Field */}
        <Row>
          <Col span={24} sm={{ span: 11 }}>
            <Form.Item label={`${t("content:startingDate")}`} name="startDate">
              <DatePicker
                style={{ width: "100%" }}
                disabledDate={(current) => {
                  return endDate && current
                    ? current < dayjs(Date.now()) || current > dayjs(endDate)
                    : current < dayjs(Date.now());
                }}
                onChange={(date: any, dateString: string) => {
                  setStartDate(dateString);
                }}
              />
            </Form.Item>
          </Col>
          <Col span={24} sm={{ span: 11, offset: 2 }}>
            <Form.Item
              label={`${t("content:endDateExpected")}`}
              name="estimatedEndDate"
            >
              <DatePicker
                onChange={(date: any, dateString: string) => {
                  setEndDate(dateString);
                }}
                style={{ width: "100%" }}
                disabledDate={(current) => {
                  return current && current < dayjs(startDate);
                }}
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Submit Buttons Field */}
        <Form.Item hidden={useCase !== "create" && true}>
          <Button type="primary" htmlType="submit">
            {isLoading && <LoadingOutlined />} Create Project
          </Button>
        </Form.Item>
        <Form.Item hidden={useCase !== "edit" && true}>
          <Button type="primary" htmlType="submit">
            {isLoading && <LoadingOutlined />} Confirm Edit
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default ProjectForm;
