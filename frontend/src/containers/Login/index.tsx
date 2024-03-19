import { useEffect, useState } from "react";
import Form from "antd/lib/form";
import Input from "antd/lib/input";
import Button from "antd/lib/button";
import { EyeInvisibleOutlined, EyeOutlined } from "@ant-design/icons";
import { Link, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { login, logout } from "../../redux/auth";
import { ReactElement } from "react";
import { Tooltip } from "antd";

const Login = (): ReactElement => {
  let dispatch = useAppDispatch();
  let { loading } = useAppSelector((state) => state.authModal);

  const [useMagicToken, setMagicToken] = useState(true);

  // Fetch token from /:token
  const { token } = useParams<{ token: string }>();

  const onFinish = (values) => {
    dispatch(login(values));
  };

  useEffect(() => {
    if (token) {
      dispatch(login({ magicToken: token }));
    }
  }, [token, dispatch]);

  return (
    <>
      <div className="login">
        <h2 className="main-heading center">Please log in</h2>
        <p className="sub-heading">
          {!useMagicToken
            ? "Please enter your username and password to continue. In usually cases the username is your email address."
            : "Please use your magic token to login. Magic token lets you login without username and password"}
        </p>
        {!useMagicToken && (
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

            <p className="forget-pass link" style={{ marginBottom: "1.5rem" }}>
              <Tooltip
                title={
                  "Forget password is disabled, please contact system admin"
                }
              >
                <Link to="/forget-password">Forget Password?</Link>
              </Tooltip>
            </p>

            <p className="forget-pass link">
              <Link onClick={() => setMagicToken(true)} to="#">
                Use magic token
              </Link>
            </p>
            <Form.Item>
              <Button
                loading={loading}
                style={{ width: 400, marginTop: 8 }}
                type="primary"
                htmlType="submit"
              >
                Login
              </Button>
            </Form.Item>
          </Form>
        )}

        {/* Magic token Form */}
        {/* Enter magic token */}
        {useMagicToken && (
          <Form
            name="basic"
            layout="vertical"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            autoComplete="off"
          >
            <Form.Item
              name="magicToken"
              rules={[
                {
                  required: true,
                  message: "Please enter a valid magic token",
                },
              ]}
              label={<span className="form-label">Magic Token</span>}
              required
            >
              <Input className="form-input" placeholder="Enter Magic Token" />
            </Form.Item>
            <p className="forget-pass link">
              <Link onClick={() => setMagicToken(false)} to="#">
                Use email and password
              </Link>
            </p>
            <Form.Item>
              <Button
                loading={loading}
                style={{ width: 400, marginTop: 8 }}
                type="primary"
                htmlType="submit"
              >
                Login
              </Button>
            </Form.Item>
          </Form>
        )}
        {/* End Magic token Form */}
      </div>
    </>
  );
};

export default Login;
