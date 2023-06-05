import { ICommentTask } from "./TaskInfo";
import { useAppSelector } from "../../redux/hook";
import { RootState } from "../../redux/store";
import imageApi from "../../services/api/imageApi";
import taskApi from "../../services/api/taskApi";
import { Editor } from "@tinymce/tinymce-react";
import { Modal, Popconfirm } from "antd";
import TextArea from "antd/es/input/TextArea";
import { NoticeType } from "antd/es/message/interface";
import parse from "html-react-parser";
import moment from "moment";
import { useTranslation } from "react-i18next";
import { Editor as TinyMCEEditor } from "tinymce";
import { v4 as uuid } from "uuid";
import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";

interface IProps {
  taskCurrentId: string;
  comment: ICommentTask;
  showMessage: (type: NoticeType, content: string, duration?: number) => void;
  setCountReloadComments: Dispatch<SetStateAction<number>>;
}

const TaskComment = ({
  comment,
  showMessage,
  setCountReloadComments,
  taskCurrentId,
}: IProps) => {
  const [open, setOpen] = useState(false);
  const contentRef = useRef<string>("");

  const user = useAppSelector((state: RootState) => state.auth?.userInfo);
  const { t } = useTranslation(["content", "base"]);
  const tinyRef = useRef<TinyMCEEditor | null>(null);

  //hàm xác nhận xóa
  const handleDelete = (id: string) => {
    showMessage("loading", `${t("content:loading")}...`);
    taskApi
      .deleteComment(taskCurrentId, id)
      .then((res: any) => {
        showMessage("success", res.message, 2);
        setCountReloadComments((prev) => prev + 1);
      })
      .catch((err: any) => {
        showMessage("error", err.response.data?.message, 2);
      });
  };
  //hàm sửa

  const handleEdit = () => {
    console.log(contentRef.current);
    // if (content && comment) {
    //   showMessage("loading", `${t("content:loading")}...`);
    //   taskApi
    //     .addComment(comment._id, content)
    //     .then((res: any) => {
    //       showMessage("success", res.message, 2);
    //       setCountReloadComments((prev) => prev + 1);
    //       if (tinyRef.current) {
    //         tinyRef.current.setContent("");
    //       }
    //     })
    //     .catch((err: any) => {
    //       showMessage("error", err.response.data?.message, 2);
    //     });
    // }
  };

  function handleEditorChange(content: any, editor: any) {
    if (content) contentRef.current = content;
  }

  useEffect(() => {}, [tinyRef.current, comment]);
  const handleCancel = () => {
    setOpen(false);
  };

  return (
    <div key={uuid()} className="comment_content">
      <img src={comment.commenter.avatar} alt="" className="img_user" />
      <div className="comment-container">
        <p className="title">
          {comment.commenter.fullName}
          <span>{moment(comment.createdDate).format("DD/MM/YYYY hh:mm")}</span>
        </p>
        <div className="content">{parse(comment.content)}</div>
        {user.username === comment.commenter.username && (
          <div className="action-buttons ">
            <span
              className=""
              onClick={() => {
                setOpen(true);
              }}
            >
              {t("base:edit")}
            </span>

            <Modal
              width={"70%"}
              title={t("base:edit")}
              style={{ height: "500px" }}
              open={open}
              onOk={handleEdit}
              onCancel={handleCancel}
              okText={t("base:ok")}
              cancelText={t("base:cancel")}
            >
              <div className="" style={{ height: "400px" }}>
                <Editor
                  onInit={(evt, editor) => {
                    tinyRef.current = editor;
                  }}
                  initialValue={comment.content}
                  apiKey={process.env.REACT_APP_TINYMCE_KEY}
                  init={{
                    height: "100%",
                    width: "100%",
                    menubar: false,
                    statusbar: false,
                    plugins: ["image"],

                    toolbar: `
                    undo redo | formatselect | bold italic |  image | backcolor | \
                alignleft aligncenter alignright alignjustify | \
                bullist numlist outdent indent | removeformat 
                    `,
                    file_picker_types: "file image media",
                    // image_dimensions: false,
                    image_class_list: [
                      { title: "Responsive", value: "img-tiny" },
                    ],
                    images_upload_handler: async (blobInfo) => {
                      return new Promise((resolve, reject) => {
                        let imageFile = new FormData();
                        imageFile.append("image", blobInfo.blob());
                        imageApi
                          .uploadImg(imageFile)
                          .then((data: any) => {
                            const url = data.image;
                            resolve(url);
                          })
                          .catch((e) => {
                            reject(e);
                          });
                      });
                    },
                  }}
                  // value={contentRef.current}
                  onEditorChange={handleEditorChange}
                />
              </div>
            </Modal>
            <span className="">
              <Popconfirm
                placement="right"
                title={t("content:titleDeleteComment")}
                description={t("content:desDeleteComment")}
                onConfirm={() => handleDelete(comment._id)}
                okText={t("base:ok")}
                cancelText={t("base:cancel")}
              >
                <span className="btn_delete">{t("base:delete")}</span>
              </Popconfirm>
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskComment;
