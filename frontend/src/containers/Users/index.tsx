import { useEffect, useState } from "react";
import Button from "antd/lib/button";
import Popconfirm from "antd/lib/popconfirm";
import Space from "antd/lib/space";
import Table from "antd/lib/table";
import Tag from "antd/lib/tag";
import notification from "antd/lib/notification";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { ConsumerInterface } from "src/Interfaces/ConsumerInterface";
import { UserInterface } from "src/Interfaces/UserInterface";
import { getConsumersListService } from "src/services/consumers";
import { deleteUserService, getUsersListService } from "src/services/users";
import CreateUser from "./CreateUser";
import EditUser from "./EditUser";

const Users = (): React.ReactElement => {
  const [usersLoading, setUsersLoading] = useState(true);
  const [users, setUsers] = useState<UserInterface[]>([]);

  const [editUser, setEditUser] = useState<UserInterface>();
  const [editDrawerVisible, setEditDrawerVisible] = useState(false);

  const [consumersLoading, setConsumersLoading] = useState(true);
  const [consumers, setConsumers] = useState<ConsumerInterface[]>([]);

  const [deleteUserLoading, setDeleteUserLoading] = useState(false);

  // Load the consumers on page load
  useEffect(() => {
    fetchConsumers();
  }, []);

  // Only when consumers are loaded, then load the users
  useEffect(() => {
    fetchUsers();
  }, [consumers]);

  const fetchUsers = () => {
    setUsersLoading(true);
    let ret = getUsersListService();
    ret
      .then((res) => {
        setUsers(res);
        setUsersLoading(false);
      })
      .catch((err) => {
        console.log("Error while fetching users", err);
        setUsersLoading(false);
      });
  };

  const fetchConsumers = () => {
    setConsumersLoading(true);
    let ret = getConsumersListService();
    ret
      .then((res) => {
        setConsumers(res);
        setConsumersLoading(false);
      })
      .catch((err) => {
        console.log("Error while fetching consumers", err);
        setConsumersLoading(false);
      });
  };

  const deleteUser = (user: UserInterface, users: UserInterface[]) => {
    // Loop through users and check if the user is the last admin
    let adminCount = 0;
    users.forEach((user: UserInterface) => {
      if (user.role === "admin") {
        adminCount++;
      }
    });

    if (user.role === "admin" && adminCount === 1) {
      notification.error({
        message: "Error",
        description: "Cannot delete the last admin",
      });
      return;
    }

    setUsersLoading(true);
    let ret = deleteUserService(user);
    ret
      .then((res) => {
        notification.success({
          message: "Success",
          description: "User deleted successfully",
        });
        setUsersLoading(false);
        fetchUsers();
      })
      .catch((err) => {
        console.log("Error while deleting user", err);
        setUsersLoading(false);
      });
  };

  const showEditDrawer = () => {
    setEditDrawerVisible(true);
  };

  const handleEditClick = (user: UserInterface) => {
    setEditUser(user);
    showEditDrawer();
  };

  const userColumns = [
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
          {record.firstName + " " + record.lastName}
        </a>
      ),
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (text, record: UserInterface) => (
        <Tag color={record.role === "admin" ? "volcano" : "geekblue"}>
          {record.role?.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Consumers Access List",
      dataIndex: "consumerAccess",
      key: "consumerAccessList",
      render: (text, record: UserInterface) => {
        if (record.role === "admin") {
          return <div>Admin has access to all consumers </div>;
        } else {
          return (
            <Space size="small">
              {record.consumersAccess?.map((item: string) => (
                <Tag color="blue" key={item}>
                  {
                    consumers.filter(
                      (consumer: ConsumerInterface) => consumer.id === item
                    )[0]?.name
                  }
                </Tag>
              ))}
            </Space>
          );
        }
      },
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text, record: UserInterface) => {
        return new Date(record.createdAt).toLocaleString();
      },
    },
    {
      title: "Last Login",
      dataIndex: "lastLogin",
      key: "lastLogin",
      render: (text, record: UserInterface) => {
        return record.lastLogin
          ? new Date(record.lastLogin).toLocaleString()
          : "Never";
      },
    },
    {
      title: "Action",
      key: "action",
      render: (_, record: UserInterface) => (
        <Space size="middle">
          <Button onClick={() => handleEditClick(record)}>
            <Space>
              Edit
              <EditOutlined />
            </Space>
          </Button>
          <Popconfirm
            title={
              "Are you sure to delete " +
              record.firstName +
              " " +
              record.lastName +
              "?"
            }
            onConfirm={() => {
              deleteUser(record, users);
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
      <h2>Users</h2>
      <Table loading={usersLoading} columns={userColumns} dataSource={users} />
      <EditUser
        visible={editDrawerVisible}
        editUser={editUser}
        fetchUsers={fetchUsers}
        consumers={consumers}
        editDrawerVisible={editDrawerVisible}
        setEditDrawerVisible={setEditDrawerVisible}
      />
      <CreateUser consumers={consumers} fetchUsers={fetchUsers} />
    </div>
  );
};

export default Users;
