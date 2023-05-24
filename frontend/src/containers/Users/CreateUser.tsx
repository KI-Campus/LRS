import { ReactElement, useRef, useState } from "react";
import Button from "antd/lib/button";
import Drawer from "antd/lib/drawer";
import Form from "antd/lib/form";
import Input from "antd/lib/input";
import notification from "antd/lib/notification";
import { UserAddOutlined } from "@ant-design/icons";
import Select from "antd/lib/select";
import Space from "antd/lib/space";
import { createUserService } from "src/services/users";

export default function CreateUser(props): ReactElement {
  const [createUserDrawerVisible, setCreateUserDrawerVisible] = useState(false);
  const [createUserloading, setCreateUserLoading] = useState(false);
  const formRef = useRef(null);
  const [consumersAccessListDisabled, setConsumersAccessListDisabled] =
    useState(false);

  const onCreateUserFinish = (values: any) => {
    // Clear the form values
    formRef.current.resetFields();

    setCreateUserLoading(true);
    let ret = createUserService(values);
    ret
      .then((res) => {
        notification.success({
          message: "Success",
          description: "User created successfully",
        });
        setCreateUserLoading(false);
        setCreateUserDrawerVisible(false);
        props.fetchUsers();
      })
      .catch((err) => {
        console.log("Error while creating user", err);
        setCreateUserLoading(false);
      });
  };

  return (
    <div>
      <p>To create a new user click on the following button</p>
      <Button
        onClick={() => {
          setCreateUserDrawerVisible(true);
        }}
      >
        <Space>
          <UserAddOutlined />
          Create a new user
        </Space>
      </Button>
      <Drawer
        size={"large"}
        title={"Create a new user"}
        placement="right"
        visible={createUserDrawerVisible}
        onClose={() => {
          setCreateUserDrawerVisible(false);
        }}
      >
        <p>Create a new user</p>
        <Form
          ref={formRef}
          name="basic"
          layout="horizontal"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          initialValues={props.editUser}
          onFinish={onCreateUserFinish}
          onFinishFailed={(errorInfo) => {
            notification.error({
              message: "Error creating the user: ",
            });
          }}
          autoComplete="off"
        >
          <Form.Item
            label="Email Address"
            name="email"
            rules={[
              {
                required: true,
                message: "Please input email address",
                type: "email",
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[
              {
                required: true,
                message: "Please provide password",
              },
              {
                min: 6,
                message: "Please enter a password with 6 or more characters",
              },
            ]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            label="First Name"
            name="firstName"
            rules={[
              {
                required: true,
                message: "Please provide firstname",
                type: "string",
                whitespace: true,
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Last Name"
            name="lastName"
            rules={[
              {
                required: true,
                message: "Please provide a last name",
                type: "string",
                whitespace: true,
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Role"
            name="role"
            rules={[
              {
                required: true,
                message: "Please specify the role of the user",
                type: "string",
              },
            ]}
          >
            <Select
              onChange={(value) => {
                if (value === "admin") {
                  setConsumersAccessListDisabled(true);
                  formRef.current.setFieldsValue({
                    consumersAccess: ["all"],
                  });
                } else {
                  setConsumersAccessListDisabled(false);
                }
              }}
            >
              <Select.Option value="user">User</Select.Option>
              <Select.Option value="admin">Admin</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Consumer Access List"
            name="consumersAccess"
            rules={[
              {
                required: false,
                message: "Please specify the consumers access list",
              },
            ]}
          >
            <Select mode="multiple" disabled={consumersAccessListDisabled}>
              {props.consumers.map((item) => (
                <Select.Option value={item.id} key={item.id}>
                  {item.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item>
            <Button
              loading={createUserloading}
              type="primary"
              htmlType="submit"
            >
              <Space>
                <UserAddOutlined />
                Create user
              </Space>
            </Button>
          </Form.Item>

          <Form.Item>
            <Button
              onClick={() => {
                setCreateUserDrawerVisible(false);
              }}
            >
              Cancel
            </Button>
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
}
