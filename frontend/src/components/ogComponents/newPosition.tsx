import { Layout, Row, Col, Button, Space } from "antd";
import { ArrowLeftOutlined, LeftOutlined } from "@ant-design/icons";
import { useContext, useEffect, useState } from "react";
import Navbar from "../Subcomponents/Comp_Navbar";
import ChessBoard from "../ogComponents/chessBoard";
import { useNavigate, useParams } from "react-router-dom";
import NewPlaceConfirmationDialog from "./newPlacePopUp";
import NewPlaceConfirmationDialogOfficina from "./newPlacePopUpOfficina";
import {
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { firestore } from "../../provider/firebase";
import DraggableComponent from "./draggableComponent";
import OfficinaComponent from "./pianta_officina";
import UserContext from "../../provider/userInfoProvider";
import toast from "react-hot-toast";

type ItemId = {
  commessa: string;
  status: string;
  shelf: string;
  test: any[];
  id: string;
};

type ItemIdOfficina = {
  commessa: string;
  shelf: string;
  test: any[];
  id: string;
};

const NewPositions = () => {
  let { todo: initialTodo } = useParams();
  let { commessa: initialCommessa } = useParams();
  const { user } = useContext(UserContext);
  const [commessa, _setCommessa] = useState<string>(initialCommessa || "");
  const [loadingLastButton, setLoadingLastButton] = useState(false);
  const [id, _setId] = useState<string>(initialTodo || "");
  const [itemCommessa, setItemCommessa] = useState<any>({});
  const [shelf, setShelf] = useState<string>("");
  const [rows] = useState<number>(0);
  const [columns] = useState<string>("0");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDialogOpenOfficina, setIsDialogOpenOfficina] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ItemId>({
    commessa: "",
    status: "",
    shelf: "",
    test: [],
    id: "",
  });
  const [selectedItemOfficina, setSelectedItemOfficina] =
    useState<ItemIdOfficina>({ commessa: "", shelf: "", test: [], id: "" });
  const navigate = useNavigate();

  const fetchItem = async () => {
    if (commessa) {
      // Query for documents where commessa field matches the parameter
      const recordsCollection = collection(firestore, "records");
      const q = query(recordsCollection, where("commessa", "==", commessa));

      try {
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          // Get the first matching document
          const doc = querySnapshot.docs[0];
          // console("Document data:", doc.data());
          const newData = {
            ...doc.data(),
            idRecords: doc.id,
          };
          setItemCommessa(newData);
          // console(newData);
        } else {
          // console("No matching documents for commessa:", commessa);
          return null;
        }
      } catch (error) {
        console.error("Error fetching documents:", error);
        toast.error(`Error fetching documents: ${error}`);
        return null;
      }
    } else {
      // console("No commessa parameter provided");
      return null;
    }
  };

  useEffect(() => {
    if (!itemCommessa || Object.keys(itemCommessa).length === 0) {
      fetchItem();
    } else {
      // console("itemCommessa: ", itemCommessa);
    }
  });

  const handleCellClick = ({
    row,
    col,
    status,
  }: {
    row: number;
    col: string;
    status: string;
  }) => {
    // console("status: ", status);
    //console.log(`OUTSIDE - Cell clicked: ${commessa}-${shelf}-${row}-${col}`);
    const newShelf = `${shelf}-${row}-${col}`;
    // Query for documents where the 'shelf' array contains 'newShelf'
    const recordsCollection = collection(firestore, "records");

    // Create a query against the collection.
    const q = query(
      recordsCollection,
      where("shelf", "array-contains", newShelf)
    );
    const documentsArray: any[] = [];
    getDocs(q)
      .then((querySnapshot) => {
        if (querySnapshot.empty) {
          // console("No matching documents.");
          const item = {
            commessa,
            status,
            shelf: newShelf,
            test: documentsArray,
            id: id,
          };
          //console.log(item);
          setSelectedItem(item);
          setIsDialogOpen(true);
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
          id: id,
        };
        setSelectedItem(item); // Assuming 'commessa' is the itemId you want to pass
        setIsDialogOpen(true);
      })
      .catch((error) => {
        toast.error("Error getting documents: ", error);
      });
  };

  const handleLastConfirmation = async () => {
    setLoadingLastButton(true);
    try {
      if (itemCommessa.id != "") {
        const docRef = doc(firestore, "records", itemCommessa.idRecords);
        await updateDoc(docRef, { status: 10 });
      }
      toast.success("Posizione aggiornata correttamente");
      setLoadingLastButton(false);
      navigate("/");
    } catch (error) {
      toast.error(`Errore posizione: ${error}`);
      setLoadingLastButton(false);
    }
  };

  const handlePathClickOfficina = (shelf: string) => {
    //console.log(`Path "${shelf}" clicked from outside!`);
    //console.log(`INSIDE - Path clicked: ${shelf}`);
    const newShelf = `Officina.${shelf}`;
    //console.log(newShelf);
    const item = { commessa, shelf: newShelf, test: itemCommessa, id: id };
    setSelectedItemOfficina(item);
    setIsDialogOpenOfficina(true);
    //console.log(isDialogOpenOfficina)
  };

  return (
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
      <Navbar />
      <Row justify="center" style={{ marginBottom: 24 }}>
        <Col span={22}>
          {!shelf ? (
            <div style={{ width: "100%" }}>
              <Row
                justify="space-between"
                align="middle"
                style={{ marginBottom: 16 }}
              >
                <Button
                  icon={<ArrowLeftOutlined />}
                  type="primary"
                  onClick={() => navigate(-1)}
                  size="large"
                >
                  Indietro
                </Button>
              </Row>

              <Row justify="center">
                <Col span={12}>
                  <div
                    style={{
                      border: "1px solid rgb(95, 95, 95)",
                      borderRadius: 8,
                    }}
                  >
                    <OfficinaComponent
                      onPathClick={handlePathClickOfficina}
                      todo={itemCommessa}
                    />
                  </div>
                </Col>
              </Row>
            </div>
          ) : (
            <div style={{ width: "100%" }}>
              <Row
                justify="space-between"
                align="middle"
                style={{ marginBottom: 16 }}
              >
                <Button
                  icon={<LeftOutlined />}
                  onClick={() => setShelf("")}
                  type="text"
                />

                {id !== "" && (
                  <Space>
                    <Button
                      type="primary"
                      loading={loadingLastButton}
                      onClick={handleLastConfirmation}
                    >
                      Finito
                    </Button>
                    <DraggableComponent text={initialCommessa || ""} />
                  </Space>
                )}
              </Row>

              <ChessBoard
                item={itemCommessa}
                rows={rows}
                columns={columns}
                title={shelf}
                onPathClick={handleCellClick}
                shelf={[]}
              />

              <NewPlaceConfirmationDialog
                item={selectedItem}
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
              />
            </div>
          )}

          {user?.reparto === "Officina" && (
            <NewPlaceConfirmationDialogOfficina
              item={selectedItemOfficina}
              isOpen={isDialogOpenOfficina}
              onClose={() => {
                fetchItem();
                setIsDialogOpenOfficina(false);
              }}
            />
          )}
        </Col>
      </Row>
    </Layout>
  );
};

export default NewPositions;
