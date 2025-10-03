// export default DepotManager;
import { Button, Layout, Modal, Select } from "antd";
import Navbar from "../components/navbar";
import { useContext, useEffect, useState } from "react";
import Warehouse from "../components/warehouse";
import ChessBoard from "../components/chessBoard";
import axios from "axios";
import OfficinaComponent from "../components/ogComponents/pianta_officina";
import toast from "react-hot-toast";
import UserContext from "../provider/userInfoProvider";

const { Content } = Layout;

interface SectorInfo {
  name: string;
  row: number;
  record: any[];
  column: number;
}

const DepotManager = () => {
  const { user } = useContext(UserContext);
  console.log(user);
  const raw = localStorage.getItem("locationsParams");
  const param = raw ? JSON.parse(raw) : null;
  const [seeSector, setSeeSector] = useState<string>("");
  const [sectorInfo, setSectorInfo] = useState<SectorInfo>(null as any);
  const [openConfirmModalNewShelf, setOpenConfirmModalNewShelf] =
    useState<boolean>(false);
  const [openConfirmModalNewOfficinaPos, setOpenConfirmModalNewOfficinaPos] =
    useState<boolean>(false);
  const [shelfSelected, setShelfSelected] = useState<string>("");
  const [statusSelected, setStatusSelected] = useState<number>(0);
  const [shelfToShow, setShelfToShow] = useState<string[]>([]);
  const [posData] = useState<any>(param.pos);
  const [todoData, setTodoData] = useState<any>(param.todo);
  const url = import.meta.env.VITE_BACKEND_URL;

  console.log(posData);

  useEffect(() => {
    if (todoData?.shelf?.length > 0) {
      setShelfToShow([...todoData.shelf]);
    }
  }, []); // Empty dependency array means it only runs once on mount

  function handleSectorSelect(sector: string, sectorInfo: SectorInfo): void {
    setSeeSector(sector);
    setSectorInfo(sectorInfo);
    console.log(sector, sectorInfo);
  }
  function handlePathClick(row: number, col: string, status: number): void {
    //console.log(row, col, status);
    setStatusSelected(status);
    setShelfSelected(`${seeSector}-${row}-${col}`);
    setOpenConfirmModalNewShelf(true);
  }

  function handleOfficinaPosClick(pos: string): void {
    setShelfSelected(pos);
    console.log(pos);
    setOpenConfirmModalNewOfficinaPos(true);
  }

  function handleModalOfficinaConfirmation(): void {
    try {
      axios
        .post(`${url}/updateofficinapos`, {
          todo: todoData,
          shelf: `${shelfSelected}`,
          author: user?.name + " " + user?.surname || "anonymous",
        })
        .then((response) => {
          if (response.data.success) {
            setTodoData({
              ...todoData,
              shelf: ["Officina." + shelfSelected],
            });
            toast.success("Posizione aggiornata con successo");
          }
        });
    } catch (error) {
      toast.error("Errore nell'aggiornamento della posizione");
    }
    setOpenConfirmModalNewOfficinaPos(false);
  }

  function handleModalConfirmation(): void {
    //console.log(todoData);
    axios
      .post(`${url}/updatedepot`, {
        shelf: `${shelfSelected}`,
        status: statusSelected,
      })
      .then(() => {
        setSectorInfo({
          ...sectorInfo,
          record: sectorInfo.record.map((item) => {
            if (item.shelf === `${shelfSelected}`) {
              return {
                ...item,
                status: statusSelected,
              };
            }
            return item;
          }),
        });

        if (todoData.id !== undefined) {
          //console.log(todoData.id);
          // Check if the shelf is already in the array
          const isAlreadyInShelf = shelfToShow.includes(shelfSelected);

          if (isAlreadyInShelf) {
            // If it's already in the array, remove it
            const newShelfToShow = shelfToShow.filter(
              (shelf) => shelf !== shelfSelected
            );
            setShelfToShow(newShelfToShow);

            // Use the same updateshelf endpoint but with a remove flag
            axios.post(`${url}/updateshelf`, {
              commessa: todoData.commessa,
              iterationId: todoData.id,
              shelf: shelfSelected,
              remove: true, // Add this flag to indicate removal
              author: user?.name + " " + user?.surname || "anonymous",
            });
          } else {
            // If it's not in the array, add it as before
            axios.post(`${url}/updateshelf`, {
              commessa: todoData.commessa,
              iterationId: todoData.id,
              shelf: shelfSelected,
              author: user?.name + " " + user?.surname || "anonymous",
            });

            // Then update the local state with a new array
            const newShelfToShow = [...shelfToShow];
            if (!newShelfToShow.includes(shelfSelected)) {
              newShelfToShow.push(shelfSelected);
            }
            setShelfToShow(newShelfToShow);
          }

          setOpenConfirmModalNewShelf(false);
        } else {
          setOpenConfirmModalNewShelf(false);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

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
      <Content style={{ padding: "24px 48px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-start",
            marginBottom: 24,
          }}
        >
          {seeSector && (
            <Button
              type="primary"
              onClick={() => {
                setSeeSector("");
                setSectorInfo(null as any);
              }}
            >
              Torna al {posData === "Magazzino" ? "Magazzino" : "Officina"}
            </Button>
          )}
        </div>
        {posData === "Magazzino" && !seeSector && !sectorInfo ? (
          <Warehouse onSectorSelect={handleSectorSelect} />
        ) : posData === "Magazzino" && seeSector && sectorInfo ? (
          <ChessBoard
            rows={sectorInfo.row}
            columns={sectorInfo.column.toString()}
            title={seeSector}
            items={sectorInfo.record}
            commessa={todoData.commessa}
            shelf={todoData.id !== undefined ? shelfToShow : []}
            onPathClick={({ row, col, status }) =>
              handlePathClick(row, col, status)
            }
          />
        ) : (
          <OfficinaComponent
            onPathClick={handleOfficinaPosClick}
            todo={todoData}
          />
        )}
      </Content>

      <Modal
        title="Conferma selezione posizione"
        open={openConfirmModalNewShelf}
        onCancel={() => {
          setSeeSector("");
          setSectorInfo(null as any);
        }}
        footer={null}
        width={600}
      >
        <p>
          Hai selezionato il settore <strong>{shelfSelected}</strong>. <br />
          Aggiungi materiale a questa commessa: {todoData.commessa}
        </p>
        <Select
          placeholder="Seleziona lo stato"
          value={statusSelected}
          onChange={setStatusSelected}
          style={{ width: 200 }}
        >
          <Select.Option value={1}>Posizione Disponibile</Select.Option>
          <Select.Option value={2}>Posizione Usabile</Select.Option>
          <Select.Option value={3}>Posizione Piena</Select.Option>
        </Select>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <Button
            onClick={() => {
              setOpenConfirmModalNewShelf(false);
            }}
          >
            Annulla
          </Button>
          <Button type="primary" onClick={() => handleModalConfirmation()}>
            Conferma
          </Button>
        </div>
      </Modal>

      <Modal
        title="Conferma selezione posizione"
        open={openConfirmModalNewOfficinaPos}
        onCancel={() => {
          setOpenConfirmModalNewOfficinaPos(false);
        }}
        footer={null}
        width={600}
      >
        <p>
          Hai selezionato il settore <strong>{shelfSelected}</strong>. <br />
          Sposta la commessa {todoData.commessa}
        </p>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <Button
            onClick={() => {
              setOpenConfirmModalNewShelf(false);
            }}
          >
            Annulla
          </Button>
          <Button
            type="primary"
            onClick={() => handleModalOfficinaConfirmation()}
          >
            Conferma
          </Button>
        </div>
      </Modal>
    </Layout>
  );
};

export default DepotManager;
