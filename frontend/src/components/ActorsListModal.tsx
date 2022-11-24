import { List, Modal, Pagination } from "antd";
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

  const fetchActorsList = async () => {
    setLoading(true);
    const response = await getActorsService(
      props.consumer,
      props.course,
      page,
      pageSize
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
      visible={props.isOpen}
      onCancel={handleCancel}
      footer={null}
    >
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
          pageSize: pageSize,
          total: total,
        }}
        renderItem={(item, index) => (
          <List.Item
            key={item._id}
            onClick={() => {
              props.setSelectedActor(item._id);
              props.modalCloserFunction(false);
            }}
            className={"hoverable"}
          >
            <List.Item.Meta title={item._id} description={item.email} />
            <div>{index + 1 + page * pageSize - pageSize}</div>
          </List.Item>
        )}
      />
    </Modal>
  );
}
