import { useContext } from "react";
import { BrowserRouter, useRoutes } from "react-router-dom";
import { ConfigProvider, theme } from "antd";
import LoginPage from "./pages/login";
import HomePage from "./pages/homepage";
import FourOfour from "./pages/fourOfour";
import Details from "./pages/details";
import NewRecords from "./pages/new";
import UserContext from "./provider/userInfoProvider";
import DepotManager from "./pages/depotManager";

const RoutesComponent = () => {
  const { user } = useContext(UserContext);

  const element = useRoutes([
    { path: "/login", element: <LoginPage /> },
    { path: "/404", element: <FourOfour /> },
    { path: "/details", element: <Details /> },
    { path: "/newRecords", element: <NewRecords /> },
    { path: "/", element: <HomePage /> },
    { path: "/locations", element: <DepotManager /> },
  ]);

  // Show loading spinner while checking authentication
  // if (isLoading) {
  //   return (
  //     <div style={{
  //       display: 'flex',
  //       justifyContent: 'center',
  //       alignItems: 'center',
  //       height: '100vh',
  //       background: '#1e2a4a'
  //     }}>
  //       <Spin size="large" />
  //     </div>
  //   );
  // }

  return user ? element : <LoginPage />;
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
