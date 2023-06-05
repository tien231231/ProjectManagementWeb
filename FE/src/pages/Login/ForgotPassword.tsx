import React from "react";
import { Form, Typography, Divider, Input, Button, Row, Col } from "antd";
import { Link } from "react-router-dom";
import { images } from "../../assets/images/index";

const { Title } = Typography;

const ForgotPassword: React.FC = () => {
  const [form] = Form.useForm();

  const onFinish = async (requestBody: any) => {
    console.log("Data:", requestBody);
  };

  const getCode = () => {
    console.log("Get Code from Email");
  };

  return (
    <div className="forgot-password">
      <img src={images.registerBackground} alt="register-background" />
      <div className="form-container">
        <div className="form-title">
          <Title level={3}>Reset Password</Title>
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

          {/* Verification Code Field */}
          <Form.Item label="Verification Code">
            <Row gutter={8} align="middle">
              <Col span={16}>
                <Form.Item
                  noStyle
                  name="verficationCode"
                  rules={[
                    {
                      required: true,
                      message: "Please input your code",
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Button onClick={getCode}>Get Code</Button>
              </Col>
            </Row>
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
              Reset
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default ForgotPassword;
