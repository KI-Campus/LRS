import Button from "antd/lib/button";
import Drawer from "antd/lib/drawer";
import Form from "antd/lib/form";
import Input from "antd/lib/input";
import notification from "antd/lib/notification";
import { useRef, useState } from "react";
import { ConsumerInterface } from "src/Interfaces/ConsumerInterface";
import { updateConsumerService } from "src/services/consumers";

export default function EditConsumer(props) {
  const [updateConsumerLoading, setUpdateConsumerLoading] = useState(false);
  const formRef = useRef(null);

  const hideEditDrawer = () => {
    props.setEditDrawerVisible(false);
    props.fetchConsumers();
  };

  const updateConsumer = (consumerId: string, values: ConsumerInterface) => {
    setUpdateConsumerLoading(true);
    let ret = updateConsumerService(consumerId, values);
    ret
      .then((res) => {
        notification.success({
          message: "Success",
          description: "Consumer updated successfully",
        });
        setUpdateConsumerLoading(false);
        hideEditDrawer();
      })
      .catch((err) => {
        console.log("Error while updating consumer", err);
        setUpdateConsumerLoading(false);
      });
  };
  const onEditFormFinish = (values: ConsumerInterface) => {
    updateConsumer(props.editConsumer.id, values);
  };

  return (
    <Drawer
      size={"large"}
      title={"Edit Consumer " + props.editConsumer?.name}
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
          initialValues={props.editConsumer}
          onFinish={onEditFormFinish}
          onFinishFailed={(errorInfo) => {
            notification.error({
              message: "Error editing the consumer: " + errorInfo,
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
              loading={updateConsumerLoading}
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
