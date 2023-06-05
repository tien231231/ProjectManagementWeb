import axiosClient from "../axiosClient";

const taskApi = {
  addTask(task: any) {
    const url = `/task/new`;
    return axiosClient.post(url, task);
  },
  deleteTask(id: string) {
    const url = `/task/delete/${id}`;
    return axiosClient.post(url);
  },
  getTask(taskId: string) {
    const url = `/task/details/${taskId}`;
    return axiosClient.get(url);
  },
  editTask(taskId: string, task: any) {
    const url = `/task/update/${taskId}`;
    return axiosClient.post(url, task);
  },
  getAllTask(stageId: string, params?: any) {
    const url = `/stage/tasks/${stageId}`;
    return axiosClient.get(url, { params });
  },
  // phần comment
  getAllComment(taskId: string) {
    const url = `/task/${taskId}/getcomments`;
    return axiosClient.get(url);
  },
  addComment(taskId: string, comment: string) {
    const url = `/task/${taskId}/addcomment`;
    return axiosClient.post(url, {
      content: comment,
    });
  },
  deleteComment(taskId: string, commentId: string) {
    const url = `/task/${taskId}/deletecomment/${commentId}`;
    return axiosClient.delete(url);
  },
  // phần lịch sử hoạt động của task
  getActivities(taskId: string) {
    const url = `/task/activities/${taskId}`;
    return axiosClient.get(url);
  },
};
export default taskApi;
