import { ReactNode } from "react";
import { useHistory } from "react-router";
import Layout from "antd/lib/layout";
import Col from "antd/lib/col";
import Menu from "antd/lib/menu";
import Row from "antd/lib/row";
import Spin from "antd/lib/spin";
import { useAppSelector } from "src/redux/hooks";
import AppHeader from "../../containers/AppHeader/index";

import { routeConstants } from "src/utils/routeConstants";
import Icon from "@ant-design/icons/lib/components/Icon";
import Footer from "src/containers/Footer";

const { Content } = Layout;

export default function DashboardLayout({ children }: { children: ReactNode }) {
  let { globalLoading } = useAppSelector((state) => state.authModal);
  let { location } = useHistory();

  let history = useHistory();

  let filteredSideMenu = routeConstants.filter((v) => v.showInSidebar === true);
  return (
    <div>
      <Spin spinning={globalLoading}>
        <AppHeader />
        <Row>
          <Col
            xs={24}
            md={6}
            lg={6}
            xl={4}
            xxl={3}
            style={{ backgroundColor: "#f7f7f8" }}
          >
            <div className="custom-sidebar">
              <Menu
                onSelect={(e) => {
                  history.push(e.key);
                }}
                selectedKeys={[location.pathname]}
                className="main-menu"
                mode="inline"
              >
                {filteredSideMenu.map((sideMenu) => {
                  return (
                    <Menu.Item
                      className="menu-item"
                      key={sideMenu.route.path}
                      // icon={<DocumentationIcon/>}
                      icon={
                        location.pathname === sideMenu.route.path ? (
                          <Icon
                            className="sidebar-icon"
                            component={sideMenu.icons.filled}
                          />
                        ) : (
                          <Icon
                            className="sidebar-icon"
                            component={sideMenu.icons.simple}
                          />
                        )
                      }
                    >
                      {sideMenu.title}
                    </Menu.Item>
                  );
                })}
              </Menu>
            </div>
          </Col>

          <Col xs={24} md={18} lg={18} xl={20} xxl={21}>
            <Content className="main-content-container">{children}</Content>
          </Col>
        </Row>
      </Spin>
    </div>
  );
}
