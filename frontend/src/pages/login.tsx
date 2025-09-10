import { useContext, useEffect, useState } from "react";
import logo from "../assets/Logo_vuoto_tondo.svg";
import { useNavigate } from "react-router-dom";
import { Form, Input, Button, Typography, Layout, Space, Image } from "antd";
import UserContext from "../provider/userInfoProvider";
import toast from "react-hot-toast";

const { Title, Text } = Typography;
const { Content } = Layout;

const LoginPage = () => {
  const { login, user } = useContext(UserContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const url = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();

  useEffect(() => {
    if (user !== undefined) {
      navigate("/");
    }
  }, [user]);

  const handleSubmit = async (values: { email: string; password: string }) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${url}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mail: values.email,
          username: values.email, // Using email as username
          password: values.password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Logged in successfully");
        // console(data.user);
        login(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/");
      } else {
        toast.error(data.message || "Login failed");
      }
    } catch (error: any) {
      toast.error(`Login error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout
      style={{
        minWidth: "100vw", // Ensure minimum width covers viewport
        width: "100vw",
        height: "100vh",
        background: "#1e2a4a",
        display: "flex", // Use flexbox on the main layout
        justifyContent: "center", // Center content horizontally
        alignItems: "center", // Center content vertically
        overflow: "hidden", // Prevent scrollbars on the layout itself
        margin: 0,
        padding: 0,
      }}
    >
      <Content
        style={{
          // Let Content size itself based on children, centering is handled by Layout
          padding: 0,
          margin: 0,
          display: "flex", // Use flex to allow inner Space/Form centering
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Space // Re-enabled the content
          direction="vertical"
          align="center"
          // Removed fixed width style, let it size naturally
        >
          <Space direction="vertical" align="center">
            {" "}
            {/* Ensure inner Space is centered */}
            <Image src={logo} alt="Logo" width={100} preview={false} />
            <Text
              strong
              style={{
                fontSize: "40px",
                color: "#ffffff",
                marginBottom: "20px",
              }}
            >
              MarZine
            </Text>
          </Space>
          <Form
            layout="vertical"
            style={{
              width: "600px", // But limit its maximum width
              padding: "32px",
              background: "rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              borderRadius: "16px",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
            }}
            onFinish={handleSubmit}
          >
            <Title
              level={2}
              style={{
                textAlign: "center",
                marginBottom: "32px",
                color: "#ffffff",
              }}
            >
              Login
            </Title>
            <Form.Item
              label={<Text style={{ color: "#ffffff" }}>Email</Text>}
              name="email"
              rules={[{ required: true, message: "Please input your email!" }]}
            >
              <Input
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                allowClear
                size="large"
                style={{
                  background: "rgba(255, 255, 255, 0.1)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  borderRadius: "8px",
                  color: "#ffffff",
                }}
              />
            </Form.Item>
            <Form.Item
              label={<Text style={{ color: "#ffffff" }}>Password</Text>}
              name="password"
              rules={[
                { required: true, message: "Please input your password!" },
              ]}
            >
              <Input.Password
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                size="large"
                style={{
                  background: "rgba(255, 255, 255, 0.1)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  borderRadius: "8px",
                  color: "#ffffff",
                }}
              />
            </Form.Item>
            <Form.Item style={{ marginBottom: 0 }}>
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={isLoading}
                size="large"
                style={{
                  height: 48,
                  fontSize: "16px",
                  background: "#4096ff",
                  borderColor: "#4096ff",
                  borderRadius: "8px",
                  marginTop: "24px",
                }}
              >
                Sign In
              </Button>
            </Form.Item>
          </Form>
        </Space>
      </Content>
    </Layout>
  );
};

export default LoginPage;
