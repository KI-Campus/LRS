import { ReactElement } from "react";
import { Link } from "react-router-dom";
// import Logo from "../../assets/img/logo.svg";
import Button from "antd/lib/button";
import { useAppDispatch } from "src/redux/hooks";
import { LogoutOutlined } from "@ant-design/icons";
import { logout } from "src/redux/auth";
import Space from "antd/lib/space";

const AppHeader = (): ReactElement => {
  let dispatch = useAppDispatch();

  return (
    <div className="header-container">
      <div className="nav-header-section">
        <div className="app-logo">
          <Link to="/">
            <h1>openLRS</h1>
          </Link>
        </div>
      </div>
      <div className="user-options-section">
        <Button onClick={() => dispatch(logout())} shape="round">
          <Space>
            <LogoutOutlined />
            Logout
          </Space>
        </Button>
      </div>
    </div>
  );
};

export default AppHeader;
