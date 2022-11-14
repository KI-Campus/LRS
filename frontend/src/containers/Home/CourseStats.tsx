import Card from "antd/lib/card";
import Row from "antd/lib/row";
import Col from "antd/lib/col";
import { Space, Tooltip } from "antd";
import { QuestionCircleTwoTone } from "@ant-design/icons";
import { ReactElement } from "react";

export function CourseStats({ courseStatsLoading, courseStats }): ReactElement {
  return (
    <div className="site-card-wrapper">
      <Row gutter={16}>
        <Col span={24}>
          <Card loading={courseStatsLoading} title={"Course Title"}>
            <Tooltip title={"Course ID: " + courseStats._id}>
              <Space>
                {courseStats?.title || ""}
                <QuestionCircleTwoTone />
              </Space>
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
          <Card loading={courseStatsLoading} title="Total Students">
            {courseStats?.totalActorsCount}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
