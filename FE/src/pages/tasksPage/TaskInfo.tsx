import TaskComment from "./TaskComment";
import { ITask } from "./TaskForm";
import { useAppSelector } from "../../redux/hook";
import { RootState } from "../../redux/store";
import imageApi from "../../services/api/imageApi";
import taskApi from "../../services/api/taskApi";
import { Editor } from "@tinymce/tinymce-react";
import { Button } from "antd";
import { NoticeType } from "antd/es/message/interface";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Editor as TinyMCEEditor } from "tinymce";
import { v4 as uuid } from "uuid";

interface ITaskComments {
  taskCurrent: ITask | null;
  showMessage: (type: NoticeType, content: string, duration?: number) => void;
}

export interface ICommentTask {
  commenter: {
    avatar: string;
    email: string;
    fullName: string;
    username: string;
    _id: string;
  };
  content: string;
  createdDate: Date;
  _id: string;
}

const TaskInfo = ({ taskCurrent, showMessage }: ITaskComments) => {
  const [listComment, setListComment] = useState<ICommentTask[]>([]);

  const commentListRef = useRef<HTMLDivElement | null>(null);
  const [countReloadComments, setCountReloadComments] = useState<number>(1);
  const [content, setContent] = useState("");

  const user = useAppSelector((state: RootState) => state.auth?.userInfo);
  const { t } = useTranslation(["content", "base"]);
  const tinyRef = useRef<TinyMCEEditor | null>(null);
  function handleEditorChange(content: any, editor: any) {
    setContent(content);
  }
  // gửi comment
  const handleSendComment = () => {
    if (content && taskCurrent) {
      showMessage("loading", `${t("content:loading")}...`);
      taskApi
        .addComment(taskCurrent._id, content)
        .then((res: any) => {
          showMessage("success", res.message, 2);
          setCountReloadComments((prev) => prev + 1);
          commentListRef?.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
          if (tinyRef.current) {
            tinyRef.current.setContent("");
          }
        })
        .catch((err: any) => {
          showMessage("error", err.response.data?.message, 2);
        });
    }
  };
  // lấy danh sách comment và đảo ngược lại
  useEffect(() => {
    if (taskCurrent) {
      taskApi
        .getAllComment(taskCurrent?._id)
        .then((res: any) => setListComment(res.comments.reverse()))
        .catch((err) => {
          console.log(err);
        });
    }
  }, [taskCurrent, countReloadComments]);

  return (
    <div className="task_info--container" id="task_info">
      <div className="modal modal_task">
        <div className="modal_comment">
          <h3 className="comment_title">{t("content:form.comments")}</h3>
          <div className="comments_container ">
            <div ref={commentListRef} className="comment_list">
              {listComment?.map((comment) => (
                <TaskComment
                  key={uuid()}
                  taskCurrentId={taskCurrent?._id || ""}
                  comment={comment}
                  showMessage={showMessage}
                  setCountReloadComments={setCountReloadComments}
                />
              ))}
            </div>
            <div
              className="comment_list-chat"
              style={{ height: content ? "400px" : "150px" }}
            >
              <div className="comment_action ">
                <img
                  src={user.avatar}
                  alt={user?.fullName || ""}
                  className="img_user"
                />
                <Editor
                  onInit={(evt, editor) => {
                    tinyRef.current = editor;
                  }}
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
                  value={content}
                  onEditorChange={handleEditorChange}
                />
              </div>

              <div className="btn_action">
                <Button
                  type="primary"
                  style={{ width: "90%", height: "50px" }}
                  onClick={handleSendComment}
                >
                  Send
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskInfo;
