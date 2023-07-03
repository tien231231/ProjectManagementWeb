import FormStages from "./FormStages";
import StageReview from "./StageReview";
import Loading from "../../components/support/Loading";
import useIsBoss from "../../hooks/useIsBoss";
import { useAppSelector } from "../../redux/hook";
import stageApi from "../../services/api/stageApi";
import { changeMsgLanguage } from "../../utils/changeMsgLanguage";
import { ProjectType } from "../projectPage/ProjectDetail";
import { DeleteFilled, EditFilled, EyeFilled } from "@ant-design/icons";
import Search from "antd/es/input/Search";
import moment from "moment";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  createSearchParams,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import {
  Button,
  message,
  Modal,
  Pagination,
  Popconfirm,
  Space,
  Table,
  Typography,
} from "antd";
import useMessageApi, {
  UseMessageApiReturnType,
} from "../../components/support/Message";

import type { ColumnsType } from "antd/es/table";

export interface IStages {
  key?: string;
  _id?: string;
  name: string;
  startDate: Date;
  endDateExpected: Date;
  reviews?: object[];
  endDateActual?: Date;
}
interface IStagesData {
  stages: IStages[];
  currentPage: number;
  total: number;
  totalPages: number;
}
interface DataType {
  key?: string;
  name: string;
  startDate: string;
  endDateExpected: string;
  endDateActual: string;
}

interface PropTypes {
  projectDetail?: ProjectType;
}

const { Text } = Typography;

