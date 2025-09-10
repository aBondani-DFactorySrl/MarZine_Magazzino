// #region Imports
import { Input, Button, Space, Typography, Popover, Spin } from "antd";
import toast from "react-hot-toast";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
const { Text } = Typography;
//#endregion

//#region Interfaces
interface SearchComProps {
  aobAddableCommesse: any[];
}
//#endregion

const SearchCommessa: React.FC<SearchComProps> = ({ aobAddableCommesse }) => {
  //#region Variables
  const url = import.meta.env.VITE_BACKEND_URL;
  const [searchQuery, setSearchQuery] = useState("");
  const [triggeerFilter, _setTriggerFilter] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [filteredCommesse, setFilteredCommesse] = useState<any[]>([]);
  const columnsPrintImpegni = useMemo(
    () => [
      { header: "Cod. Articolo", dataKey: "cod_art" },
      { header: "Descrizione", dataKey: "des_articolo_riga" },
      { header: "Qta", dataKey: "qta_merce" },
      { header: "Doc", dataKey: "num_doc" },
      { header: "RagSoc", dataKey: "des_ragsoc" },
    ],
    []
  );
  const columnsPrintMancanti = useMemo(
    () => [
      { header: "Cod. Articolo", dataKey: "cod_art" },
      { header: "Descrizione", dataKey: "des_articolo_riga" },
      { header: "Qta", dataKey: "qta_merce" },
      { header: "Doc", dataKey: "num_doc" },
      { header: "Data ordine", dataKey: "dat_doc" },
      { header: "Arrivo previsto", dataKey: "dat_evas_riga" },
      { header: "RagSoc", dataKey: "des_ragsoc" },
    ],
    []
  );
  const newRecordToInsert = {
    commessa: "",
    capocommessa: "",
    stato: 0,
    iniziolav: null,
    finelav: null,
    comcliente: "",
    descommessa: "",
    descliente: "",
    cablaggio: {
      orePreviste: {
        potenza: 0,
        ausiliari: 0,
      },
      oreLav: [],
    },
    montaggio: {
      orePreviste: {
        ore: 0,
      },
      oreLav: [],
    },
    errori: {
      df: [],
      nu: [],
      cp: [],
      ca: [],
      co: [],
    },
    tecniciassegnati: [],
    progression: 0,
    materialerichiesto: false,
    created_at: null,
    visible: true,
    statushistory: [
      {
        stato: 0,
        fromtimestamp: null,
        endtimestamp: null,
      },
    ],
  };
  //#endregion

  //#region Functions Backend Calls
  const handleAddCommessa = async (commessa: any) => {
    try {
      const commessaGeneral = commessa.commessa.split(" - ")[0];
      const commessaCliente = commessa.comCliente.split(" - ")[0];
      const commessaDescrip = commessa.desCommessa.split(" - ")[0];
      const clienteDescript = commessa.desCliente
        ? commessa.desCliente.split(" - ")[0]
        : "";

      const newRecord = {
        ...newRecordToInsert,
        commessa: commessaGeneral,
        capocommessa: "",
        stato: 0,
        iniziolav: new Date().toISOString(),
        comcliente: commessaCliente,
        descommessa: commessaDescrip,
        descliente: clienteDescript,
        created_at: new Date().toISOString(),
        statushistory: [
          {
            stato: 0,
            fromtimestamp: new Date().toISOString(),
            endtimestamp: null,
          },
        ],
      };

      const response = await axios.post(`${url}/commessa`, newRecord);

      if (response.data.success) {
        toast.success("Commessa aggiunta con successo");
      } else {
        throw new Error(response.data.message || "Failed to add commessa");
      }
    } catch (error) {
      toast.error("Errore durante l'aggiunta della commessa");
    }
  };
  const handleCheckImpegniCommessa = async (commessa: any) => {
    if (commessa === "") {
      toast.error("Inserisci il numero della commessa.");
      return;
    }
    await axios
      .get(`${url}/checkimpegni-commessa`, {
        params: {
          codCommessa: commessa.replace(" - MERGED", ""),
        },
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((response) => {
        if (response.data.length === 0) {
          toast.error("Nessun impegno trovato");
        } else {
          const filteredData = response.data;
          const sortedData = filteredData.sort((a: any, b: any) => {
            if (a.des_articolo_riga < b.des_articolo_riga) return -1;
            if (a.des_articolo_riga > b.des_articolo_riga) return 1;
            return 0;
          });
          generatePdfImpegni(sortedData, commessa);
        }
      })
      .catch(() => {
        toast.error("Error checking commessa");
      });
  };
  const handleCheckMancantiCommessa = async (commessa: any) => {
    if (commessa === "") {
      toast.error("Inserisci il numero della commessa.");
      return;
    }
    await axios
      .get(`${url}/checkmancanti-commessa`, {
        params: {
          codCommessa: commessa.replace(" - MERGED", ""),
        },
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((response) => {
        if (response.data.length === 0) {
          toast.success("Nessun mancante trovato");
        } else {
          const sortedData = response.data.sort((a: any, b: any) => {
            if (a.des_articolo_riga < b.des_articolo_riga) return -1;
            if (a.des_articolo_riga > b.des_articolo_riga) return 1;
            return 0;
          });
          const formattedData = sortedData.map((item: any) => {
            let date = new Date(item.dat_evas_riga);
            let day = String(date.getDate()).padStart(2, "0");
            let month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
            let year = date.getFullYear();
            let formattedDateEvas = `${day}/${month}/${year}`;
            date = new Date(item.dat_doc);
            day = String(date.getDate()).padStart(2, "0");
            month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
            year = date.getFullYear();
            const formattedDateDoc = `${day}/${month}/${year}`;
            return {
              ...item,
              dat_evas_riga: formattedDateEvas,
              dat_doc: formattedDateDoc,
            };
          });
          generatePdfMancanti(formattedData, commessa);
        }
      })
      .catch((error) => {
        console.error(error);
        toast.error("Error checking commessa");
      });
  };
  //#endregion

  //#region Functions PDF Generation
  const generatePdfImpegni = (components: any[], commessa: any) => {
    let startY = 20; // Starting Y position for the first table

    const doc = new jsPDF({
      orientation: "landscape",
    });
    doc.setFont("times", "bold");
    doc.setFontSize(24);
    doc.text(
      "Materiale impegnato per la commessa: " +
        commessa.replace(" - MERGED", ""),
      148,
      startY,
      { align: "center" }
    );
    startY += 10;
    autoTable(doc, {
      head: [columnsPrintImpegni.map((col) => ({ content: col.header }))],
      body: components.map((item) =>
        columnsPrintImpegni.map((col) => item[col.dataKey])
      ),
      startY: startY,
      styles: {
        fillColor: [220, 220, 220],
        textColor: [0, 0, 0],
      },
    });
    //doc.save(commessa + '_Components.pdf');
    const pdfUrl = doc.output("bloburl");

    // Open the PDF in a new tab
    const newWindow = window.open();
    if (newWindow) {
      newWindow.document.write(
        `<iframe src="${pdfUrl}" width="100%" height="100%" style="border:none;"></iframe>`
      );
      newWindow.document.title = commessa + "_Impegni";
    }
  };
  const generatePdfMancanti = (components: any[], commessa: any) => {
    let startY = 20; // Starting Y position for the first table

    const doc = new jsPDF({
      orientation: "landscape",
    });
    doc.setFont("times", "bold");
    doc.setFontSize(24);
    doc.text(
      "Materiale mancante per la commessa: " +
        commessa.replace(" - MERGED", ""),
      148,
      startY,
      { align: "center" }
    );
    startY += 10;
    autoTable(doc, {
      head: [columnsPrintMancanti.map((col) => ({ content: col.header }))],
      body: components.map((item) =>
        columnsPrintMancanti.map((col) => item[col.dataKey])
      ),
      startY: startY,
      styles: {
        fillColor: [220, 220, 220],
        textColor: [0, 0, 0],
      },
    });
    //doc.save(commessa + '_Components.pdf');
    const pdfUrl = doc.output("bloburl");

    // Open the PDF in a new tab
    const newWindow = window.open();
    if (newWindow) {
      newWindow.document.write(
        `<iframe src="${pdfUrl}" width="100%" height="100%" style="border:none;"></iframe>`
      );
      newWindow.document.title = commessa + "_Mancanti";
    }
  };
  //#endregion

  //#region Functions Commessa Filter
  const filterCommesse = () => {
    setIsLoading(true);

    const filtered = aobAddableCommesse.filter((item: any) => {
      const matchesStatus = triggeerFilter ? item.status === 10 : true;
      const matchesSearch = item.commessa
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return matchesSearch && matchesStatus;
    });
    setFilteredCommesse(filtered);
    setIsLoading(false);
  };

  useEffect(() => {
    filterCommesse();
  }, [searchQuery]);
  //#endregion

  //#region Main Return
  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          width: "100%",
          marginBottom: 16,
        }}
      >
        <Space>
          <Input
            placeholder="Cerca commessa..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: 300, marginRight: 16 }}
            suffix={isLoading && <Spin size="small" />}
            autoFocus
          />
        </Space>
      </div>

      <div style={{ overflowY: "auto", maxHeight: "400px" }}>
        <Space wrap>
          {isLoading ? (
            <div
              style={{ width: "100%", textAlign: "center", padding: "20px" }}
            >
              <Spin size="large" />
            </div>
          ) : (
            filteredCommesse.map((commessa: any) => (
              <Popover
                content={
                  <Space direction="vertical">
                    <Button
                      onClick={() => {
                        handleCheckMancantiCommessa(commessa.commessa);
                      }}
                    >
                      Mancanti
                    </Button>
                    <Button
                      onClick={() => {
                        handleCheckImpegniCommessa(commessa.commessa);
                      }}
                    >
                      Impegni
                    </Button>
                    <Button
                      type="primary"
                      onClick={() => handleAddCommessa(commessa)}
                    >
                      Aggiungi
                    </Button>
                  </Space>
                }
                title={`Opzioni per ${commessa.commessa}`}
                trigger="click"
                placement="right"
              >
                <Button
                  key={commessa.uniqueKey}
                  style={{
                    width: 200,
                    height: 60,
                    whiteSpace: "normal",
                    wordBreak: "break-word",
                    margin: 8,
                  }}
                >
                  {commessa.commessa}
                </Button>
              </Popover>
            ))
          )}
        </Space>

        {!isLoading && filteredCommesse.length === 0 && (
          <Text
            style={{
              display: "block",
              textAlign: "center",
              color: "#999",
              marginTop: 16,
            }}
          >
            Nessuna commessa trovata
          </Text>
        )}
      </div>
    </>
  );
  //#endregion
};

export default SearchCommessa;
