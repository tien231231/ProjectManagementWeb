import { UploadOutlined } from "@ant-design/icons";
import { Button } from "antd";
import React from "react";
import { useTranslation } from "react-i18next";

interface IProp {
  handleImagePreview: any;
}

const InputFile = ({ handleImagePreview }: IProp) => {
  const { t } = useTranslation(["content", "base"]);
  return (
    <>
      <Button icon={<UploadOutlined />}>
        <label htmlFor="imageUpload" className="">
          {t("content:profileUser.choose photo")}
        </label>
      </Button>
      <input
        style={{ display: "none" }}
        id="imageUpload"
        type="file"
        accept="image/*"
        onChange={handleImagePreview}
      />
    </>
  );
};

export default InputFile;
