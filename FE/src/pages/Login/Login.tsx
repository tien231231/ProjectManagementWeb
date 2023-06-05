import React, { useEffect } from "react";
import {
  Form,
  Button,
  Input,
  Divider,
  Typography,
  Checkbox,
  notification,
} from "antd";
import { LoadingOutlined, GoogleOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../redux/hook";
import { images } from "../../assets/images/index";
import { requestLogin } from "../../redux/store";

const { Title, Paragraph } = Typography;

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [api, contextHolder] = notification.useNotification();
  const { isLoading } = useAppSelector((state) => {
    return state.auth;
  });
  const dispatch = useAppDispatch();

  const onFinish = async (requestBody: any) => {
    dispatch(requestLogin(requestBody))
      .unwrap()
      .then(() => {
        navigate("/");
      })
      .catch((error) => {
        api["error"]({
          message: "Error",
          description: error.message,
        });
      });
  };

  return (
    <div className="login">
      {contextHolder}
      <img src={images.registerBackground} alt="register-background" />
      <div className="form-container">
        <div className="form-title">
          <Title level={3}>Login</Title>
          <Paragraph>Welcome back. Login to start working.</Paragraph>
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
          {/* Email Field */}
          <Form.Item
            name="credential"
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

          <Form.Item name="rememberMe" valuePropName="checked">
            <Checkbox>Remember me</Checkbox>
          </Form.Item>

          {/* Submit Button */}
          <Form.Item>
            <Button type="primary" htmlType="submit">
              {isLoading && <LoadingOutlined />}Login
            </Button>
          </Form.Item>
        </Form>

        <Paragraph>
          <Link to="/forgot-password">Forgot Password?</Link>
          <Divider type="vertical" />
          Don't have account?&nbsp;
          <Link to="/register">Sign up</Link>
        </Paragraph>
        <Divider className="login-divider" orientation="center" plain>
          Or
        </Divider>
        <div className="google-register-button">
          <Button type="primary" size="large">
            <GoogleOutlined />
            Login with Google
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Login;
