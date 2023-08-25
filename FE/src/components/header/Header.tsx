import { setLogout } from "../../redux/slice/authSlice";
import { BellOutlined, DownOutlined } from "@ant-design/icons";
import { Button, Dropdown, Popover, Select, Space, Typography } from "antd";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

const { Text } = Typography;

const Header = () => {
  const [language, setLanguage] = useState(1);
  const user = useSelector((state: any) => state.auth);
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation(["base"]);

  // const currentLanguage = locales[i18n.language as keyof typeof locales];

  const handleLogout = () => {
    dispatch(setLogout("Log Out"));
  };
  useEffect(() => {
    if (localStorage.getItem("language")) {
      i18n.changeLanguage(
        JSON.parse((localStorage.getItem("language") as string) ?? "en")
      );
    }
  }, [language]);
  const items = [
    {
      key: "1",
      label: <Link to="/project/user/info">{t("base:userInfo")}</Link>,
    },
    {
      key: "4",
      danger: true,
      label: (
        <Link to="/" onClick={handleLogout}>
          {t("base:logout")}
        </Link>
      ),
    },
  ];
  return (
    <header className="app_header">
      <div className="header_logo">
        <Link to="/">
          <img
            src="https://i.imgur.com/r0MWGAZ.jpg"
            alt="pm"
            style={{ width: '50px', height: '25px' }}
          />
        </Link>
        <span></span>
      </div>
      <div className="header_auth">
        <div className="language_action">
          <Popover content={<p>Tiếng việt</p>}>
            <img
              className={`${i18n.language === "vi" ? "active" : ""} `}
              src="https://st.quantrimang.com/photos/image/2021/09/05/Co-Vietnam.png"
              alt="Tiếng việt"
              onClick={() => {
                localStorage.setItem("language", JSON.stringify("vi"));
                setLanguage((prev) => prev + 1);
              }}
            />
          </Popover>
          <Popover content={<p>English</p>}>
            <img
              className={`${i18n.language === "en" ? "active" : ""} `}
              src="https://vuongquocanh.com/wp-content/uploads/2018/04/la-co-vuong-quoc-anh.jpg"
              alt="English"
              onClick={() => {
                localStorage.setItem("language", JSON.stringify("en"));
                setLanguage((prev) => prev + 1);
              }}
            />
          </Popover>
        </div>

        {/* <span className="bell">
          <BellOutlined />
        </span> */}
        <div className="header_auth-user">
          <div className="dropdown__user">
            <Dropdown
              menu={{
                items,
              }}
            >
              <Text>
                <Space>
                  {user?.userInfo?.fullName.length < 13
                    ? user?.userInfo?.fullName
                    : `${user?.userInfo?.fullName.substring(0, 13)}...`}
                  <DownOutlined />
                </Space>
              </Text>
            </Dropdown>
          </div>
          <div className="header__img">
            <img
              srcSet={`${
                user.userInfo.avatar ||
                "https://st.quantrimang.com/photos/image/072015/22/avatar.jpg"
              } 2x`}
              alt=""
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
