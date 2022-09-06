import { Link } from "react-router-dom";
import { EyeInvisibleOutlined, EyeOutlined } from "@ant-design/icons";
import Divider from "antd/lib/divider";
import Input from "antd/lib/input";
import Form from "antd/lib/form";
import Button from "antd/lib/button";

import notification from "antd/lib/notification";
import { useAppSelector } from "../../redux/hooks";
import { ReactElement } from "react";

interface RegisterParams {
  againPassword: string;
  password: string;
  email: string;
}

const Signup = (): ReactElement => {
  // let dispatch = useAppDispatch();
  let loading = useAppSelector((state) => state.authModal.loading);

  const onFinish = (values: RegisterParams) => {
    if (values.againPassword !== values.password) {
      notification.error({
        message: "Password does not match",
      });
      return;
    }

    // dispatch(register({ email: values.email, password: values.password }));
  };

  return (
    <>
      <div className="register">
        <h2 className="main-heading center">Let’s Get Started.</h2>
        <p className="sub-heading">
          Itaque earum rerum hic tenetur a sapiente delectus
        </p>
        <Form
          name="basic"
          layout="vertical"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            name="email"
            rules={[
              {
                type: "email",
                required: true,
                message: "Please use a valid email address",
              },
            ]}
            label={<span className="form-label">Email</span>}
          >
            <Input
              type="email"
              className="form-input"
              placeholder="Enter Email"
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[
              {
                required: true,
                message: "Please enter a valid password",
              },
              {
                min: 6,
                message: "Please enter a password with 6 or more characters",
              },
            ]}
            label={<span className="form-label">Password</span>}
            required
          >
            <Input.Password
              iconRender={(visible) =>
                visible ? (
                  <EyeOutlined style={{ fontSize: 24, color: "#5C5E78" }} />
                ) : (
                  <EyeInvisibleOutlined
                    style={{ fontSize: 24, color: "#5C5E78" }}
                  />
                )
              }
              className="form-input"
              placeholder="Enter Password"
            />
          </Form.Item>
          <Form.Item
            name="againPassword"
            label={<span className="form-label">Confirm Password</span>}
            rules={[
              {
                required: true,
                message: "Please enter a valid password",
              },
              {
                min: 6,
                message: "Please enter a password with 6 or more characters",
              },
            ]}
            required
          >
            <Input.Password
              iconRender={(visible) =>
                visible ? (
                  <EyeOutlined style={{ fontSize: 24, color: "#5C5E78" }} />
                ) : (
                  <EyeInvisibleOutlined
                    style={{ fontSize: 24, color: "#5C5E78" }}
                  />
                )
              }
              className="form-input"
              placeholder="Confirm Password"
            />
          </Form.Item>
          <p className="terms-and-conditions">
            By clicking Create Account I agree to all
            <span className="small-link">
              <Link to="/">Terms</Link>
            </span>
            and
            <span className="small-link">
              <Link to="/">Conditions</Link>
            </span>
            .
          </p>
          <Form.Item>
            <Button
              style={{ width: 400 }}
              type="primary"
              htmlType="submit"
              loading={loading}
            >
              Create Account
            </Button>
          </Form.Item>
          <Divider>or</Divider>

          <p className="login-redirect">
            Already have an Account ?{" "}
            <span className="link">
              <Link to="/login"> Login</Link>
            </span>
          </p>
        </Form>
      </div>
    </>
  );
};

export default Signup;
