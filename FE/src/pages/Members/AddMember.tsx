import {
  CloseOutlined,
  LoadingOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  Button,
  Input,
  message,
  Select,
  SelectProps,
  Spin,
  Typography,
} from "antd";
import { NoticeType } from "antd/es/message/interface";
import axios from "axios";
import { debounce } from "lodash";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { changeMsgLanguage } from "../../utils/changeMsgLanguage";

const { Title, Text } = Typography;
const { Search } = Input;

interface PropTypes {
  closeModal: React.Dispatch<React.SetStateAction<boolean>>;
  memberData: any[];
  setPagination: React.Dispatch<any>;
  setMemberData: React.Dispatch<React.SetStateAction<any[]>>;
  showMessage: (type: NoticeType, content: string, duration?: number) => void;
  countValidate: number;
}

interface UserSearchResult {
  _id?: string;
  email: string;
  fullName: string;
  username: string;
  avatar: string;
  role?: string;
  id?: string;
  label: string;
  value: string;
}

const AddMember: React.FC<PropTypes> = ({
  closeModal,
  memberData,
  setPagination,
  setMemberData,
  showMessage,
  countValidate,
}) => {
  const params = useParams();
  const timeOutRef = useRef<any>(null);
  const dispatch = useDispatch();
  const token = useSelector((state: any) => state.auth.userInfo.token);
  const [searchInput, setSearchInput] = useState<string>();
  const [selectedResult, setSelectedResult] = useState<UserSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [addMemberFetching, setAddMemberFetching] = useState<boolean>(false);
  const [error, setError] = useState<any>({});
  const [count, setCount] = useState<number>(countValidate);
  const [searchValue, setSearchValue] = useState<string>();
  const [searchData, setSearchData] = useState<any[]>([]);
  const { t, i18n } = useTranslation(["content", "base"]);

  const roleSelectOptions = [
    {
      label: `${t("content:member.manager")}`,
      value: "manager",
      disabled: true,
    },
    {
      label: `${t("content:member.leader")}`,
      value: "leader",
      disabled: (count as number) >= 3 && true,
    },
    { label: `${t("content:member.supervisor")}`, value: "supervisor" },
    { label: `${t("content:member.member")}`, value: "member" },
  ];

  // Validate khi chọn role Leader/Quản lý trong modal Add Member
  useEffect(() => {
    let leaderRole = selectedResult.filter(
      (value: any) => value?.role === "leader"
    );
    let leaderCount = memberData.filter((data: any) => {
      return data?.role === "leader";
    });
    setCount([...leaderCount, ...leaderRole]?.length);
  }, [selectedResult]);

  const cancelModal = () => {
    closeModal(false);
  };

  //Search all users
  const handleSearch = (value: string) => {
    let currentValue: string;
    if (timeOutRef.current) {
      clearTimeout(timeOutRef.current);
      timeOutRef.current = null;
    }
    currentValue = value;
    const fetchingUser = async () => {
      setIsLoading(true);
      try {
        const response = await axios({
          method: "get",
          url: `${process.env.REACT_APP_BACKEND_URL}/user/search`,
          params: { query: value },
          headers: { Authorization: `Bearer ${token}` },
        });
        if (currentValue === value) {
          let validatedSearchResult = response.data.users?.map(
            (result: UserSearchResult) => {
              if (
                memberData.some(
                  (memberInfo: any) => memberInfo.data._id === result._id
                )
              ) {
                return { ...result, isJoined: true };
              } else {
                return result;
              }
            }
          );
          setSearchData(validatedSearchResult);
          setIsLoading(false);
        }
      } catch (err) {
        setIsLoading(false);
      }
    };
    if (value) {
      timeOutRef.current = setTimeout(fetchingUser, 500);
    } else {
      setSearchData([]);
    }
  };

  // Chọn User sau khi có kết quả Search
  // Set vào state hiển thị danh sách được chọn
  const selectSearchResult = (value: any) => {
    let result = searchData.filter((data) => {
      return data._id === value.key;
    })[0];
    setSelectedResult([
      ...selectedResult,
      { ...result, label: result.fullName, value: result._id },
    ]);
  };

  // Chọn role cho thành viên để add vào dự án
  const handleSelectRole = (value: string, selectedItem: any) => {
    let newResults = selectedResult.map((result: any) => {
      if (result._id === selectedItem._id) {
        return { ...result, role: value, id: result._id };
      } else return result;
    });
    setSelectedResult(newResults);
  };

  // Cancel User nếu không muốn add vào dự án nữa
  const cancelSelectedUser = (value: any) => {
    console.log("Delete Value:", value);
    if (value._id) {
      let deSelect = selectedResult.filter((result: any) => {
        return result._id !== value._id;
      });
      setSelectedResult(deSelect);
    } else {
      let deSelect = selectedResult.filter((result: any) => {
        return result._id !== value.key;
      });
      setSelectedResult(deSelect);
    }
  };

  const handleAddMembers = async () => {
    setAddMemberFetching(true);
    try {
      if (selectedResult.length > 0) {
        const response = await axios({
          method: "post",
          url: `${process.env.REACT_APP_BACKEND_URL}/project/members/add/${params.projectId}`,
          data: selectedResult.map(({ role, id }) => ({ role, id })),
          headers: { Authorization: `Bearer ${token}` },
        });
        setMemberData(response.data.members);
        setPagination({ pageIndex: 1, total: response.data.members.length });
        showMessage(
          "success",
          changeMsgLanguage(response.data?.message, "Đã thêm thành viên mới"),
          2
        );
        setAddMemberFetching(false);
        setSelectedResult([]);
        setSearchInput("");
        closeModal(false);
      } else {
        setError({
          ...error,
          message: changeMsgLanguage(
            "Please add members",
            "Vui lòng chọn thành viên"
          ),
        });
        setAddMemberFetching(false);
      }
    } catch (err: any) {
      showMessage(
        "error",
        changeMsgLanguage(
          err.response.data?.message,
          "Thêm thành viên thất bại"
        ),
        2
      );
      setAddMemberFetching(false);
    }
  };

  return (
    <div className="add-member">
      <Title level={3}>Add Members</Title>
      <div className="search-box-container" style={{ width: "300px" }}>
        <Select
          allowClear
          showSearch
          labelInValue
          value={selectedResult}
          mode="multiple"
          size="large"
          maxTagCount="responsive"
          placeholder="Full Name"
          style={{ width: "250px" }}
          defaultActiveFirstOption={false}
          suffixIcon={<SearchOutlined />}
          optionFilterProp="children"
          filterOption={(input, option) =>
            typeof option?.label === "string" &&
            option.label.toLowerCase().includes(input.toLowerCase())
          }
          onSearch={handleSearch}
          onChange={(newValue) => {
            setSelectedResult(newValue as UserSearchResult[]);
          }}
          onSelect={selectSearchResult}
          onDeselect={cancelSelectedUser}
          notFoundContent={isLoading ? <LoadingOutlined /> : null}
          dropdownRender={(menu) =>
            isLoading ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  padding: "10px 0",
                }}
              >
                <LoadingOutlined />
              </div>
            ) : (
              menu
            )
          }
          options={searchData?.map((d) => ({
            value: d._id,
            label: `${d.fullName}`,
            disabled: d.isJoined && true,
          }))}
        />
        <div className="error-message">
          {error.message ?? <>{error.message}</>}
        </div>
      </div>
      <div className="add-member-container">
        {selectedResult?.map((result: UserSearchResult) => {
          return (
            <div key={result?._id} className="add-member-item">
              <div className="item-content">
                <img src={result?.avatar} alt="user-avatar" />
                <div>{result?.fullName}</div>
              </div>
              <div className="item-action">
                <Select
                  options={roleSelectOptions}
                  placeholder="Select role"
                  onSelect={(value) => {
                    handleSelectRole(value, result);
                  }}
                  dropdownMatchSelectWidth={false}
                />
                <Button
                  icon={<CloseOutlined />}
                  onClick={() => {
                    cancelSelectedUser(result);
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className="add-member-button">
        <Button type="primary" onClick={handleAddMembers}>
          {addMemberFetching && <LoadingOutlined />} Add Members
        </Button>
        <Button onClick={cancelModal}>Cancel</Button>
      </div>
    </div>
  );
};

export default AddMember;
