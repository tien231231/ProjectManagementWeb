import { Spin } from "antd";
import React from "react";

const Loading: React.FC = () => (
  <div className="loading_pages">
    <Spin size="large">
      <div className="content" />
    </Spin>
  </div>
);

export default Loading;
