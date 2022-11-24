import Card from "antd/lib/card";
import Row from "antd/lib/row";
import Col from "antd/lib/col";
import { Button, Skeleton, Space, Tooltip } from "antd";
import { QuestionCircleTwoTone } from "@ant-design/icons";
import { ReactElement, useState } from "react";
import ActorsListModal from "src/components/ActorsListModal";

export function CourseStats({
  courseStatsLoading,
  courseStats,
  consumer,
  selectedActor,
  setSelectedActor,
}): ReactElement {
  const [actorsListModalVisible, setActorsListModalVisible] = useState(false);

  return (
    <div className="site-card-wrapper">
      <ActorsListModal
        consumer={consumer}
        course={courseStats._id}
        isOpen={actorsListModalVisible}
        modalCloserFunction={setActorsListModalVisible}
        setSelectedActor={setSelectedActor}
      />
      <Row gutter={16}>
        <Col span={24}>
          <Card loading={courseStatsLoading} title={"Course Title"}>
            <Tooltip title={"Course ID: " + courseStats._id}>
              <Space>
                {courseStats?.title || ""}
                <QuestionCircleTwoTone />
              </Space>
              <Skeleton loading={courseStatsLoading} active />
            </Tooltip>
          </Card>
        </Col>
      </Row>
      <br />
      <Row gutter={16}>
        <Col span={4}>
          <Card loading={courseStatsLoading} title="Total Records">
            {courseStats?.totalRecords}
          </Card>
        </Col>
        <Col span={4}>
          <Card loading={courseStatsLoading} title="Total Submissions">
            {courseStats?.totalSubmissions}
          </Card>
        </Col>
        <Col span={4}>
          <Card loading={courseStatsLoading} title="Exercise Types">
            {courseStats?.exerciseTypes}
          </Card>
        </Col>
        <Col span={4}>
          <Card
            loading={courseStatsLoading}
            title="Number of times Exercises Passed"
          >
            {courseStats?.totalPassingExercises}
          </Card>
        </Col>

        <Col span={4}>
          <Card loading={courseStatsLoading} title="Students">
            <Tooltip title="Click to see the list of students">
              <Space>
                {courseStats?.totalActorsCount}
                <Button
                  type="default"
                  onClick={() => setActorsListModalVisible(true)}
                >
                  Select
                </Button>
              </Space>
            </Tooltip>
          </Card>
        </Col>

        {selectedActor && (
          <Col span={4}>
            <Card loading={courseStatsLoading} title="Selected Student">
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
