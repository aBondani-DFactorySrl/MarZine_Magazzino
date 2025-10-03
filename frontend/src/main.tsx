import { createRoot } from "react-dom/client";
import { ConfigProvider, theme } from "antd";
import App from "./App.tsx";
import "./index.css";
import { UserProvider } from "./provider/userInfoProvider.tsx";
import { NotificationProvider } from "./components/notificationManager.tsx";

const config = {
  token: {
    colorPrimary: "#63b3ed",
    colorInfo: "#63b3ed",
    colorBgBase: "#1a202c",
    colorText: "#f0f0f0",
    colorTextLightSolid: "#1a202c",
  },
  algorithm: theme.darkAlgorithm,
  components: {
    DatePicker: {
      colorPrimary: "#63b3ed", // Custom primary color for DatePicker
      colorBgContainer: "#1a202c", // Custom background color for DatePicker
      colorPrimaryHover: "#6a70ff", // Custom hover color for DatePicker
      cellActiveWithRangeBg: "#1a202c",
      colorText: "#63b3ed", // Custom text color for DatePicker
      colorBorder: "#63b3ed", // Custom border color for DatePicker
      cellHoverBg: "#1a202c", // Background color of cell hover state
    },
    Select: {
      selectorBg: "#1a202c", // Custom background color for Select
      colorBorder: "#63b3ed", // Custom border color for DatePicker
      colorPrimaryHover: "#6a70ff", // Custom hover color for DatePicker
    },
  },
};

createRoot(document.getElementById("root")!).render(
  <ConfigProvider theme={config}>
    <NotificationProvider />
    <UserProvider>
      <App />
    </UserProvider>
  </ConfigProvider>
);
