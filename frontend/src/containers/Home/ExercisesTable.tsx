import { Button, Space, Table, message, Checkbox } from "antd";
import notification from "antd/lib/notification";
import { ReactElement, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getExercisesListService, downloadService } from "src/services/records";

export function ExercisesTable(props): ReactElement {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const [selectedExercise, setSelectedExercise] = useState("");
  const [ignoreSubExercises, setIgnoreSubExercises] = useState(true);

  const fetchExercises = async (currentPage, pageSize) => {
    setLoading(true);
    let result = getExercisesListService(
      props.consumerId,
      props.courseId,
      currentPage,
      pageSize,
      ignoreSubExercises
    );
    result
      .then((res) => {
        setTotal(res.pagination.total);
        setData(res.result);
        setLoading(false);
      })
      .catch((err) => {
        console.log("Error while fetching list of exercises", err);
        setLoading(false);
      });
  };

  const handleTableChange = (pagination) => {
    setPage(pagination.current);
    setPageSize(pagination.pageSize);
    fetchExercises(pagination.current, pagination.pageSize);
  };

  const onExerciseDownload = (exercise) => {
    let messageReturn = message.loading({ content: "Downloading exercise..." });

    downloadService(props.consumer, props.course, exercise._id)
      .then((res) => {
        const file = new Blob([JSON.stringify(res)], {
          type: "application/json",
        });
        const fileURL = URL.createObjectURL(file);
        const link = document.createElement("a");
        link.href = fileURL;
        link.setAttribute("download", exercise.title + ".json");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        messageReturn();
        message.success({
          content: "Exercise Downloaded Successfully!",
          duration: 1,
        });
      })
      .catch((err) => {
        console.log("Error while downloading exercise", err);
        message.error({
          content: "Error downloading",
          duration: 2,
        });
      });
  };

  useEffect(() => {
    fetchExercises(page, pageSize);
  }, [props.courseId, props.consumerId, ignoreSubExercises]);

  const columns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (text, record) =>
        record._id.search("subContentId") > -1 ? (
          <Link
            to={`consumer/${props.consumerId}/course/${
              props.courseId
            }/exercise/${record._id.split("?subContentId=")[0]}/sub/${
              record._id.split("?subContentId=")[1]
            }`}
          >
            {record.title}
          </Link>
        ) : (
          <Link
            to={`consumer/${props.consumerId}/course/${props.courseId}/exercise/${record._id}`}
          >
            {record.title}
          </Link>
        ),
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (text) => {
        if (!text) return "N/A";
        if (!text[0]) return "N/A";
        // Convert http://h5p.org/libraries/H5P.LibraryName-versionNumber to LibraryName versionNumber
        let label = text[0];
        if (label.includes("http://h5p.org/libraries/")) {
          return label.split("http://h5p.org/libraries/")[1];
        }
        return text ?? "N/A";
      },
    },
    {
      title: "Total Submissions",
      dataIndex: "totalSubmissions",
      key: "totalSubmissions",
      render: (text, record) => {
        return record.totalSubmissions > 0 ? text : "0";
      },
    },
    {
      title: "Average Score",
      dataIndex: "averageScore",
      key: "averageScore",
      render: (text, record) => {
        return record?.averageScore?.toFixed(2) ?? "N/A";
      },
    },
    {
      title: "Exercise ID",
      dataIndex: "_id",
      key: "_id",
    },
    {
      title: "Actions",
      key: "actions",
      render: (text: any, record: any) => (
        <Space size="middle">
          <Button
            onClick={() => {
              onExerciseDownload(record);
            }}
          >
            Download
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <h3>List of Exercises</h3>

      <h5>Total Exercises {total}</h5>
      <Checkbox
        style={{ display: "none" }}
        defaultChecked={ignoreSubExercises}
        onChange={(e) => {
          setIgnoreSubExercises(e.target.checked);
        }}
      >
        Ignore Sub-Exercises
      </Checkbox>
      <br />

      <Table
        rowKey={(record) => record._id}
        loading={loading}
        dataSource={data}
        columns={columns}
        pagination={{
          current: page,
          pageSize: pageSize,
          total: total,
        }}
        onChange={handleTableChange}
      />
    </>
  );
}
