import { useEffect, useState } from "react";
import Button from "antd/lib/button";
import Popconfirm from "antd/lib/popconfirm";
import Space from "antd/lib/space";
import Table from "antd/lib/table";
import type { ColumnsType } from "antd/es/table";
import Tag from "antd/lib/tag";
import notification from "antd/lib/notification";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { ConsumerInterface } from "src/Interfaces/ConsumerInterface";
import { UserInterface } from "src/Interfaces/UserInterface";
import { getConsumersListService } from "src/services/consumers";
import { deleteUserService, getUsersListService } from "src/services/users";
import CreateUser from "./CreateUser";
import EditUser from "./EditUser";
import { Col, Row, Tooltip } from "antd";
import { getAllCoursesAdminService } from "src/services/courses";
import { DefaultOptionType } from "antd/lib/select";

const Users = (): React.ReactElement => {
  const [usersLoading, setUsersLoading] = useState(true);
  const [users, setUsers] = useState<UserInterface[]>([]);

  const [editUser, setEditUser] = useState<UserInterface>();
  const [editDrawerVisible, setEditDrawerVisible] = useState(false);

  const [consumersLoading, setConsumersLoading] = useState(true);
  const [consumers, setConsumers] = useState<ConsumerInterface[]>([]);

  const [deleteUserLoading, setDeleteUserLoading] = useState(false);

  const [courses, setCourses] = useState<Omit<DefaultOptionType, "label">[]>([
    // { id: "kic", pId: 0, value: "kic", title: "Kic" },
    // {
    //   id: "kic_courseId_course1",
    //   pId: "kic",
    //   value: "kic_courseId_course1",
    //   title: "Course 1",
    //   isLeaf: true,
    // },
    // {
    //   id: "kic_courseId_course2",
    //   pId: "kic",
    //   value: "kic_courseId_course2",
    //   title: "Course 2",
    //   isLeaf: true,
    // },
    // {
    //   id: "kic_courseId_*",
    //   pId: "kic",
    //   value: "kic_courseId_*",
    //   title: "All courses",
    //   isLeaf: true,
    // },
  ]);

  const [coursesLoading, setCoursesLoading] = useState(true);

  // Load the consumers & courses on page load
  useEffect(() => {
    fetchConsumers();
  }, []);

  // Only when consumers are loaded, then load the users
  useEffect(() => {
    fetchUsers();
    fetchCourses();
  }, [consumers]);

  const fetchUsers = () => {
    setUsersLoading(true);
    let ret = getUsersListService();
    ret
      .then((res) => {
        // Add a key to each user
        res = res.map((user) => {
          user.key = user.id;
          return user;
        });
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

  const helperFunctionConsumerIDToName = (consumerId: string) => {
    let consumerName = consumerId;
    // Loop through consumers array object
    for (let i = 0; i < consumers.length; i++) {
      if (consumers[i].id === consumerId) {
        console.log(
          "Matched consumer name",
          consumers[i].name,
          "for consumerId",
          consumerId
        );
        consumerName = consumers[i].name;
      }
    }
    return consumerName;
  };

  // This function calls the getAllCoursesAdminService and then creates the courses tree data for the tree select component
  const fetchCourses = async () => {
    setCoursesLoading(true);
    let coursesTreeData = await getAllCoursesAdminService();

    let coursesTreeSelectData = [];
    // Loop through the courses and add the courses to the tree data
    coursesTreeData.forEach((item, index) => {
      let course = {
        id: `${item.consumer}`,
        pId: index,
        value: `${item.consumer}`,
        // title: `${item.consumer.toUpperCase()}`,
        title: `${helperFunctionConsumerIDToName(item.consumer)}`,
        isLeaf: false,
      };
      coursesTreeSelectData.push(course);

      // Now add the courses of the consumer
      item.courses.forEach((courseItem) => {
        let course = {
          id: `${item.consumer}_courseId_${courseItem.id}`,
          pId: `${item.consumer}`,
          value: `${item.consumer}_courseId_${courseItem.id}`,
          title: `${
            helperFunctionConsumerIDToName(item.consumer) + ": " + courseItem.id
          }`,
          isLeaf: true,
        };
        coursesTreeSelectData.push(course);
      });

      // Add the all courses option
      let allCourses = {
        id: `${item.consumer}_courseId_*`,
        pId: `${item.consumer}`,
        value: `${item.consumer}_courseId_*`,
        title: `${
          helperFunctionConsumerIDToName(item.consumer) +
          ": All current and future courses"
        }`,
        isLeaf: true,
      };

      coursesTreeSelectData.push(allCourses);
    });

    // Finally set the useState
    setCourses(coursesTreeSelectData);

    setCoursesLoading(false);
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

  const userColumns: ColumnsType<UserInterface> = [
    {
      title: "#",
      key: "no",
      // Responsive, show on bigger devices
      responsive: ["xxl"],
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
      // Responsive, don't show on devices smaller than xl
      responsive: ["xl", "xxl"],
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
      title: "Courses Access List",
      dataIndex: "coursesAccess",
      key: "coursesAccessList",
      // Responsive, show on bigger devices
      responsive: ["xxl"],
      render: (text, record: UserInterface) => {
        let coursesAccess = record.coursesAccess;

        // From coursesAccess array of strings remove "_courseId_" in the middle and replace it with " - "
        // Also change consumer to its consumer name
        coursesAccess = coursesAccess?.map((item: string) => {
          if (item.includes("_courseId_")) {
            // Get the consumer name
            let consumerName = item.split("_")[0];
            let courseId = item.split("_courseId_")[1];
            consumerName = helperFunctionConsumerIDToName(consumerName);
            return consumerName + " - " + courseId;
          } else {
            return item;
          }
        });

        if (record.role === "admin") {
          return <div>Admin has access to all courses </div>;
        } else {
          return (
            <Space size="small">
              {/* Check if coursesAccess item length is < 2 then render tags, otherwise render only 2 and tooltip to display all */}
              {coursesAccess?.length < 2 ? (
                coursesAccess?.map((item: string) => (
                  <Tag color="blue" key={item}>
                    {/* {
                      consumers.filter(
                        (consumer: ConsumerInterface) => consumer.id === item
                      )[0]?.name
                    } */}
                    {item}
                  </Tag>
                ))
              ) : (
                <Tooltip title={coursesAccess.join("\n")}>
                  <Tag color="blue" key={coursesAccess[0]}>
                    {coursesAccess[0]} and {coursesAccess.length - 1} more
                  </Tag>
                </Tooltip>
              )}
            </Space>
          );
        }
      },
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      // Responsive, show on bigger devices
      responsive: ["xxl"],
      render: (text, record: UserInterface) => {
        return new Date(record.createdAt).toLocaleString();
      },
    },
    {
      title: "Last Login",
      dataIndex: "lastLogin",
      key: "lastLogin",
      // Responsive, show on bigger devices
      responsive: ["xl", "xxl"],
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
          </Col>
        </Row>
      ),
    },
  ];

  return (
    <div>
      <h2>Users</h2>
      <Table loading={usersLoading} columns={userColumns} dataSource={users} />
      <EditUser
        visible={editDrawerVisible}
        editUser={editUser}
        fetchUsers={fetchUsers}
        consumers={consumers}
        courses={courses}
        editDrawerVisible={editDrawerVisible}
        setEditDrawerVisible={setEditDrawerVisible}
      />
      <CreateUser
        consumers={consumers}
        fetchUsers={fetchUsers}
        courses={courses}
      />
    </div>
  );
};

export default Users;
