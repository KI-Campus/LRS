import Card from "antd/lib/card";
import Row from "antd/lib/row";
import Col from "antd/lib/col";
import { Button, Skeleton, Space, Tooltip } from "antd";
import { QuestionCircleTwoTone } from "@ant-design/icons";
import { ReactElement, useState } from "react";
import ActorsListModal from "src/components/ActorsListModal";
import { useAppSelector } from "src/redux/hooks";
import { TEXT_ACTORS_COUNT_MISINFORMATION } from "src/utils/constants";

export function CourseStats({
  courseStatsLoading,
  courseStats,
  consumer,
  selectedActor,
  setSelectedActor,
}): ReactElement {
  const [actorsListModalVisible, setActorsListModalVisible] = useState(false);

  const { isLoggedIn, user } = useAppSelector((state) => state.authModal);

  return (
    <div className="site-card-wrapper">
      <ActorsListModal
        consumer={consumer}
        course={courseStats?._id}
        isOpen={actorsListModalVisible}
        modalCloserFunction={setActorsListModalVisible}
        setSelectedActor={setSelectedActor}
      />
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Card
            size="small"
            loading={courseStatsLoading}
            title={"Course Title"}
          >
            <Tooltip title={"Course ID: " + courseStats?._id}>
              <Space>
                {courseStats?.title || ""}
                <QuestionCircleTwoTone style={{ cursor: "pointer" }} />
              </Space>
              <Skeleton loading={courseStatsLoading} active />
            </Tooltip>
          </Card>
        </Col>
      </Row>
      <br />
      <Row gutter={[24, 24]}>
        <Col sm={24} md={24} lg={8} xl={4} span={4}>
          <Card size="small" loading={courseStatsLoading} title="Total Records">
            {courseStats?.totalRecords}
          </Card>
        </Col>
        <Col sm={24} md={24} lg={8} xl={4} span={4}>
          <Card
            size="small"
            loading={courseStatsLoading}
            title="Total Submissions"
          >
            {courseStats?.totalSubmissions}
          </Card>
        </Col>
        <Col sm={24} md={24} lg={8} xl={4} span={4}>
          <Card
            size="small"
            loading={courseStatsLoading}
            title="Exercise Types"
          >
            {courseStats?.exerciseTypes}
          </Card>
        </Col>
        <Col sm={24} md={24} lg={16} xl={8} span={8}>
          <Card
            size="small"
            loading={courseStatsLoading}
            title="Number of times Exercises Passed"
          >
            {courseStats?.totalPassingExercises}
          </Card>
        </Col>

        <Col sm={24} md={24} lg={8} xl={4} span={4}>
          <Card size="small" loading={courseStatsLoading} title="Students">
            <Space>
              {courseStats?.totalActorsCount}
              <Tooltip title={TEXT_ACTORS_COUNT_MISINFORMATION}>
                <QuestionCircleTwoTone style={{ cursor: "pointer" }} />
              </Tooltip>
              {user.role === "admin" && (
                <Tooltip title="Click to see the list of students">
                  <Button
                    type="default"
                    onClick={() => setActorsListModalVisible(true)}
                  >
                    Select
                  </Button>
                </Tooltip>
              )}
            </Space>
          </Card>
        </Col>

        {selectedActor && (
          <Col sm={24} md={24} lg={16} xl={8} span={8}>
            <Card
              size="small"
              loading={courseStatsLoading}
              title="Selected Student"
            >
              {"ID: " + selectedActor}
              <Button type="link" onClick={() => setSelectedActor(null)}>
                {"Reset"}
              </Button>
            </Card>
          </Col>
        )}
      </Row>
    </div>
  );
}
