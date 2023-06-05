import { LoadingOutlined } from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";
import _ from "lodash";
import React, { useState } from "react";
import { useSelector } from "react-redux";
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

const { Title } = Typography;
const { TextArea } = Input;

interface PropsType {
  title?: string;
  useCase: "create" | "edit" | "info";
  data?: object;
  key?: any;
  closeModal?: React.Dispatch<React.SetStateAction<boolean>>;
  projectDetail?: any;
}

const ProjectForm: React.FC<PropsType> = (props) => {
  const [form] = Form.useForm();
  const token = useSelector((state: any) => state.auth.userInfo.token);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [api, contextHolder] = notification.useNotification();
  const [startDate, setStartDate] = useState<string>();
  const [endDate, setEndDate] = useState<string>();
  const statusOptions = [
    { label: "Preparing", value: "preparing" },
    { label: "On Going", value: "ongoing" },
    { label: "Suspension", value: "suspended" },
    { label: "Complete", value: "completed" },
  ];

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
        setIsLoading(false);
        if (props.closeModal) {
          props.closeModal(false);
          form.resetFields();
        }
      }
    } catch (err: any) {
      api["error"]({
        message: "Error",
        description: err.response.data.message,
      });
      setIsLoading(false);
    }
  };

  // Gửi Request edit thông tin project
  const handleEdit = async (data: any) => {
    try {
      console.log("Data sending with Edit Request:", data);
      setIsLoading(true);
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/project/update/${props.projectDetail._id}`,
        { ...data },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log(response);
      setIsLoading(false);
      if (props.closeModal) {
        props.closeModal(false);
        form.resetFields();
      }
    } catch (err: any) {
      api["error"]({
        message: "Error",
        description: err.response.data.message,
      });
      setIsLoading(false);
    }
  };

  const handleSubmit = (value: any) => {
    if (props.useCase === "create") {
      handleCreate(value);
    } else {
      handleEdit(value);
    }
  };

  return (
    <div className="project-form">
      {contextHolder}
      <Title level={3}>{props.title}</Title>
      <Form
        disabled={props.useCase === "info" ? true : false}
        initialValues={{
          ...props.projectDetail,
          status: props.projectDetail?.status.toUpperCase(),
          startDate: dayjs(props.projectDetail?.startDate),
          estimatedEndDate: dayjs(props.projectDetail?.estimatedEndDate),
        }}
        size="large"
        layout="vertical"
        name="projectInfo"
        form={form}
        onFinish={handleSubmit}
      >
        {/* Project Name Field */}
        <Form.Item
          label="Project Name"
          name="name"
          rules={[
            {
              required: true,
              message: "Please input your project name!",
            },
          ]}
        >
          <TextArea autoSize />
        </Form.Item>

        {/* Code Name and Status Field: Chỉ hiển thị khi show Info và Edit */}
        <Form.Item hidden={props.useCase === "create" && true}>
          <Row>
            <Col span={11}>
              <Form.Item label="Code Name" name="code">
                <Input disabled />
              </Form.Item>
            </Col>
            <Col span={11} offset={2}>
              <Form.Item label="Status" name="status">
                <Select options={statusOptions} />
              </Form.Item>
            </Col>
          </Row>
        </Form.Item>

        {/* Description Field */}
        <Form.Item
          label="Description"
          name="description"
          rules={[
            {
              required: true,
              message: "Please describe your project!",
            },
          ]}
        >
          <TextArea autoSize={{ minRows: 4 }} />
        </Form.Item>

        {/* Start Date - End Date Field */}
        <Row>
          <Col span={11}>
            <Form.Item label="Start Date" name="startDate">
              <DatePicker
                style={{ width: "100%" }}
                disabledDate={(current) => {
                  return current && current < dayjs(Date.now());
                }}
                onChange={(date: any, dateString: string) => {
                  setStartDate(dateString);
                }}
              />
            </Form.Item>
          </Col>
          <Col span={11} offset={2}>
            <Form.Item label="End Date" name="estimatedEndDate">
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
        <Form.Item hidden={props.useCase !== "create" && true}>
          <Button type="primary" htmlType="submit">
            {isLoading && <LoadingOutlined />} Create Project
          </Button>
        </Form.Item>
        <Form.Item hidden={props.useCase !== "edit" && true}>
          <Button type="primary" htmlType="submit">
            {isLoading && <LoadingOutlined />} Confirm Edit
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default ProjectForm;
