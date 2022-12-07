import {
  Button,
  Space,
  Table,
  message,
  Checkbox,
  Menu,
  Radio,
  Row,
  Col,
  Input,
} from "antd";
import notification from "antd/lib/notification";
import { ReactElement, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DownloadModal, {
  DownloadModalProps,
} from "src/components/DownloadModal";
import { getExercisesListService, downloadService } from "src/services/records";

export function ExercisesTable(props): ReactElement {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const [selectedExercise, setSelectedExercise] = useState("");
  const [ignoreSubExercises, setIgnoreSubExercises] = useState(true);

  const [downloadModalOpen, setDownloadModalOpen] = useState<boolean>(false);
  const [downloadOptions, setDownloadOptions] = useState<DownloadModalProps>({
    consumer: "",
    course: "",
    exercise: "",
    ignoreSubExercises: 0,
    includeSimplifyRecords: 1,
    includeRAWRecords: 1,
    isConsumerSelected: false,
    isCourseSelected: false,
    isExerciseSelected: false,
    selectedText: "",
    actor: props.actor ?? null,
  });

  const [exerciseTypesFilter, setExerciseTypesFilter] = useState<string[]>([]);
  const [searchText, setSearchText] = useState<string>(undefined);

  const fetchExercises = async (currentPage, pageSize) => {
    setLoading(true);
    let result = getExercisesListService(
      props.consumerId,
      props.courseId,
      currentPage,
      pageSize,
      ignoreSubExercises,
      exerciseTypesFilter,
      searchText,
      props.actor
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
    setDownloadModalOpen(true);
    setDownloadOptions({
      consumer: props.consumerId,
      course: props.courseId,
      exercise: exercise._id,
      ignoreSubExercises: 0,
      includeSimplifyRecords: 0,
      includeRAWRecords: 1,
      isConsumerSelected: false,
      isCourseSelected: false,
      isExerciseSelected: true,
      selectedText:
        "Exercise " + exercise.title + " (ID: " + exercise._id + ")",
      actor: props.actor ?? null,
    });
  };

  useEffect(() => {
    fetchExercises(page, pageSize);
  }, [
    props.courseId,
    props.consumerId,
    ignoreSubExercises,
    exerciseTypesFilter,
    searchText,
    props.actor,
  ]);

  useEffect(() => {
    setSearchText(undefined);
    setExerciseTypesFilter([]);
  }, [props.courseId, props.consumerId]);

  const columns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (text, record) =>
        record._id.search("subContentId") > -1 ? (
          <Link
            to={{
              state: { actor: props.actor },
              pathname: `/consumer/${props.consumerId}/course/${
                props.courseId
              }/exercise/${record._id.split("?subContentId=")[0]}/sub/${
                record._id.split("?subContentId=")[1]
              }`,
            }}
          >
            {record.title}
          </Link>
        ) : (
          <Link
            to={{
              state: { actor: props.actor },
              pathname: `/consumer/${props.consumerId}/course/${props.courseId}/exercise/${record._id}`,
            }}
          >
            {record.title ?? "N/A"}
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
      filteredValue: exerciseTypesFilter,
      filterDropdown: ({ confirm }) => (
        <div>
          <Menu>
            {props.types?.map &&
              props.types?.map((type) => (
                <Menu.Item key={type}>
                  <Checkbox
                    style={{ width: "100%" }}
                    checked={exerciseTypesFilter.includes(type)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setExerciseTypesFilter([...exerciseTypesFilter, type]);
                      } else {
                        setExerciseTypesFilter(
                          exerciseTypesFilter.filter((t) => t !== type)
                        );
                      }
                    }}
                  >
                    {String(type)?.split("http://h5p.org/libraries/")[1]}
                  </Checkbox>
                </Menu.Item>
              ))}
          </Menu>
          <div>
            <Button
              onClick={() => {
                setExerciseTypesFilter([]);
              }}
              style={{
                width: "90%",
                marginTop: 2,
                marginBottom: 8,
                marginLeft: 8,
                marginRight: 8,
              }}
            >
              Reset
            </Button>
          </div>
        </div>
      ),
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
      {searchText && (
        <>
          <Row gutter={20}>
            <Col>
              <h3>Showing search results for: {searchText}</h3>
            </Col>
            <Col>
              <Button
                onClick={() => {
                  setSearchText(undefined);
                }}
                size={"small"}
              >
                Clear
              </Button>
            </Col>
          </Row>
          <br />
        </>
      )}

      {!searchText && (
        <>
          <Row gutter={20}>
            <Col>
              <Input.Search
                placeholder="Search by exercise title or ID"
                onSearch={(value) => {
                  setSearchText(value);
                }}
                enterButton
              />
            </Col>
          </Row>
          <br />
        </>
      )}

      <DownloadModal
        {...downloadOptions}
        isOpen={downloadModalOpen}
        modalCloserFunction={setDownloadModalOpen}
        consumer={props.consumerId}
        course={props.courseId}
        selectedText={downloadOptions.selectedText}
      />

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
