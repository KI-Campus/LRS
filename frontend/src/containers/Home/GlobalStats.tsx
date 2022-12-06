import Card from "antd/lib/card";
import Row from "antd/lib/row";
import Col from "antd/lib/col";
import { Space, Tooltip } from "antd";
import { QuestionCircleTwoTone } from "@ant-design/icons";
import { ReactElement } from "react";
import { TEXT_ACTORS_COUNT_MISINFORMATION } from "src/utils/constants";

export function GlobalStats({ globalStatsLoading, globalStats }): ReactElement {
  return (
    <div className="site-card-wrapper">
      <Row gutter={16}>
        <Col span={4}>
          <Card loading={globalStatsLoading} title="Total Records">
            {globalStats?.totalRecords}
          </Card>
        </Col>
        <Col span={4}>
          <Card loading={globalStatsLoading} title="Total Submissions">
            {globalStats?.totalSubmissions}
          </Card>
        </Col>
        <Col span={4}>
          <Card loading={globalStatsLoading} title="Exercise Types">
            {globalStats?.exerciseTypes}
          </Card>
        </Col>
        <Col span={4}>
          <Card
            loading={globalStatsLoading}
            title="Number of times Exercises Passed"
          >
            {globalStats?.totalPassingExercises}
          </Card>
        </Col>
        <Col span={4}>
          <Card loading={globalStatsLoading} title="Total Consumers">
            <Tooltip
              title={
                "Consumer IDs: " +
                globalStats.totalConsumersList
                  ?.map((consumer) => consumer._id)
                  .join(", ")
              }
            >
              <Space>
                {globalStats?.totalConsumers}
                <QuestionCircleTwoTone style={{ cursor: "pointer" }} />
              </Space>
            </Tooltip>
          </Card>
        </Col>
        <Col span={4}>
          <Card loading={globalStatsLoading} title="Total Students">
            <Space>
              {globalStats?.totalActorsCount}
              <Tooltip title={TEXT_ACTORS_COUNT_MISINFORMATION}>
                <QuestionCircleTwoTone style={{ cursor: "pointer" }} />
              </Tooltip>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
