//#region Imports
import { useState, useEffect } from "react";
import { Button, Row, Col, Typography, Spin, Card, Popover } from "antd";
import { useCustomToast } from "../Subcomponents/Comp_Toast";
import FilterMontaggio from "../Subcomponents/Comp_FilterHoursMontaggio";
import AddMontaggioHours from "../Subcomponents/Comp_AddNewMontaggioHours";
import FilterCablaggio from "../Subcomponents/Comp_FilterHoursCablaggio";
import AddCablaggioHours from "../Subcomponents/Comp_AddNewCablaggioHours";
//#endregion

//#region Interfaces
type RecordType = {
  montaggio?: {
    orePreviste: {
      ore: 0;
    };
    oreLav: Array<{
      tecnico: string;
      task: string;
      oreLav: number;
      timestamp: string;
      note: string;
    }>;
  };
  tecniciassegnati: Array<[string]>;
  cablaggio?: {
    orePreviste: {
      ausiliari: number;
      potenza: number;
    };
    oreLav: Array<{
      tecnico: string;
      task: string;
      oreLav: number;
      timestamp: string;
      note: string;
    }>;
  };
};

interface AddHourProps {
  commessa: any;
}
//#endregion

const AddHour: React.FC<AddHourProps> = ({ commessa }) => {
  //#region Variables
  const { Title, Text } = Typography;
  const { showErrorToast, showSuccessToast } = useCustomToast();
  const [loading, setLoading] = useState(false);
  const [addHourCablaggio, setAddHourCablaggio] = useState(false);
  const [addHourMontaggio, setAddHourMontaggio] = useState(false);
  const [record, setRecord] = useState<RecordType>({
    tecniciassegnati: [],
    montaggio: {
      orePreviste: {
        ore: 0,
      },
      oreLav: [],
    },
    cablaggio: {
      orePreviste: {
        ausiliari: 0,
        potenza: 0,
      },
      oreLav: [],
    },
  });
  const [tecnici, setTecnici] = useState<string[]>([]);
  const [oreCableggio, setOreCableggio] = useState(0.5);
  const [dataCableggio, setDataCableggio] = useState(new Date());
  const [taskCableggio, setTaskCableggio] = useState("");
  const [noteCableggio, setNoteCableggio] = useState("");
  const [tecnicoCableggio, setTecnicoCableggio] = useState("");
  const [oreMontaggio, setOreMontaggio] = useState(0.5);
  const [taskMontaggio, setTaskMontaggio] = useState("");
  const [dataMontaggio, setDataMontaggio] = useState(new Date());
  const [noteMontaggio, setNoteMontaggio] = useState("");
  const [tecnicoMontaggio, setTecnicoMontaggio] = useState("");

  const [filterMontaggioTecnico, setFilterMontaggioTecnico] = useState("");
  const [filterMontaggioLav, setFilterMontaggioLav] = useState("");
  const [filterMontaggioDate, setFilterMontaggioDate] = useState("");

  const [filterCablaggioTecnico, setFilterCablaggioTecnico] = useState("");
  const [filterCablaggioLav, setFilterCablaggioLav] = useState("");
  const [filterCablaggioDate, setFilterCablaggioDate] = useState("");
  const url = import.meta.env.VITE_BACKEND_URL;

  const [windowDim, setWindowDim] = useState(getWindowDimensions());
  const Lavorazioni = [
    { code: "M1", desc: "Montaggio Canale" },
    { code: "M2", desc: "Installazione Componenti" },
    { code: "M3", desc: "Montaggio Morsetti" },
    { code: "M4", desc: "Etichettatura su componenti e morsetti" },
    { code: "C1", desc: "Cablaggio Potenza" },
    { code: "C2", desc: "Cablaggio Ausiliari" },
    { code: "C3", desc: "Cablaggio Rete Dati" },
  ];
  //#endregion

  //#region get Window Dimension and Fetch Data & Tecnici
  function getWindowDimensions() {
    const { innerWidth: width, innerHeight: height } = window;
    return {
      width,
      height,
    };
  }
  useEffect(() => {
    function handleResize() {
      setWindowDim(getWindowDimensions());
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // console(commessa.commessa);
        const response = await fetch(`${url}/gethours/${commessa.commessa}`);
        if (!response.ok) {
          throw new Error("Failed to fetch hours");
        }

        const data = await response.json();
        if (data.success) {
          // console(data.data);
          setRecord(data.data);
        } else {
          throw new Error(data.message || "Failed to fetch hours");
        }
      } catch (error: any) {
        showErrorToast(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [commessa]);

  useEffect(() => {
    setTecnici(record.tecniciassegnati.flat());
  }, [record]);
  //#endregion

  //#region Clear Filters functions
  const clearMontaggioFilters = () => {
    setFilterMontaggioTecnico("");
    setFilterMontaggioLav("");
    setFilterMontaggioDate("");
  };

  const clearCablaggioFilters = () => {
    setFilterCablaggioTecnico("");
    setFilterCablaggioLav("");
    setFilterCablaggioDate("");
  };
  //#endregion

  //#region Save New hours added
  const updateOreLav = async (newEntry: any, method: string) => {
    // Update the local state
    setRecord((prevRecord: any) => ({
      ...prevRecord,
      [method]: {
        ...prevRecord[method],
        oreLav: [...prevRecord[method].oreLav, newEntry],
      },
    }));

    const localRecord = {
      ...record,
      [method]: {
        ...record[method as keyof RecordType],
        oreLav: [
          ...((record[method as keyof RecordType] as any)?.oreLav || []),
          newEntry,
        ],
      },
    };

    // Extract root records for cablaggio and montaggio
    const rootRecordCablaggio = localRecord.cablaggio;
    const rootRecordMontaggio = localRecord.montaggio;

    // Calculate expected hours
    const expectedHours =
      (rootRecordMontaggio?.orePreviste?.ore || 0) +
      (rootRecordCablaggio?.orePreviste?.ausiliari || 0) +
      (rootRecordCablaggio?.orePreviste?.potenza || 0);

    // Calculate worked hours
    const workedHoursCablaggio = rootRecordCablaggio?.oreLav.reduce(
      (total: number, item: any) => total + item.oreLav,
      0
    );
    const workedHoursMontaggio = rootRecordMontaggio?.oreLav.reduce(
      (total: number, item: any) => total + item.oreLav,
      0
    );

    const totalWorkedHours =
      (workedHoursCablaggio || 0) + (workedHoursMontaggio || 0);
    const percentageWorked =
      expectedHours > 0 ? (totalWorkedHours / expectedHours) * 100 : 0;

    // Get the current maximum ID in the arra
    try {
      const response = await fetch(`${url}/updatehours/${commessa.commessa}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          method,
          newEntry,
          progression: percentageWorked,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update hours");
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || "Failed to update hours");
      }

      return record;
    } catch (error: any) {
      showErrorToast(error.message);
      throw error;
    }
  };

  const handleSubmit = (e: any, method: string) => {
    e.preventDefault();
    if (
      (method === "montaggio" &&
        tecnicoMontaggio !== "" &&
        taskMontaggio !== "") ||
      (method === "cablaggio" &&
        tecnicoCableggio !== "" &&
        taskCableggio !== "")
    ) {
      const newOreLavEntry = {
        tecnico: method === "montaggio" ? tecnicoMontaggio : tecnicoCableggio,
        task: method === "montaggio" ? taskMontaggio : taskCableggio,
        oreLav: method === "montaggio" ? oreMontaggio : oreCableggio,
        timestamp:
          method === "montaggio"
            ? new Date(dataMontaggio).toISOString()
            : new Date(dataCableggio).toISOString(),
        note: method === "montaggio" ? noteMontaggio : noteCableggio,
      };

      updateOreLav(newOreLavEntry, method);
      if (method !== "montaggio") {
        setTaskCableggio("");
        setOreCableggio(0.5);
        setDataCableggio(new Date());
        setNoteCableggio("");
      } else {
        setTaskMontaggio("");
        setOreMontaggio(0.5);
        setDataMontaggio(new Date());
        setNoteMontaggio("");
      }
      showSuccessToast("Ora aggiunta con successo");
    } else {
      showErrorToast("Non hai selezionato tutti i campi necessari");
    }
  };
  //#endregion

  const addHoursToDate = (date: Date, hours: number): Date => {
    const newDate = new Date(date);
    newDate.setTime(newDate.getTime() + hours * 60 * 60 * 1000);
    return newDate;
  };

  //#region Main Return
  //console.log(record);
  return (
    <div style={{ width: "100%" }}>
      {loading ? (
        <div style={{ textAlign: "center", padding: "20px" }}>
          <Spin size="large" />
        </div>
      ) : (
        <Row gutter={32}>
          <Col span={12}>
            {/* Montaggio Section */}
            <div style={{ position: "relative", marginBottom: "5px" }}>
              <Title level={4} style={{ textAlign: "center" }}>
                Montaggio - {record.montaggio?.orePreviste?.ore} ore
              </Title>
              <Button
                style={{ position: "absolute", right: 0, top: 0 }}
                onClick={() => {
                  setAddHourMontaggio(!addHourMontaggio);
                  setTaskMontaggio("");
                  setTecnicoMontaggio("");
                  setOreMontaggio(0.5);
                  setDataMontaggio(new Date());
                  setNoteMontaggio("");
                }}
              >
                {addHourMontaggio ? "Chiudi" : "Aggiungi ora"}
              </Button>
            </div>

            <FilterMontaggio
              filterMontaggioTecnico={filterMontaggioTecnico}
              setFilterMontaggioTecnico={setFilterMontaggioTecnico}
              filterMontaggioLavorazione={filterMontaggioLav}
              setFilterMontaggioLavorazione={setFilterMontaggioLav}
              filterMontaggioDate={filterMontaggioDate}
              clearMontaggioFilters={clearMontaggioFilters}
              record={record}
              setFilterMontaggioDate={setFilterMontaggioDate}
            />

            <div
              style={{
                border: "1px solid #d9d9d9",
                borderRadius: "8px",
                padding: "16px",
                maxHeight:
                  windowDim.height < 900
                    ? "200px"
                    : addHourMontaggio
                    ? 250
                    : 650,
                overflowY: "auto",
              }}
            >
              {record.montaggio !== undefined &&
                record.montaggio.oreLav
                  .filter((item: any) => {
                    const matchesTecnico =
                      !filterMontaggioTecnico ||
                      item.tecnico === filterMontaggioTecnico;
                    const matchesLavorazione =
                      !filterMontaggioLav || item.task === filterMontaggioLav;
                    const matchesDate =
                      !filterMontaggioDate ||
                      addHoursToDate(new Date(item.timestamp), 2)
                        .toISOString()
                        .split("T")[0] === filterMontaggioDate;
                    return matchesTecnico && matchesLavorazione && matchesDate;
                  })
                  .sort((a: any, b: any) => {
                    const dateA: any = new Date(a.timestamp);
                    const dateB: any = new Date(b.timestamp);
                    return dateB - dateA;
                  })
                  .map((item: any) => (
                    <Card
                      key={item.id}
                      style={{ marginBottom: 16 }}
                      bodyStyle={{ padding: "12px" }}
                    >
                      <Row align="middle" justify="space-between">
                        <Col flex="2">
                          <Text>{item.tecnico}</Text>
                        </Col>
                        <Col flex="1" style={{ textAlign: "center" }}>
                          <Text>
                            {(() => {
                              const found = Lavorazioni.find(
                                (lav) => lav.code === item.task
                              );
                              return found
                                ? `${item.task} - ${found.desc}`
                                : item.task;
                            })()}
                          </Text>
                        </Col>
                        <Col flex="1" style={{ textAlign: "center" }}>
                          <Text>{item.oreLav}h</Text>
                        </Col>
                        <Col flex="1" style={{ textAlign: "center" }}>
                          <Text>
                            {new Date(item.timestamp).toLocaleDateString(
                              "it-IT"
                            )}
                          </Text>
                        </Col>
                        <Col>
                          <Popover
                            content={
                              <div
                                style={{ padding: "8px", textAlign: "center" }}
                              >
                                {item.note}
                              </div>
                            }
                            trigger="click"
                          >
                            <Button
                              size="small"
                              disabled={item.note.trim() === ""}
                            >
                              ...
                            </Button>
                          </Popover>
                        </Col>
                      </Row>
                    </Card>
                  ))}
            </div>

            {addHourMontaggio && (
              <AddMontaggioHours
                handleSubmit={(e) => handleSubmit(e, "montaggio")}
                dataMontaggioNew={dataMontaggio}
                setDataMontaggioNew={setDataMontaggio}
                tecniciAssegnatiCommessa={tecnici}
                setTecnicoMontaggioNew={setTecnicoMontaggio}
                setTasksMontaggioNew={setTaskMontaggio}
                setOreMontaggioNew={setOreMontaggio}
                setNoteMontaggioNew={setNoteMontaggio}
                tecnicoMontaggioNew={tecnicoMontaggio}
                tasksMontaggioNew={taskMontaggio}
                oreMontaggioNew={oreMontaggio}
                noteMontaggioNew={noteMontaggio}
              />
            )}
          </Col>

          <Col span={12}>
            {/* Cablaggio Section */}
            <div style={{ position: "relative", marginBottom: "5px" }}>
              <Title level={4} style={{ textAlign: "center" }}>
                Cablaggio -{" "}
                {record.cablaggio &&
                  record.cablaggio?.orePreviste?.potenza +
                    record.cablaggio?.orePreviste?.ausiliari}{" "}
                ore
              </Title>
              <Button
                style={{ position: "absolute", right: 0, top: 0 }}
                onClick={() => {
                  setAddHourCablaggio(!addHourCablaggio);
                  setTaskCableggio("");
                  setTecnicoCableggio("");
                  setOreCableggio(0.5);
                  setDataCableggio(new Date());
                  setNoteCableggio("");
                }}
              >
                {addHourCablaggio ? "Chiudi" : "Aggiungi ora"}
              </Button>
            </div>

            <FilterCablaggio
              filterCablaggioTecnico={filterCablaggioTecnico}
              setFilterCablaggioTecnico={setFilterCablaggioTecnico}
              filterCablaggioLavorazione={filterCablaggioLav}
              setFilterCablaggioLavorazione={setFilterCablaggioLav}
              filterCablaggioDate={filterCablaggioDate}
              clearCablaggioFilters={clearCablaggioFilters}
              record={record}
              setFilterCablaggioDate={setFilterCablaggioDate}
            />

            <div
              style={{
                border: "1px solid #d9d9d9",
                borderRadius: "8px",
                padding: "16px",
                maxHeight:
                  windowDim.height < 900
                    ? "200px"
                    : addHourCablaggio
                    ? 250
                    : 650,
                overflowY: "auto",
              }}
            >
              {record.cablaggio !== undefined &&
                record.cablaggio.oreLav
                  .filter((item: any) => {
                    const matchesTecnico =
                      !filterCablaggioTecnico ||
                      item.tecnico === filterCablaggioTecnico;
                    const matchesLavorazione =
                      !filterCablaggioLav || item.task === filterCablaggioLav;
                    const matchesDate =
                      !filterCablaggioDate ||
                      addHoursToDate(new Date(item.timestamp), 2)
                        .toISOString()
                        .split("T")[0] === filterCablaggioDate;
                    return matchesTecnico && matchesLavorazione && matchesDate;
                  })
                  .sort((a: any, b: any) => {
                    const dateA: any = new Date(a.timestamp);
                    const dateB: any = new Date(b.timestamp);
                    return dateB - dateA;
                  })
                  .map((item: any) => (
                    <Card
                      key={item.id}
                      style={{ marginBottom: 16 }}
                      bodyStyle={{ padding: "12px" }}
                    >
                      <Row align="middle" justify="space-between">
                        <Col flex="2">
                          <Text>{item.tecnico}</Text>
                        </Col>
                        <Col flex="1" style={{ textAlign: "center" }}>
                          <Text>
                            {(() => {
                              const found = Lavorazioni.find(
                                (lav) => lav.code === item.task
                              );
                              return found
                                ? `${item.task} - ${found.desc}`
                                : item.task;
                            })()}
                          </Text>
                        </Col>
                        <Col flex="1" style={{ textAlign: "center" }}>
                          <Text>{item.oreLav}h</Text>
                        </Col>
                        <Col flex="1" style={{ textAlign: "center" }}>
                          <Text>
                            {new Date(item.timestamp).toLocaleDateString(
                              "it-IT"
                            )}
                          </Text>
                        </Col>
                        <Col>
                          <Popover
                            content={
                              <div
                                style={{ padding: "8px", textAlign: "center" }}
                              >
                                {item.note}
                              </div>
                            }
                            trigger="click"
                          >
                            <Button
                              size="small"
                              disabled={item.note.trim() === ""}
                            >
                              ...
                            </Button>
                          </Popover>
                        </Col>
                      </Row>
                    </Card>
                  ))}
            </div>

            {addHourCablaggio && (
              <AddCablaggioHours
                handleSubmit={(e) => handleSubmit(e, "cablaggio")}
                dataCablaggioNew={dataCableggio}
                setDataCablaggioNew={setDataCableggio}
                tecniciAssegnatiCommessa={tecnici}
                setTecnicoCablaggioNew={setTecnicoCableggio}
                setTasksCablaggioNew={setTaskCableggio}
                setOreCablaggioNew={setOreCableggio}
                setNoteCableggioNew={setNoteCableggio}
                tecnicoCableggioNew={tecnicoCableggio}
                tasksCablaggioNew={taskCableggio}
                oreCablaggioNew={oreCableggio}
                noteCableggioNew={noteCableggio}
              />
            )}
          </Col>
        </Row>
      )}
    </div>
  );
  //#endregion
};

export default AddHour;
