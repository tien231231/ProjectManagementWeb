import axiosClient from "../axiosClient";

const userApi = {
  editUser(data: any) {
    const url = `/user/update`;
    return axiosClient.post(url, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  editUserPrivate(data: any) {
    const url = `/user/update/private`;
    return axiosClient.post(url, data);
  },
};
export default userApi;
