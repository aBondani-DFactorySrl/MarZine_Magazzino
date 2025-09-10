import { Layout, Row, Col, Button, Spin, Typography, Space } from "antd";
import { useEffect, useState } from "react";
import Navbar from "../Subcomponents/Comp_Navbar";
import { useNavigate, useParams } from "react-router-dom";
import NewPlaceConfirmationDialog from "./newPlacePopUp";
import {
  collection,
  getDocs,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { firestore } from "../../provider/firebase";
import { ArrowLeftOutlined } from "@ant-design/icons";
import ChessBoardMultiple from "./ChessBoardMultiple";
import MovedPlaceConfirmationDialog from "./movedPlacePopUp";

const { Content } = Layout;
const { Title } = Typography;

type ItemIdNew = {
  commessa: string;
  status: string;
  shelf: string;
  test: any[];
  id: string;
};

type ItemIdMove = {
  commessa: string;
  status: string;
  shelfOld: string;
  shelfNew: string;
  test: any[];
  id: string;
};

const ComPosition = () => {
  let { commessa: initialCommessa } = useParams();
  const [loading, setLoading] = useState(true);
  const [commessa] = useState<string>(initialCommessa || "");
  const [itemCommessa, setItemCommessa] = useState<any>({});
  const [windowDimensions, setWindowDimensions] = useState(
    getWindowDimensions()
  );
  const [isDialogOpenNew, setIsDialogOpenNew] = useState(false);
  const [isDialogOpenMove, setIsDialogOpenMove] = useState(false);
  const [selectedItemNew, setSelectedItemNew] = useState<ItemIdNew>({
    commessa: "",
    status: "",
    shelf: "",
    test: [],
    id: "",
  });
  const [selectedItemMove, setSelectedItemMove] = useState<ItemIdMove>({
    commessa: "",
    status: "",
    shelfOld: "",
    shelfNew: "",
    test: [],
    id: "",
  });
  const navigate = useNavigate();
  const rowsArray = [4, 4, 5];
  const columnsArray = ["15", "15", "16"];
  const chessName = ["C", "D", "G"];
  const [draggedCell, setDraggedCell] = useState<{
    row: number;
    col: string;
    status: string;
    title: string;
  } | null>(null);

  useEffect(() => {
    setLoading(true);
    if (commessa) {
      const recordsCollection = collection(firestore, "records");
      const q = query(recordsCollection, where("commessa", "==", commessa));

      const unsubscribe = onSnapshot(
        q,
        (querySnapshot) => {
          if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            const newData = {
              ...doc.data(),
              idRecords: doc.id,
            };
            setItemCommessa(newData);
            // console(newData);
          }
          setLoading(false);
        },
        (error) => {
          console.error("Error fetching commessa:", error);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } else {
      setLoading(false);
    }
  }, [commessa]);

  const handlePathClick = ({
    row,
    col,
    status,
    title,
  }: {
    row: number;
    col: string;
    status: string;
    title: string;
  }) => {
    if (!draggedCell) {
      const newShelf = `${title}-${row}-${col}`;
      const recordsCollection = collection(firestore, "records");
      const q = query(
        recordsCollection,
        where("shelf", "array-contains", newShelf)
      );
      const documentsArray: any[] = [];
      getDocs(q)
        .then((querySnapshot) => {
          if (querySnapshot.empty) {
            const item = {
              commessa,
              status,
              shelf: newShelf,
              test: documentsArray,
              id: itemCommessa.idRecords,
            };
            setSelectedItemNew(item);
            setIsDialogOpenNew(true);
            return;
          }
          querySnapshot.forEach((doc) => {
            documentsArray.push(doc.data());
          });
          const item = {
            commessa,
            status,
            shelf: newShelf,
            test: documentsArray,
            id: itemCommessa.idRecords,
          };
          setSelectedItemNew(item);
          setIsDialogOpenNew(true);
        })
        .catch((error) => {
          console.error("Error getting documents:", error);
        });
    }
  };

  const handleDragStart = (
    row: number,
    col: string,
    status: string,
    title: string
  ) => {
    setDraggedCell({ row, col, status, title });
  };

  const handleDrop = (
    row: number,
    col: string,
    status: string,
    title: string
  ) => {
    if (draggedCell) {
      setDraggedCell(null);
      const oldShelf = `${draggedCell.title}-${draggedCell.row}-${draggedCell.col}`;
      const newShelf = `${title}-${row}-${col}`;
      if (oldShelf !== newShelf) {
        const recordsCollection = collection(firestore, "records");
        const q = query(
          recordsCollection,
          where("shelf", "array-contains", newShelf)
        );
        const documentsArray: any[] = [];
        getDocs(q)
          .then((querySnapshot) => {
            if (querySnapshot.empty) {
              const item = {
                commessa,
                status,
                shelfOld: oldShelf,
                shelfNew: newShelf,
                test: documentsArray,
                id: itemCommessa.idRecords,
              };
              setSelectedItemMove(item);
              setIsDialogOpenMove(true);
              return;
            }
            querySnapshot.forEach((doc) => {
              documentsArray.push(doc.data());
            });
            const item = {
              commessa,
              status,
              shelfOld: oldShelf,
              shelfNew: newShelf,
              test: documentsArray,
              id: itemCommessa.idRecords,
            };
            setSelectedItemMove(item);
            setIsDialogOpenMove(true);
          })
          .catch((error) => {
            console.error("Error getting documents:", error);
          });
      }
    }
  };

  function getWindowDimensions() {
    const { innerWidth: width, innerHeight: height } = window;
    return {
      width,
      height,
    };
  }

  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
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
      <Navbar />
      <Content
        style={{
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {loading ? (
          <Row justify="center" align="middle" style={{ minHeight: "100%" }}>
            <Col>
              <Space direction="vertical" align="center">
                <Spin size="large" />
                <Title level={2}>Loading... Please wait!!</Title>
              </Space>
            </Col>
          </Row>
        ) : (
          <Row
            justify="center"
            align="middle"
            style={{ marginBottom: 24, width: "100%" }}
          >
            <Col
              span={24}
              style={{
                maxWidth: windowDimensions.width - 100,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "24px",
              }}
            >
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Button
                  icon={<ArrowLeftOutlined />}
                  type="primary"
                  onClick={() => navigate(-1)}
                  size="large"
                >
                  Indietro
                </Button>
                {/* {commessa && <DraggableComponent text={commessa} />} */}
              </div>

              <div
                style={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "32px",
                }}
              >
                {rowsArray.map((rows, index) => (
                  <ChessBoardMultiple
                    key={index}
                    rows={rows}
                    columns={columnsArray[index]}
                    title={`${chessName[index]}`}
                    item={itemCommessa}
                    shelf={itemCommessa ? itemCommessa.shelf : []}
                    onPathClick={handlePathClick}
                    onDragStart={handleDragStart}
                    onDrop={handleDrop}
                  />
                ))}
              </div>

              <NewPlaceConfirmationDialog
                item={selectedItemNew}
                isOpen={isDialogOpenNew}
                onClose={() => setIsDialogOpenNew(false)}
              />
              <MovedPlaceConfirmationDialog
                item={selectedItemMove}
                isOpen={isDialogOpenMove}
                onClose={() => setIsDialogOpenMove(false)}
              />
            </Col>
          </Row>
        )}
      </Content>
    </Layout>
  );
};

export default ComPosition;
