import AddMember from "./AddMember";
import { deleteQuery, setQuery } from "../../redux/slice/paramsSlice";
import { formatDate } from "../../utils/formatDate";
import { DeleteFilled } from "@ant-design/icons";
import { ColumnsType } from "antd/es/table";
import axios from "axios";
import moment from "moment";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import useMessageApi, {
  UseMessageApiReturnType,
} from "../../components/support/Message";

import {
  Button,
  Input,
  Divider,
  Table,
  Modal,
  Typography,
  Select,
  Popconfirm,
  Skeleton,
} from "antd";
import { NoticeType } from "antd/es/message/interface";
import { useTranslation } from "react-i18next";
import { changeMsgLanguage } from "../../utils/changeMsgLanguage";
import useIsBoss from "../../hooks/useIsBoss";

const { Search } = Input;
const { Text } = Typography;

export interface MemberDataType {
  name: string;
  role: string;
  joinDate: string;
  key?: string;
  fullName?: string;
  username?: string;
}

interface PopupPropTypes {
  record: MemberDataType;
  token: string;
  params: { projectId?: string };
  setMemberData: React.Dispatch<React.SetStateAction<any[]>>;
  showMessage: (type: NoticeType, content: string, duration?: number) => void;
  setPagination: React.Dispatch<any>;
  isBoss: boolean;
}

interface MemberRolePropTypes {
  record: MemberDataType;
  roleSelectOptions: any[];
  params: { projectId?: string };
  token: string;
  setMemberData: React.Dispatch<React.SetStateAction<any[]>>;
  showMessage: (type: NoticeType, content: string, duration?: number) => void;
  isBoss: boolean;
}

const DeleteConfirmPopup: React.FC<PopupPropTypes> = ({
  record,
  params,
  token,
  setMemberData,
  showMessage,
  setPagination,
  isBoss,
}) => {
  const { t, i18n } = useTranslation(["content", "base"]);

  const handleConfirm = async (stages: MemberDataType) => {
    try {
      const response = await axios({
        method: "post",
        url: `${process.env.REACT_APP_BACKEND_URL}/project/members/remove/${params.projectId}`,
        headers: { Authorization: `Bearer ${token}` },
        data: { id: stages.key },
      });
      showMessage(
        "success",
        changeMsgLanguage(response.data?.message, "Đã xóa thành viên"),
        2
      );
      setMemberData(response.data.members);
      setPagination({ pageIndex: 1, total: response.data.members.length });
    } catch (err: any) {
      showMessage(
        "error",
        changeMsgLanguage(
          err.response.data?.message,
          "Xóa thành viên thất bại"
        ),
        2
      );
    }
  };

  return (
    <>
      <Popconfirm
        disabled={(record.role === "manager" && true) || !isBoss}
        placement="topRight"
        title={`${t("content:member.delete popup title")}`}
        description={`${t("content:member.deltete popup desc")}`}
        onConfirm={() => handleConfirm(record)}
        okText={t("base:ok")}
        cancelText={t("base:cancel")}
      >
        <Button
          icon={<DeleteFilled />}
          disabled={(record.role === "manager" && true) || !isBoss}
        />
      </Popconfirm>
    </>
  );
};

const UpdateMemberRole: React.FC<MemberRolePropTypes> = ({
  record,
  roleSelectOptions,
  params,
  token,
  setMemberData,
  showMessage,
  isBoss,
}) => {
  const [roleUpdating, setRoleUpdating] = useState<boolean>(false);
  const updateRole = async (selectValue: any, record: MemberDataType) => {
    setRoleUpdating(true);
    try {
      const response = await axios({
        method: "post",
        url: `${process.env.REACT_APP_BACKEND_URL}/project/members/update/${params.projectId}`,
        headers: { Authorization: `Bearer ${token}` },
        data: {
          id: record.key,
          role: selectValue,
          joiningDate: formatDate(record.joinDate),
        },
      });
      showMessage(
        "success",
        changeMsgLanguage(
          response.data?.message,
          "Cập nhật vai trò thành công"
        ),
        2
      );
      setMemberData(response.data.members);
      setRoleUpdating(false);
    } catch (err: any) {
      showMessage(
        "error",
        changeMsgLanguage(err.response.data?.message, "Cập nhật thất bại"),
        2
      );
      setRoleUpdating(false);
    }
  };
  return (
    <>
      {/* <ToastContainer /> */}
      <Select
        loading={roleUpdating && true}
        disabled={(record.role === "manager" && true) || !isBoss}
        onSelect={(value) => updateRole(value, record)}
        value={record.role}
        options={roleSelectOptions}
        dropdownMatchSelectWidth={false}
      />
    </>
  );
};

