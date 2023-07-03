import InputFile from "./InputFile";
import InputPassword, { InputPasswordTextArea } from "./InputPassword";
import Sidebar from "../../components/sidebar/Sidebar";
import { useAxios } from "../../hooks";
import { updateUserInfo } from "../../redux/slice/authSlice";
import userApi from "../../services/api/userApi";
import { changeMsgLanguage } from "../../utils/changeMsgLanguage";
import { RightOutlined } from "@ant-design/icons";
import { DatePicker, Select, Space } from "antd";
import { Modal, Skeleton } from "antd";
import dayjs from "dayjs";
import moment from "moment";
import "moment/locale/vi";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";

import type { DatePickerProps } from "antd";
import useMessageApi, {
  UseMessageApiReturnType,
} from "../../components/support/Message";

export interface IUser {
  avatar: string;
  dob: Date;
  email: string;
  fullName: string;
  gender: string;
  phone: number;
  userType: string;
  username: string;
}
export interface IDataEdit {
  field: string;
  data: any;
  requirePassword?: boolean;
}
const UserDetails = () => {
  const [dataImage, setDataImage] = useState<any>(null);
  const [imagePreview, setImagePreview] = useState<any>(null);
  const [fieldUserEdit, setFieldUserEdit] = useState<IDataEdit>({
    field: "",
    data: "",
    requirePassword: false,
  });
  //2 modal
  const [open, setOpen] = useState(false);
  const [modalImage, setModalImage] = useState(false);
  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [countReload, setCountReload] = useState<number>(1);
  //lấy dữ liệu user
  const { responseData, isLoading } = useAxios("get", "/user/details", [
    countReload,
  ]);
  const { showMessage, contextHolder }: UseMessageApiReturnType =
    useMessageApi();
  const { t, i18n } = useTranslation(["content", "base"]);
  const dispatch = useDispatch();

  const userInfo: IUser = useMemo(() => {
    return responseData ? responseData?.user : null;
  }, [responseData]);

  moment.locale(i18n.language);

  useEffect(() => {
    dispatch(updateUserInfo(userInfo));
  }, [userInfo]);

  //thay đổi ngày
  const handleChangeDay: DatePickerProps["onChange"] = (date) => {
    setFieldUserEdit({
      field: "dob",
      data: date,
      requirePassword: false,
    });
  };
  //thay đôi giới tính
  const handleChangeGender = (value: string) => {
    setFieldUserEdit({
      ...fieldUserEdit,
      data: value,
    });
  };
  // xử lí preview ảnh
  const handleImagePreview = (e: any) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      file.preview = URL.createObjectURL(file);
      setImagePreview(file);
      const formData = new FormData();
      formData.append("avatar", file, file.name);
      setDataImage(formData);
    }
  };
  // xóa preview ảnh khi thay đổi tránh rò rỉ bộ nhớ
  useEffect(() => {
    return () => {
      imagePreview &&
        imagePreview.preview &&
        URL.revokeObjectURL(imagePreview.preview);
    };
  }, [userInfo]);

  //edit các field text thường
  const handleEditUser = () => {
    // không yêu cầu mật khẩu -- các field thường
    if (fieldUserEdit.data && !fieldUserEdit.requirePassword) {
      if (fieldUserEdit.field === "phone") {
        fieldUserEdit.data = fieldUserEdit.data.trim();
        if (!/^(0\d{9})$/.test(fieldUserEdit.data)) {
          showMessage("error", t("content:profileUser.message phone"), 1.5);
          return;
        }
      }
      showMessage("loading", `${t("content:loading")}...`);
      userApi
        .editUser({
          [fieldUserEdit.field]: fieldUserEdit.data,
        })
        .then((res: any) => {
          showMessage(
            "success",
            changeMsgLanguage(res?.message, "Thay đổi thành công"),
            2
          );
          setOpen(false);
          setFieldUserEdit({
            field: "",
            data: "",
            requirePassword: false,
          });
          setCountReload((prev) => prev + 1);
        })
        .catch((err: any) => {
          showMessage(
            "error",
            changeMsgLanguage(err.response?.data?.message, "Thay đổi thất bại"),
            2
          );
        });
    }
    // Yêu cầu mật khẩu -- các field private
    else if (fieldUserEdit.data && fieldUserEdit.requirePassword) {
      showMessage("loading", `${t("content:loading")}...`);
      userApi
        .editUserPrivate({
          [fieldUserEdit.field]: fieldUserEdit.data,
          oldPassword: currentPassword,
        })
        .then((res: any) => {
          showMessage(
            "success",
            changeMsgLanguage(res?.message, "Thay đổi thành công"),
            2
          );
          setOpen(false);
          setCountReload((prev) => prev + 1);
          setFieldUserEdit({
            field: "",
            data: "",
            requirePassword: false,
          });
        })
        .catch((err: any) => {
          showMessage(
            "error",
            changeMsgLanguage(err.response?.data?.message, "Thay đổi thất bại"),
            2
          );
        });
    }
  };
  // chỉnh sửa avatar
  const handleEditAvatar = () => {
    showMessage("loading", `${t("content:loading")}...`);
    userApi
      .editUser(dataImage)
      .then((res: any) => {
        showMessage(
          "success",
          changeMsgLanguage(res?.message, "Thay đổi thành công"),
          2
        );
        setModalImage(false);
        setCountReload((prev) => prev + 1);
        URL.revokeObjectURL(imagePreview.preview);
      })
      .catch((err: any) => {
        showMessage(
          "error",
          changeMsgLanguage(err.response?.data?.message, "Thay đổi thất bại"),
          2
        );
      });
  };
  //show modal text
  const showModal = () => {
    setOpen(true);
  };
  //tắt modal
  const handleCancel = () => {
    setCurrentPassword("");
    setOpen(false);
    setModalImage(false);
    setImagePreview(null);
    setFieldUserEdit({
      field: "",
      data: "",
      requirePassword: false,
    });
  };
  // thay đổi ở nơi yes or no yêu cầu xác minh mật khẩu
  const handleChangeFieldUserEdit = (field: string, require?: boolean) => {
    showModal();
    !require
      ? setFieldUserEdit({
          field: field,
          data: userInfo?.[field as keyof typeof userInfo],
        })
      : setFieldUserEdit({
          field: field,
          data: userInfo?.[field as keyof typeof userInfo],
          requirePassword: true,
        });
  };

  return isLoading && !userInfo ? (
    <div style={{ paddingTop: "30px" }}>
      <Skeleton active />
    </div>
  ) : (
    <div className="user__container">
      {contextHolder}
      <div className="basic__info info">
        <div className="info__content">
          <div className="title">
            <h2>{t("content:profileUser.title basic")}</h2>
            <p>{t("content:profileUser.sub title basic")}</p>
          </div>
          <div className="wrapper" onClick={() => setModalImage(true)}>
            <span>{t("content:profileUser.avatar")}</span>
            <span className="sub_avatar">
              {t("content:profileUser.sub avatar")}
            </span>
            <div className="avatar">
              <img
                src={imagePreview?.preview || userInfo?.avatar}
                alt="avatar"
              />
              <div className="camera">
                <div className="camera__icon"></div>
              </div>
            </div>
          </div>
          <div
            className=" wrapper "
            onClick={() => {
              handleChangeFieldUserEdit("fullName");
            }}
          >
            <span>{t("content:profileUser.fullName")}</span>
            <span>{userInfo?.fullName}</span>
            <RightOutlined />
          </div>
          <div
            className=" wrapper"
            onClick={() => {
              handleChangeFieldUserEdit("gender");
            }}
          >
            <span>{t("content:profileUser.gender")}</span>
            <span>
              {t(`content:profileUser.${userInfo?.gender}` as keyof typeof t)}
            </span>
            <RightOutlined />
          </div>
          <div
            className=" wrapper"
            onClick={() => {
              handleChangeFieldUserEdit("phone");
            }}
          >
            <span>{t("content:profileUser.phone")}</span>
            <span>{userInfo?.phone}</span>
            <RightOutlined />
          </div>
          <div
            className=" wrapper"
            onClick={() => {
              handleChangeFieldUserEdit("dob");
            }}
          >
            <span>{t("content:profileUser.date of birth")}</span>
            <span>{moment(userInfo?.dob).format("DD MMMM, YYYY")}</span>
            <RightOutlined />
          </div>
        </div>
      </div>
      <div className="private__info info">
        <div className="info__content">
          <div className="title">
            <h2>{t("content:profileUser.title account")}</h2>
            <p>{t("content:profileUser.sub title account")}</p>
          </div>
        </div>
        <div className=" wrapper">
          <span>{t("content:profileUser.username")}</span>
          <span>{userInfo?.username}</span>
        </div>
        <div
          className=" wrapper"
          onClick={() => {
            handleChangeFieldUserEdit("email", true);
          }}
        >
          <span>Email</span>
          <span>{userInfo?.email}</span>
          <RightOutlined />
        </div>
        <div
          className=" wrapper"
          onClick={() => {
            handleChangeFieldUserEdit("newPassword", true);
          }}
        >
          <span>{t("content:profileUser.password")}</span>
          <span>*******</span>
          <RightOutlined />
        </div>
      </div>
      {/* modal các field text */}
      <Modal
        title={t("content:profileUser.edit title form")}
        okButtonProps={{ disabled: !fieldUserEdit.data }}
        open={open}
        onOk={handleEditUser}
        onCancel={handleCancel}
        okText={t("base:ok")}
        cancelText={t("base:cancel")}
      >
        <div style={{ padding: "13px 0" }}>
          {fieldUserEdit.field === "dob" && (
            <DatePicker
              autoComplete="off"
              style={{ width: "50%" }}
              value={dayjs(fieldUserEdit?.data || userInfo?.dob)}
              onChange={handleChangeDay}
              disabledDate={(current) => {
                return (
                  current && current > dayjs(Date.now()).subtract(1, "year")
                );
              }}
            />
          )}
          {fieldUserEdit.field !== "dob" &&
            fieldUserEdit.field !== "gender" && (
              <div className="form__content">
                {fieldUserEdit.requirePassword && (
                  <div className="form__password">
                    <span style={{ width: "150px" }}>
                      {t("content:profileUser.current password")}
                    </span>
                    <InputPassword
                      currentPassword={currentPassword}
                      setCurrentPassword={setCurrentPassword}
                    />
                  </div>
                )}
                <div className="form__password">
                  <span style={{ width: "150px" }}>
                    {t(
                      `content:profileUser.${fieldUserEdit.field}` as keyof typeof t
                    )}
                  </span>
                  <InputPasswordTextArea
                    fieldUserEdit={fieldUserEdit}
                    setFieldUserEdit={setFieldUserEdit}
                  />
                </div>
              </div>
            )}
          {fieldUserEdit.field === "gender" && (
            <Select
              value={fieldUserEdit.data}
              defaultValue={userInfo.gender}
              style={{ width: 120 }}
              onChange={handleChangeGender}
              options={[
                { value: "other", label: t("content:profileUser.other") },
                { value: "male", label: t("content:profileUser.male") },
                { value: "female", label: t("content:profileUser.female") },
              ]}
            />
          )}
        </div>
      </Modal>

      {/* modal với field image */}
      <Modal
        title={t("content:profileUser.avatar")}
        open={modalImage}
        okButtonProps={{ disabled: !imagePreview }}
        onOk={handleEditAvatar}
        onCancel={handleCancel}
        okText={t("base:ok")}
        cancelText={t("base:cancel")}
      >
        <div className="modal__avatar">
          <div className="avatar__img">
            <img
              src={imagePreview?.preview || userInfo?.avatar}
              alt="ảnh đại diện"
            />
          </div>
          <div>
            <div className="avatar__upload">
              <InputFile handleImagePreview={handleImagePreview} />
            </div>
          </div>
        </div>
      </Modal>
    </div>
    // </div>
  );
};

export default UserDetails;
