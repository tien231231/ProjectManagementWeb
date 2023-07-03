import { projectSlice } from "./../redux/slice/projectSlice";
import { MemberDataType } from "../pages/Members/MemberList";
import { useAppSelector } from "../redux/hook";
import { RootState } from "../redux/store";
import projectApi from "../services/api/projectApi";
import { useEffect, useState } from "react";
import { useParams } from "react-router";

const useIsBoss = (devDependencies = [], boss = 3, projId?: string) => {
  const [isBoss, setIsBoss] = useState(false);
  const params = useParams();
  const user = useAppSelector((state: RootState) => state.auth.userInfo);

  // Lấy List member thuộc projectSlice
  useEffect(() => {
    (async () => {
      try {
        const response: any = await projectApi.getAllMember(
          !projId ? params.projectId as string : projId
        );

        response?.members?.forEach(
          (userP: {
            data: MemberDataType;
            joiningDate: Date;
            role: string;
          }) => {
            //	Chủ dự án hoặc quản lý dự án có thể tạo mới/cập nhật stages cho dự án đang thực hiện.
            //	Chủ dự án, quản lý dự án, người giám sát dự án có thể thực hiện đánh giá khi kết thúc stage.
            //boss ở đay là số ng có quyền
            if (boss === 3) {
              if (
                userP.role === "manager" ||
                userP.role === "leader" ||
                userP.role === "supervisor"
              ) {
                if (userP.data.username === user.username) {
                  setIsBoss(true);

                  return;
                }
              }
            } else if (boss === 2) {
              if (userP.role === "manager" || userP.role === "leader") {
                if (userP.data.username === user.username) {
                  setIsBoss(true);
                  return;
                }
              }
            }
          }
        );
      } catch (err) {
        console.error(err);
      }
    })();
  }, [...devDependencies]);

  return { isBoss };
};
export default useIsBoss;
