import React from "react";
import { images } from "../../assets/images";
import { Typography } from "antd";

const { Title, Paragraph } = Typography;

const RegisterVerify: React.FC = () => {
  return (
    <div className="register-verify">
      <img src={images.registerBackground} alt="register-background" />
      <div className="content">
        <Title level={1}>Register Success</Title>
        <Paragraph>Please check your email for verification</Paragraph>
      </div>
    </div>
  );
};

export default RegisterVerify;
