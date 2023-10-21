import { GlobalStats } from "./GlobalStats";
import {
  ReactComponentElement,
  ReactElement,
  useEffect,
  useRef,
  useState,
} from "react";
import { useParams, useHistory, useLocation } from "react-router-dom";
import Select from "antd/lib/select";
import Row from "antd/lib/row";
import Col from "antd/lib/col";
import { Button, Divider, Popconfirm, Space, Spin } from "antd";

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
import EditUser from "../Users/EditUser";
import { UserInterface } from "src/Interfaces/UserInterface";
import { useAppSelector } from "src/redux/hooks";

const { Option } = Select;
const Home = (): ReactElement => {
  let history = useHistory();

  let location = useLocation();

  const { user } = useAppSelector((state) => state.authModal);

  // @ts-ignore
  const { consumerId, courseId } = useParams();
  const [globalStatsLoading, setGlobalStatsLoading] = useState(false);
  const [globalStats, setGlobalStats] = useState<any>({});

  const [consumersLoading, setConsumersLoading] = useState(true);
  const [consumers, setConsumers] = useState<ConsumerInterface[]>([]);
  const [selectedConsumer, setSelectedConsumer] = useState<string>("");
  const consumerSelectComponentRef = useRef<any>();

  const [coursesLoading, setCoursesLoading] = useState(true);
  const [courses, setCourses] = useState<CourseInterface[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>(null);
  const [showCourseStats, setShowCourseStats] = useState<boolean>(false);
  const [selectedCourseDetails, setSelectedCourseDetails] = useState<any>({});

  const [selectedCourseDetailsLoading, setSelectedCourseDetailsLoading] =
    useState(true);

  const [selectedActor, setSelectedActor] = useState(null);

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

  const [courseExerciseTypes, setCourseExerciseTypes] = useState<string[]>();

  const [courseRootExerciseTypes, setCourseRootExerciseTypes] =
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

  const [editUser, setEditUser] = useState<UserInterface>();
  const [editDrawerVisible, setEditDrawerVisible] = useState(false);

  const handleConsumerSelect = (value: string) => {
    history.push("/consumer/" + value);
    setSelectedConsumer(value);
  };

  const handleCourseSelect = (value: string) => {
    if (consumerId)
      history.push("/consumer/" + consumerId + "/course/" + value);
    if (selectedConsumer)
      history.push("/consumer/" + selectedConsumer + "/course/" + value);
    setSelectedCourse(value);
  };

  const fetchCourses = () => {
    let result;
    if (!courseId) result = getCoursesListService(selectedConsumer);
    else result = getCoursesListService(consumerId);
    result
      .then((res) => {
        setCourses(res);
        setCoursesLoading(false);
        // Select the first course
        if (courseId && consumerId) {
          setSelectedCourse(courseId);
        } else if (!courseId && consumerId) {
          setSelectedCourse(res[0]?._id);
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
        if (consumerId) {
          setSelectedConsumer(consumerId);
        } else {
          // Select the consumer if there is only one
          if (res.length === 1) {
            setSelectedConsumer(res[0].id);
          }
        }
      })
      .catch((err) => {
        console.log(err);
        setConsumersLoading(false);
      });
  };

  const fetchCourse = () => {
    setSelectedCourseDetailsLoading(true);
    let result = getCourseDetailsService(
      selectedConsumer,
      selectedCourse,
      selectedActor
    );
    result
      .then((res) => {
        setSelectedCourseDetails(res[0]);
        setSelectedCourseDetailsLoading(false);
        setCourseExerciseTypes(res[0].exerciseTypesList);
        setCourseRootExerciseTypes(res[0].rootExerciseTypesList);
      })
      .catch((err) => {
        console.log(err);
        setSelectedCourseDetailsLoading(false);
        setCourseExerciseTypes([]);
        setCourseRootExerciseTypes([]);
      });
  };

  const fetchCourseSubmissionsOverTime = () => {
    setCourseSubmissionsOverTimeLoading(true);
    let result = getCourseSubmissionsOverTimeService(
      selectedConsumer,
      selectedCourse,
      selectedActor
    );
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
    let result = getCourseExerciseTypesCountsService(
      selectedConsumer,
      selectedCourse,
      selectedActor
    );
    result
      .then((res) => {
        setCourseExerciseTypesCount(res);

        setCourseExerciseTypesCountLoading(false);
      })
      .catch((err) => {
        console.log(err);

        setCourseExerciseTypesCountLoading(false);
      });
  };

  // On load get all consumers, get global stats
  useEffect(() => {
    fetchConsumers();
  }, []);

  // When selected consumer changes
  useEffect(() => {
    setCoursesLoading(true);
    setCourses([]);
    setSelectedCourse(null);
    setSelectedActor(null);
    setShowCourseStats(false);
    if (selectedConsumer) {
      // Get all courses for selected consumer
      fetchCourses();
    }
  }, [selectedConsumer]);

  // When selected course changes
  useEffect(() => {
    if (selectedCourse) {
      setShowCourseStats(false);
      fetchCourse();
      //fetchCourseSubmissionsOverTime();
      //fetchCourseExerciseTypesCount();
    }
  }, [selectedCourse, selectedActor]);

  // When react router state is editCurrentUser is true
  useEffect(() => {
    // @ts-ignore
    if (location.state?.editCurrentUser === true) {
      setEditUser(user);
      setEditDrawerVisible(true);
    }
  }, [location.state, user]);

  return (
    <div>
      <EditUser
        visible={editDrawerVisible}
        editUser={editUser}
        fetchUsers={null}
        consumers={consumers}
        editDrawerVisible={editDrawerVisible}
        setEditDrawerVisible={setEditDrawerVisible}
        isCurrentUser={true}
      />
      <h2>Welcome to openLRS Dashboard</h2>
      {(Object.keys(globalStats).length > 0 || globalStatsLoading) && (
        <GlobalStats
          globalStatsLoading={globalStatsLoading}
          globalStats={globalStats}
          fetchGlobalStats={fetchGlobalStats}
        />
      )}
      {!Object.keys(globalStats).length && (
        <Popconfirm
          title="Loading global stats will take a while. Are you sure?"
          onConfirm={fetchGlobalStats}
          okText="Yes"
          cancelText="Cancel"
        >
          <Button>Load Global Stats</Button>
        </Popconfirm>
      )}
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
        <Col span={18}>
          <Select
            showSearch
            value={selectedConsumer}
            ref={consumerSelectComponentRef}
            loading={consumersLoading}
            disabled={consumersLoading || consumers.length <= 1}
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
        <>
          <CourseStats
            consumer={selectedConsumer}
            courseStatsLoading={selectedCourseDetailsLoading}
            courseStats={selectedCourseDetails}
            selectedActor={selectedActor}
            setSelectedActor={setSelectedActor}
          />

          <Divider></Divider>
        </>
      )}

      {selectedCourse && !showCourseStats && (
        <Popconfirm
          title="Loading course stats will take a while. Are you sure?"
          onConfirm={() => {
            // fetchCourse();
            fetchCourseSubmissionsOverTime();
            fetchCourseExerciseTypesCount();
            setShowCourseStats(true);
          }}
          okText="Yes"
          cancelText="Cancel"
        >
          <Button>Load Course Stats</Button>
        </Popconfirm>
      )}

      {selectedCourse && showCourseStats && (
        <>
          <Row gutter={[24, 24]}>
            <Col md={24} lg={24} xl={12} span={12}>
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
            <Col md={24} lg={24} xl={12} span={12}>
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
        </>
      )}
      <Divider></Divider>
      {selectedCourse && (
        <Row>
          <Col span={24}>
            {selectedConsumer && selectedCourse && (
              <ExercisesTable
                types={courseRootExerciseTypes}
                courseId={selectedCourse}
                consumerId={selectedConsumer}
                actor={selectedActor}
              />
            )}
          </Col>
        </Row>
      )}
    </div>
  );
};

export default Home;
