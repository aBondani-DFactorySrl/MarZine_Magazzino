import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Progress,
  Row,
  Table,
  Typography,
  Space,
  Layout,
} from "antd";
import toast from "react-hot-toast";
import { ChangeEvent, useContext, useEffect, useState } from "react";
import Navbar from "../components/navbar";
import axios from "axios";
import { BellOutlined, BellFilled, CheckOutlined } from "@ant-design/icons";
import { RxExternalLink } from "react-icons/rx";
import UserContext from "../provider/userInfoProvider";

const { Title } = Typography;
const { TextArea } = Input;

interface ExcelDataRow {
  Articolo: string;
  Descrizione: string;
  UdM: string;
  Qta: number | string;
  Ubicazione: string;
  Commessa: string;
  CommessaUbicazione: string;
}

const NewRecords = () => {
  const { user } = useContext(UserContext);
  const url = import.meta.env.VITE_BACKEND_URL;
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [inputKey, setInputKey] = useState(Math.random().toString());
  const [commessa, setCommessa] = useState("");
  const [uniqueDocs, _setUniqueDocs] = useState<string[]>([]);
  const [urgent, setUrgent] = useState(false);
  const [external, setExternal] = useState(false);
  const [_isClickedSign, setIsClickedSign] = useState(false);
  const [_uploadProgressSign, setUploadProgressSign] = useState(0);
  const [_isUploadingSign, setIsUploadingSign] = useState(false);
  const [isUploadingComponents, setIsUploadingComponents] = useState(false);
  const [uploadProgressComponents, setUploadProgressComponents] = useState(0);
  const [fileComponents, setFileComponents] = useState<File[]>([]);
  const [_fileSign, setFileSign] = useState<File | null>(null);
  const [filePathComponents, setFilePathComponents] = useState<any[]>([]);
  const [desCliente, setDesCliente] = useState("");
  const [codCliente, setCodCliente] = useState("");
  const [note, setNote] = useState("");
  const [desCommessa, setDesCommessa] = useState("");
  const [comCliente, setComCliente] = useState("");
  const [excelData, setExcelData] = useState<ExcelDataRow[]>([
    {
      Articolo: "",
      Descrizione: "",
      UdM: "",
      Qta: "",
      Ubicazione: "",
      Commessa: "",
      CommessaUbicazione: "",
    },
  ]);

  useEffect(() => {
    resetForm();
  }, []);

  const [windowDimensions, setWindowDimensions] = useState(
    getWindowDimensions()
  );

  function getWindowDimensions() {
    const { innerWidth: width, innerHeight: height } = window;
    return {
      width,
      height,
    };
  }

  const clientMappings = {
    "000001": "BIOXIS PHARMACEUTICALS",
    "000002": "ACMI SPA",
    "000006": "MARCHIANI FLAVIO SNC",
    "000024": "SIDEL SPA",
    "000026": "GENERAL COM SPA",
    "000033": "B.M.P. GROUP SRL",
    "000036": "R.G. ELETTROIMPIANTI SRL",
    "000038": "LESATEC SRL",
    "000040": "GEA PROCOMAC SPA",
    "000046": "FT SYSTEM SRL",
    "000047": "EUROSISTEMI SRL",
    "000053": "LINCOTEK EQUIPMENT SPA",
    "000059": "EUROMETAL SRL",
    "000063": "ZACMI ZANICHELLI MECCANICA SPA",
    "000072": "FERMAC SRL",
    "000073": "TIESSE SRL",
    "000087": "LINCOTEK RUBBIANO SPA",
    "000088": "BERTOLI SRL",
    "000089": "ACR SRL",
    "000090": "TEPROM SRL",
    "000094": "BOLTON FOOD SPA",
    "000096": "M.T. COSTRUZIONE MACCHINE SRL",
    "000100": "EUROPOOL SRL",
    "000103": "CIMATECH SRL DI SIMONAZZI - GARIJO E BARBIERI",
    "000104": "S.I.E.N. SNC DI SALARDI & C.",
    "000108": "VETROMECCANICA SRL",
    "000113": "CAREBO SPA",
    "000114": "DALLARA AUTOMOBILI SPA",
    "000147": "SADA CAVI SPA",
    "000158": "ALCOTEC SRL",
    "000160": "IMP.A.C. SRL",
    "000161": "MARCHIANI SRL",
    "000163": "FILLSHAPE SRL",
    "000166": "ISTITUTO D'ISTRUZIONE SUPERIORE SILVIO D'ARZIO",
    "000167": "INTERPUMP GROUP SPA",
    "000168": "ACMI MEXICO S.A. de C.V.",
    "000169": "ASMECH SYSTEMS LIMITED",
    "000170": "IEMA SRL",
    "000171": "MICROMECCANICA DI PRECISIONE SRL",
    "000173": "MAPSTER SRL",
    "000176": "ARTIGIANA CERATI CLAUDIO",
    "000177": "CHIESI FARMACEUTICI SPA",
    "000181": "TEAM BYTE SRL",
    "000182": "SICK SPA",
    "000183": "G.B. GNUDI BRUNO SPA",
    "000184": "FORPAC SRL",
    "000185": "IMAL SRL",
    "000186": "AUTECO SISTEMI SRL",
    "000188": "ASITA SRL",
    "000195": "ELETRAS SRL",
    "000202": "ILINOX SRL",
    "000207": "MERLI OFFICE SRL",
    "000209": "REXEL SPA",
    "000219": "COMET  SPA",
    "000230": "DANFOSS SRL",
    "000258": "ROCKWELL AUTOMATION SRL",
    "000259": "LAPP ITALIA SRL",
    "000260": "PHOENIX CONTACT SPA",
    "000261": "CATELLANI SRL - Tecno Forniture Elettriche",
    "000262": "B.F.B. SRL",
    "000263": "PILZ ITALIA SRL",
    "000266": "SACCHI GIUSEPPE SPA",
    "000281": "FERRARI MAURO AUTOTRASPORTI",
    "000340": "TE.CO. TECNOLOGIA COMMERCIALE SPA",
    "000362": "TEKIMA SRL",
    "000405": "MURRELEKTRONIK SRL",
    "000420": "WURTH SRL",
    "000431": "MP GAMMA SRL",
    "000432": "PFANNENBERG ITALIA SRL",
    "000436": "CIGNOLI ELETTROFORNITURE SRL",
    "000464": "RS COMPONENTS SPA",
    "000480": "SCHNEIDER ELECTRIC SPA",
    "000486": "LPS SRL",
    "000505": "LASSE - Societa' cooperativa Sociale",
    "000662": "F.I.M.U. SRL",
    "000693": "HMS INDUSTRIAL NETWORKS AB",
    "000710": "GREEN ENERGY SRL",
    "000743": "TECNOE SRL",
    "000754": "NIDEC INDUSTRIAL AUTOMATION ITALY SPA",
    "000756": "PIGRECO SRL",
    "000764": "FESTO SPA",
    "000799": "SEW EURODRIVE SAS",
    "000804": "EUROPCAR S.A.",
    "000834": "NUOVA FABER SRL",
    "000852": "PR ELECTRONICS ITALY SRL",
    "000856": "BTICINO SPA",
    "000871": "GAMBETTA SRL",
    "000876": "F.P. di Fontanesi Massimiliano",
    "000882": "CM FIMA SRL",
    "000885": "B.M.P. SRL",
    "000886": "SPIRAX SARCO SRL",
    "000890": "FATTORI MARIO & C SNC",
    "000894": "WONDERWARE ITALIA SPA",
    "000896": "CLEVERTECH SPA",
    "000899": "B.A. PROCESSING SRL",
    "000900": "C.M.A. SRL",
    "000902": "I.M.A. SPA",
    "000903": "IDROINOX IMPIANTI SRL",
    "000904": "ELFI SPA",
    "000917": "EMMEQU SRL",
    "000921": "FORTNA SPA",
    "000930": "RF SRL",
    "000931": "NETPARMA di Abretti Luigi e C. SAS",
    "000932": "FMT FOOD MACHINERY & TECHNOLOGY",
    "000942": "METALTECNO SNC",
    "000949": "ORZI GIACOMO",
    "000957": "SIDEL BLOWING & SERVICES SAS",
    "000961": "MECCANICA ITALIA SPA",
    "000962": "B.F.B. PIPING SRL",
    "000963": "SIEMENS SPA",
    "000964": "ABSERVICE SRL",
    "000972": "ELETTRIC DM SRL",
    "000974": "CNA - ASSOCIAZIONE TERRITORIALE DI PARMA",
    "000979": "KYKLOO SRL",
    "000988": "PRESSCO TECHNOLOGY INC",
    "000992": "DOMO SRL",
    "000997": "LORENZ PAN AG",
    "001000": "SCATOLA MATTEO",
    "001003": "GORRERI SRL",
    "001007": "HT ITALIA srl",
    "001013": "AG-CEREC SRL",
    "001022": "EZS - EASY SOLUTION",
    "001027": "GI GROUP SPA",
    "001029": "GI FORMAZIONE SRL",
    "001037": "D.e.D. TECNOLOGIE SRL",
    "001038": "SPX Flow Europe Ltd-Sede Secondaria Italiana",
    "001050": "MARCHIANI FRANCESCO",
    "001065": "TURCK BANNER SRL",
    "001067": "TONELLI GROUP SPA",
    "001083": "FORTNA SPA RAPPRESENTANTE FISCALE CAMERA DI COMMERCIO ITALIA",
    "001085": "EUROPCAR SPOLKA Z OGRANICZONA ODPOWIEDZIALNOSCIA SP.K.",
    "001092": "UNILEVER UK LTD",
    "001093": "ARONPAK SRL",
    "001094": "TROPICAL FOOD MACHINERY SRL Unipersonale",
    "001098": "K-SERVICES ITALY SRL",
    "001103": "PERFETTI VAN MELLE SPA",
    "001108": "F.LLI LOMBATTI SPA",
    "001112": "R&R SRL SPEDIZIONI INTERNAZIONALI",
    "001119": "AMB DI MELNAROWICZ BARBARA",
    "001126": "POLYKETTING B.V.",
    "001131": "PAVAN SPA",
    "001135": "THERMO RAMSEY ITALIA SRL",
    "001138": "BRAM-COR SPA",
    "001147": "VOSLAUER MINERALW ASSER GMBH",
    "001155": "FOOD PROCESSING EQUIPMENT SRL",
    "001158": "SONEPAR ITALIA SPA UNIP.",
    "001166": "NOVA IMPIANTI SRL",
    "001171": "SKILLTECH SRL",
    "001173": "ASOTECH SRL",
    "001176": "SINT TECHNOLOGY SRL",
    "001178": "EMS GROUP SPA",
    "001179": "PEN-TEC SRL",
    "001183": "ZANELLI SRL",
    "001188": "UNIMAC-GHERRI SRL A SOCIO UNICO",
    "001192": "FRIGOMECCANICA SPA",
    "001198": "CARROZZERIA MANTOVANI di MANTOVANI FLAVIO E C.",
    "001199": "TITANLAB SRL",
    "001203": "L.M. SPA HANDLING SYSTEMS",
    "001209": "VALCOLATTE SRL",
    "001218": "IEC+ SRL",
    "001220": "PATA SPA",
    "001221": "NOSIO SPA",
    "001223": "TEC.AL SRL",
    "001225": "QUADRICA SRL",
    "001227": "CASEARTECNICA BARTOLI SRL",
    "001235": "AMS SRL",
    "001248": "ASCHIERI MONTAGGI SRL",
    "001250": "BIOFER SPA",
    "001251": "GRENKE LOCAZIONE SRL",
    "001256": "PREAN S.R.L.",
    "001259": "TELEPASS S.P.A. (Francia)",
    "001264": "ROSSI INGEGNERIA ALIMENTARE SRL",
    "001275": "MINGAZZINI SRL",
    "001282": "UNITED SYMBOL SPA",
    "001285": "ITEC SRL",
    "001295": "G.C.E. CAVI ELETTRICI SRL",
    "001299": "FIMAT SERVICE SRL",
    "001307": "PACKITAL SRL a socio unico",
    "001315": "TWINOVA SRL",
    "001316": "PIERO BERSANINI SPA",
    "001330": "DE BRITO RODRIGUES FERNANDO",
    "001334": "GMD TEAM S.R.L.",
    "001335": "R.L. GROUP IMPIANTISTICA INDUSTRIALE SRL",
    "001344": "ABEA SRL CON UNICO SOCIO",
    "001345": "3A AUTOMATION SRL",
    "001346": "A DUE di Squeri Donato & C. SPA",
    "001347": "GEA MECHANICAL EQIPMENT ITALIA SPA",
    "001353": "PUBBLISERVICE SRL",
    "001355": "ANTARES VISION S.P.A",
    "001356": "DIESSE SCRL",
    "001361": "ANGHEL IMPIANTI DI ANGHEL ANDREI",
    "001365": "VALISI",
    "001367": "GEA PROCESS ENGINEERING SPA",
    "001370": "AGRIFLEX SRL",
    "001372": "STUDIO TECNICO ASSOCIATO POWER TECHNOLOGY",
    "001374": "BATTISTINI S.R.L. LAVORAZIONI MECCANICHE",
    "001381": "GEA IMAFORNI SPA",
    "001384": "CBA SRL",
    "001394": "D.FACTORY SRL",
    "001404": "T.M.E. SPA - PACKAGING SOLUTIONS",
    "001413": "STARK SRL",
    "001414": "DIAMALTERIA ITALIANA SRL",
    "001421": "SIRAM SPA",
    "001426": "ZEFA TECHNOLOGIES",
    "001439": "CDNI SRL",
    "001440": "HEILA CRANES SPA",
    "001447": "ANYDESK SOFTWARE GMBH",
    "001450": "RAMP SRL",
    "001456": "QBM S.R.L.",
    "001457": "NAVATTA GROUP SRL",
    "001458": "LT SRL",
    "001463": "HBA SRL",
    "001477": "RODOLFI MANSUETO SPA",
    "001481": "PARMALAT SPA",
    "001498": "ANGHEL ION",
    "001508": "ELETTRICA SYSTEM SRL",
    "001509": "WEGH GROUP SPA",
    "001511": "HAFIX LTDA",
    "001521": "EMEL SRL",
    "001537": "EUROPCAR NEDERLAND 0V",
    "001551": "AKZO NOBEL COATINGS SPA",
    "001552": "EUROPCAR MOBILITY GROUP DENMARK A/S",
    "001562": "EUROPEISK BILUTHYRNING AB",
    "001564": "GIFT CAMPAIGN S.L.",
    "001565": "LEANTECH SRL",
    "001566": "TELEPASS (CROAZIA)",
    "001589": "SNF ENVIROTECH SRL",
    MARSRL: "MARCHIANI S.R.L.",
  };

  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isFirstLoad) {
      setIsFirstLoad(false);
    }
    let wrongCommessa = false;
    for (let i = 0; i < excelData.length; i++) {
      if (excelData[i].Commessa === commessa) {
        wrongCommessa = true;
        break;
      }
    }
    if (!wrongCommessa && excelData.length > 0) {
      toast(
        (t) => (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "4px 0",
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <span style={{ marginRight: "8px", fontSize: "16px" }}>⚠️</span>
              <span>
                La commessa non corrisponde con il file dei componenti.
              </span>
            </div>
            <button
              onClick={() => toast.dismiss(t.id)}
              style={{
                marginLeft: "15px",
                padding: "4px 10px",
                backgroundColor: "#FFFAEE",
                border: "1px solid #e6b800",
                borderRadius: "4px",
                color: "#664d00",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "16px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                transition: "all 0.2s ease",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.backgroundColor = "#fff5d6")
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.backgroundColor = "#FFFAEE")
              }
            >
              <span style={{ fontWeight: "bold" }}>Chiudi</span>
            </button>
          </div>
        ),
        {
          style: {
            border: "1px solid #e6b800",
            padding: "12px 16px",
            color: "#664d00",
            backgroundColor: "#fffbcc",
            boxShadow: "0 4px 8px rgba(0,0,0,0.08)",
            borderRadius: "6px",
          },
          iconTheme: {
            primary: "#e6b800",
            secondary: "#FFFAEE",
          },
          duration: 10000,
        }
      );
    }
  }, [excelData]);

  useEffect(() => {
    setDesCommessa("");
    setComCliente("");
  }, [commessa]);

  const resetForm = () => {
    setCommessa("");
    setNote("");
    setFileComponents([]);
    setFileSign(null);
    setUploadProgressComponents(0);
    setUploadProgressSign(0);
    setFilePathComponents([]);
    setIsUploadingComponents(false);
    setIsUploadingSign(false);
    setIsClickedSign(false);
    setExcelData([]);
    setInputKey(Math.random().toString());
    setUrgent(false);
    setExternal(false);
  };

  const handleSubmit = async () => {
    console.log(user);
    if (desCommessa === "" && user?.role !== "999") {
      toast.error("Per favore controlla la commessa.");
      return;
    }
    if (desCliente == undefined) {
      toast.error("desCliente non trovata");
      return;
    }
    if (
      uploadProgressComponents !== 100 &&
      !user?.email.includes("test@test")
    ) {
      toast.error("Non hai caricato il file dei componenti.");
      return;
    }

    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    try {
      // Prepare data for PostgreSQL
      const recordData = {
        commessa: commessa || "test",
        desCommessa: desCommessa || "test",
        comCliente: comCliente || "test",
        componentsPath: filePathComponents,
        desCliente: desCliente || "test",
        codCliente: codCliente || "test",
        status: 0,
        urgent: urgent,
        external: external,
        shelf: [],
        shelfStatus: [],
        uniqueDocs: uniqueDocs,
        note: [
          {
            text: note,
            author: user?.name + "." + user?.surname || "@marchianisrl.com",
            timestamp: new Date().toISOString(),
          },
        ],
      };

      const response = await axios.post(`${backendUrl}/addRecord`, recordData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.data.success) {
        toast.success("Form submitted successfully!");
        if (filePathComponents.length > 0) {
          const backendUrl = import.meta.env.VITE_BACKEND_URL;

          try {
            const response = await axios.post(
              `${backendUrl}/moveFilesToFinal`,
              {
                filePaths: filePathComponents,
                commessa: commessa,
                type: external ? "External" : "Components",
              },
              {
                headers: {
                  "Content-Type": "application/json",
                },
              }
            );

            if (response.data.success) {
              toast.success("File salvati definitivamente!");
              // Update file paths to final locations
              setFilePathComponents(response.data.finalPaths);
            } else {
              throw new Error(response.data.message || "Move failed");
            }
          } catch (error) {
            console.error("Move files error:", error);
            toast.error("Errore nel salvataggio definitivo dei file.");
          }
        }
        resetForm();
      } else {
        throw new Error(response.data.message || "Failed to submit form");
      }
    } catch (error) {
      console.error("Submit error:", error);
      if (axios.isAxiosError(error)) {
        toast.error(
          "Error submitting form: " +
            (error.response?.data?.message || error.message)
        );
      } else {
        toast.error("Error submitting form: " + error);
      }
    }
  };

  const handleFileChange =
    (resource: string) => (event: ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      switch (resource) {
        case "Components":
          if (files) {
            const fileArray = Array.from(files);
            setFileComponents(fileArray);
          }
          break;
      }
    };

  const handleUploadComponents = async () => {
    if (commessa === "") {
      toast.error("Inserisci il numero della commessa.");
      return;
    }

    if (!fileComponents || fileComponents.length === 0) {
      toast.error("No file selected.");
      return;
    }

    setUploadProgressComponents(0);
    setIsUploadingComponents(true);

    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    let filePaths = [];
    let uploadSuccess;

    uploadSuccess = true;

    try {
      for (let i = 0; i < fileComponents.length; i++) {
        const formData = new FormData();

        // Append the file
        formData.append("file", fileComponents[i]);

        // Append metadata with temp flag
        formData.append("commessa", commessa);
        formData.append("type", external ? "External" : "Components");
        formData.append("isTemp", "true"); // Flag to indicate temporary upload

        const response = await axios.post(
          `${backendUrl}/uploadFile`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
            onUploadProgress: (progressEvent) => {
              if (progressEvent.total) {
                const percentCompleted = Math.round(
                  (progressEvent.loaded * 100) / progressEvent.total
                );
                setUploadProgressComponents(percentCompleted);
              }
            },
          }
        );

        if (response.data.success) {
          filePaths.push(response.data.filePath);
          console.log(
            `File ${i + 1} uploaded to temp successfully:`,
            response.data.filePath
          );
        } else {
          throw new Error(response.data.message || "Upload failed");
        }
      }

      toast.success(
        "File caricati in temporaneo. Premi 'Invia' per confermare."
      );
      setFilePathComponents(filePaths);

      // Process Excel files if not external (from temp location)
      if (!external) {
        await processExcelFiles(filePaths, backendUrl);
      }
    } catch (error) {
      uploadSuccess = false;
      console.error("Upload error:", error);
      if (axios.isAxiosError(error)) {
        toast.error(
          "Error uploading file: " +
            (error.response?.data?.message || error.message)
        );
      } else {
        toast.error("Error uploading file: " + error);
      }
    } finally {
      setIsUploadingComponents(false);
    }
  };

  const processExcelFiles = async (filePaths: string[], backendUrl: string) => {
    let filteredData: any = [];

    for (let i = 0; i < filePaths.length; i++) {
      try {
        const response = await axios.post(
          `${backendUrl}/read-excel`,
          {
            filePath: filePaths[i],
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const responseData = response.data;
        let docNum = 0;

        for (let j = 0; j < responseData.length; j++) {
          if (responseData[j].Articolo.includes("Num.")) {
            docNum = responseData[j].Articolo.split("Num.")[1].trim();
            filteredData.push({ Descrizione: "Doc: " + docNum, doc: docNum });
          }
          if (typeof responseData[j].Qta === "number") {
            filteredData.push({
              ...responseData[j],
              doc: docNum,
            });
          }
        }

        filteredData.forEach((item: any) => {
          if (!uniqueDocs.includes(item.doc)) {
            uniqueDocs.push(item.doc);
          }
        });
      } catch (error) {
        console.error("Error reading Excel file:", error);
        toast.error("Error reading file: " + filePaths[i]);
      }
    }

    setExcelData(filteredData);
    toast.success("File/s letto/i correttamente.");
  };

  const handleCheckCommessa = async () => {
    if (commessa === "") {
      toast.error("Inserisci il numero della commessa.");
      return;
    }
    await axios
      .get(`${url.toString()}/checkinformation-commessa`, {
        params: {
          codCommessa: commessa,
        },
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((response) => {
        if (response.data.length === 0) {
          toast.error("Commessa non trovata");
        } else {
          toast.success("Commessa trovata");
          if (
            response.data[0].cod_cliente === "" ||
            response.data[0].cod_cliente === null
          ) {
            setCodCliente("Codice non disponibile");
            setDesCliente("Descrizione non disponibile");
          } else {
            setDesCliente(
              clientMappings[
                response.data[0].cod_cliente as keyof typeof clientMappings
              ]
            );
            setCodCliente(response.data[0].cod_cliente);
          }
          if (
            response.data[0].des_commessa === "" ||
            response.data[0].des_commessa === null
          ) {
            setDesCommessa("Descrizione non disponibile");
          } else {
            setDesCommessa(response.data[0].des_commessa);
          }
          if (
            response.data[0].des_campo_libero12 === "" ||
            response.data[0].des_campo_libero12 === null
          ) {
            setComCliente("Commessa Cliente non disponibile");
          } else {
            setComCliente(response.data[0].des_campo_libero12);
          }
        }
      })
      .catch(() => {
        toast.error("Error checking commessa");
      });
  };

  const columns = [
    {
      title: "Articolo",
      dataIndex: "Articolo",
      key: "Articolo",
    },
    {
      title: "Descrizione",
      dataIndex: "Descrizione",
      key: "Descrizione",
    },
    {
      title: "UdM",
      dataIndex: "UdM",
      key: "UdM",
    },
    {
      title: "Qta",
      dataIndex: "Qta",
      key: "Qta",
    },
    {
      title: "Ubicazione",
      dataIndex: "Ubicazione",
      key: "Ubicazione",
    },
    {
      title: "Commessa",
      dataIndex: "Commessa",
      key: "Commessa",
    },
    {
      title: "CommessaUbicazione",
      dataIndex: "CommessaUbicazione",
      key: "CommessaUbicazione",
    },
  ];

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
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          width: windowDimensions.width - 100,
          alignItems: "center",
        }}
      >
        <Card
          style={{ padding: 16, display: "flex", justifyContent: "center" }}
        >
          <Form onFinish={handleSubmit}>
            <Row
              justify="space-between"
              align="middle"
              style={{ marginBottom: 24 }}
            >
              <Col>
                <Title level={3} style={{ margin: 0 }}>
                  Nuovo inserimento
                </Title>
              </Col>
              <Col>
                <Space>
                  <Button
                    type={external ? "primary" : "default"}
                    icon={<RxExternalLink />}
                    onClick={() => setExternal(!external)}
                  />
                  <Button
                    type={urgent ? "primary" : "default"}
                    danger={urgent}
                    icon={urgent ? <BellFilled /> : <BellOutlined />}
                    onClick={() => setUrgent(!urgent)}
                  />
                </Space>
              </Col>
            </Row>
            <Row gutter={32}>
              <Col span={8}>
                <Form.Item label="Commessa" required>
                  <Input
                    value={commessa}
                    onChange={(e) => setCommessa(e.target.value)}
                    style={{ textAlign: "center" }}
                    required
                  />
                </Form.Item>
              </Col>

              <Col span={15}>
                <Form.Item label="Descrizione">
                  <Input
                    value={desCommessa}
                    readOnly
                    style={{ textAlign: "left" }}
                  />
                </Form.Item>
              </Col>

              <Col span={1}>
                <Form.Item label="">
                  <Button type="primary" onClick={handleCheckCommessa} block>
                    <CheckOutlined />
                  </Button>
                </Form.Item>
              </Col>
            </Row>
            <Card title="Informazioni Cliente" style={{ marginBottom: 24 }}>
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item label="Codice Cliente">
                    <Input
                      value={codCliente}
                      readOnly
                      style={{ textAlign: "center" }}
                    />
                  </Form.Item>
                </Col>

                <Col span={8}>
                  <Form.Item label="Descrizione Cliente">
                    <Input
                      value={desCliente}
                      readOnly
                      style={{ textAlign: "center" }}
                    />
                  </Form.Item>
                </Col>

                <Col span={8}>
                  <Form.Item label="Commessa Cliente">
                    <Input
                      value={comCliente}
                      readOnly
                      style={{ textAlign: "center" }}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16} align="bottom">
                <Col span={14}>
                  <Form.Item label="File Componenti">
                    <input
                      key={inputKey}
                      type="file"
                      multiple
                      accept=".xlsx,.xls"
                      onChange={handleFileChange("Components")}
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </Col>

                <Col span={10}>
                  <Form.Item>
                    <Button
                      type="primary"
                      onClick={handleUploadComponents}
                      loading={isUploadingComponents}
                      disabled={fileComponents.length === 0}
                      block
                      size="large"
                    >
                      {isUploadingComponents
                        ? "Caricamento..."
                        : "Carica Componenti"}
                    </Button>
                  </Form.Item>
                </Col>
              </Row>

              {uploadProgressComponents > 0 && (
                <Row>
                  <Col span={24}>
                    <Progress percent={uploadProgressComponents} />
                  </Col>
                </Row>
              )}
              <Row>
                <Col span={24}>
                  <Form.Item>
                    <TextArea
                      rows={4}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Inserisci note..."
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* Excel Data Display */}
            {excelData.length > 0 && (
              <Card title="Dati Excel" style={{ marginBottom: 24 }}>
                <Table
                  columns={columns}
                  dataSource={excelData}
                  rowKey={(index) => index?.toString() || "0"}
                  scroll={{ x: true }}
                  size="small"
                />
              </Card>
            )}

            {/* Action Buttons */}
            <Row justify="center" style={{ marginTop: 24 }}>
              <Col>
                <Space size="large">
                  <Button type="primary" htmlType="submit" size="large">
                    Invia
                  </Button>
                  <Button onClick={resetForm} size="large">
                    Reset
                  </Button>
                </Space>
              </Col>
            </Row>
          </Form>
        </Card>
      </div>
    </Layout>
  );
};

export default NewRecords;
