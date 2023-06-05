import Comment from '../../components/comment/Comment';
import { useAxios } from '../../hooks';
import useIsBoss from '../../hooks/useIsBoss';
import { useAppSelector } from '../../redux/hook';
import { RootState } from '../../redux/store';
import projectApi from '../../services/api/projectApi';
import stageApi from '../../services/api/stageApi';
import { MemberDataType } from '../Members/MemberList';
import {
  Button,
  Input,
  Modal,
  Skeleton
  } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { v4 as uuid } from 'uuid';

import useMessageApi, {
  UseMessageApiReturnType,
} from "../../components/support/Message";

const { TextArea } = Input;
export interface IUserComment {
  _id: string;
  fullName: string;
  avatar: string;
  email: string;
  username: string;
}
interface IResponseMemberList {
  projectId: string;
  members: {
    data: MemberDataType;
    joiningDate: Date;
    role: string;
  }[];
  [key: string]: any; // Các trường khác có thể có trong phản hồi HTTP
}
export interface IReview {
  content: string;
  reviewer: IUserComment;
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}
interface IPropsReview {
  stageId: string;
}

const StageReview = ({ stageId }: IPropsReview) => {
  const [myReview, setMyReview] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [reviewAdded, setReviewAdded] = useState<number>(1);
  // const [isBoss, setIsBoss] = useState(false);
  const [listComment, setListComment] = useState<any>([]);
  const [numberPage, setNumberPage] = useState<number>(1);
  const [loading, setLoading] = useState(false);

  const commentListRef = useRef<HTMLDivElement>(null);
  const { showMessage, contextHolder }: UseMessageApiReturnType =
    useMessageApi();

  const { isBoss } = useIsBoss([], 2);

  const { t } = useTranslation(["content", "base"]);

  //lấy danh sách tất cả đánh giá
  const { responseData, isLoading } = useAxios(
    "get",
    `/stage/review/${stageId}?page=1`,
    [stageId, open, reviewAdded]
  );

  useEffect(() => {
    setListComment(responseData.review);
    return () => {
      setNumberPage(1);
    };
  }, [responseData]);

  // thêm đánh giá
  const handleAddComment = () => {
    if (myReview) {
      showMessage("loading", `${t("content:loading")}...`);
      stageApi
        .addComment(stageId, myReview)
        .then((res: any) => {
          showMessage("success", res.message, 2);
          setReviewAdded((prev) => prev + 1);
          setOpen(false);
          setMyReview("");
        })
        .catch((err) => {
          showMessage("error", err.response.data?.message, 2);
        });
    }
  };
  // load thêm dữ liệu
  // chờ backend trả về sớm nhất trước mới đúng
  const handleLoadMore = () => {
    const params = {
      page: numberPage + 1,
    };
    setLoading(true);
    stageApi.getAllCommentPagination(stageId, params).then((res: any) => {
      listComment && setListComment((prev: any) => [...prev, ...res.review]);
      setNumberPage((prev) => prev + 1);
      setLoading(false);
    });
  };

  // Lấy List member thuộc project
  // useEffect(() => {
  //   (async () => {
  //     try {
  //       const response: any = await projectApi.getAllMember(
  //         params.projectId as string
  //       );
  //       response?.members?.forEach(
  //         (userP: {
  //           data: MemberDataType;
  //           joiningDate: Date;
  //           role: string;
  //         }) => {
  //           if (
  //             userP.role === "manager" ||
  //             userP.role === "leader" ||
  //             userP.role === "supervisor"
  //           ) {
  //             if (userP.data.username === user.username) {
  //               setIsBoss(true);
  //               return;
  //             }
  //           }
  //         }
  //       );
  //     } catch (err) {
  //       console.error(err);
  //     }
  //   })();
  // }, []);
  const showModal = () => {
    setOpen(true);
  };
  const handleCancel = () => {
    setOpen(false);
    setNumberPage(1);
    setLoading(false);
  };
  return (
    <div className="stage__review">
      {contextHolder}
      <div className="stage__review--header">
        {isBoss && (
          <Button type="primary" onClick={showModal}>
            {t("content:addReview")}
          </Button>
        )}
        <h2>{t("content:review")}</h2>
        <Modal
          title={t("content:addReview")}
          open={open}
          onOk={handleAddComment}
          onCancel={handleCancel}
          okText={t("base:ok")}
          cancelText={t("base:cancel")}
        >
          <TextArea
            value={myReview}
            onChange={(e) => setMyReview(e.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
              }
            }}
            rows={4}
          />
        </Modal>
      </div>
      <div className="stage__review--content">
        {isLoading ? (
          <div style={{ paddingTop: "20px" }}>
            <Skeleton active avatar />
          </div>
        ) : (
          <div
            className="review__list--comment scroll_custom "
            ref={commentListRef}
          >
            {responseData?.review?.length === 0 ? (
              <strong>{t("content:tittleReview")}</strong>
            ) : (
              listComment?.map((comment: IReview) => (
                <Comment
                  key={uuid()}
                  showMessage={showMessage}
                  reviewComment={comment}
                  setReviewAdded={setReviewAdded}
                  stageId={stageId}
                />
              ))
            )}
            {responseData.totalPages > numberPage && (
              <span className="load__more" onClick={handleLoadMore}>
                {t("base:loadMore")}
              </span>
            )}
            {loading && (
              <div style={{ paddingTop: "20px" }}>
                <Skeleton avatar />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StageReview;
