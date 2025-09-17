//#region Imports
import { useState, useEffect, useContext, useMemo } from "react";
import {
  Button,
  Typography,
  Spin,
  Input,
  Space,
  Row,
  Col,
  Modal,
  Select,
} from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import { useCustomToast } from "../Subcomponents/Comp_Toast";
import UserContext from "../../provider/userInfoProvider";
import {
  ErrorCard,
  ErrorForm,
} from "../Subcomponents/Comp_ItemErrorInAddErrorModal";
import axios from "axios";
import * as XLSX from "xlsx";
//#endregion

//#region Interfaces
interface OreLav {
  tecnico: string;
  task: string;
  oreLav: number;
  timestamp: string;
  note: string;
}

interface ErrorItem {
  causaesterna: boolean;
  ore: number;
  note: string;
  repartodisbaglio: string;
  titolo: string;
}

type RecordType = {
  montaggio?: {
    orePreviste: {
      ore: number;
    };
    oreLav: OreLav[];
  };
  cablaggio?: {
    orePreviste: {
      ausiliari: number;
      potenza: number;
    };
    oreLav: OreLav[];
  };
  errori?: {
    [key: string]: ErrorItem[];
    df: ErrorItem[];
    nu: ErrorItem[];
    cp: ErrorItem[];
    ca: ErrorItem[];
    co: ErrorItem[];
  };
};

interface AddHourProps {
  commessa: any;
}

//#endregion

