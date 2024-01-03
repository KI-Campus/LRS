import { Button, Card, Col, Row, Space, Spin, Table, Tooltip } from "antd";
import { ReactElement, useEffect, useState } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import {
  getExerciseDetailsService,
  getExerciseSubmissionsOverTimeService,
  getMCQChartService,
  getTrueFalseChartService,
} from "src/services/records";
import { QuestionCircleTwoTone } from "@ant-design/icons";
import { SubmissionsOverTime } from "../../components/SubmissionsOverTime";

import ExerciseEventTypesGraph from "./ExerciseEventTypesGraph";
import ExerciseMCQGraph from "./ExerciseMCQGraph";
import TrueFalseGraph from "./TrueFalseGraph";
import DownloadModal from "src/components/DownloadModal";

import BackButton from "src/components/BackButton";
import { TEXT_ACTORS_COUNT_MISINFORMATION } from "src/utils/constants";
const Exercise = (): ReactElement => {
  // Fetch consumer ID and exercise ID from router : consumer/:consumerId/exercise/:exerciseId

  const location = useLocation();

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

  const [trueFalseChartData, setTrueFalseChartData] = useState<any>();
  const [trueFalseChartDataLoading, setTrueFalseChartDataLoading] =
    useState(true);

  const [downloadModalOpen, setDownloadModalOpen] = useState(false);

  useEffect(() => {
    // @ts-ignore
    fetchExercise(exerciseId, subExerciseId, location?.state?.actor);

    fetchExerciseSubmissionsOverTime(
      exerciseId,
      subExerciseId,
      // @ts-ignore
      location?.state?.actor
    );
    return () => {};
  }, []);

  useEffect(() => {
    if (!exercise) return;
    setExerciseVerbs(exercise.eventTypes);
  }, [exercise]);

  const fetchExercise = async (id: string, subId = null, actor = null) => {
    setExerciseLoading(true);
    let result = getExerciseDetailsService(
      consumerId,
      courseId,
      id,
      subId,
      actor
    );
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

  const fetchExerciseSubmissionsOverTime = async (
    id: string,
    subId = null,
    actor = null
  ) => {
    setExerciseSubmissionsOverTimeLoading(true);
    let result = getExerciseSubmissionsOverTimeService(
      consumerId,
      courseId,
      id,
      subId,
      actor
    );
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

  const fetchMCQChartData = (id: string, subId = null, actor = null) => {
    setMcqChartLoading(true);
    let result = getMCQChartService(consumerId, courseId, id, subId, actor);
    result
      .then((res) => {
        setMcqChartData(res);
        setMcqChartCorrectResponse(res.correctResponsesPattern?.split("[,]"));
        setMcqChartLoading(false);
      })
      .catch((err) => {
        console.log("Error while loading MCQ chart data", err);
        setMcqChartLoading(false);
      });
  };

  const fetchTrueFalseChartData = (id: string, subId = null, actor = null) => {
    setTrueFalseChartDataLoading(true);
    let result = getTrueFalseChartService(
      consumerId,
      courseId,
      id,
      subId,
      actor
    );
    result
      .then((res) => {
        setTrueFalseChartDataLoading(false);
        setTrueFalseChartData(res);
      })
      .catch((err) => {
        setTrueFalseChartDataLoading(false);
        console.log("Error while loading True False Chart Data", err);
      });
  };

  useEffect(() => {
    if (!exercise) return;
    if (
      String(exercise?.type).search(
        "http://h5p.org/libraries/H5P.MultiChoice"
      ) !== -1
    ) {
      // @ts-ignore
      fetchMCQChartData(exerciseId, subExerciseId, location?.state?.actor);
    }

    if (
      String(exercise?.type).search(
        "http://h5p.org/libraries/H5P.TrueFalse"
      ) !== -1
    ) {
      // @ts-ignore
      fetchTrueFalseChartData(
        exerciseId,
        subExerciseId,
        // @ts-ignore
        location?.state?.actor
      );
    }
  }, [exercise]);

  // Add isCorrect property to each choice when correct MCQ response is available
  useEffect(() => {
    if (mcqChartCorrectResponse && mcqChartData) {
      let mcqDataCompleteData = mcqChartData;
      // Iterate over the mcqDataCompleteData
      for (let i = 0; i < mcqDataCompleteData.choices.length; i++) {
        // Current item
        let item = mcqDataCompleteData.choices[i];
        if (mcqChartCorrectResponse.includes(String(i))) {
          item.isCorrect = true;
        } else {
          item.isCorrect = false;
        }
      }
      setMcqChartData(mcqDataCompleteData);
    }
  }, [mcqChartCorrectResponse, mcqChartData, mcqChartLoading]);

  const childExercisesTableColumns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (text: string, record: any) => (
        <Link
          to={{
            state: {
              // @ts-ignore
              actor: location?.state?.actor ? location?.state?.actor : null,
            },
            pathname: `../../../../../consumer/${consumerId}/course/${courseId}/exercise/${record.parentId}/sub/${record.childId}`,
          }}
        >
          {text ?? "N/A"}
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
      title: "Child Exercise ID",
      dataIndex: "childId",
      key: "childId",
    },
  ];

  return (
    <>
      <Row>
        <Col span={18}>
          <h2>
            <Space>
              <BackButton />
              Exercise Details
            </Space>
          </h2>
        </Col>
        <Col span={6} style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button onClick={() => setDownloadModalOpen(true)}>Download</Button>
        </Col>
      </Row>
      <DownloadModal
        consumer={consumerId}
        course={courseId}
        exercise={exerciseId}
        ignoreSubExercises={0}
        includeSimplifyRecords={0}
        includeRAWRecords={1}
        isConsumerSelected={false}
        isCourseSelected={false}
        isExerciseSelected={true}
        selectedText={exercise?.title ?? ""}
        isOpen={downloadModalOpen}
        modalCloserFunction={setDownloadModalOpen}
        // @ts-ignore
        actor={location?.state?.actor ? location?.state?.actor : null}
      />

      {exerciseLoading ? (
        <Spin>Loading</Spin>
      ) : (
        <>
          <div className="site-card-wrapper">
            <Row gutter={[24, 24]}>
              <Col xs={24} xl={8} span={8}>
                <Card loading={exerciseLoading} title={"Exercise Title"}>
                  <Tooltip
                    title={"Complete Exercise ID in xAPI: " + exercise._id}
                  >
                    <Space>
                      {exercise?.title || "N/A"}
                      <QuestionCircleTwoTone style={{ cursor: "pointer" }} />
                    </Space>
                  </Tooltip>
                </Card>
              </Col>
              {exercise?.type && (
                <Col xs={24} sm={24} md={24} lg={24} xl={8} span={8}>
                  <Card loading={exerciseLoading} title={"Type"}>
                    <Tooltip
                      title={
                        "Complete Exercise Type in xAPI: " + exercise?.type
                      }
                    >
                      <Space>
                        {String(exercise?.type)
                          ?.split("/")
                          ?.pop()
                          ?.split("-")[0] || "N/A"}
                        <QuestionCircleTwoTone style={{ cursor: "pointer" }} />
                      </Space>
                    </Tooltip>
                  </Card>
                </Col>
              )}
              <Col xs={0} xl={8} span={8}>
                <Card
                  loading={exerciseLoading}
                  title={isSubExercise ? "Parent ID" : "ID"}
                >
                  <Space>
                    {isSubExercise ? (
                      <Link
                        to={{
                          state: {
                            // @ts-ignore
                            actor: location?.state?.actor
                              ? // @ts-ignore
                                location?.state?.actor
                              : null,
                          },
                          pathname: `/consumer/${consumerId}/course/${courseId}/exercise/${
                            exercise?._id.split("?subContentId=")[0]
                          }`,
                        }}
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
                <Col span={6}>
                  <Card loading={exerciseLoading} title={"Exercise ID"}>
                    <Space>{isSubExercise ? subExerciseId : "N/A"}</Space>
                  </Card>
                </Col>
              )}
            </Row>
            <br />

            <Row gutter={[24, 24]}>
              {/* DISABLING TOTAL RECORDS TO OPTIMIZE PERFORMANCE */}
              {/* <Col sm={24} lg={8} span={8}>
                <Card loading={exerciseLoading} title="Total Records">
                  {exercise?.totalRecords}
                </Card>
              </Col> */}
              {/* DISABLING ATTEMPTED TO OPTIMIZE PERFORMANCE */}
              {/* <Col sm={24} lg={8} span={8}>
                <Card loading={exerciseLoading} title="Attempted">
                  {exercise?.attempted ?? "0"}
                </Card>
              </Col> */}
              <Col sm={24} lg={8} span={8}>
                <Card loading={exerciseLoading} title="Total Submissions">
                  {exercise?.totalSubmissions ?? "0"}
                </Card>
              </Col>
            </Row>
            <br />

            <Row gutter={[24, 24]}>
              <Col sm={24} lg={8} span={8}>
                <Card
                  loading={exerciseLoading}
                  title="Number of times Exercise Passed"
                >
                  {exercise?.totalPassingEvents ?? "0"}
                </Card>
              </Col>

              {exercise?.averageScore && (
                <Col sm={24} lg={8} span={8}>
                  <Card
                    loading={exerciseLoading}
                    title="Average Score (max 1.0)"
                  >
                    {(exercise?.averageScore?.toFixed(2) ?? "N/A") +
                      " out of " +
                      exercise?.averageScoreOutOf}
                  </Card>
                </Col>
              )}
            </Row>
            <br />
            <Row gutter={[24, 24]}>
              {
                // @ts-ignore
                location?.state?.actor && (
                  <Col sm={24} lg={8} span={8}>
                    <Card loading={exerciseLoading} title="Selected Student">
                      {
                        // @ts-ignore
                        location?.state?.actor
                      }
                    </Card>
                  </Col>
                )
              }
              {
                // @ts-ignore
                exercise?.totalActorsCount && !location?.state?.actor && (
                  <Col sm={24} lg={8} span={8}>
                    <Card
                      loading={exerciseLoading}
                      title="Students (Unique Users)"
                    >
                      <Space>
                        {exercise?.totalActorsCount ?? "0"}
                        <Tooltip title={TEXT_ACTORS_COUNT_MISINFORMATION}>
                          <QuestionCircleTwoTone
                            style={{ cursor: "pointer" }}
                          />
                        </Tooltip>
                      </Space>
                    </Card>
                  </Col>
                )
              }
              {
                // @ts-ignore
                exercise?.totalActorsCompletedCount &&
                  // @ts-ignore
                  !location?.state?.actor && (
                    <Col sm={24} lg={8} span={8}>
                      <Card
                        loading={exerciseLoading}
                        title="Students who completed the exercise"
                      >
                        <Space>
                          {exercise?.totalActorsCompletedCount ?? "0"}
                          <Tooltip title={TEXT_ACTORS_COUNT_MISINFORMATION}>
                            <QuestionCircleTwoTone
                              style={{ cursor: "pointer" }}
                            />
                          </Tooltip>
                        </Space>
                      </Card>
                    </Col>
                  )
              }
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
            {String(exercise?.type)?.search("H5P.TrueFalse") > 0 &&
              trueFalseChartData?.length > 0 && (
                <Row>
                  <Col span={6}>
                    <div className="shadow-bordered">
                      <Card
                        loading={exerciseLoading}
                        title={"True False Chart"}
                      >
                        <TrueFalseGraph
                          data={trueFalseChartData}
                          loading={exerciseLoading}
                        />
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
                      <h6>
                        {mcqChartCorrectResponse && <hr /> &&
                          "* Correct choices are in bold font"}
                      </h6>
                    </Card>
                  </div>
                </Col>
              </Row>
            )}
            <br />
            <Row gutter={[24, 24]}>
              {exercise?.totalSubmissions > 0 && (
                <Col sm={24} lg={12} span={12}>
                  <div className="shadow-bordered">
                    <SubmissionsOverTime
                      loading={exerciseSubmissionsOverTimeLoading}
                      data={exerciseSubmissionsOverTime}
                    />
                  </div>
                </Col>
              )}
              <Col sm={24} lg={12} span={12}>
                <div className="shadow-bordered">
                  {exerciseVerbs && (
                    <ExerciseEventTypesGraph
                      loading={exerciseLoading}
                      data={exerciseVerbs}
                      title={"Exercise Event Types"}
                    />
                  )}
                  <Row>
                    {/* List all the verbs that are used in the exercise */}
                    {exerciseVerbs &&
                      exerciseVerbs.map((verb, index) => (
                        <div
                          style={{ margin: "10px", fontSize: "9px" }}
                          key={index}
                        >
                          <Space>
                            <a href={verb.title} target="_blank">
                              {verb.title}
                            </a>
                          </Space>
                        </div>
                      ))}
                  </Row>
                </div>
              </Col>
            </Row>
            <br />
            <br />
            {exercise.childExercises.length > 0 && (
              <Row gutter={[24, 24]}>
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
                <Row gutter={[24, 24]}>
                  <Col sm={24} span={12}>
                    <div className="shadow-bordered">
                      <ExerciseMCQGraph
                        loading={mcqChartLoading}
                        data={mcqChartData?.choices}
                        title={"MCQ Chart Choices Count"}
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
