import { useEffect, useState } from "react";
import { ConsumerInterface } from "src/Interfaces/ConsumerInterface";
import {
  deleteConsumerService,
  getConsumersListService,
} from "src/services/consumers";
import Space from "antd/lib/space";
import Button from "antd/lib/button";
import Popconfirm from "antd/lib/popconfirm";
import Table from "antd/lib/table";
import type { ColumnsType } from "antd/es/table";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import EditConsumer from "./EditConsumer";
import notification from "antd/lib/notification";
import CreateConsumer from "./CreateConsumer";
import { Col, Row } from "antd";

const Consumers = (): React.ReactElement => {
  const [loading, setLoading] = useState(true);
  const [consumers, setConsumers] = useState<ConsumerInterface[]>([]);

  const [editConsumer, setEditConsumer] = useState<ConsumerInterface>();
  const [editDrawerVisible, setEditDrawerVisible] = useState(false);

  const [deleteConsumerLoading, setDeleteConsumerLoading] = useState(false);

  // Load the consumers on page load
  useEffect(() => {
    fetchConsumers();
  }, []);

  const fetchConsumers = () => {
    setLoading(true);
    let ret = getConsumersListService();
    ret
      .then((res) => {
        // Remove consumer "all" from the list
        res = res.filter((consumer) => consumer.id !== "all");
        // Add a key to each consumer
        res = res.map((consumer) => {
          consumer.key = consumer.id;
          return consumer;
        });
        setConsumers(res);
        setLoading(false);
      })
      .catch((err) => {
        console.log("Error while fetching consumers", err);
        setLoading(false);
      });
  };

  const handleEditClick = (consumer: ConsumerInterface) => {
    setEditConsumer(consumer);
    setEditDrawerVisible(true);
  };

  const deleteConsumer = (consumer: ConsumerInterface) => {
    setDeleteConsumerLoading(true);
    let ret = deleteConsumerService(consumer.id);
    ret
      .then((res) => {
        notification.success({
          message: "Success",
          description: "Consumer deleted successfully",
        });
        setDeleteConsumerLoading(false);
        fetchConsumers();
      })
      .catch((err) => {
        console.log("Error while deleting consumer", err);
        setDeleteConsumerLoading(false);
      });
  };

  const consumerColumns: ColumnsType<ConsumerInterface> = [
    {
      title: "#",
      key: "no",
      // Responsive, show on bigger devices
      responsive: ["xl", "xxl"],
      render: (text, record, index) => index + 1,
    },
    {
      title: "Name",
      key: "name",
      render: (text, record) => (
        <a
          href="#"
          onClick={() => {
            handleEditClick(record);
          }}
        >
          {record.name}
        </a>
      ),
    },
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      // Responsive, show on bigger devices
      responsive: ["xl", "xxl"],
    },
    {
      title: "Picture",
      dataIndex: "picture",
      key: "picture",
      render: (text, record) =>
        record.picture ? (
          <img
            src={record.picture}
            alt={record.name}
            style={{ width: "auto", height: "50px" }}
          />
        ) : (
          <span>No picture</span>
        ),
    },

    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      // Responsive, show on bigger devices
      responsive: ["xl", "xxl"],
      render: (text, record: ConsumerInterface) => {
        return new Date(record.createdAt).toLocaleString() || "";
      },
    },

    {
      title: "Action",
      key: "action",
      render: (_, record: ConsumerInterface) => (
        <Row gutter={[24, 24]}>
          <Col md={24} xl={12}>
            <Button onClick={() => handleEditClick(record)}>
              <Space>
                <EditOutlined />
                Edit
              </Space>
            </Button>
          </Col>
          <Col md={24} xl={12}>
            <Popconfirm
              title={"Are you sure to delete " + record.name + "?"}
              onConfirm={() => {
                deleteConsumer(record);
              }}
              okText="Yes Delete"
              cancelText="Cancel"
            >
              <Button danger>
                <Space>
                  <DeleteOutlined />
                  Delete
                </Space>
              </Button>
            </Popconfirm>
          </Col>
        </Row>
      ),
    },
  ];

  return (
    <div>
      <h2>Consumers</h2>
      <Table
        loading={loading}
        columns={consumerColumns}
        dataSource={consumers}
      />
      <EditConsumer
        fetchConsumers={fetchConsumers}
        editConsumer={editConsumer}
        editDrawerVisible={editDrawerVisible}
        setEditDrawerVisible={setEditDrawerVisible}
      />

      <CreateConsumer fetchConsumers={fetchConsumers} />
    </div>
  );
};

export default Consumers;
