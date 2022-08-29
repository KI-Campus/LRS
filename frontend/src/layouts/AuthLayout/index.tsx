import { ReactNode } from "react";
import Col from "antd/lib/col";
import Row from "antd/lib/row";
// import imgSrc from "src/assets/img/img.png";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <Row className="auth-wrapper">
      <Col xs={24} md={10} lg={8} className="full-height">
        <div className="left-container">
          {/* <img alt="SideImage" style={{ width: 300 }} src={imgSrc} /> */}
          <h3>Welcome to openLRS</h3>
          <p>Please login to use your credentials to view openLRS records</p>
        </div>
      </Col>
      <Col xs={24} md={14} lg={16} className="full-height">
        <div className="right-container">{children}</div>
      </Col>
    </Row>
  );
}
