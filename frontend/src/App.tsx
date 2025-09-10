import { useEffect, useState } from "react";
import { BrowserRouter, useNavigate, useRoutes } from "react-router-dom";
import { ConfigProvider, theme } from "antd";
import LoginPage from "./pages/login";
import HomePage from "./pages/homepage";
import NewPositions from "./components/ogComponents/newPosition";
import ComPosition from "./components/ogComponents/comPosition";

const RoutesComponent = () => {
  const navigate = useNavigate();
  const [isLogged, setIsLogged] = useState(false);

  useEffect(() => {
    // Check if there's a valid session
    const checkSession = async () => {
      const userSession = localStorage.getItem("user");
      if (userSession) {
        const userData = JSON.parse(userSession);
        // console(userData);
        if (userData.defaultPwd) {
          setIsLogged(false);
          navigate("/login");
        } else {
          setIsLogged(true);
        }
      } else {
        setIsLogged(false);
        navigate("/login");
      }
    };

    checkSession();
  }, [navigate]);

  const element = useRoutes([
    { path: "/login", element: <LoginPage /> },
    { path: "/", element: <HomePage /> },
    { path: "ubication/:commessa/Officina", element: <NewPositions /> },
    { path: "ubication/:commessa/Magazzino", element: <ComPosition /> },
  ]);

  return isLogged ? element : <LoginPage />;
};

const App: React.FC = () => {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: "#1677ff",
          colorBgContainer: "#1e2a4a",
          borderRadius: 8,
        },
      }}
    >
      <BrowserRouter>
        <RoutesComponent />
      </BrowserRouter>
    </ConfigProvider>
  );
};

export default App;