const StagesPage: React.FC<PropTypes> = (props: PropTypes) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [createStages, setCreateStages] = useState<boolean>(false);
  const [searchInput, setSearchInput] = useState<string>();
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [finishCount, setFinishCount] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [stageCurrentReview, setStageCurrentReview] = useState<string>("");
  const [stagesData, setStagesData] = useState<IStagesData>({
    stages: [],
    currentPage: 1,
    total: 1,
    totalPages: 1,
  });
  const [editStages, setEditStages] = useState<{
    status: boolean;
    stages: IStages | any;
  }>({
    status: false,
    stages: null,
  });
  const [searchParams, setSearchParams] = useSearchParams();
  const searchRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const params = useParams();

  const { showMessage, contextHolder }: UseMessageApiReturnType =
    useMessageApi();
  const token: string = useAppSelector(
    (state: any) => state.auth?.userInfo?.token
  );
  const { t, i18n } = useTranslation(["content", "base"]);
  const navigate = useNavigate();
  const { isBoss } = useIsBoss([]);

  // lấy dữ liệu stages theo page
  useEffect(() => {
    setLoading(true);
    const subParams = {
      page: searchParams.get("page"),
    };
    stageApi
      .getStagesPagination(params.projectId as string, subParams)
      .then((res: any) => {
        setStagesData(res);
        setLoading(false);
      })
      .catch((err: any) => {
        setLoading(false);
        message.error(err.response.data.message);
      });
  }, [finishCount, token, pageNumber]);

  // hám xóa
  const confirm = (stages: DataType) => {
    showMessage("loading", `${t("content:loading")}...`);
    stageApi
      .deleteStage(stages.key as string)
      .then((res: any) => {
        showMessage(
          "success",
          changeMsgLanguage(res?.message, "Xóa thành công"),
          2
        );
        setFinishCount((prev) => prev + 1);
      })
      .catch((err) => {
        showMessage(
          "error",
          changeMsgLanguage(err.response?.data?.message, "Xóa thất bại"),
          2
        );
      });
  };

  //hàm gọi api khi search
  const handleChangeSearch = (event: any) => {
    let value = event?.target.value;

    setSearchInput(value);
    setSearchParams({
      currentTab: "Stages",
      name: value || "",
      page: (searchParams.get("page") as string) || "1",
    });
  };

  //hàm cancel modal
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    setPageNumber(Number(searchParams.get("page")) || 1);
  }, []);

  // api search kết hợp url searchParams
  useEffect(() => {
    if (searchRef.current) {
      clearTimeout(searchRef.current);
    }
    searchRef.current = setTimeout(() => {
      setLoadingSearch(true);

      if (searchParams.get("name")) {
        const subParams = {
          page: 1,
          name: searchParams.get("name")?.split("+").join(" "),
        };
        stageApi
          .SearchStage(params.projectId as string, subParams)
          .then((res: any) => {
            setStagesData(res);
            setLoadingSearch(false);

            setSearchParams({
              currentTab: "Stages",
              name: (searchParams.get("name") as string) || "",
              page: "1",
            });
          })
          .catch((err) => {});
      } else {
        stageApi
          .SearchStage(params.projectId as string)
          .then((res: any) => {
            setStagesData(res);
            setLoadingSearch(false);
          })
          .catch((err) => {
            message.error(err.response.data.message);
          });
      }
    }, 800);
  }, [searchInput]);

  //hám search
  const handleSearchStage = (value: string) => {
    setLoading(true);
    setLoadingSearch(true);
    if (searchRef.current) {
      clearTimeout(searchRef.current);
    }
    if (value) {
      const subParams = {
        page: 1,
        name: value,
      };
      stageApi
        .SearchStage(params.projectId as string, subParams)
        .then((res: any) => {
          setStagesData(res);
          setLoading(false);
          setLoadingSearch(false);

          setSearchInput("");
        })
        .catch((err) => {
          setLoading(false);
          message.error(err.response.data.message);
        });
    } else {
      stageApi
        .SearchStage(params.projectId as string)
        .then((res: any) => {
          setStagesData(res);
          setLoadingSearch(false);

          setLoading(false);
        })
        .catch((err) => {
          setLoading(false);
          message.error(err.response.data.message);
        });
    }
  };

  const navigateTasks = (record: any) => {
    navigate({
      pathname: `${record.key}`,
      search: `${createSearchParams({ type: "all" })}`,
    });
  };

  //dữ liệu table
  const columns: ColumnsType<DataType> = useMemo(
    () => [
      {
        title: t("content:name"),
        dataIndex: "name",
        key: "name",

        sorter: (a, b) => a.name.localeCompare(b.name),
        render: (_, record: DataType) => (
          <Text
            className="stage_name"
            onClick={() => {
              navigateTasks(record);
            }}
          >
            {record.name}
          </Text>
        ),
      },

      {
        title: t("content:startDate"),
        dataIndex: "startDate",
        key: "startDate",
        sorter: (a, b) => {
          const startDateA = moment(a.startDate, "YYYY-MM-DD").toDate();
          const startDateB = moment(b.startDate, "YYYY-MM-DD").toDate();
          return startDateA.getTime() - startDateB.getTime();
        },
      },
      {
        title: t("content:endDateExpected"),
        dataIndex: "endDateExpected",
        key: "endDateExpected",
        sorter: (a, b) => {
          const startDateA = moment(a.endDateExpected, "YYYY-MM-DD").toDate();
          const startDateB = moment(b.endDateExpected, "YYYY-MM-DD").toDate();
          return startDateA.getTime() - startDateB.getTime();
        },
      },
      {
        title: t("content:endDateActual"),
        dataIndex: "endDateActual",
        key: "endDateActual",
        sorter: (a, b) => {
          const startDateA = moment(a.endDateActual, "YYYY-MM-DD").toDate();
          const startDateB = moment(b.endDateActual, "YYYY-MM-DD").toDate();
          return startDateA.getTime() - startDateB.getTime();
        },
      },

      {
        title: t("content:action"),
        key: "action",
        render: (_, record: DataType) => (
          <Space size="middle">
            {isBoss && (
              <>
                <span
                  onClick={() => {
                    setEditStages({
                      status: true,
                      stages: record,
                    });
                  }}
                >
                  <EditFilled style={{ fontSize: "16px", cursor: "pointer" }} />
                </span>
                <Popconfirm
                  placement="topRight"
                  title={t("content:titleDeleteStage")}
                  description={t("content:desDeleteStage")}
                  onConfirm={() => confirm(record)}
                  okText={t("base:ok")}
                  cancelText={t("base:cancel")}
                >
                  <DeleteFilled
                    style={{ fontSize: "16px", cursor: "pointer" }}
                  />
                </Popconfirm>
              </>
            )}
            <span
              onClick={() => {
                setIsModalOpen(true);
                setStageCurrentReview(record.key || "");
              }}
            >
              <EyeFilled style={{ fontSize: "16px", cursor: "pointer" }} />
            </span>
          </Space>
        ),
      },
    ],
    [stagesData, i18n.language]
  );

  // dữ liệu stages trong table
  const data: DataType[] = useMemo(() => {
    if (!stagesData?.stages) return [];
    return stagesData.stages.map((stage: IStages) => ({
      key: stage._id,
      name: stage.name,
      startDate: moment(stage.startDate).format("DD-MM-YYYY"),
      endDateExpected: moment(stage.endDateExpected).format("DD-MM-YYYY"),
      endDateActual: stage.endDateActual
        ? moment(stage.endDateActual).format("DD-MM-YYYY")
        : "",
    }));
  }, [stagesData?.stages]);

  return (
    <div className="content_project-page stages_page">
      {loading && <Loading />}
      {contextHolder}
      <div className="project_page-header ">
        {isBoss && (
          <div className="header_left">
            <Button
              type="primary"
              size={"large"}
              onClick={() => setCreateStages(true)}
            >
              {t("content:createStage")}
            </Button>
          </div>
        )}

        <div className="header_right">
          <Space wrap>
            <Search
              value={(searchParams.get("name") as string) || ""}
              allowClear
              onChange={(event: any) => {
                handleChangeSearch(event);
              }}
              onSearch={handleSearchStage}
              placeholder={t("content:enterStageName")}
              size="large"
              style={{ width: "300px" }}
              loading={loadingSearch}
            />
          </Space>
        </div>
      </div>
      <div className="project_page-table">
        <Table
          columns={columns}
          dataSource={data}
          pagination={{
            hideOnSinglePage: true,
          }}
        />
        <div className="pagination">
          <Pagination
            current={Number(searchParams.get("page") || 1)}
            defaultCurrent={stagesData.totalPages}
            total={stagesData.total}
            onChange={(page: number) => {
              setPageNumber(page);

              setSearchParams({
                currentTab: "Stages",
                name: searchParams.get("name") as string,
                page: `${page}`,
              });
            }}
          />
        </div>
      </div>
      {createStages && (
        <FormStages
          title={t("content:createStage")}
          button={t("base:create")}
          status={false}
          endDateActual={false}
          setCreateStages={setCreateStages}
          setFinishCount={setFinishCount}
          showMessage={showMessage}
        />
      )}
      {editStages.status && (
        <FormStages
          showMessage={showMessage}
          setFinishCount={setFinishCount}
          editStages={editStages}
          title={t("content:editStage")}
          button={t("base:update")}
          projectDetail={props.projectDetail}
          setEditStages={setEditStages}
        />
      )}

      <Modal
        title=""
        width="70%"
        open={isModalOpen}
        onCancel={handleCancel}
        maskClosable={false}
        style={{ top: "50px" }}
        footer={[]}
        className="responsive-modal"
      >
        <StageReview stageId={stageCurrentReview} />
      </Modal>
    </div>
  );
};

export default StagesPage;
