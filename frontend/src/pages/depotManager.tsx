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
import React from "react";

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
  const [openConfirmModalFinish, setOpenConfirmModalFinish] =
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

  function handleFinishClick(): void {
    try {
      axios
        .post(`${url}/updatestatoiffinito`, {
          todo: todoData,
        })
        .then((response) => {
          if (response.data.success) {
            toast.success("Iterazione aggiornata con successo");
            // Navigate back or refresh the page
            window.location.href = "/";
          }
        });
    } catch (error) {
      toast.error("Errore nell'aggiornamento dell'iterazione");
    }
    setOpenConfirmModalFinish(false);
  }

  function handleConfirmFinish(): void {
    setOpenConfirmModalFinish(true);
  }

  function handleShelfMove(fromShelf: string, toShelf: string): void {
    // Check if the target shelf is available (status 0 or 1)
    const targetShelfStatus = getShelfStatus(toShelf);

    if (targetShelfStatus === 3) {
      toast.error("La posizione di destinazione è piena");
      return;
    }

    try {
      // Remove from old shelf and add to new shelf
      axios
        .post(`${url}/moveshelf`, {
          commessa: todoData.commessa,
          iterationId: todoData.id,
          fromShelf: fromShelf,
          toShelf: toShelf,
          author: user?.name + " " + user?.surname || "anonymous",
        })
        .then((response) => {
          if (response.data.success) {
            // Update local state
            const newShelfToShow = shelfToShow.map((shelf) =>
              shelf === fromShelf ? toShelf : shelf
            );
            setShelfToShow(newShelfToShow);

            // Update sector info if needed
            // setSectorInfo({
            //   ...sectorInfo,
            //   record: sectorInfo.record.map((item) => {
            //     if (item.shelf === fromShelf) {
            //       return { ...item, shelf: toShelf };
            //     }
            //     if (item.shelf === toShelf) {
            //       return { ...item, status: 2 }; // Mark as occupied
            //     }
            //     return item;
            //   }),
            // });

            toast.success(`Materiale spostato da ${fromShelf} a ${toShelf}`);
          }
        })
        .catch((error) => {
          toast.error("Errore nello spostamento del materiale");
          console.error("Move error:", error);
        });
    } catch (error) {
      toast.error("Errore nello spostamento del materiale");
    }
  }

  function handleShelfMoveWithStatus(
    fromShelf: string,
    toShelf: string,
    fromStatus: number,
    toStatus: number
  ): void {
    try {
      // First update the depot status for the "from" shelf
      axios
        .post(`${url}/updatedepot`, {
          shelf: fromShelf,
          status: fromStatus,
          author: user?.name + " " + user?.surname || "anonymous",
        })
        .then((fromDepotResponse) => {
          if (fromDepotResponse.data.success) {
            // Then update the depot status for the "to" shelf
            axios
              .post(`${url}/updatedepot`, {
                shelf: toShelf,
                status: toStatus,
                author: user?.name + " " + user?.surname || "anonymous",
              })
              .then((toDepotResponse) => {
                if (toDepotResponse.data.success) {
                  // Finally move the shelf in the iteration
                  axios
                    .post(`${url}/moveshelf`, {
                      commessa: todoData.commessa,
                      iterationId: todoData.id,
                      fromShelf: fromShelf,
                      toShelf: toShelf,
                      author: user?.name + " " + user?.surname || "anonymous",
                    })
                    .then((moveResponse) => {
                      if (moveResponse.data.success) {
                        // Update local state
                        const newShelfToShow = shelfToShow.map((shelf) =>
                          shelf === fromShelf ? toShelf : shelf
                        );
                        setShelfToShow(newShelfToShow);

                        // Update sector info to reflect the new statuses
                        setSectorInfo({
                          ...sectorInfo,
                          record: sectorInfo.record.map((item) => {
                            if (item.shelf === toShelf) {
                              return { ...item, status: toStatus };
                            }
                            if (item.shelf === fromShelf) {
                              return { ...item, status: fromStatus };
                            }
                            return item;
                          }),
                        });

                        const getStatusText = (status: number) => {
                          switch (status) {
                            case 1:
                              return "Disponibile";
                            case 2:
                              return "Usabile";
                            case 3:
                              return "Piena";
                            default:
                              return "Sconosciuto";
                          }
                        };

                        toast.success(
                          `Materiale spostato da ${fromShelf} (${getStatusText(
                            fromStatus
                          )}) a ${toShelf} (${getStatusText(toStatus)})`
                        );
                      } else {
                        toast.error("Errore nello spostamento del materiale");
                      }
                    })
                    .catch((error) => {
                      toast.error("Errore nello spostamento del materiale");
                      console.error("Move error:", error);
                    });
                } else {
                  toast.error(
                    "Errore nell'aggiornamento dello stato della posizione di destinazione"
                  );
                }
              })
              .catch((error) => {
                toast.error(
                  "Errore nell'aggiornamento dello stato della posizione di destinazione"
                );
                console.error("To depot update error:", error);
              });
          } else {
            toast.error(
              "Errore nell'aggiornamento dello stato della posizione di partenza"
            );
          }
        })
        .catch((error) => {
          toast.error(
            "Errore nell'aggiornamento dello stato della posizione di partenza"
          );
          console.error("From depot update error:", error);
        });
    } catch (error) {
      toast.error("Errore nello spostamento del materiale");
      console.error("General error:", error);
    }
  }

  function getShelfStatus(shelfKey: string): number {
    if (!sectorInfo?.record) return 0;

    const shelfData = sectorInfo.record.find((item: any) => {
      return item && item.shelf === shelfKey;
    });

    return shelfData?.status || 0;
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
          <React.Fragment>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                gap: 20,
                marginBottom: 16,
                marginRight: 200,
              }}
            >
              {todoData.commessa ? (
                <>
                  <div
                    draggable={true}
                    onDragStart={(e) => {
                      // Mark the drag as a generic selection action
                      e.dataTransfer.setData("text/plain", "drag-select");
                    }}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      padding: "10px 16px",
                      background: "rgba(30, 42, 74, 0.8)",
                      color: "#4FC3F7",
                      border: "1px solid #4FC3F7",
                      borderRadius: 20,
                      cursor: "grab",
                      boxShadow: "0 2px 8px rgba(79, 195, 247, 0.2)",
                      userSelect: "none",
                      fontSize: "14px",
                      fontWeight: "500",
                      transition: "all 0.2s ease",
                      backdropFilter: "blur(10px)",
                      minWidth: "120px",
                    }}
                    title="Trascina su una cella per selezionarla"
                  >
                    {todoData.commessa}
                  </div>
                  <Button
                    type="primary"
                    onClick={() => {
                      handleConfirmFinish();
                    }}
                  >
                    Finito
                  </Button>
                </>
              ) : null}
            </div>

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
              onShelfMove={handleShelfMove}
              onShelfMoveWithStatus={handleShelfMoveWithStatus}
            />
          </React.Fragment>
        ) : posData === "Officina" ? (
          <OfficinaComponent
            onPathClick={handleOfficinaPosClick}
            todo={todoData}
          />
        ) : (
          <Warehouse onSectorSelect={handleSectorSelect} />
        )}
      </Content>

      <Modal
        title={
          shelfToShow.includes(shelfSelected)
            ? "Conferma rimozione posizione"
            : "Conferma selezione posizione"
        }
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
          {shelfToShow.includes(shelfSelected)
            ? `Rimuovi materiale da questa commessa: ${todoData.commessa}`
            : `Aggiungi materiale a questa commessa: ${todoData.commessa}`}
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
          <Button
            type="primary"
            onClick={() => handleModalConfirmation()}
            danger={shelfToShow.includes(shelfSelected)}
          >
            {shelfToShow.includes(shelfSelected)
              ? "Conferma Rimozione"
              : "Conferma"}
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
      <Modal
        title="Conferma completamento"
        open={openConfirmModalFinish}
        onCancel={() => {
          setOpenConfirmModalFinish(false);
        }}
        footer={null}
        width={500}
      >
        <p>
          Sei sicuro di voler spostare la commessa{" "}
          <strong>{todoData.commessa}</strong> come pronta a magazzino?
        </p>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 8,
            marginTop: 16,
          }}
        >
          <Button
            onClick={() => {
              setOpenConfirmModalFinish(false);
            }}
          >
            Annulla
          </Button>
          <Button type="primary" onClick={() => handleFinishClick()}>
            Conferma Completamento
          </Button>
        </div>
      </Modal>
    </Layout>
  );
};

export default DepotManager;