const MemberList: React.FC = () => {
  const timeOutRef = useRef<any>(null);
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParams = useSelector((state: any) => state.queryParams);
  const params = useParams();
  const token = useSelector((state: any) => state.auth.userInfo.token);
  const [memberData, setMemberData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState<boolean>(false);
  const [searchResult, setSearchResult] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>({
    pageIndex: 1,
    total: null,
  });
  const { showMessage, contextHolder }: UseMessageApiReturnType =
    useMessageApi();
  const { t, i18n } = useTranslation(["content", "base"]);
  const [countValidate, setCountValidate] = useState<number>();
  const { isBoss } = useIsBoss([], 2);

  // Lấy List member thuộc project
  useEffect(() => {
    const getMemberData = async () => {
      try {
        setIsLoading(true);
        const response = await axios({
          method: "get",
          url: `${process.env.REACT_APP_BACKEND_URL}/project/members/${params.projectId}`,
          headers: { Authorization: `Bearer ${token}` },
          params: { page: queryParams.currentPage, limit: 10 },
        });
        setMemberData(response.data.members);
        setPagination({
          ...pagination,
          total: response.data.total,
          pageIndex: response.data.currentPage,
        });
        setIsLoading(false);
      } catch (err) {
        console.error(err);
      }
    };
    getMemberData();
  }, []);

  // Validate điều kiện 1 dự án chỉ có 1 owner và 3 manager
  useEffect(() => {
    let count = memberData.filter((data: any) => {
      return data.role === "leader";
    }).length;
    setCountValidate(count);
  }, [memberData]);

  const roleSelectOptions = [
    {
      value: "manager",
      label: `${t("content:member.manager")}`,
      disabled: true,
    },
    {
      value: "leader",
      label: `${t("content:member.leader")}`,
      disabled: (countValidate as number) >= 3 && true,
    },
    { value: "supervisor", label: `${t("content:member.supervisor")}` },
    { value: "member", label: `${t("content:member.member")}` },
  ];
  // Kết thúc Validate

  // Search Member thuộc project
  useEffect(() => {
    const searchUsers = async () => {
      if (queryParams.search) {
        setIsLoading(true);
        try {
          const response = await axios({
            method: "get",
            url: `${process.env.REACT_APP_BACKEND_URL}/project/members/${params.projectId}`,
            params: {
              credential: queryParams.search,
            },
            headers: { Authorization: `Bearer ${token}` },
          });

          setSearchResult(response.data.members);
          setPagination({
            ...pagination,
            total: response.data.total,
            pageIndex: response.data.currentPage,
          });
          setIsLoading(false);
        } catch (err) {
          console.error(err);
          setIsLoading(false);
        }
      }
    };
    timeOutRef.current = setTimeout(searchUsers, 500);
    return () => {
      clearTimeout(timeOutRef.current);
    };
  }, [queryParams.search]);

  // **** PAGE CHANGE SẼ GỬI TIẾP API GET USER MEMBER ĐỂ LẤY THEO PAGE TƯƠNG ỨNG ****
  const handlePageChange = async (page: number) => {
    setIsLoading(true);
    try {
      const response = await axios({
        method: "get",
        url: `${process.env.REACT_APP_BACKEND_URL}/project/members/${params.projectId}`,
        headers: { Authorization: `Bearer ${token}` },
        params: { page, limit: 10 },
      });
      setMemberData(response.data.members);
      setPagination({
        ...pagination,
        total: response.data.total,
        pageIndex: response.data.currentPage,
      });
      setSearchParams({ ...queryParams, currentPage: page });
      setIsLoading(false);
    } catch (err) {
      console.error(err);
      setIsLoading(false);
    }
  };

  const handleInputChange = (event: any) => {
    let value = event.target.value;
    if (value === "" && searchParams.has("search")) {
      let query = searchParams.get("search");
      if (query) {
        searchParams.delete("search");
        const newParams: { [key: string]: string } = {};
        searchParams.forEach((value: string, key: string) => {
          newParams[key] = value;
        });
        setSearchResult([]);
        setSearchParams(newParams);
        dispatch(deleteQuery("search"));
      }
    } else {
      dispatch(setQuery({ ...queryParams, search: value }));
      setSearchParams({ ...queryParams, search: value });
    }
  };

  // Setup Table
  const columns: ColumnsType<MemberDataType> = [
    {
      title: `${t("content:name")}`,
      dataIndex: "name",
      key: "name",

      render: (_, record: MemberDataType, index: number) => {
        return (
          <>
            <Text>{record.name}</Text>
          </>
        );
      },
    },
    {
      title: `${t("content:member.role")}`,
      dataIndex: "role",
      key: "role",
      render: (_, record: MemberDataType, index: number) => {
        return (
          <>
            <UpdateMemberRole
              isBoss={isBoss}
              showMessage={showMessage}
              setMemberData={setMemberData}
              params={params}
              token={token}
              record={record}
              roleSelectOptions={roleSelectOptions}
            />
          </>
        );
      },
    },
    {
      title: `${t("content:member.join date")}`,
      dataIndex: "joinDate",
      key: "joinDate",
    },
    {
      title: `${t("content:action")}`,
      dataIndex: "action",
      key: "action",
      render: (_, record: MemberDataType, index: number) => {
        return (
          <>
            <DeleteConfirmPopup
              isBoss={isBoss}
              showMessage={showMessage}
              setMemberData={setMemberData}
              record={record}
              params={params}
              token={token}
              setPagination={setPagination}
            />
          </>
        );
      },
    },
  ];

  const data: MemberDataType[] =
    searchResult && searchResult.length > 0
      ? searchResult.map((data) => {
          return {
            key: data.data._id,
            name: data.data.fullName,
            role: data.role,
            joinDate: moment(data.joiningDate).format("DD/MM/YYYY"),
          };
        })
      : memberData.map((data) => {
          return {
            key: data.data._id,
            name: data.data.fullName,
            role: data.role,
            joinDate: moment(data.joiningDate).format("DD/MM/YYYY"),
          };
        });

  //Kết thúc setup table

  return (
    <div className="member-list">
      {contextHolder}
      {/* Add Member Modal */}
      <Modal
        centered
        open={showAddMemberModal}
        onCancel={() => {
          setShowAddMemberModal(false);
        }}
        footer={null}
        destroyOnClose
      >
        <AddMember
          showMessage={showMessage}
          setMemberData={setMemberData}
          closeModal={setShowAddMemberModal}
          memberData={memberData}
          countValidate={countValidate as number}
          setPagination={setPagination}
        />
      </Modal>

      {/* Main Content */}
      <div className="header">
        <Button
          style={{ width: "150px" }}
          disabled={!isBoss}
          type="primary"
          size="large"
          onClick={() => {
            setShowAddMemberModal(true);
          }}
        >
          {`${t("content:member.add member")}`}
        </Button>

        {/* Search Project Member Input */}
        <Search
          value={queryParams.search}
          allowClear
          onChange={handleInputChange}
          placeholder={`${t("content:member.member name")}`}
          size="large"
          style={{ width: "300px" }}
        />
      </div>
      <Divider />
      {isLoading ? (
        <Skeleton active/>
      ) : (
        <div className="content">
          <Table
            scroll={{
              x: 500,
            }}
            columns={columns}
            dataSource={data}
            pagination={{
              position: ["bottomCenter"],
              total: pagination.total,
              pageSize: 10,
              current: pagination.pageIndex,
              onChange: handlePageChange,
            }}
          />
        </div>
      )}
    </div>
  );
};

export default MemberList;
