import { Alert, Button, Checkbox, Form, Input, message, Modal } from "antd";
import React, { useEffect, useRef, useState } from "react";
import { downloadService } from "src/services/records";

export interface DownloadModalProps {
  consumer: string;
  course: string;
  exercise?: string;
  ignoreSubExercises?: 0 | 1;
  includeSimplifyRecords?: 0 | 1;
  includeRAWRecords?: 0 | 1;

  isConsumerSelected?: boolean;
  isCourseSelected?: boolean;
  isExerciseSelected?: boolean;

  selectedText?: string;

  isOpen?: boolean;
  modalCloserFunction?: Function;
}

export default function DownloadModal(props: DownloadModalProps) {
  const [downloading, setDownloading] = useState(false);
  const [ignoreSubExercises, setIgnoreSubExercises] = useState<Boolean>(
    Boolean(props.ignoreSubExercises)
  );

  const [includeRAWRecords, setIncludeRAWRecords] = useState<Boolean>(
    Boolean(props.includeRAWRecords)
  );
  const [includeSimplifyRecords, setIncludeSimplifyRecords] = useState<Boolean>(
    Boolean(props.includeSimplifyRecords)
  );

  const [downloadButtonDisabled, setDownloadButtonDisabled] = useState(false);

  const rawRecordsCheckboxRef = useRef(null);
  const simplifyRecordsCheckboxRef = useRef(null);

  const handleOk = () => {
    setDownloading(true);

    let messageReturn = message.loading({ content: "Downloading..." });

    downloadService(
      props.consumer,
      props.course,
      props.exercise,
      ignoreSubExercises,
      includeSimplifyRecords,
      includeRAWRecords
    )
      .then((res) => {
        const file = new Blob([JSON.stringify(res)], {
          type: "application/json",
        });
        const fileURL = URL.createObjectURL(file);
        const link = document.createElement("a");
        link.href = fileURL;

        let fileName;
        if (props.isExerciseSelected) {
          fileName = props.exercise;
        } else if (props.isCourseSelected) {
          fileName = props.course;
        } else if (props.isConsumerSelected) {
          fileName = props.consumer;
        }

        link.setAttribute("download", fileName + ".json");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        messageReturn();
        message.success({
          content: "Exercise Downloaded Successfully!",
          duration: 1,
        });
        setDownloading(false);
      })
      .catch((err) => {
        console.log("Error while downloading exercise", err);
        message.error({
          content: "Error downloading",
          duration: 2,
        });
        setDownloading(false);
      });

    props.modalCloserFunction(false);
  };

  const handleCancel = () => {
    props.modalCloserFunction(false);
  };

  useEffect(() => {
    setIgnoreSubExercises(Boolean(props.ignoreSubExercises));
  }, [props.ignoreSubExercises]);

  useEffect(() => {
    setIncludeRAWRecords(Boolean(props.includeRAWRecords));
  }, [props.includeRAWRecords]);

  useEffect(() => {
    setIncludeSimplifyRecords(Boolean(props.includeSimplifyRecords));
  }, [props.includeSimplifyRecords]);

  useEffect(() => {
    if (!includeRAWRecords && !includeSimplifyRecords) {
      setDownloadButtonDisabled(true);
    } else {
      setDownloadButtonDisabled(false);
    }
  }, [includeSimplifyRecords, includeRAWRecords]);

  return (
    <>
      <Modal
        title={"Download: " + props.selectedText}
        closable={true}
        visible={props.isOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Download JSON"
        okButtonProps={{
          disabled: downloadButtonDisabled,
        }}
      >
        {props.isConsumerSelected && (
          <Alert
            message="Warning"
            style={{ marginRight: "1rem" }}
            description="This will download all data for the selected consumer. This may take a while. Please be patient."
            type="warning"
            showIcon
          />
        )}
        {props.isCourseSelected && (
          <Alert
            message="Warning"
            style={{ marginRight: "1rem" }}
            description="This will download all data for the selected course. This may take a while. Please be patient."
            type="warning"
            showIcon
          />
        )}
        {props.isExerciseSelected && (
          <Alert
            message="Information"
            style={{ marginRight: "1rem" }}
            description="This will download all data for the selected exercise. "
            type="info"
            showIcon
          />
        )}
        <br />
        <p>
          <h5>Downloaded data will be in JSON format</h5>
        </p>
        <p>
          <h5>
            To convert JSON format to CSV, you can use any third-party
            converter, e.g.:{" "}
          </h5>
          <h5>
            <a
              href="https://www.convertcsv.com/json-to-csv.htm"
              target={"_blank"}
            >
              https://www.convertcsv.com/json-to-csv.htm
            </a>
          </h5>
        </p>

        <Checkbox
          checked={ignoreSubExercises ? false : true}
          onChange={(e) => {
            setIgnoreSubExercises(e.target.checked ? false : true);
          }}
        >
          Include all sub exercises data
        </Checkbox>
        <br />
        <Checkbox
          ref={rawRecordsCheckboxRef}
          checked={includeRAWRecords ? true : false}
          onChange={(e) => {
            setIncludeRAWRecords(e.target.checked ? true : false);
          }}
        >
          Include raw xAPI data
        </Checkbox>
        <br />
        <Checkbox
          ref={simplifyRecordsCheckboxRef}
          checked={includeSimplifyRecords ? true : false}
          onChange={(e) => {
            setIncludeSimplifyRecords(e.target.checked ? true : false);
          }}
        >
          Include simplified data
        </Checkbox>
      </Modal>
    </>
  );
}
