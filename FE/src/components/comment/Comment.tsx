import { IReview } from "../../pages/stagesPage/StageReview";
import { useAppSelector } from "../../redux/hook";
import { RootState } from "../../redux/store";
import stageApi from "../../services/api/stageApi";
import { Input, Modal, Popconfirm } from "antd";
import { NoticeType } from "antd/es/message/interface";
import parse from "html-react-parser";
import moment from "moment";
import React, { Dispatch, SetStateAction, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { v4 as uuid } from "uuid";

const { TextArea } = Input;

export interface IComment {
  taskComment?: any;
  stageId?: string;
  showMessage: (type: NoticeType, content: string, duration?: number) => void;
  setReviewAdded?: Dispatch<SetStateAction<number>>;
  reviewComment?: IReview;
}
const Comment: React.FC<IComment> = ({
  taskComment,
  reviewComment,
  showMessage,
  setReviewAdded,
  stageId,
}: IComment) => {
  const [open, setOpen] = useState(false);
  const user = useAppSelector((state: RootState) => state.auth.userInfo);
  const myCommentRef = useRef<string>(reviewComment?.content || "");
  const { t } = useTranslation(["content", "base"]);
  //hàm xác nhận xóa
  const handleDelete = (id: string) => {
    showMessage("loading", "Loading...");
    stageApi
      .deleteComment(stageId as string, id)
      .then((res: any) => {
        showMessage("success", res?.message, 2);
        setReviewAdded?.((prev) => prev + 1);
      })
      .catch((err) => {
        showMessage("error", err.response.data?.message, 2);
      });
  };
  //hàm sửa
  const handleEdit = () => {
    const myComment = myCommentRef.current;
    if (myComment) {
      showMessage("loading", "Loading...");
      stageApi
        .editComment(stageId as string, reviewComment?._id as string, myComment)
        .then((res: any) => {
          showMessage("success", res?.message, 2);
          setReviewAdded?.((prev) => prev + 1);
          setOpen(false);
        })
        .catch((err) => {
          showMessage("error", err.response.data?.message, 2);
        });
    }
  };

  const handleCancel = () => {
    setOpen(false);
  };

  return (
    <div key={uuid()} className="comment_content">
      <img src={reviewComment?.reviewer?.avatar} alt="" className="img_user" />
      <div className="comment-container">
        <p className="title">
          {reviewComment?.reviewer?.fullName}
          <span>
            {moment(reviewComment?.createdAt).format("DD/MM/YYYY hh:mm")}
          </span>
        </p>
        <div className="content">
          {reviewComment ? reviewComment.content : parse(taskComment?.content)}
        </div>
        <div className="action-buttons ">
          {user.username === reviewComment?.reviewer.username && (
            <>
              <span
                className=""
                onClick={() => {
                  setOpen(true);
                }}
              >
                {t("base:edit")}
              </span>

              <Modal
                title={t("base:edit")}
                open={open}
                onOk={handleEdit}
                onCancel={handleCancel}
                okText={t("base:ok")}
                cancelText={t("base:cancel")}
              >
                <TextArea
                  defaultValue={reviewComment?.content}
                  onChange={(e) => (myCommentRef.current = e.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                    }
                  }}
                  rows={4}
                />
              </Modal>
              <span className="">
                <Popconfirm
                  placement="right"
                  title={t("content:titleDeleteComment")}
                  description={t("content:desDeleteComment")}
                  onConfirm={() => handleDelete(reviewComment?._id as string)}
                  okText={t("base:ok")}
                  cancelText={t("base:cancel")}
                >
                  <span className="btn_delete">{t("base:delete")}</span>
                </Popconfirm>
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Comment;
