import { ReactElement, useEffect, useRef, useState } from "react";
import Button from "antd/lib/button";
import Drawer from "antd/lib/drawer";
import Form from "antd/lib/form";
import Input from "antd/lib/input";
import notification from "antd/lib/notification";
import Select from "antd/lib/select";
import { UserInterface } from "src/Interfaces/UserInterface";
import { updateUserService } from "src/services/users";

export default function EditUser(props): ReactElement {
  const [updateUserLoading, setUpdateUserLoading] = useState(false);
  const formRef = useRef(null);
  const [consumersAccessListDisabled, setConsumersAccessListDisabled] =
    useState(false);

  const hideEditDrawer = () => {
    props.setEditDrawerVisible(false);
    props.fetchUsers();
  };

  const updateUser = (userId: string, values: UserInterface) => {
    setUpdateUserLoading(true);
    let ret = updateUserService(userId, values);
    ret
      .then((res) => {
        notification.success({
          message: "Success",
          description: "User updated successfully",
        });
        setUpdateUserLoading(false);
        hideEditDrawer();
      })
      .catch((err) => {
        console.log("Error while updating user", err);
        setUpdateUserLoading(false);
      });
  };
  const onEditFormFinish = (values: UserInterface) => {
    updateUser(props.editUser.id, values);
  };

  useEffect(() => {
    if (!props.editUser) return;
    if (props.editUser.role === "admin") {
      setConsumersAccessListDisabled(true);
    }
  }, [props.editUser]);

  return (
    <Drawer
      size={"large"}
      title={
        "Edit User " +
        props.editUser?.firstName +
        " " +
        props.editUser?.lastName
      }
      placement="right"
      onClose={hideEditDrawer}
      visible={props.editDrawerVisible}
    >
      {props.editDrawerVisible && (
        <Form
          ref={formRef}
          name="basic"
          layout="horizontal"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          initialValues={props.editUser}
          onFinish={onEditFormFinish}
          onFinishFailed={(errorInfo) => {
            notification.error({
              message: "Error editing the user: " + errorInfo,
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
              loading={updateUserLoading}
              type="primary"
              htmlType="submit"
            >
              Update
            </Button>
          </Form.Item>

          <Form.Item>
            <Button
              onClick={() => {
                hideEditDrawer();
              }}
            >
              Cancel
            </Button>
          </Form.Item>
        </Form>
      )}
    </Drawer>
  );
}
