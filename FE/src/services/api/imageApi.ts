import axiosClient from "../axiosClient";

const imageApi = {
  uploadImg(img: any) {
    const url = `/upload/image`;
    return axiosClient.post(url, img, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};
export default imageApi;
