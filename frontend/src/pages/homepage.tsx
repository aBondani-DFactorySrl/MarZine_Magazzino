import React, { useContext, useEffect, useState, useRef } from "react";
import Navbar from "../components/navbar";
import { Layout, Spin, Typography, Row, Col, Divider } from "antd";
import ToDoList from "../components/toDoList";
import UserContext from "../provider/userInfoProvider";
import axios from "axios";
import FourOfour from "./fourOfour";

const Homepage: React.FC = () => {
  const { user } = useContext(UserContext);
  const url = import.meta.env.VITE_BACKEND_URL;
  const [loading, _setLoading] = React.useState(false);
  const [_records, setRecords] = useState<any>([]);
  const [_recordWithStatusFrom10To20, _setRecordWithStatusFrom10To20] =
    useState<any>([]);
  const [recordsWithStatus0, setRecordsWithStatus0] = useState<any>([]);
  const [recordsWithStatus1, setRecordsWithStatus1] = useState<any>([]);
  const [recordsWithStatus10, setRecordsWithStatus10] = useState<any>([]);
  const [recordsWithStatus11, setRecordsWithStatus11] = useState<any>([]);
  const [_recordsWithStatus2, _setRecordsWithStatus2] = useState<any>([]);
  const [recordsWithStatus20, setRecordsWithStatus20] = useState<any>([]);
  const [_recordsWithStatus30, _setRecordsWithStatus30] = useState<any>([]);
  const [recordsWithStatus33, setRecordsWithStatus33] = useState<any>([]);
  const [recordsWithStatus99, setRecordsWithStatus99] = useState<any>([]);
  const [windowDimensions, setWindowDimensions] = useState(
    getWindowDimensions()
  );

  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const POLLING_INTERVAL = 5000; // Poll every 5 seconds (adjust as needed)

  function getWindowDimensions() {
    const { innerWidth: width, innerHeight: height } = window;
    return { width, height };
  }

  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const flattenIterazioni = (records: any) => {
    return records.flatMap((record: any) => {
      let IterhigherId = 0;
      record.iterazioni.forEach((iter: any) => {
        if (iter.id > IterhigherId) {
          IterhigherId = iter.id;
        }
      });
      return record.iterazioni.map((iter: any) => ({
        ...iter,
        com_cliente: record.com_cliente,
        commessa: record.commessa,
        des_commessa: record.des_commessa,
        recordId: record.id,
        key: record.id,
        allIteration: record.iterazioni,
        iterationLength: record.iterazioni.length,
        iterationHigherStatus: record.iterazioni.reduce(
          (max: number, iter: any) => Math.max(max, iter.stato),
          0
        ),
        iterationHigherShelf: record.iterazioni[IterhigherId]?.shelf,
      }));
    });
  };

  const fetchRecords = async () => {
    try {
      const res = await axios.get(`${url}/fetchrecords`);
      setRecords(res.data.data);
      const allTodos = flattenIterazioni(res.data.data);
      console.log(allTodos);

      setRecordsWithStatus0(allTodos.filter((todo: any) => todo.stato === 0));
      setRecordsWithStatus1(allTodos.filter((todo: any) => todo.stato === 1));
      setRecordsWithStatus10(allTodos.filter((todo: any) => todo.stato === 10));
      setRecordsWithStatus11(allTodos.filter((todo: any) => todo.stato === 11));
      setRecordsWithStatus20(allTodos.filter((todo: any) => todo.stato === 20));
      setRecordsWithStatus33(allTodos.filter((todo: any) => todo.stato === 33));
      setRecordsWithStatus99(allTodos.filter((todo: any) => todo.stato === 99));
    } catch (error) {
      console.error("Error fetching records:", error);
    }
  };

  // Setup polling - runs only once on mount
  useEffect(() => {
    // Initial fetch
    fetchRecords();
    localStorage.removeItem("locationsParams");

    // Start polling
    pollingIntervalRef.current = setInterval(() => {
      console.log("Polling for new records...");
      fetchRecords();
    }, POLLING_INTERVAL);

    // Cleanup on unmount
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, []); // Empty array - only run once on mount

  // Optional: Pause polling when tab is not visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab is hidden - stop polling
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
          console.log("Polling paused - tab hidden");
        }
      } else {
        // Tab is visible - resume polling only if not already polling
        if (!pollingIntervalRef.current) {
          console.log("Polling resumed - tab visible");
          fetchRecords(); // Fetch immediately
          pollingIntervalRef.current = setInterval(() => {
            console.log("Polling for new records...");
            fetchRecords();
          }, POLLING_INTERVAL);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []); // Empty array - listener doesn't need to change

  return (
    <Layout
      style={{ width: windowDimensions.width, height: windowDimensions.height }}
    >
      <Layout
        style={{
          minHeight: "100vh",
          width: "100vw",
          background: "#1e2a4a",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          margin: 0,
          padding: 0,
        }}
      >
        <div>
          <Navbar />
          {loading ? (
            <div
              style={{
                width: windowDimensions.width,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <div style={{ textAlign: "center" }}>
                <Spin size="large" style={{ marginBottom: 20 }} />
                <Typography.Title level={4}>
                  Loading... Please wait!!
                </Typography.Title>
              </div>
            </div>
          ) : (
            <div
              style={{
                height: windowDimensions.height - 100,
                overflowX: "hidden",
                overflowY: "hidden",
                width: windowDimensions.width - 30,
              }}
            >
              <Row
                justify="space-between"
                style={{ width: windowDimensions.width, height: "100%" }}
              >
                {user?.reparto === "Magazzino" && (
                  <Row gutter={16} style={{ width: "100%", height: "100%" }}>
                    <Col>
                      <ToDoList todos={recordsWithStatus0} title={"Prelievo"} />
                    </Col>
                    <Divider type="vertical" style={{ height: "100%" }} />
                    <Col>
                      <ToDoList
                        todos={recordsWithStatus1}
                        title={"Pos. a Magazzino"}
                      />
                    </Col>
                    <Divider type="vertical" style={{ height: "100%" }} />
                    <Col>
                      <ToDoList
                        todos={recordsWithStatus10}
                        title={"Pronti a magazzino"}
                      />
                    </Col>
                    <Divider type="vertical" style={{ height: "auto" }} />
                    <Col>
                      <ToDoList
                        todos={recordsWithStatus11}
                        title={"Richiesto da Officina"}
                      />
                    </Col>
                    <Divider type="vertical" style={{ height: "auto" }} />
                    <Col>
                      <ToDoList
                        todos={recordsWithStatus20}
                        title={"In officina"}
                      />
                    </Col>
                    <Divider type="vertical" style={{ height: "auto" }} />
                    <Col>
                      <ToDoList
                        todos={recordsWithStatus33}
                        title={"Prep. alla Spedizione"}
                      />
                    </Col>
                    <Divider type="vertical" style={{ height: "auto" }} />
                    <Col>
                      <ToDoList todos={recordsWithStatus99} title={"Spedito"} />
                    </Col>
                  </Row>
                )}
                {user?.reparto === "Officina" && <FourOfour />}
              </Row>
            </div>
          )}
        </div>
      </Layout>
    </Layout>
  );
};

export default Homepage;
