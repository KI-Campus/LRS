import Card from "antd/lib/card";
import Row from "antd/lib/row";
import Col from "antd/lib/col";
import { Space, Tooltip } from "antd";
import { QuestionCircleTwoTone } from "@ant-design/icons";

export function GlobalStats({ globalStatsLoading, globalStats }) {
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
                <QuestionCircleTwoTone />
              </Space>
            </Tooltip>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
