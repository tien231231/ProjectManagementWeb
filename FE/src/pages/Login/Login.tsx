import { images } from "../../assets/images/index";
import { useAppDispatch, useAppSelector } from "../../redux/hook";
import { requestLogin } from "../../redux/store";
import { GoogleOutlined, LoadingOutlined } from "@ant-design/icons";
import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Form,
  Button,
  Input,
  Divider,
  Typography,
  Checkbox,
  notification,
} from "antd";
import useMessageApi, {
  UseMessageApiReturnType,
} from "../../components/support/Message";

const { Title, Paragraph } = Typography;

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  // const [api, contextHolder] = notification.useNotification();
  const { isLoading } = useAppSelector((state) => {
    return state.auth;
  });
  const dispatch = useAppDispatch();
  const { showMessage, contextHolder }: UseMessageApiReturnType =
    useMessageApi();

  const onFinish = async (requestBody: any) => {
    dispatch(requestLogin(requestBody))
      .unwrap()
      .then(() => {
        // navigate("/");
        navigate(-1);
      })
      .catch((err) => {
        showMessage("error", err, 2);
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
            label="E-mail/Username"
            rules={[
              {
                required: true,
                message: "Please input your E-mail or Username",
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
      </div>
    </div>
  );
};

export default Login;
