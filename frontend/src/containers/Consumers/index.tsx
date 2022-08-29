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
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import EditConsumer from "./EditConsumer";
import notification from "antd/lib/notification";
import CreateConsumer from "./CreateConsumer";

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

  const consumerColumns = [
    {
      title: "#",
      key: "no",
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
      render: (text, record: ConsumerInterface) => {
        return new Date(record.createdAt).toLocaleString() || "";
      },
    },

    {
      title: "Action",
      key: "action",
      render: (_, record: ConsumerInterface) => (
        <Space size="middle">
          <Button onClick={() => handleEditClick(record)}>
            <Space>
              Edit
              <EditOutlined />
            </Space>
          </Button>
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
        </Space>
      ),
    },
  ];

  return (
    <div className={editDrawerVisible ? "blur" : ""}>
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
