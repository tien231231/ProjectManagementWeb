import { IDataEdit } from "./UserDetails";
import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";
import { Input } from "antd";
import TextArea from "antd/es/input/TextArea";
import React, { Dispatch, SetStateAction } from "react";
import { useTranslation } from "react-i18next";
interface IProp {
  currentPassword: string;
  setCurrentPassword: any;
}
interface IPropTextArea {
  fieldUserEdit: IDataEdit;
  setFieldUserEdit: Dispatch<SetStateAction<IDataEdit>>;
}
export const InputPasswordTextArea = ({
  fieldUserEdit,
  setFieldUserEdit,
}: IPropTextArea) => {
  const { t } = useTranslation(["content", "base"]);
  return (
    <TextArea
      value={fieldUserEdit.data}
      placeholder={
        fieldUserEdit?.field === "newPassword"
          ? `${t("content:profileUser.new")} ${t(
              "content:profileUser.password"
            )}...`
          : `${t("content:profileUser.new")} ${fieldUserEdit?.field}...`
      }
      onChange={(e) => {
        const value = e.target.value;
        if (
          !value.startsWith(" ") &&
          !value.endsWith("  ") &&
          /^.{0,30}$/.test(value)
        ) {
          setFieldUserEdit({
            ...fieldUserEdit,
            data: e.target.value,
          });
        }
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault();
        }
      }}
      autoSize={{ maxRows: 1 }}
    />
  );
};

const InputPassword = ({ currentPassword, setCurrentPassword }: IProp) => {
  const { t } = useTranslation(["content", "base"]);

  return (
    <>
      <Input.Password
        value={currentPassword}
        onChange={(e) => {
          const value = e.target.value;
          if (
            !value.startsWith(" ") &&
            !value.endsWith(" ") &&
            /^.{0,18}$/.test(value)
          ) {
            setCurrentPassword(e.target.value);
          }
        }}
        placeholder={t("content:profileUser.current password")}
        iconRender={(visible) =>
          visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
        }
      />
    </>
  );
};

export default InputPassword;
