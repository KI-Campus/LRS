import Card from "antd/lib/card";
import Row from "antd/lib/row";
import Col from "antd/lib/col";
import { Button, Popconfirm, Space, Tooltip } from "antd";
import { QuestionCircleTwoTone } from "@ant-design/icons";
import { ReactElement } from "react";
import { TEXT_ACTORS_COUNT_MISINFORMATION } from "src/utils/constants";

export function GlobalStats({
  globalStatsLoading,
  globalStats,
  fetchGlobalStats,
}): ReactElement {
  return (
    <div className="site-card-wrapper">
      <Row gutter={[24, 24]}>
        <Col sm={24} md={24} lg={8} xl={4} span={4}>
          <Card size="small" loading={globalStatsLoading} title="Total Records">
            {globalStats?.totalRecords ?? "N/A"}
          </Card>
        </Col>
        <Col sm={24} md={24} lg={8} xl={4} span={4}>
          <Card
            size="small"
            loading={globalStatsLoading}
            title="Total Submissions"
          >
            {globalStats?.totalSubmissions ?? "N/A"}
          </Card>
        </Col>
        <Col sm={24} md={24} lg={8} xl={4} span={4}>
          <Card
            size="small"
            loading={globalStatsLoading}
            title="Exercise Types"
          >
            {globalStats?.exerciseTypes ?? "N/A"}
          </Card>
        </Col>
        <Col sm={24} md={24} lg={16} xl={8} span={8}>
          <Card
            size="small"
            loading={globalStatsLoading}
            title="Number of times Exercises Passed"
          >
            {globalStats?.totalPassingExercises ?? "N/A"}
          </Card>
        </Col>
        <Col sm={24} md={24} lg={8} xl={4} span={4}>
          <Card
            size="small"
            loading={globalStatsLoading}
            title="Total Consumers"
          >
            <Tooltip
              title={
                "Consumer IDs: " +
                  globalStats.totalConsumersList
                    ?.map((consumer) => consumer._id)
                    .join(", ") ?? ""
              }
            >
              <Space>
                {globalStats?.totalConsumers ?? "N/A"}
                <QuestionCircleTwoTone style={{ cursor: "pointer" }} />
              </Space>
            </Tooltip>
          </Card>
        </Col>
        <Col sm={24} md={24} lg={8} xl={4} span={4}>
          <Card
            size="small"
            loading={globalStatsLoading}
            title="Total Students"
          >
            <Space>
              {globalStats?.totalActorsCount ?? "N/A"}
              <Tooltip title={TEXT_ACTORS_COUNT_MISINFORMATION}>
                <QuestionCircleTwoTone style={{ cursor: "pointer" }} />
              </Tooltip>
            </Space>
          </Card>
        </Col>
      </Row>
      <br />
    </div>
  );
}
