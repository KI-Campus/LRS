import { ArrowLeftOutlined } from "@ant-design/icons";

export default function BackButton() {
  const goBack = () => {
    window.history.back();
  };
  return (
    <div className="backButton">
      <ArrowLeftOutlined onClick={goBack} />
    </div>
  );
}
