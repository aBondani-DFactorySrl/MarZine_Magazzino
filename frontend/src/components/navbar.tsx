import React, { useContext } from "react";
import {
  Layout,
  Avatar,
  Space,
  Dropdown,
  Typography,
  Image,
  theme,
  Button,
} from "antd";
import { useNavigate } from "react-router-dom";
import {
  HomeOutlined,
  SettingOutlined,
  InfoCircleOutlined /*, ControlOutlined*/,
} from "@ant-design/icons";
import { FaWarehouse } from "react-icons/fa6";
import { VscNewFile } from "react-icons/vsc";
//import ModalVersion from "./ModalVersion";
import reactLogo from "../assets/Logo_vuoto_tondo.svg";
import UserContext from "../provider/userInfoProvider";

const { Header } = Layout;
const { Title } = Typography;

const Navbar: React.FC = () => {
  const { user, logout } = useContext(UserContext);
  const navigate = useNavigate();
  const { token } = theme.useToken();

  const handleSignOut = () => {
    // Remove user data from localStorage
    localStorage.removeItem("user");
    // Call the logout function from context
    logout();
    // Navigate to login page
    navigate("/login");
  };

  const handleRedirect = (path: string) => {
    navigate(path);
  };

  const dropdownMenuItems = [
    {
      key: "profile",
      label: "Profile",
      icon: <SettingOutlined />,
      onClick: () => handleRedirect("/profile"),
    },
    {
      key: "about",
      label: "About",
      icon: <InfoCircleOutlined />,
      onClick: () => handleRedirect("/about"),
    },
  ];

  return (
    <>
      <Header
        style={{
          display: "flex",
          alignItems: "left",
          justifyContent: "space-between",
          padding: "0 30px",
          backgroundColor: "transparent",
        }}
      >
        {/* Logo and Title */}
        <Space align="center">
          <Image
            src={reactLogo}
            preview={false}
            alt="Logo"
            width={50}
            style={{ cursor: "pointer" }}
            onClick={() => handleRedirect("/")}
          />
          <Title
            level={3}
            style={{
              margin: 0,
              color: "white",
              fontFamily: "Poppins, sans-serif",
              fontWeight: 600,
            }}
          >
            MarZine Magazzino
          </Title>
        </Space>

        {/* Menu and Buttons */}
        <Space size={20}>
          <Button
            color="default"
            variant="text"
            size="large"
            onClick={() => handleRedirect("/")}
          >
            <HomeOutlined />
          </Button>
          <Button
            color="default"
            variant="text"
            size="large"
            onClick={() => {
              localStorage.removeItem("locationsParams");

              let fullParam = { todo: {}, pos: "Magazzino" };
              localStorage.setItem(
                "locationsParams",
                JSON.stringify(fullParam)
              );
              handleRedirect("/locations");
            }}
          >
            <FaWarehouse />
          </Button>
          <Button
            color="default"
            variant="text"
            size="large"
            onClick={() => handleRedirect("/newRecords")}
          >
            <VscNewFile />
          </Button>
          {/* <Button color="default" variant="text" size="large" onClick={() => handleRedirect("/cfgmodifier")}>
            <ControlOutlined />
          </Button> */}
          <Button
            color="default"
            variant="text"
            size="large"
            onClick={() => handleSignOut()}
          >
            Logout
          </Button>
          {/* <ModalVersion /> */}
          <Dropdown menu={{ items: dropdownMenuItems }} trigger={["click"]}>
            <Avatar
              style={{
                backgroundColor: token.colorPrimary,
                cursor: "pointer",
                fontSize: "1rem",
              }}
              size="large"
            >
              {`${user?.name?.[0] ?? ""}${user?.surname?.[0] ?? ""}` || "U"}
            </Avatar>
          </Dropdown>
        </Space>
      </Header>
    </>
  );
};

export default Navbar;
