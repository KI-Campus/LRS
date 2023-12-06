import { ReactElement, useEffect, useRef, useState } from "react";
import Button from "antd/lib/button";
import Drawer from "antd/lib/drawer";
import Form from "antd/lib/form";
import Input from "antd/lib/input";
import notification from "antd/lib/notification";
import { UserAddOutlined } from "@ant-design/icons";
import Select from "antd/lib/select";
import type { DefaultOptionType } from "antd/es/select";
import Space from "antd/lib/space";
import { TreeSelect } from "antd";
import { createUserService } from "src/services/users";
import { getAllCoursesAdminService } from "src/services/courses";

export default function CreateUser(props): ReactElement {
  const [createUserDrawerVisible, setCreateUserDrawerVisible] = useState(false);
  const [createUserloading, setCreateUserLoading] = useState(false);
  const formRef = useRef(null);
  const [coursesAccessListDisabled, setCoursesAccessListDisabled] =
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

  const onCourseAccessChange = (value, label, extra) => {
    // Check if the user has selected a course which has value of courseId_*
    // If yes, then select all the courses of that consumer (parent)

    // Check in value array if there is a value which a string containing _courseId_*

    for (let i = 0; i < value.length; i++) {
      if (value[i].includes("_courseId_*")) {
        // Select all the courses of the consumer
        let consumerId = value[i].split("_")[0];
        let coursesOfConsumer = props.courses.filter(
          (item) => item.pId === consumerId && item.isLeaf === true
        );
        let coursesOfConsumerIds = coursesOfConsumer.map((item) => item.value);
        formRef.current.setFieldsValue({
          coursesAccess: coursesOfConsumerIds,
        });
      }
    }
  };

  return (
    <div>
      <p>To create a new user click on the following button</p>
      <Button
        type="primary"
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
        open={createUserDrawerVisible}
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
                  setCoursesAccessListDisabled(true);
                  formRef.current.setFieldsValue({
                    // Empty the courses access list
                    coursesAccess: [],
                  });
                } else {
                  setCoursesAccessListDisabled(false);
                }
              }}
            >
              <Select.Option value="user">User</Select.Option>
              <Select.Option value="admin">Admin</Select.Option>
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
              multiple={true}
              showSearch={true}
              showCheckedStrategy={"SHOW_CHILD"}
              onChange={onCourseAccessChange}
              treeData={props.courses}
            />
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
