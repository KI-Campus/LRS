import { ReactElement } from "react";
import { Link, useHistory } from "react-router-dom";
import Logo from "../../assets/img/lrs-logo.svg";
import Button from "antd/lib/button";
import Icon from "@ant-design/icons/lib/components/Icon";
import { useAppDispatch, useAppSelector } from "src/redux/hooks";
import {
  LogoutOutlined,
  DownOutlined,
  UserOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { logout } from "src/redux/auth";
import Space from "antd/lib/space";
import Tag from "antd/lib/tag";
import Badge from "antd/lib/badge";
import Menu from "antd/lib/menu";
import Dropdown from "antd/lib/dropdown";
import { Tooltip } from "antd";
import { QuestionCircleTwoTone } from "@ant-design/icons";
const AppHeader = (): ReactElement => {
  let dispatch = useAppDispatch();
  let history = useHistory();

  const { user } = useAppSelector((state) => state.authModal);

  const menu = (
    <Menu>
      <Menu.Item
        disabled={user.tempUser ? true : false}
        key={"profile"}
        onClick={() => {
          history.push({ pathname: "/", state: { editCurrentUser: true } });
        }}
      >
        <Space>
          <EditOutlined />
          Edit Profile
        </Space>
      </Menu.Item>
      <Menu.Item
        key={"logout"}
        onClick={() => {
          dispatch(logout());
        }}
      >
        <Space>
          <LogoutOutlined />
          Logout
        </Space>
      </Menu.Item>
    </Menu>
  );

  return (
    <div className="header-container">
      <div className="nav-header-section">
        <div className="app-logo">
          <Link to="/">
            <div
              style={{
                paddingTop: "10px",
                display: "flex",
                gap: "1rem",
                alignItems: "baseline",
              }}
            >
              <img
                style={{ width: "24px", height: "24px" }}
                src={Logo}
                alt="logo"
              />
              <h1>openLRS</h1>
            </div>
          </Link>
        </div>
      </div>
      <div className="user-options-section">
        {/* <Space>
          {user.firstName + " " + user.lastName}
          <Tag color={user.role === "admin" ? "volcano" : "geekblue"}>
            {user.role?.toUpperCase()}
          </Tag>

          <Button onClick={() => dispatch(logout())} shape="round">
            <Space>
              <LogoutOutlined />
              Logout
            </Space>
          </Button>
        </Space> */}

        <Dropdown overlay={menu} trigger={["click"]}>
          <a className="ant-dropdown-link" onClick={(e) => e.preventDefault()}>
            <Space>
              <UserOutlined style={{ fontSize: 16 }} />
              <Space>
                <span className="user-name">
                  {user.tempUser
                    ? user?.email.substring(0, 10) + "..."
                    : user?.email || "User"}
                </span>
                <Tooltip
                  title={
                    user.tempUser
                      ? "Expire: " + new Date(user.expireAt).toLocaleString()
                      : ""
                  }
                >
                  <Tag
                    color={
                      user.role === "admin"
                        ? "volcano"
                        : user.tempUser
                        ? "lime"
                        : "geekblue"
                    }
                  >
                    {user.tempUser ? (
                      <>
                        Temporary User <QuestionCircleTwoTone />
                      </>
                    ) : (
                      user.role?.toUpperCase()
                    )}
                  </Tag>
                </Tooltip>
              </Space>
              <span>
                <DownOutlined className="icon-drop-down" />
              </span>
            </Space>
          </a>
        </Dropdown>
      </div>
    </div>
  );
};

export default AppHeader;
