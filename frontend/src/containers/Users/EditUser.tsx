import { ReactElement, useEffect, useRef, useState } from "react";
import Button from "antd/lib/button";
import Drawer from "antd/lib/drawer";
import Form from "antd/lib/form";
import Input from "antd/lib/input";
import notification from "antd/lib/notification";
import Select from "antd/lib/select";
import { UserInterface } from "src/Interfaces/UserInterface";
import { updateUserService } from "src/services/users";
import { useAppDispatch } from "src/redux/hooks";
import { checkLoginStatus } from "src/redux/auth";
import { useHistory } from "react-router-dom";
import { TreeSelect } from "antd";

export default function EditUser(props): ReactElement {
  let dispatch = useAppDispatch();
  const history = useHistory();
  const [updateUserLoading, setUpdateUserLoading] = useState(false);
  const formRef = useRef(null);
  const [coursesAccessListDisabled, setCoursesAccessListDisabled] =
    useState(false);

  const hideEditDrawer = () => {
    props.setEditDrawerVisible(false);
    props.fetchUsers();
  };

  const updateUser = (userId: string, values: UserInterface) => {
    setUpdateUserLoading(true);
    if (props.isCurrentUser) userId = "current";
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
    history.push({ state: {} });
    // Fetch current user again if props.isCurrentUser is true
    if (props.isCurrentUser) dispatch(checkLoginStatus());
  };

  useEffect(() => {
    if (!props.editUser) return;
    if (props.editUser.role === "admin") {
      setCoursesAccessListDisabled(true);
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
      open={props.editDrawerVisible}
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
            <Input disabled={props.isCurrentUser} />
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
              disabled={props.isCurrentUser}
              onChange={(value) => {
                if (value === "admin") {
                  setCoursesAccessListDisabled(true);
                  formRef.current.setFieldsValue({
                    consumersAccess: ["all"],
                  });
                } else {
                  setCoursesAccessListDisabled(false);
                }
              }}
            >
              <Select.Option value="admin">Admin</Select.Option>
              <Select.Option value="user">User</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Course Access List"
            name="coursesAccess"
            rules={[
              {
                required: false,
                message: "Please specify the courses access list",
              },
            ]}
          >
            <TreeSelect
              disabled={coursesAccessListDisabled}
              allowClear
              treeDataSimpleMode
              style={{ width: "100%" }}
              dropdownStyle={{ maxHeight: "auto", overflow: "scroll" }}
              placeholder={coursesAccessListDisabled ? "All" : "Please select"}
              treeCheckable={true}
              treeCheckStrictly={true}
              multiple={true}
              showSearch={true}
              treeData={props.courses}
            />
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