const AddError: React.FC<AddHourProps> = ({ commessa }) => {
  //#region Variables

  //Global
  const { showErrorToast, showSuccessToast } = useCustomToast();
  const { user } = useContext(UserContext);
  const url = import.meta.env.VITE_BACKEND_URL;
  const [loading, setLoading] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isOpenModify, setIsOpenModify] = useState(false);
  const [record, setRecord] = useState<RecordType>({});

  //Runtime
  const [ore, setOre] = useState(0.5);
  const [note, setNote] = useState("");
  const [titolo, setTitolo] = useState("");
  const [repartoDisbaglio, setRepartoDisbaglio] = useState("");
  const [schemista, setSchemista] = useState("");
  const [provenienzaSchemista, setProvenienzaSchemista] = useState("");

  //Edit
  const [oreEdit, setOreEdit] = useState(0.5);
  const [noteEdit, setNoteEdit] = useState("");
  const [titoloEdit, setTitoloEdit] = useState("");
  const [repartoDisbaglioEdit, setRepartoDisbaglioEdit] = useState("");
  const [schemistaEdit, setSchemistaEdit] = useState("");
  const [provenienzaSchemistaEdit, setProvenienzaSchemistaEdit] = useState("");

  //Error
  const [addHourErroreDF, setAddHourErroreDF] = useState<boolean>(false);
  const [addHourErroreNU, setAddHourErroreNU] = useState<boolean>(false);
  const [addHourErroreCP, setAddHourErroreCP] = useState<boolean>(false);
  const [addHourErroreCA, setAddHourErroreCA] = useState<boolean>(false);
  const [addHourErroreCO, setAddHourErroreCO] = useState<boolean>(false);

  const setters = useMemo(
    () => ({
      setRepartoDisbaglio,
      setTitolo,
      setProvenienzaSchemista,
      setSchemista,
      setOre,
      setNote,
    }),
    [
      setRepartoDisbaglio,
      setTitolo,
      setProvenienzaSchemista,
      setSchemista,
      setOre,
      setNote,
    ]
  );
  const formData = useMemo(
    () => ({
      repartoDisbaglio,
      titolo,
      provenienzaSchemista,
      schemista,
      ore,
      note,
    }),
    [repartoDisbaglio, titolo, provenienzaSchemista, schemista, ore, note]
  );

  //#endregion

  //#region Fetch Data
  const fetchOptions = async () => {
    setLoading(true);
    setRecord(commessa);
    setLoading(false);
  };

  useEffect(() => {
    if (commessa.errori !== undefined) {
      fetchOptions();
    }
  }, [commessa]);
  //#endregion

  //#region Save New Errors on DB
  const handleSubmit = async (e: any, method: string) => {
    e.preventDefault();

    const newOreLavEntry = {
      schemista: schemista,
      provenienzaSchemista: provenienzaSchemista,
      note: note,
      ore: ore,
      repartodisbaglio: repartoDisbaglio,
      titolo: titolo,
    };

    try {
      const response = await fetch(`${url}/adderrors/${commessa.commessa}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          method,
          newEntry: newOreLavEntry,
        }),
      });
      const responseData = await response.json();

      if (responseData.success) {
        setRecord(responseData.data);
        showSuccessToast("Errore aggiunto con successo");
      } else {
        showErrorToast("Errore nell'aggiunta dell'errore");
      }
    } catch (error) {
      console.error("Error adding error:", error);
      showErrorToast("Errore nell'aggiunta dell'errore");
    }

    // Reset form fields
    setRepartoDisbaglio("");
    setTitolo("");
    setOre(0.5);
    setNote("");
    setProvenienzaSchemista("");
    setSchemista("");
  };
  //#endregion

  //#region General Functions
  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
  };
  //#endregion

  //#region Save Edited Errors on DB
  const handleEditRow = (item: any, method: string) => {
    setSelectedId(item.id);
    setRepartoDisbaglioEdit(item.repartodisbaglio);
    setTitoloEdit(item.titolo);
    setOreEdit(item.ore);
    setNoteEdit(item.note);
    setSchemista(item.schemista);
    setProvenienzaSchemista(item.provenienzaSchemista);
    setSelectedMethod(method);
    setIsOpenModify(true);
  };
  const handleSaveEditedRow = async () => {
    const updatedError = {
      id: selectedId, // Ensure the `id` is preserved in the updated object
      schemista: schemista,
      provenienzaSchemista: provenienzaSchemista,
      //causaesterna: causaEsternaEdit,
      note: noteEdit,
      ore: oreEdit,
      repartodisbaglio: repartoDisbaglioEdit,
      titolo: titoloEdit,
    };

    try {
      // Ensure `record.errori[selectedMethod]` exists and is an array
      if (
        record?.errori?.[selectedMethod] &&
        Array.isArray(record.errori[selectedMethod])
      ) {
        // Find and update the specific element by `id`
        const updatedArray = record.errori[selectedMethod].map((error: any) =>
          error.id === selectedId ? updatedError : error
        );

        // Update using the backend API instead of Firestore
        const response = await axios.post(
          `${url}/updateerror/${commessa.commessa}`,
          {
            method: selectedMethod,
            updatedArray: updatedArray,
          }
        );

        if (response.data.success) {
          // Update local state optimistically
          setRecord((prevRecord: any) => ({
            ...prevRecord,
            errori: {
              ...prevRecord.errori,
              [selectedMethod]: updatedArray,
            },
          }));

          showSuccessToast("Errore modificato con successo");
        } else {
          showErrorToast("Errore nella modifica dell'errore");
        }
      } else {
        showErrorToast(
          "Errore nella modifica dell'errore: metodo non trovato o non è un array"
        );
      }
    } catch (error) {
      console.error("Error updating error:", error);
      showErrorToast("Errore nella modifica dell'errore");
    }

    setIsOpenModify(false);
  };
  //#endregion

  //#region Remove Errors Function
  const handleRemoveError = async (item: any, method: string) => {
    try {
      const response = await axios.post(
        `${url}/removeerror/${commessa.commessa}`,
        {
          method,
          id: item.id,
        }
      );

      if (response.data.success) {
        setRecord((prevRecord: any) => {
          const updatedArray = prevRecord.errori[method].filter(
            (error: any) => error.id !== item.id
          );
          return {
            ...prevRecord,
            errori: {
              ...prevRecord.errori,
              [method]: updatedArray,
            },
          };
        });

        showSuccessToast("Errore rimosso con successo");
      } else {
        showErrorToast("Errore nella rimozione dell'errore");
      }
    } catch (error) {
      showErrorToast("Errore nella rimozione dell'errore");
    }
  };
  //#endregion

  //#region Export to Excel
  const exportToExcel = () => {
    try {
      // Prepare data for Excel export
      const excelData: any[] = [];

      // Add header row
      excelData.push([
        "Commessa",
        "Categoria",
        "Reparto Disbaglio",
        "Titolo",
        "Ore",
        "Note",
        "Schemista",
        "Provenienza Schemista",
        "Causa Esterna",
      ]);

      // Process each error category
      const categories = [
        { key: "df", name: "Disposizione di fondo" },
        { key: "nu", name: "Numerazione" },
        { key: "cp", name: "Componenti" },
        { key: "ca", name: "Cablaggio" },
        { key: "co", name: "Collaudo" },
      ];

      categories.forEach((category) => {
        if (record.errori?.[category.key]) {
          record.errori[category.key].forEach((item: any) => {
            excelData.push([
              commessa.commessa || "",
              category.name,
              item.repartodisbaglio || "",
              item.titolo || "",
              item.ore || 0,
              item.note || "",
              item.schemista || "",
              item.provenienzaSchemista || "",
              item.causaesterna ? "Sì" : "No",
            ]);
          });
        }
      });

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(excelData);

      // Set column widths
      const colWidths = [
        { wch: 15 }, // Commessa
        { wch: 20 }, // Categoria
        { wch: 15 }, // Reparto Disbaglio
        { wch: 30 }, // Titolo
        { wch: 8 }, // Ore
        { wch: 40 }, // Note
        { wch: 20 }, // Schemista
        { wch: 20 }, // Provenienza Schemista
        { wch: 12 }, // Causa Esterna
      ];
      ws["!cols"] = colWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, "Errori");

      // Generate filename with current date
      const currentDate = new Date().toISOString().split("T")[0];
      const filename = `Errori_Commessa_${commessa.commessa}_${currentDate}.xlsx`;

      // Save file
      XLSX.writeFile(wb, filename);

      showSuccessToast("File Excel esportato con successo");
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      showErrorToast("Errore durante l'esportazione del file Excel");
    }
  };
  const ButtonExportToExcel = () => {
    return (
      <Row justify="end" style={{ marginBottom: 16 }}>
        <Col>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={exportToExcel}
            disabled={
              !record.errori ||
              Object.keys(record.errori).every(
                (key) =>
                  !record.errori?.[key] || record.errori[key].length === 0
              )
            }
          >
            Esporta in Excel
          </Button>
        </Col>
      </Row>
    );
  };

  //#endregion

  //#region Main Return

  return (
    <div>
      {loading ? (
        <Spin />
      ) : (
        <>
          <ButtonExportToExcel />
          <Row gutter={[32, 32]} justify="space-around">
            <Col span={8}>
              <ErrorCard
                title="Disposizione di fondo"
                method="df"
                errors={record.errori?.df || []}
                isAddingHour={addHourErroreDF}
                onToggleAdd={() => {
                  setAddHourErroreDF(!addHourErroreDF);
                  setAddHourErroreNU(false);
                  setAddHourErroreCP(false);
                  setAddHourErroreCO(false);
                  setAddHourErroreCA(false);
                  setNote("");
                  setOre(0.5);
                  setTitolo("");
                  setRepartoDisbaglio("");
                }}
                onEdit={handleEditRow}
                onRemove={handleRemoveError}
                user={user}
                truncateText={truncateText}
              />
            </Col>
            <Col span={8}>
              <ErrorCard
                title="Numerazione"
                method="nu"
                errors={record.errori?.nu || []}
                isAddingHour={addHourErroreNU}
                onToggleAdd={() => {
                  setAddHourErroreNU(!addHourErroreNU);
                  setAddHourErroreDF(false);
                  setAddHourErroreCP(false);
                  setAddHourErroreCO(false);
                  setAddHourErroreCA(false);
                  setNote("");
                  setOre(0.5);
                  setTitolo("");
                  setRepartoDisbaglio("");
                }}
                onEdit={handleEditRow}
                onRemove={handleRemoveError}
                user={user}
                truncateText={truncateText}
              />
            </Col>
            <Col span={8}>
              <ErrorCard
                title="Componenti"
                method="cp"
                errors={record.errori?.cp || []}
                isAddingHour={addHourErroreCP}
                onToggleAdd={() => {
                  setAddHourErroreCP(!addHourErroreCP);
                  setAddHourErroreNU(false);
                  setAddHourErroreDF(false);
                  setAddHourErroreCO(false);
                  setAddHourErroreCA(false);
                  setNote("");
                  setOre(0.5);
                  setTitolo("");
                  setRepartoDisbaglio("");
                }}
                onEdit={handleEditRow}
                onRemove={handleRemoveError}
                user={user}
                truncateText={truncateText}
              />
            </Col>
            {(addHourErroreDF || addHourErroreNU || addHourErroreCP) && (
              <ErrorForm
                onSubmit={handleSubmit}
                activeMethod={
                  addHourErroreDF
                    ? "df"
                    : addHourErroreNU
                    ? "nu"
                    : addHourErroreCP
                    ? "cp"
                    : ""
                }
                formData={formData}
                setters={setters}
              />
            )}
          </Row>
          <Row
            gutter={[24, 24]}
            justify="space-around"
            style={{ marginTop: 32 }}
          >
            <Col span={12}>
              <ErrorCard
                title="Cablaggio"
                method="ca"
                errors={record.errori?.ca || []}
                isAddingHour={addHourErroreCA}
                onToggleAdd={() => {
                  setAddHourErroreCA(!addHourErroreCA);
                  setAddHourErroreDF(false);
                  setAddHourErroreNU(false);
                  setAddHourErroreCP(false);
                  setAddHourErroreCO(false);
                  setNote("");
                  setOre(0.5);
                  setTitolo("");
                  setRepartoDisbaglio("");
                }}
                onEdit={handleEditRow}
                onRemove={handleRemoveError}
                user={user}
                truncateText={truncateText}
              />
            </Col>
            <Col span={12}>
              <ErrorCard
                title="Collaudo"
                method="co"
                errors={record.errori?.co || []}
                isAddingHour={addHourErroreCO}
                onToggleAdd={() => {
                  setAddHourErroreCO(!addHourErroreCO);
                  setAddHourErroreDF(false);
                  setAddHourErroreNU(false);
                  setAddHourErroreCP(false);
                  setAddHourErroreCA(false);
                  setNote("");
                  setOre(0.5);
                  setTitolo("");
                  setRepartoDisbaglio("");
                }}
                onEdit={handleEditRow}
                onRemove={handleRemoveError}
                user={user}
                truncateText={truncateText}
              />
            </Col>

            {(addHourErroreCA || addHourErroreCO) && (
              <ErrorForm
                onSubmit={handleSubmit}
                activeMethod={
                  addHourErroreCA ? "ca" : addHourErroreCO ? "co" : ""
                }
                formData={formData}
                setters={setters}
              />
            )}
          </Row>
          <Modal
            title="Modifica Errore"
            open={isOpenModify}
            onOk={handleSaveEditedRow}
            onCancel={() => setIsOpenModify(false)}
          >
            <Space direction="vertical" style={{ width: "100%" }}>
              <Typography.Title level={5}>Reparto</Typography.Title>
              <Select
                style={{ width: "100%" }}
                value={repartoDisbaglioEdit}
                onChange={(value) => setRepartoDisbaglioEdit(value)}
              >
                <Select.Option value="" disabled>
                  Seleziona un reparto
                </Select.Option>
                <Select.Option value="S">S - Schemisti</Select.Option>
                <Select.Option value="M">M - Magazzino</Select.Option>
                <Select.Option value="O">O - Officina</Select.Option>
              </Select>
              {(repartoDisbaglioEdit === "S" || repartoDisbaglio === "M") && (
                <>
                  <Select
                    style={{ width: "100%" }}
                    value={provenienzaSchemistaEdit}
                    onChange={(value) => setProvenienzaSchemistaEdit(value)}
                  >
                    <Select.Option value="" disabled>
                      Seleziona se Interno o Esterno
                    </Select.Option>
                    <Select.Option value="INT">Interno</Select.Option>
                    <Select.Option value="EXT">Esterno</Select.Option>
                  </Select>
                  {repartoDisbaglioEdit === "S" &&
                  provenienzaSchemistaEdit === "EXT" ? (
                    <Input
                      required
                      placeholder="Schemista"
                      value={schemistaEdit}
                      onChange={(e) => setSchemistaEdit(e.target.value)}
                    />
                  ) : (
                    repartoDisbaglioEdit === "S" &&
                    provenienzaSchemistaEdit === "INT" && (
                      <Select
                        style={{ width: "100%" }}
                        value={schemistaEdit}
                        onChange={(value) => setSchemistaEdit(value)}
                      >
                        <Select.Option value="" disabled>
                          Seleziona Schemista Interno
                        </Select.Option>
                        <Select.Option value="Giacomo Menegalli">
                          Giacomo Menegalli
                        </Select.Option>
                        <Select.Option value="Danil Puscov">
                          Danil Puscov
                        </Select.Option>
                        <Select.Option value="Alfio Lena">
                          Alfio Lena
                        </Select.Option>
                        <Select.Option value="Luca Borlenghi">
                          Luca Borlenghi
                        </Select.Option>
                        <Select.Option value="Nicolas Arbasi">
                          Nicolas Arbasi
                        </Select.Option>
                        <Select.Option value="Andrea Marchese">
                          Andrea Marchese
                        </Select.Option>
                      </Select>
                    )
                  )}
                </>
              )}
              <Typography.Title level={5}>Titolo Errore</Typography.Title>
              <Input
                required
                placeholder="Titolo"
                value={titoloEdit}
                onChange={(e) => setTitoloEdit(e.target.value)}
              />
              <Typography.Title level={5}>
                Ore per risolvere l'errore
              </Typography.Title>
              <Select
                style={{ width: "100%" }}
                value={oreEdit}
                onChange={(value) => setOreEdit(value)}
              >
                <Select.Option value="" disabled>
                  Seleziona le ore
                </Select.Option>
                {Array.from({ length: 48 }, (_, i) => (i + 1) / 2).map(
                  (ore) => (
                    <Select.Option key={ore} value={ore}>
                      {ore}
                    </Select.Option>
                  )
                )}
              </Select>
              <Typography.Title level={5}>Note</Typography.Title>
              <Input.TextArea
                rows={2}
                value={noteEdit}
                onChange={(e) => setNoteEdit(e.target.value)}
              />
            </Space>
          </Modal>
        </>
      )}
    </div>
  );
  //#endregion
};

export default AddError;
