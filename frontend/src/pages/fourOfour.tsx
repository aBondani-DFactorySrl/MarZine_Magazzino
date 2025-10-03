import React, { useState, useEffect, useContext } from "react";
import { Button, Layout } from "antd";
import { useNavigate } from "react-router-dom";
import UserContext from "../provider/userInfoProvider";

interface WindowDimensions {
  width: number;
  height: number;
}

function getWindowDimensions(): WindowDimensions {
  const { innerWidth: width, innerHeight: height } = window;
  return {
    width,
    height,
  };
}

const FourOfour: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useContext(UserContext);
  const [windowDimensions, setWindowDimensions] = useState<WindowDimensions>(
    getWindowDimensions()
  );

  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleRedirectToOtherMarzine = () => {
    window.location.href = "https://marzineoff.marclev.com";
  };
  const handleRedirectToLogin = () => {
    localStorage.removeItem("user");
    logout();
    navigate("/login");
  };

  return (
    <Layout
      style={{ width: windowDimensions.width, height: windowDimensions.height }}
    >
      <Layout
        style={{
          minHeight: "100vh", // Use minHeight instead of fixed height
          width: "100vw",
          background: "#1e2a4a", // Keep background if needed for the whole page
          display: "flex",
          flexDirection: "column", // Stack Navbar and Content vertically
          // Removed justifyContent and alignItems to allow full width
          overflow: "hidden", // Prevent scrollbars on the layout itself
          margin: 0,
          padding: 0,
        }}
      >
        <div
          style={{
            padding: "20px",
            color: "white",
            textAlign: "center",
          }}
        >
          <h1>404 - Page Not Found</h1>
          <p>The page you are looking for does not exist.</p>
          <p>
            This is the MAGAZZINO Version of Marzine®. If you see this you are
            trying to access the wrong version maybe.
            <br />
            Go to{" "}
            <Button onClick={handleRedirectToOtherMarzine}>
              marzineoff.marclev.com
            </Button>{" "}
            or retry <Button onClick={handleRedirectToLogin}>login</Button>.
          </p>
        </div>
      </Layout>
    </Layout>
  );
};

export default FourOfour;
