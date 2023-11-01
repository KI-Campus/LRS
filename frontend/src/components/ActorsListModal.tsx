import { Button, Col, Input, List, Modal, Pagination, Row } from "antd";
import { useEffect, useState } from "react";
import { getActorsService } from "src/services/records";
import { GET_ACTORS_PAGE_SIZE } from "src/utils/constants";

export interface ActorsListModalProps {
  consumer: string;
  course: string;
  exercise?: string;

  isOpen?: boolean;
  modalCloserFunction?: Function;

  setSelectedActor: Function;
}

export default function ActorsListModal(props: ActorsListModalProps) {
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(GET_ACTORS_PAGE_SIZE);
  const [total, setTotal] = useState(0);
  const [actorsList, setActorsList] = useState([]);

  const [searchText, setSearchText] = useState<string>(undefined);

  const fetchActorsList = async () => {
    setLoading(true);
    const response = await getActorsService(
      props.consumer,
      props.course,
      page,
      pageSize,
      searchText
    );
    if (response) {
      setActorsList(response?.result);
      setTotal(response?.pagination?.total);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (props.isOpen) {
      fetchActorsList();
    }
  }, [props.isOpen, page]);

  useEffect(() => {
    if (props.isOpen) {
      setPage(1);
      fetchActorsList();
    }
  }, [searchText]);

  const handleOk = () => {
    props.modalCloserFunction(false);
  };

  const handleCancel = () => {
    props.modalCloserFunction(false);
  };

  return (
    <Modal
      closable={true}
      title={`Total ${total} students`}
      open={props.isOpen}
      onCancel={handleCancel}
      footer={null}
    >
      {searchText && (
        <>
          <Row gutter={20}>
            <Col>
              <h3>Showing search results for: {searchText}</h3>
            </Col>
            <Col>
              <Button
                onClick={() => {
                  setSearchText(undefined);
                }}
                size={"small"}
              >
                Clear
              </Button>
            </Col>
          </Row>
          <br />
        </>
      )}

      {!searchText && (
        <>
          <Row gutter={20}>
            <Col>
              <Input.Search
                placeholder="Search student by ID or name"
                onSearch={(value) => {
                  setSearchText(value);
                }}
                enterButton
              />
            </Col>
          </Row>
          <br />
        </>
      )}
      <h4>
        Select a student to view their records for this course and exercise
      </h4>

      <List
        loading={loading}
        size={"small"}
        dataSource={actorsList}
        pagination={{
          onChange: (page) => {
            setPage(page);
          },
          current: page,
          pageSize: pageSize,
          total: total,
        }}
        renderItem={(item, index) => (
          <List.Item
            style={{ boxShadow: "5px 5px 20px rgb(0 0 0 / 5%)" }}
            key={item._id}
            onClick={() => {
              props.setSelectedActor(item._id);
              props.modalCloserFunction(false);
            }}
            className={"hoverable"}
          >
            <List.Item.Meta title={item._id} />
            <div>{index + 1 + page * pageSize - pageSize}</div>
          </List.Item>
        )}
      />
    </Modal>
  );
}
