import { Button, Result } from "antd";
import { ReactElement } from "react";
import { Link } from "react-router-dom";

const Component404 = (): ReactElement => {
  return (
    <div className="container-404">
      <Result
        status="404"
        title="404"
        subTitle="Sorry, the page you visited does not exist."
        extra={<Link to="/">Back to Home</Link>}
      />
    </div>
  );
};

export default Component404;
