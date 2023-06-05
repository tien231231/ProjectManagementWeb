import { setLogout } from "../../redux/slice/authSlice";
import { BellOutlined, DownOutlined } from "@ant-design/icons";
import { Button, Dropdown, Popover, Select, Space } from "antd";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

const Header = () => {
  const [language, setLanguage] = useState(1);
  const user = useSelector((state: any) => state.auth);
  const dispatch = useDispatch();
  const handleLogout = () => {
    dispatch(setLogout("Log Out"));
  };
  const { i18n } = useTranslation();

  // const currentLanguage = locales[i18n.language as keyof typeof locales];

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
      label: <Link to="/user/info">Thông tin tài khoản </Link>,
    },
    {
      key: "4",
      danger: true,
      label: (
        <Link to="/" onClick={handleLogout}>
          Đăng xuất
        </Link>
      ),
    },
  ];
  return (
    <header className="app_header">
      <div className="header_logo">
        <Link to="/">
          <img
            src="https://4218478784-files.gitbook.io/~/files/v0/b/gitbook-legacy-files/o/spaces%2F-MWcLXaW6te9yNIG__kn%2Favatar-1616661413606.png?generation=1616661413852661&alt=media"
            alt="mindx"
          />
        </Link>
        <span>Mindx</span>
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

        <span className="bell">
          <BellOutlined />
        </span>
        <div className="header_auth-user">
          <Dropdown
            menu={{
              items,
            }}
          >
            <Link className="" to="/auth/info">
              <Space>
                {user.userInfo.fullName}
                <DownOutlined />
              </Space>
            </Link>
          </Dropdown>
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
