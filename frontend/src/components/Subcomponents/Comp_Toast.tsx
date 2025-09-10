import { notification } from "antd";
import { CheckCircleFilled, CloseCircleFilled } from "@ant-design/icons";

export function useCustomToast() {
  function showErrorToast(message: string) {
    return notification.error({
      message: message,
      icon: <CloseCircleFilled style={{ color: "white" }} />,
      style: {
        backgroundColor: "#c53030",
        color: "white",
        borderRadius: "8px",
      },
      placement: "top",
      closeIcon: <CloseCircleFilled style={{ color: "white" }} />,
    });
  }

  function showSuccessToast(message: string) {
    return notification.success({
      message: message,
      icon: <CheckCircleFilled style={{ color: "white" }} />,
      style: {
        backgroundColor: "#2f855a",
        color: "white",
        borderRadius: "8px",
      },
      placement: "top",
      closeIcon: <CloseCircleFilled style={{ color: "white" }} />,
    });
  }

  return { showErrorToast, showSuccessToast };
}
