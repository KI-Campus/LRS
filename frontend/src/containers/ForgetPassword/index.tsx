import { Form, Input, Button } from "antd";
import { Link } from "react-router-dom";
import { useAppSelector } from "src/redux/hooks";

const ForgetPassword = () => {
  // let dispatch = useAppDispatch();
  let loading = useAppSelector((state) => state.authModal.loading);

  const onFinish = ({ email }: { email: string }) => {
    console.log("email: ", email);
    // dispatch(resetPassword(email));
  };

  return (
    <>
      <div className="forget-password">
        <h2 className="main-heading center">Forgot Password</h2>
        <p className="sub-heading">
          Forgot password form is disabled. Please contact your system admin
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
            rules={[{ required: true, message: "Invalid Email" }]}
            label={<span className="form-label">Email</span>}
          >
            <Input
              type="email"
              className="form-input"
              placeholder="Enter Email"
              disabled={true}
            />
          </Form.Item>

          <Form.Item>
            <Button
              loading={loading}
              style={{ width: 400, marginTop: 8 }}
              type="primary"
              htmlType="submit"
              disabled={true}
            >
              Reset Password
            </Button>
          </Form.Item>
          <p className="forget-password-redirect">
            <span className="link">
              <Link to="/login"> Login</Link>
            </span>
          </p>
        </Form>
      </div>
    </>
  );
};

export default ForgetPassword;
