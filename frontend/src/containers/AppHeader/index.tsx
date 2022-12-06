import { ReactElement } from "react";
import { Link, useHistory } from "react-router-dom";
// import Logo from "../../assets/img/logo.svg";
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
const AppHeader = (): ReactElement => {
  let dispatch = useAppDispatch();
  let history = useHistory();

  const { user } = useAppSelector((state) => state.authModal);

  const menu = (
    <Menu>
      <Menu.Item
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
            <h1>openLRS</h1>
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
                <span className="user-name">{user?.email || "User"}</span>
                <Tag color={user.role === "admin" ? "volcano" : "geekblue"}>
                  {user.role?.toUpperCase()}
                </Tag>
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
