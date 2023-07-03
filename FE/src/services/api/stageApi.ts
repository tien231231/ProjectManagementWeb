import axiosClient from '../axiosClient';

interface IStageAdd {
  projectId?: string;
  name: string;
  startDate: Date;
  endDateExpected: Date;
}
interface IStageEdit extends IStageAdd {
  endDateActual: Date;
}

const stageApi = {
  //lấy theo pagination(page)
  getStage(stageId: string) {
    const url = `/stage/details/${stageId}`;
    return axiosClient.get(url);
  },
  getStagesPagination(projectId: string, params: any) {
    const url = `/project/stages/${projectId}`;
    return axiosClient.get(url, {
      params,
    });
  },
  // api search kết hợp url searchParams
  SearchStage(projectId: string, params?: any) {
    const url = `/project/stages/search/${projectId}`;
    return axiosClient.get(url, { params });
  },
  addStage: (stage: IStageAdd) => {
    const url = `/stage/add`;
    return axiosClient.post(url, stage);
  },
  editStage(stageId: string, stage: IStageEdit) {
    const url = `/stage/update/${stageId}`;
    return axiosClient.post(url, stage);
  },
  deleteStage(stageId: string) {
    const url = `/stage/delete/${stageId}`;
    return axiosClient.post(url, { stageId });
  },
  //phần liên quan đến đánh giá bình luận
  getAllCommentPagination(stageId: string, params: any) {
    const url = `stage/review/${stageId}`;
    return axiosClient.get(url, {
      params,
    });
  },
  addComment(stageId: string, comment: string) {
    const url = `/stage/review/add/${stageId}`;
    return axiosClient.post(url, {
      review: comment,
    });
  },
  deleteComment(stageId: string, commentId: string) {
    const url = `/stage/review/delete/${stageId}`;
    return axiosClient.post(url, { id: commentId });
  },
  editComment(stageId: string, commentId: string, myComment: string) {
    const url = `/stage/review/update/${stageId}`;
    return axiosClient.post(url, {
      review: myComment,
      id: commentId,
    });
  },
};

export default stageApi;
