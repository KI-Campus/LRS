import { Card, Col, Row, Space, Spin, Table, Tooltip } from "antd";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  getExerciseDetailsService,
  getExerciseSubmissionsOverTimeService,
  getMCQChartService,
} from "src/services/records";
import { QuestionCircleTwoTone } from "@ant-design/icons";
import { SubmissionsOverTime } from "../../components/SubmissionsOverTime";
import { BarGraph } from "../../components/BarGraph";

const Exercise = (): React.ReactElement => {
  // Fetch consumer ID and exercise ID from router : consumer/:consumerId/exercise/:exerciseId

  // @ts-ignore
  const { exerciseId, subExerciseId } = useParams();
  // @ts-ignore
  const { consumerId, courseId } = useParams();
  const [exercise, setExercise] = useState<any>({});
  const [exerciseLoading, setExerciseLoading] = useState(true);
  const [exerciseSubmissionsOverTime, setExerciseSubmissionsOverTime] =
    useState<any>([]);
  const [
    exerciseSubmissionsOverTimeLoading,
    setExerciseSubmissionsOverTimeLoading,
  ] = useState(true);

  const [exerciseVerbs, setExerciseVerbs] = useState<any>([]);

  const [isSubExercise, setIsSubExercise] = useState(
    subExerciseId ? true : false
  );

  const [mcqChartLoading, setMcqChartLoading] = useState(true);
  const [mcqChartData, setMcqChartData] = useState<any>();
  const [mcqChartCorrectResponse, setMcqChartCorrectResponse] = useState<any>();

  useEffect(() => {
    fetchExercise(exerciseId, subExerciseId);
    fetchExerciseSubmissionsOverTime(exerciseId, subExerciseId);
    return () => {};
  }, []);

  useEffect(() => {
    if (!exercise) return;
    setExerciseVerbs(exercise.eventTypes);
  }, [exercise]);

  const fetchExercise = async (id: string, subId = null) => {
    setExerciseLoading(true);
    let result = getExerciseDetailsService(id, subId);
    result
      .then((res) => {
        setExercise(res);
        setExerciseLoading(false);
      })
      .catch((err) => {
        console.log("Error while loading exercise details", err);
        setExerciseLoading(false);
      });
  };

  const fetchExerciseSubmissionsOverTime = async (id: string, subId = null) => {
    setExerciseSubmissionsOverTimeLoading(true);
    let result = getExerciseSubmissionsOverTimeService(id, subId);
    result
      .then((res) => {
        setExerciseSubmissionsOverTime(res);
        setExerciseSubmissionsOverTimeLoading(false);
      })
      .catch((err) => {
        console.log("Error while loading exercise submissions over time", err);
        setExerciseSubmissionsOverTimeLoading(false);
      });
  };

  const fetchMCQChartData = (id: string, subId = null) => {
    setMcqChartLoading(true);
    let result = getMCQChartService(id, subId);
    result
      .then((res) => {
        setMcqChartData(res);
        setMcqChartCorrectResponse(res.correctResponsesPattern.split("[,]"));
        setMcqChartLoading(false);
      })
      .catch((err) => {
        console.log("Error while loading exercise submissions over time", err);
        setMcqChartLoading(false);
      });
  };

  useEffect(() => {
    if (!exercise) return;
    if (
      String(exercise?.type).search(
        "http://h5p.org/libraries/H5P.MultiChoice"
      ) !== -1
    ) {
      fetchMCQChartData(exerciseId, subExerciseId);
    }
  }, [exercise]);

  const childExercisesTableColumns = [
    {
      title: "Child Exercise ID",
      dataIndex: "childId",
      key: "childId",
      render: (text: string, record: any) => (
        <Link
          to={`../../../../../consumer/${consumerId}/course/${courseId}/exercise/${record.parentId}/sub/${record.childId}`}
        >
          {text}
        </Link>
      ),
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (text) => {
        return text ?? "N/A";
      },
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (text) => {
        return text ?? "N/A";
      },
    },
  ];

  return (
    <>
      <h2>Exercise Details</h2>

      {exerciseLoading ? (
        <Spin>Loading</Spin>
      ) : (
        <>
          <div className="site-card-wrapper">
            <Row gutter={16}>
              <Col span={8}>
                <Card loading={exerciseLoading} title={"Exercise Title"}>
                  <Tooltip title={"Exercise ID: " + exercise._id}>
                    <Space>
                      {exercise?.title || "N/A"}
                      <QuestionCircleTwoTone />
                    </Space>
                  </Tooltip>
                </Card>
              </Col>
              {exercise?.type && (
                <Col span={6}>
                  <Card loading={exerciseLoading} title={"Exercise Type"}>
                    <Space>{exercise?.type || "N/A"}</Space>
                  </Card>
                </Col>
              )}
              <Col span={4}>
                <Card
                  loading={exerciseLoading}
                  title={isSubExercise ? "Parent Exercise ID" : "Exercise ID"}
                >
                  <Space>
                    {isSubExercise ? (
                      <Link
                        to={`/consumer/${consumerId}/course/${courseId}/exercise/${
                          exercise?._id.split("?subContentId=")[0]
                        }`}
                      >
                        {exercise?._id.split("?subContentId=")[0]}
                      </Link>
                    ) : (
                      exercise?._id
                    )}
                  </Space>
                </Card>
              </Col>
              {isSubExercise && (
                <Col span={4}>
                  <Card loading={exerciseLoading} title={"Exercise ID"}>
                    <Space>{isSubExercise ? subExerciseId : "N/A"}</Space>
                  </Card>
                </Col>
              )}
            </Row>
            <br />
            <Row gutter={16}>
              <Col span={4}>
                <Card loading={exerciseLoading} title="Total Records">
                  {exercise?.totalRecords}
                </Card>
              </Col>
              <Col span={4}>
                <Card loading={exerciseLoading} title="Attempted">
                  {exercise?.attempted ?? "0"}
                </Card>
              </Col>
              <Col span={4}>
                <Card loading={exerciseLoading} title="Total Interactions">
                  {exercise?.totalInteractions ?? "0"}
                </Card>
              </Col>
              <Col span={4}>
                <Card loading={exerciseLoading} title="Total Submissions">
                  {exercise?.totalSubmissions ?? "0"}
                </Card>
              </Col>
              <Col span={4}>
                <Card
                  loading={exerciseLoading}
                  title="Number of times Exercise Passed"
                >
                  {exercise?.totalPassingEvents ?? "0"}
                </Card>
              </Col>

              {exercise?.averageScore && (
                <Col span={4}>
                  <Card loading={exerciseLoading} title="Average Score">
                    {exercise?.averageScore?.toFixed(2) ?? "N/A"}
                  </Card>
                </Col>
              )}
            </Row>
            <br />
            {exercise?.question && (
              <Row>
                <Col span={24}>
                  <div className="shadow-bordered">
                    <Card loading={exerciseLoading} title={"Exercise Question"}>
                      {exercise?.question || "N/A"}
                    </Card>
                  </div>
                </Col>
              </Row>
            )}
            <br />
            {exercise?.choices && exercise?.choices.length > 0 && (
              <Row>
                <Col span={24}>
                  <div className="shadow-bordered">
                    <Card loading={exerciseLoading} title={"Exercise Choices"}>
                      {exercise?.choices?.map((choice, index) => (
                        <div key={index}>
                          {mcqChartCorrectResponse?.includes(choice.key) ? (
                            <strong>
                              <Space>{choice.key + ": " + choice._id}</Space>
                            </strong>
                          ) : (
                            <Space>{choice.key + ": " + choice._id}</Space>
                          )}
                        </div>
                      ))}
                    </Card>
                  </div>
                </Col>
              </Row>
            )}
            <br />
            <Row gutter={16}>
              {exercise?.totalSubmissions > 0 && (
                <Col span={12}>
                  <div className="shadow-bordered">
                    <SubmissionsOverTime
                      loading={exerciseSubmissionsOverTimeLoading}
                      data={exerciseSubmissionsOverTime}
                    />
                  </div>
                </Col>
              )}
              <Col span={12}>
                <div className="shadow-bordered">
                  {exerciseVerbs && (
                    <BarGraph
                      loading={exerciseLoading}
                      data={exerciseVerbs}
                      title={"Exercise Event Types"}
                    />
                  )}
                </div>
              </Col>
            </Row>
            <br />
            <br />
            {exercise.childExercises.length > 0 && (
              <Row gutter={16}>
                <Col span={24}>
                  <Table
                    rowKey={(record) => record._id}
                    loading={exerciseLoading}
                    dataSource={exercise.childExercises}
                    columns={childExercisesTableColumns}
                  />
                </Col>
              </Row>
            )}
            <br />
            {mcqChartData?.choices?.length > 0 &&
              mcqChartData?.choices?.some((choice) => choice.count > 0) && (
                <Row gutter={16}>
                  <Col span={12}>
                    <div className="shadow-bordered">
                      <BarGraph
                        loading={mcqChartLoading}
                        data={mcqChartData?.choices}
                        title={"MCQ Chart Choices Count"}
                        labelField="key"
                      />
                    </div>
                  </Col>
                </Row>
              )}
          </div>
        </>
      )}
    </>
  );
};

export default Exercise;
