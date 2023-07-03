import React from "react";
import { images } from "../../assets/images";
import { Typography } from "antd";
import { Link } from "react-router-dom";

const { Title, Paragraph, Text } = Typography;

const RegisterVerify: React.FC = () => {
  return (
    <div className="register-verify">
      <img src={images.registerBackground} alt="register-background" />
      <div className="content">
        <Title level={1}>Register Success</Title>
        <Text className="content_text">
          Back to <Link to="/">login</Link> page
        </Text>
      </div>
    </div>
  );
};

export default RegisterVerify;
