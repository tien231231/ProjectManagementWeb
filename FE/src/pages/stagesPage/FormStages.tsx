import { IStages } from "./StagesPage";
import { UseMessageApiReturnType } from "../../components/support/Message";
import stageApi from "../../services/api/stageApi";
import taskApi from "../../services/api/taskApi";
import { changeMsgLanguage } from "../../utils/changeMsgLanguage";
import { ProjectType } from "../projectPage/ProjectDetail";
import { CloseOutlined, LoadingOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import "dayjs/locale/zh-cn";
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router";

import {
  Breadcrumb,
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  Row,
  Typography,
} from "antd";

const { TextArea } = Input;
const { Title } = Typography;

export interface IStagesCreate {
  name: string;
  status: string;
  endDateActual: Date;
  startDate: Date;
  endDateExpected: Date;
}

interface IForm {
  title: string;
  status?: boolean;
  endDateActual?: boolean;
  button: string;
  editStages?: { status: boolean; stages: IStages };
  projectDetail?: ProjectType;
  showMessage: UseMessageApiReturnType["showMessage"];
  setCreateStages?: Dispatch<SetStateAction<boolean>>;
  setFinishCount: Dispatch<SetStateAction<number>>;
  setEditStages?: Dispatch<
    SetStateAction<{ status: boolean; stages: IStages | {} }>
  >;
}

const FormStages: React.FC<IForm> = ({
  title,
  status = true,
  endDateActual = true,
  button,
  editStages,
  projectDetail,
  showMessage,
  setFinishCount,
  setCreateStages,
  setEditStages,
}: IForm) => {
  const [form] = Form.useForm();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation(["content", "base", "message"]);

  const [stageCurrent, setStageCurrent] = useState<IStages | null>(null);

  // hàm xử lí form
  const onFinish = (stages: IStagesCreate) => {
    setLoading(true);
    if (!editStages) {
      //trường hợp thêm
      stageApi
        .addStage({
          projectId: params.projectId as string,
          name: stages.name,
          startDate: stages.startDate,
          endDateExpected: stages.endDateExpected,
        })
        .then((res: any) => {
          setLoading(false);
          setCreateStages?.(false);
          showMessage(
            "success",
            changeMsgLanguage(res?.message, "Tạo mới thành công"),
            2
          );
          //để gọi lại api get all(đối số useEffect)
          setFinishCount((prev) => prev + 1);
        })
        .catch((err) => {
          setLoading(false);
          showMessage(
            "error",
            changeMsgLanguage(
              err.response.data?.message,
              "Ngày bắt đầu phải sau ngày kết thúc cuối cùng và trước ngày kết thúc dự kiến ​"
            ),
            2
          );
        });
    } else {
      if ("key" in editStages.stages) {
        //trường hợp sửa
        stageApi
          .editStage(editStages?.stages?.key as string, {
            name: stages.name,
            startDate: stages.startDate,
            endDateExpected: stages.endDateExpected,
            endDateActual: stages.endDateActual,
          })
          .then((res: any) => {
            setLoading(false);
            //để gọi lại api(đối số useEffect)
            setFinishCount((prev) => prev + 1);
            setEditStages?.({
              status: false,
              stages: {},
            });
            showMessage(
              "success",
              changeMsgLanguage(res?.message, "Chỉnh sửa thành công"),
              2
            );
          })
          .catch((err) => {
            setLoading(false);
            showMessage(
              "error",
              changeMsgLanguage(
                err.response.data?.message,
                "Chỉnh sửa thất bại"
              ),
              2
            );
          });
      }
    }
  };

  useEffect(() => {
    if (
      editStages &&
      editStages.stages &&
      typeof editStages.stages.key === "string"
    ) {
      stageApi.getStage(editStages.stages.key).then((res: any) => {
        setStageCurrent(res?.stage);
      });
    }
  }, [editStages]);

  const initialValues = stageCurrent
    ? {
        name: stageCurrent?.name,
        startDate: dayjs(stageCurrent?.startDate),
        endDateExpected: dayjs(stageCurrent?.endDateExpected),
        ...(stageCurrent?.endDateActual && {
          endDateActual: dayjs(stageCurrent?.endDateActual),
        }),
      }
    : {};

  useEffect(() => {
    if (stageCurrent) {
      form.setFieldsValue(initialValues);
    }
  }, [initialValues, stageCurrent]);
  const breadcrumbItem = useMemo(
    () => [
      { title: projectDetail?.name },
      {
        title:
          editStages?.stages && "name" in editStages.stages
            ? editStages.stages.name
            : "",
      },
    ],
    [editStages]
  );

  return (
    <>
      <div className="modal">
        <div className="form">
          <div className="breadcrumbItem">
            {editStages && (
              <Breadcrumb items={breadcrumbItem} style={{ fontSize: "12px" }} />
            )}
          </div>
          <div
            className="btn_close"
            onClick={() => {
              setCreateStages?.(false);
              setEditStages?.({
                status: false,
                stages: {},
              });
            }}
          >
            <CloseOutlined style={{ fontSize: "20px" }} />
          </div>
          <Title level={3}>{title}</Title>
          <Form
            initialValues={initialValues}
            size="large"
            layout="vertical"
            name=""
            form={form}
            onFinish={onFinish}
          >
            <Form.Item
              label={t("content:name")}
              name="name"
              rules={[
                {
                  required: true,
                  message: t("message:stage.Please input your stage name"),
                },
              ]}
            >
              <TextArea autoSize />
            </Form.Item>

            <Row>
              <Col span={11}>
                <Form.Item
                  label={t("content:startDate")}
                  name="startDate"
                  rules={[
                    {
                      required: true,
                      message: t("message:stage.Please fill it out completely"),
                    },
                  ]}
                >
                  <DatePicker
                    style={{ width: "100%" }}
                    disabledDate={(current) => {
                      const endDateExpected =
                        form.getFieldValue("endDateExpected");
                      const currentDate = dayjs();
                      // Disable dates earlier than current date or after expected end date
                      if (
                        (endDateExpected && current > dayjs(endDateExpected)) ||
                        current < currentDate.startOf("day")
                      ) {
                        return true;
                      }
                      return false;
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={11} offset={2}>
                <Form.Item
                  label={t("content:endDateExpected")}
                  name="endDateExpected"
                  rules={[
                    {
                      required: true,
                      message: t("message:stage.Please fill it out completely"),
                    },
                  ]}
                >
                  <DatePicker
                    style={{ width: "100%" }}
                    disabledDate={(current) => {
                      const startDate = form.getFieldValue("startDate");
                      return (
                        current &&
                        (current < dayjs() ||
                          dayjs(current).startOf("day") <=
                            dayjs(startDate).startOf("day"))
                      );
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>
            {endDateActual && (
              <Form.Item
                label={t("content:endDateActual")}
                name="endDateActual"
              >
                <DatePicker
                  style={{ width: "100%" }}
                  disabledDate={(current) => {
                    const startDate = form.getFieldValue("startDate");
                    return current && current < dayjs(startDate);
                  }}
                />
              </Form.Item>
            )}
            <Form.Item
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: 0,
              }}
            >
              <Button type="primary" htmlType="submit">
                {loading && <LoadingOutlined />}
                {button}
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </>
  );
};

export default FormStages;
