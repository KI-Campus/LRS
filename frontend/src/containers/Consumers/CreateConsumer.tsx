import Button from "antd/lib/button";
import Drawer from "antd/lib/drawer";
import Form from "antd/lib/form";
import Input from "antd/lib/input";
import notification from "antd/lib/notification";
import { useEffect, useRef, useState } from "react";
import { createConsumerService } from "src/services/consumers";
import Space from "antd/lib/space";
import { ApiOutlined } from "@ant-design/icons";

export default function CreateConsumer(props) {
  const [createConsumerloading, setCreateConsumerLoading] = useState(false);
  const formRef = useRef(null);

  useEffect(() => {
    if (formRef.current) {
      formRef.current.setFieldsValue(props.createConsumer);
    }
  }, [props.createConsumer]);

  const onCreateConsumerFinish = (values: any) => {
    // Clear the form values
    formRef.current.resetFields();

    setCreateConsumerLoading(true);
    let ret = createConsumerService(values);
    ret
      .then((res) => {
        notification.success({
          message: "Success",
          description: "Consumer created successfully",
        });
        setCreateConsumerLoading(false);
        props.setCreateConsumerDrawerVisible(false);
        props.fetchConsumers();
      })
      .catch((err) => {
        console.log("Error while creating consumer", err);
        setCreateConsumerLoading(false);
      });
  };

  return (
    <div>
      <Drawer
        size={"large"}
        title={"Create a new consumer"}
        placement="right"
        open={props.createConsumerDrawerVisible}
        onClose={() => {
          props.setCreateConsumerDrawerVisible(false);
        }}
      >
        <p>Create a new consumer</p>
        <Form
          ref={formRef}
          name="basic"
          layout="horizontal"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          initialValues={props.createConsumer}
          onFinish={onCreateConsumerFinish}
          onFinishFailed={(errorInfo) => {
            notification.error({
              message: "Error creating the consumer: " + errorInfo,
            });
          }}
          autoComplete="off"
        >
          <Form.Item
            label="ID"
            name="id"
            rules={[
              {
                required: true,
                message: "Please input ID",
                type: "string",
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Consumer Name"
            name="name"
            rules={[
              {
                required: true,
                message: "Please provide a consumer name",
                type: "string",
                whitespace: true,
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Logo URL"
            name="picture"
            rules={[
              {
                required: false,
                message: "Please provide a valid URL",
                type: "url",
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item>
            <Button
              loading={createConsumerloading}
              type="primary"
              htmlType="submit"
            >
              <Space>
                <ApiOutlined />
                Create Consumer
              </Space>
            </Button>
          </Form.Item>

          <Form.Item>
            <Button
              onClick={() => {
                props.setCreateConsumerDrawerVisible(false);
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
