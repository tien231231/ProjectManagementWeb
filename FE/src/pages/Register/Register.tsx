import React, { useState } from "react";
import { Button, Form, Input, Divider, notification, Typography } from "antd";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { GoogleOutlined, LoadingOutlined } from "@ant-design/icons";
import { images } from "../../assets/images";

const { Title } = Typography;

const Register: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [api, contextHolder] = notification.useNotification();

  // Submit Form Đăng ký
  const onFinish = async (requestBody: any) => {
    try {
      setIsLoading(true);
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/auth/signup`,
        requestBody
      );
      if (response.status === 200) {
        navigate("/register-verify");
        setIsLoading(false);
      }
    } catch (error: any) {
      api["error"]({
        message: "Error",
        description: error.response.data.message,
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="register">
      {contextHolder}
      <img src={images.registerBackground} alt="register-background" />
      <div className="form-container">
        <div className="form-title">
          <Title level={3} className="register-title">
            Register Your Account
          </Title>
          <Divider />
        </div>

        <Form
          size="large"
          className="form-layout"
          layout="vertical"
          form={form}
          name="register"
          onFinish={onFinish}
          scrollToFirstError
        >
          {/* Full name Field */}
          <Form.Item
            name="fullName"
            label="Full Name"
            rules={[
              {
                required: true,
                message: "Please input your name!",
              },
            ]}
          >
            <Input />
          </Form.Item>

          {/* Email Field */}
          <Form.Item
            name="email"
            label="E-mail"
            rules={[
              {
                type: "email",
                message: "The input is not valid E-mail!",
              },
              {
                required: true,
                message: "Please input your E-mail!",
              },
            ]}
          >
            <Input />
          </Form.Item>

          {/* Username Field */}
          <Form.Item
            name="username"
            label="Username"
            rules={[
              {
                required: true,
                message: "Please input your nickname!",
                whitespace: true,
              },
            ]}
          >
            <Input />
          </Form.Item>

          {/* Password Field */}
          <Form.Item
            name="password"
            label="Password"
            rules={[
              {
                required: true,
                message: "Please input your password!",
              },
            ]}
            hasFeedback
          >
            <Input.Password />
          </Form.Item>

          {/* Confirm Password Field */}
          <Form.Item
            name="confirm"
            label="Confirm Password"
            dependencies={["password"]}
            hasFeedback
            rules={[
              {
                required: true,
                message: "Please confirm your password!",
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error(
                      "The two passwords that you entered do not match!"
                    )
                  );
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>

          {/* Submit Button */}
          <Form.Item>
            <Button type="primary" htmlType="submit">
              {isLoading && <LoadingOutlined />}Register
            </Button>
          </Form.Item>
        </Form>
        <Divider className="register-divider" orientation="center" plain>
          Or
        </Divider>
        <div className="google-register-button">
          <Button type="primary" size="large">
            {" "}
            <GoogleOutlined />
            Register with Google
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Register;
