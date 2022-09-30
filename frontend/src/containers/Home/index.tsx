import { GlobalStats } from "./GlobalStats";
import {
  ReactComponentElement,
  ReactElement,
  useEffect,
  useRef,
  useState,
} from "react";
import { useParams, useHistory } from "react-router-dom";
import Select from "antd/lib/select";
import Row from "antd/lib/row";
import Col from "antd/lib/col";
import { Button, Divider, Space, Spin } from "antd";

import { ConsumerInterface } from "src/Interfaces/ConsumerInterface";
import { CourseInterface } from "src/Interfaces/CourseInterface";
import { getConsumersListService } from "src/services/consumers";
import {
  getCourseDetailsService,
  getCourseExerciseTypesCountsService,
  getCoursesListService,
  getCourseSubmissionsOverTimeService,
} from "src/services/courses";
import { getGlobalStatsService } from "src/services/records";
import { CourseStats } from "./CourseStats";
import { SubmissionsOverTime } from "../../components/SubmissionsOverTime";
import { ExercisesTable } from "./ExercisesTable";
import ExerciseTypesGraph from "./ExerciseTypesGraph";
import DownloadModal, {
  DownloadModalProps,
} from "src/components/DownloadModal";

const { Option } = Select;
const Home = (): ReactElement => {
  let history = useHistory();

  // @ts-ignore
  const { consumerId, courseId } = useParams();
  const [globalStatsLoading, setGlobalStatsLoading] = useState(true);
  const [globalStats, setGlobalStats] = useState<any>({});

  const [consumersLoading, setConsumersLoading] = useState(true);
  const [consumers, setConsumers] = useState<ConsumerInterface[]>([]);
  const [selectedConsumer, setSelectedConsumer] = useState<string>("");
  const consumerSelectComponentRef = useRef<any>();

  const [coursesLoading, setCoursesLoading] = useState(true);
  const [courses, setCourses] = useState<CourseInterface[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>(null);
  const [selectedCourseDetails, setSelectedCourseDetails] = useState<any>({});
  const [selectedCourseDetailsLoading, setSelectedCourseDetailsLoading] =
    useState(true);

  const [courseSubmissionsOverTime, setCourseSubmissionsOverTime] =
    useState<any>([]);
  const [
    courseSubmissionsOverTimeLoading,
    setCourseSubmissionsOverTimeLoading,
  ] = useState<boolean>(true);

  const [courseExerciseTypesCountLoading, setCourseExerciseTypesCountLoading] =
    useState<boolean>(true);

  const [courseExerciseTypesCount, setCourseExerciseTypesCount] = useState<any>(
    {}
  );

  const [courseExerciseTypesOnly, setCourseExerciseTypesOnly] =
    useState<string[]>();

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
  });

  const handleConsumerSelect = (value: string) => {
    history.push("/consumer/" + value);
    setSelectedConsumer(value);
  };

  const handleCourseSelect = (value: string) => {
    history.push("/consumer/" + consumerId + "/course/" + value);
    setSelectedCourse(value);
  };

  const fetchCourses = () => {
    let result = getCoursesListService(selectedConsumer);
    result
      .then((res) => {
        setCourses(res);
        setCoursesLoading(false);
        // Select the first course
        if (courseId && consumerId) {
          setSelectedCourse(courseId);
        } else if (!courseId && consumerId) {
          setSelectedCourse(res[0]._id);
        }
      })
      .catch((err) => {
        console.log(err);
        setCoursesLoading(false);
      });
  };

  const fetchGlobalStats = () => {
    setGlobalStatsLoading(true);
    let result = getGlobalStatsService();
    result
      .then((res) => {
        setGlobalStats(res);
        setGlobalStatsLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setGlobalStatsLoading(false);
      });
  };

  const fetchConsumers = () => {
    setConsumersLoading(true);
    let result = getConsumersListService();
    result
      .then((res) => {
        setConsumers(res);
        setConsumersLoading(false);
        // Select the first consumer
        if (consumerId) {
          setSelectedConsumer(consumerId);
        } else {
          setSelectedConsumer(res[0].id);
        }
      })
      .catch((err) => {
        console.log(err);
        setConsumersLoading(false);
      });
  };

  const fetchCourse = () => {
    setSelectedCourseDetailsLoading(true);
    let result = getCourseDetailsService(selectedCourse);
    result
      .then((res) => {
        setSelectedCourseDetails(res[0]);
        setSelectedCourseDetailsLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setSelectedCourseDetailsLoading(false);
      });
  };

  const fetchCourseSubmissionsOverTime = () => {
    setCourseSubmissionsOverTimeLoading(true);
    let result = getCourseSubmissionsOverTimeService(selectedCourse);
    result
      .then((res) => {
        setCourseSubmissionsOverTime(res);
        setCourseSubmissionsOverTimeLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setCourseSubmissionsOverTimeLoading(false);
      });
  };

  const fetchCourseExerciseTypesCount = () => {
    setCourseExerciseTypesCountLoading(true);
    let result = getCourseExerciseTypesCountsService(selectedCourse);
    result
      .then((res) => {
        setCourseExerciseTypesCount(res);
        // Loop through the result and get the exercise types
        let exerciseTypes = [];
        res.forEach((element) => {
          exerciseTypes.push(element._id);
        });

        setCourseExerciseTypesOnly(exerciseTypes);
        setCourseExerciseTypesCountLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setCourseExerciseTypesOnly([]);
        setCourseExerciseTypesCountLoading(false);
      });
  };

  // On load get all consumers, get global stats
  useEffect(() => {
    fetchConsumers();
    fetchGlobalStats();
  }, []);

  // When selected consumer changes
  useEffect(() => {
    setCoursesLoading(true);
    setCourses([]);
    setSelectedCourse(null);
    if (selectedConsumer) {
      // Get all courses for selected consumer
      fetchCourses();
    }
  }, [selectedConsumer]);

  // When selected course changes
  useEffect(() => {
    if (selectedCourse) {
      fetchCourse();
      fetchCourseSubmissionsOverTime();
      fetchCourseExerciseTypesCount();
    }
  }, [selectedCourse]);

  return (
    <div>
      <h2>Welcome to openLRS Dashboard</h2>
      <GlobalStats
        globalStatsLoading={globalStatsLoading}
        globalStats={globalStats}
      />
      <DownloadModal
        {...downloadOptions}
        isOpen={downloadModalOpen}
        modalCloserFunction={setDownloadModalOpen}
        consumer={consumerId}
        course={courseId}
        selectedText={downloadOptions.selectedText}
      />
      <Divider />
      <Row align="bottom">
        <Col span={4}>
          <h3>Select a consumer</h3>
        </Col>
        <Col span={12}>
          <Select
            showSearch
            value={selectedConsumer}
            ref={consumerSelectComponentRef}
            loading={consumersLoading}
            disabled={consumersLoading}
            style={{ width: "100%" }}
            onSelect={handleConsumerSelect}
          >
            {consumers.map((consumer) => {
              return (
                <Option
                  key={consumer.id}
                  value={consumer.id}
                  label={consumer.id + " " + consumer.name}
                >
                  <Space>
                    {consumer.name}
                    {consumer.picture && (
                      <img
                        style={{ width: "auto", height: "20px" }}
                        src={consumer.picture}
                        alt={consumer.name}
                      />
                    )}
                  </Space>
                </Option>
              );
            })}
          </Select>
        </Col>
        <Col span={6} style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button
            onClick={() => {
              setDownloadModalOpen(true);
              setDownloadOptions({
                consumer: selectedConsumer,
                course: null,
                exercise: null,
                ignoreSubExercises: 0,
                includeSimplifyRecords: 0,
                includeRAWRecords: 1,
                isConsumerSelected: true,
                isCourseSelected: false,
                isExerciseSelected: false,
                selectedText: "Consumer " + selectedConsumer,
              });
            }}
          >
            Download
          </Button>
        </Col>
      </Row>
      <Divider></Divider>
      <Row align="bottom">
        <Col span={4}>
          <h3>Select a course</h3>
        </Col>
        <Col span={12}>
          <Select
            showSearch
            optionFilterProp="label"
            value={selectedCourse}
            ref={consumerSelectComponentRef}
            loading={selectedConsumer && coursesLoading ? true : false}
            disabled={coursesLoading}
            style={{ width: "100%" }}
            onSelect={handleCourseSelect}
            // On change, empty selected course
            onChange={() => {
              setSelectedCourse("");
            }}
          >
            {courses.map((course) => {
              return (
                <Option
                  key={course._id}
                  value={course._id ? course._id : "all"}
                  label={
                    course.title
                      ? course.title + " " + course._id + " " + course.consumer
                      : "All"
                  }
                >
                  <Space>
                    {course.title} <i>Consumer:</i>{" "}
                    {
                      consumers.filter(
                        (consumer) => consumer.id === course.consumer
                      )[0]?.name
                    }
                    {consumers.filter(
                      (consumer) => consumer.id === course.consumer
                    )[0]?.picture && (
                      <img
                        style={{ width: "auto", height: "20px" }}
                        src={
                          consumers.filter(
                            (consumer) => consumer.id === course.consumer
                          )[0]?.picture
                        }
                        alt={course._id}
                      />
                    )}
                  </Space>
                </Option>
              );
            })}
          </Select>
        </Col>
        <Col span={6} style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button
            disabled={!selectedCourse}
            onClick={() => {
              setDownloadModalOpen(true);
              setDownloadOptions({
                consumer: selectedConsumer,
                course: selectedCourse,
                exercise: null,
                ignoreSubExercises: 0,
                includeSimplifyRecords: 0,
                includeRAWRecords: 1,
                isConsumerSelected: false,
                isCourseSelected: true,
                isExerciseSelected: false,
                selectedText: "Course " + selectedCourseDetails.title,
              });
            }}
          >
            Download
          </Button>
        </Col>
      </Row>
      <Divider></Divider>
      {selectedCourse && (
        <CourseStats
          courseStatsLoading={selectedCourseDetailsLoading}
          courseStats={selectedCourseDetails}
        />
      )}
      <Divider></Divider>
      {selectedCourse && (
        <>
          <Row gutter={16}>
            <Col span={12}>
              <div className="shadow-bordered">
                {!courseSubmissionsOverTimeLoading ? (
                  <SubmissionsOverTime
                    loading={courseSubmissionsOverTimeLoading}
                    data={courseSubmissionsOverTime}
                  />
                ) : (
                  <Spin />
                )}
              </div>
            </Col>
            <Col span={12}>
              <div className="shadow-bordered">
                {!courseExerciseTypesCountLoading ? (
                  <ExerciseTypesGraph
                    loading={courseExerciseTypesCountLoading}
                    data={courseExerciseTypesCount}
                    title={"Exercise types and number of events"}
                  />
                ) : (
                  <Spin />
                )}
              </div>
            </Col>
          </Row>
          <Divider></Divider>
          <Row>
            <Col span={24}>
              {selectedConsumer && selectedCourse && (
                <ExercisesTable
                  types={courseExerciseTypesOnly}
                  courseId={selectedCourse}
                  consumerId={selectedConsumer}
                />
              )}
            </Col>
          </Row>
        </>
      )}
    </div>
  );
};

export default Home;
