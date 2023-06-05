import axiosClient from "../axiosClient";

const projectApi = {
  getAll: () => {
    const url = "/project/all";
    return axiosClient.get(url);
  },
  getAllPagination: (params: any) => {
    const url = "/project/all";
    return axiosClient.get(url, { params });
  },
  // Lấy List member thuộc project
  getAllMember: (projectId: string) => {
    const url = `/project/members/all/${projectId}`;
    return axiosClient.get(url);
  },
};

export default projectApi;
