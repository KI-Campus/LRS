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
}): ReactElement {
  const { isLoggedIn, user } = useAppSelector((state) => state.authModal);

  return (
    <div className="site-card-wrapper">
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
      </Row>
    </div>
  );
}
