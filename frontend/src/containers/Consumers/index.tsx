import { useEffect, useRef, useState } from "react";
import { ConsumerInterface } from "src/Interfaces/ConsumerInterface";
import {
  deleteConsumerService,
  getConsumersListService,
} from "src/services/consumers";
import { getConsumersInDbService } from "src/services/records";
import Space from "antd/lib/space";
import Button from "antd/lib/button";
import Popconfirm from "antd/lib/popconfirm";
import Table from "antd/lib/table";
import type { ColumnsType } from "antd/es/table";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import EditConsumer from "./EditConsumer";
import notification from "antd/lib/notification";
import CreateConsumer from "./CreateConsumer";
import { Col, Row, Card, Alert } from "antd";
import { ApiOutlined } from "@ant-design/icons";

const Consumers = (): React.ReactElement => {
  const [loading, setLoading] = useState(true);
  const [consumers, setConsumers] = useState<ConsumerInterface[]>([]);

  const consumersInDb = useRef<string[]>([]);

  const [consumersDiff, setConsumersDiff] = useState<string[]>([]);

  const editConsumer = useRef<ConsumerInterface>();
  const createConsumer = useRef<ConsumerInterface>();

  const [editDrawerVisible, setEditDrawerVisible] = useState(false);

  const [createConsumerDrawerVisible, setCreateConsumerDrawerVisible] =
    useState(false);

  const [deleteConsumerLoading, setDeleteConsumerLoading] = useState(false);

  // Load the consumers on page load
  useEffect(() => {
    fetchConsumers();
  }, []);

  const fetchConsumers = async () => {
    try {
      setLoading(true);
      let resConsumersList = await getConsumersListService();

      // Remove consumer "all" from the list
      resConsumersList = resConsumersList.filter(
        (consumer) => consumer.id !== "all"
      );

      // Add a key to each consumer
      resConsumersList = resConsumersList.map((consumer) => ({
        ...consumer,
        key: consumer.id,
      }));

      // Sort the consumers by id
      resConsumersList = resConsumersList.sort((a, b) => {
        return a.id.localeCompare(b.id);
      });

      setConsumers(resConsumersList);

      let resConsumersInDb = await getConsumersInDbService();

      consumersInDb.current = resConsumersInDb.consumersInDb ?? [];

      // Find the consumers that are in the database but not in the list
      let consumersDiff = consumersInDb.current.filter(
        (consumerId) =>
          !resConsumersList.some((consumer) => consumer.id === consumerId)
      );

      setConsumersDiff(consumersDiff);
    } catch (err) {
      console.log("Error while fetching consumers", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (consumer: ConsumerInterface) => {
    // setEditConsumer(consumer);
    editConsumer.current = consumer;
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
      title: "Data source",
      dataIndex: "dataSource",
      key: "dataSource",
      // Responsive, show on bigger devices
      responsive: ["xl", "xxl"],
      render: (text, record: ConsumerInterface) => {
        return record.dataSource || "Not specified";
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
      {/* Modals */}
      <EditConsumer
        fetchConsumers={fetchConsumers}
        editConsumer={editConsumer.current}
        editDrawerVisible={editDrawerVisible}
        setEditDrawerVisible={setEditDrawerVisible}
      />
      <CreateConsumer
        fetchConsumers={fetchConsumers}
        createConsumer={createConsumer.current}
        createConsumerDrawerVisible={createConsumerDrawerVisible}
        setCreateConsumerDrawerVisible={setCreateConsumerDrawerVisible}
      />

      <h2>Consumers</h2>
      <Table
        loading={loading}
        columns={consumerColumns}
        dataSource={consumers}
      />

      {consumersDiff.length > 0 && (
        <>
          <h3>Consumers IDs detected in the database</h3>
          <Row>
            <Col span={24}>
              <Alert
                message={
                  "These following consumers IDs have been found in the database records which are not yet added in the LRS system. Click on it to add it"
                }
                type="info"
              />
              <br />

              <Card loading={loading}>
                {consumersDiff.map((consumerId) => (
                  <Button
                    id={"id_" + consumerId}
                    key={consumerId}
                    type={"link"}
                    onClick={() => {
                      createConsumer.current = {
                        _id: consumerId ?? "",
                        id: consumerId ?? "",
                        name: "Enter a friendly consumer name",
                        picture: "",
                      };
                      setCreateConsumerDrawerVisible(true);
                    }}
                  >
                    {consumerId}
                  </Button>
                ))}
              </Card>
            </Col>
          </Row>
        </>
      )}

      <p>To create a new consumer click on the following button</p>
      <Button
        type="primary"
        onClick={() => {
          createConsumer.current = null;
          setCreateConsumerDrawerVisible(true);
        }}
      >
        <Space>
          <ApiOutlined />
          Create a new Consumer
        </Space>
      </Button>
    </div>
  );
};

export default Consumers;
