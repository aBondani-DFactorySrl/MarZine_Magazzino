import React, { useContext, useEffect, useState } from "react";
import {
  Button,
  Card,
  Col,
  Input,
  Layout,
  Modal,
  Popover,
  Progress,
  Row,
  Select,
  Space,
  Spin,
  Typography,
} from "antd";
import {
  FaUserGear,
  FaPeopleGroup,
  FaListUl,
  FaFilePdf,
} from "react-icons/fa6";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import img from "../assets/Logo Marchiani R base 40 cm HR.png";
import { ArrowUpOutlined, ArrowDownOutlined } from "@ant-design/icons";
import { RiPlayListAddFill } from "react-icons/ri";
import {
  MdOutlinePlaylistRemove,
  MdSettingsInputComponent,
} from "react-icons/md";
import { PiMicrosoftExcelLogoFill } from "react-icons/pi";
import { Content } from "antd/lib/layout/layout";
import axios from "axios";
import Navbar from "../components/Subcomponents/Comp_Navbar";
import ThreeStat from "../components/Subcomponents/Comp_ThreeStatsInHompage";
import FourButtons from "../components/Subcomponents/Comp_FourButtonsInHomePage";
import AddHour from "../components/Modal/Modal_AddWorkedHour";
import AddError from "../components/Modal/Modal_AddError";
import AssignCommessa from "../components/Modal/Modal_CompileCommessa";
import UserContext from "../provider/userInfoProvider";
import ManageTechnicians from "../components/Modal/Modal_ShowTechnician";
import SearchCommessa from "../components/Modal/Modal_AddNewCommessa";
import {
  collection,
  DocumentData,
  getDocs,
  QuerySnapshot,
} from "firebase/firestore";
import { firestore } from "../provider/firebase";
import RemoveCommessa from "../components/Modal/Modal_RemoveUnusedCommessa";
import FilterReport from "../components/Modal/Modal_ParameterReport";
import autoTable from "jspdf-autotable";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import RequestUtils from "../components/Modal/Modal_RequestMaterial";
import PrintSignButton from "../components/Subcomponents/Comp_TemplateToPrintSign";

interface ToDoItem {
  iniziolav: string | number | Date;
  pippo: boolean;
  id: string;
  commessa: string;
  note: string;
  componentsPath: string[];
  signPath: string;
  status: number;
  urgent: string;
  shelf: string[];
  uniqueDocs: string[];
  ids: string[];
}

const Homepage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const { user } = useContext(UserContext);
  const keysToSumFrom = ["ca", "co", "cp", "df", "nu"];
  const [searchCommesseLoading, setSearchCommesseLoading] = useState(false);
  const monthNamesItalian = [
    "Gennaio",
    "Febbraio",
    "Marzo",
    "Aprile",
    "Maggio",
    "Giugno",
    "Luglio",
    "Agosto",
    "Settembre",
    "Ottobre",
    "Novembre",
    "Dicembre",
  ];
  const columnsPrintImpegni = [
    { header: "Cod. Articolo", dataKey: "cod_art" },
    { header: "Descrizione", dataKey: "des_articolo_riga" },
    { header: "Qta", dataKey: "qta_merce" },
    { header: "Doc", dataKey: "num_doc" },
    { header: "RagSoc", dataKey: "des_ragsoc" },
  ];

  const columnsPrintMancanti = [
    { header: "Cod. Articolo", dataKey: "cod_art" },
    { header: "Descrizione", dataKey: "des_articolo_riga" },
    { header: "Qta", dataKey: "qta_merce" },
    { header: "Doc", dataKey: "num_doc" },
    { header: "Data ordine", dataKey: "dat_doc" },
    { header: "Arrivo previsto", dataKey: "dat_evas_riga" },
    { header: "RagSoc", dataKey: "des_ragsoc" },
  ];
  const [showCommesse, setShowCommesse] = useState(true);
  const [loadedCommesse, setLoadedCommesse] = useState<any[]>([]);
  const [commessaSelected, setCommessaSelected] = useState<any>({});
  const [openAddHour, setOpenAddHour] = useState(false);
  const [openAddError, setOpenAddError] = useState(false);
  const [openAssignCommessa, setOpenAssignCommessa] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth()
  );
  const [openManageTechnicians, setOpenManageTechnicians] = useState(false);
  const [openSearchCommesse, setOpenSearchCommesse] = useState(false);
  const [openRemoveCommesse, setOpenRemoveCommesse] = useState(false);
  const [openRequestUtils, setOpenRequestUtils] = useState(false);
  const [openFilterPropReport, setOpenFilterPropReport] = useState(false);
  const [searchNameQuery, setSearchNameQuery] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [aobAddableCommesse, setaobAddableCommesse] = useState<any[]>([]);
  // const [openMancantiAndImpegniModal, setOpenMancantiAndImpegniModal] = useState(false);
  const [aobTecnici, setAobTecnici] = useState<any[]>([]);
  const url = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();
  const [aobTecniciToBeRendered, setAobTecniciToBeRendered] = useState<any[]>(
    []
  );
  const [windowDimensions, setWindowDimensions] = useState(
    getWindowDimensions()
  );

  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    // console(commessaSelected);
  }, [commessaSelected]);

  function getWindowDimensions() {
    const { innerWidth: width, innerHeight: height } = window;
    return {
      width,
      height,
    };
  }

  const fetchLoadedCommesse = async () => {
    try {
      const response = await axios.get(`${url}/fetchcommesse`); // Use your backend URL/port
      if (response.data.success) {
        const commesseData = response.data.data;
        setLoadedCommesse(commesseData);
        return { value: commesseData };
      } else {
        throw new Error(
          response.data.message || "Failed to fetch loaded commesse"
        );
      }
    } catch (err: any) {
      console.error("Failed to fetch loaded commesse:", err);
    }
  };
  const fetchedLoadedTecnici = async (commesse: any) => {
    const now = new Date();
    const targetYear = now.getFullYear();

    // Use selectedMonth instead of current month
    const targetMonth = selectedMonth + 1; // Convert to 1-12 format
    const currentMonthName = monthNamesItalian[selectedMonth];

    // Calculate hours worked by each technician
    const tecnicoOreMap: Record<string, number> = {};
    commesse.value.forEach((commessa: any) => {
      const processOreLav = (oreLavArray: any[]) => {
        oreLavArray.forEach((entry) => {
          const tecnico = entry.tecnico;
          const oreLavorate = (entry.oreLav as number) || 0;
          const entryDate = new Date(entry.timestamp);
          const entryMonth = entryDate.getMonth() + 1;
          const entryYear = entryDate.getFullYear();
          if (entryMonth === targetMonth && entryYear === targetYear) {
            tecnicoOreMap[tecnico] =
              (tecnicoOreMap[tecnico] || 0) + oreLavorate;
          }
        });
      };

      if (commessa.cablaggio?.oreLav?.length)
        processOreLav(commessa.cablaggio.oreLav);
      if (commessa.montaggio?.oreLav?.length)
        processOreLav(commessa.montaggio.oreLav);
    });

    // Prepare preprocessed list
    const technicians = Object.entries(tecnicoOreMap).map(
      ([tecnico, oreLavorate], uniqueKey) => {
        const [name, ...surnameParts] = tecnico.split(" ");
        // console(tecnico);
        const surname = surnameParts.join(" ");
        const role =
          aobTecnici.find(
            (t: any) => `${t.name.trim()} ${t.surname.trim()}` === tecnico
          )?.role || "Operaio";
        const oreLavorateNum = parseFloat(oreLavorate.toString()) || 0;
        const percOreLavorate = Math.ceil((oreLavorateNum / 186) * 100);
        // console(aobTecnici);

        return {
          uniqueKey,
          name,
          surname,
          role:
            role === "Operaio" || role === "Operatore"
              ? "Operatore"
              : "Capo Commessa",
          oreLavorate: oreLavorateNum,
          percOreLavorate,
          currentMonthName,
        };
      }
    );

    // console(technicians);

    setAobTecniciToBeRendered(technicians);
  };

  const fetchTecnici = async () => {
    try {
      const response = await axios.get(`${url}/gettecnici`); // Use your backend URL/port
      if (response.data.success) {
        const tecniciData = response.data.data;
        setAobTecnici(tecniciData);
        return { value: tecniciData };
      } else {
        throw new Error(
          response.data.message || "Failed to fetch loaded commesse"
        );
      }
    } catch (err: any) {
      console.error("Failed to fetch loaded commesse:", err);
    }
  };

  const fetchAll = async () => {
    try {
      setLoading(true);
      const commesseData = await fetchLoadedCommesse();

      if (commesseData) {
        await fetchTecnici();
        await fetchedLoadedTecnici(commesseData);
        const snapshot = await getDocs(collection(firestore, "records"));
        const merged = mergeRecords(snapshot);
        const addable = merged.filter(
          (record) =>
            record.status >= 9 &&
            record.status <= 99 &&
            (record.pippo === false || record.pippo === undefined)
        );
        // console(addable);

        setaobAddableCommesse(addable);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Error loading data");
    } finally {
      setLoading(false);
    }
  };

  const mergeRecords = (snapshot: QuerySnapshot<DocumentData>): ToDoItem[] => {
    return Array.from(
      snapshot.docs
        .map((doc) => ({ ...doc.data(), id: doc.id } as ToDoItem))
        .reduce((acc, record) => {
          const existing = acc.get(record.commessa);

          if (existing) {
            if (record.status > existing.status) {
              existing.status = record.status;
            }
            // Merge arrays and keep unique values
            existing.componentsPath = [
              ...new Set([
                ...existing.componentsPath,
                ...record.componentsPath,
              ]),
            ];
            existing.shelf = [...new Set([...existing.shelf, ...record.shelf])];
            existing.uniqueDocs = [
              ...new Set([...existing.uniqueDocs, ...record.uniqueDocs]),
            ];
            // Keep the earliest date
            if (new Date(record.iniziolav) < new Date(existing.iniziolav)) {
              existing.iniziolav = record.iniziolav;
            }
          } else {
            acc.set(record.commessa, record);
          }
          return acc;
        }, new Map<string, ToDoItem>())
        .values()
    );
  };

  // useEffect(() => {
  //   const unsubscribe = onSnapshot(
  //     collection(firestore, "records"),
  //     (snapshot) => {
  //       setaobAddableCommesse(mergeRecords(snapshot));
  //      // console(mergeRecords(snapshot));
  //       setLoading(false);
  //     },
  //     (error) => console.error("Listener error:", error)
  //   );
  //   return () => unsubscribe();
  // }, []);

  useEffect(() => {
    fetchAll();
  }, [selectedMonth]);

  useEffect(() => {
    // Fix for Chrome modal positioning
    if (openAssignCommessa) {
      const modalElements = document.querySelectorAll(".ant-modal-wrap");
      modalElements.forEach((modal) => {
        (modal as HTMLElement).style.position = "fixed";
        (modal as HTMLElement).style.top = "0";
        (modal as HTMLElement).style.left = "0";
      });
    }
  }, [openAssignCommessa]);

  const fCalculateErrori = (errorData: any, oreLavorate: any) => {
    let calculatedOreErrori = 0;
    if (errorData && typeof errorData === "object") {
      for (const key of keysToSumFrom) {
        if (errorData[key] && Array.isArray(errorData[key])) {
          for (const item of errorData[key]) {
            if (item && typeof item.ore === "number") {
              calculatedOreErrori += item.ore;
            }
          }
        }
      }
    }
    const calculatedErroriPerc =
      oreLavorate > 0 ? (calculatedOreErrori / oreLavorate) * 100 : 0;
    return { oreErrori: calculatedOreErrori, erroriPerc: calculatedErroriPerc };
  };
  const fCalculateOre = (lavorazioniData: any) => {
    let oreLavorate = 0;
    let orePrevisteTotali = 0;

    //console.log(lavorazioniData);

    if (lavorazioniData && typeof lavorazioniData === "object") {
      // Calculate oreLavorate from both cablaggio and montaggio
      if (lavorazioniData.oreLav && Array.isArray(lavorazioniData.oreLav)) {
        //console.log("entro qui");
        for (const task of lavorazioniData.oreLav) {
          if (task && typeof task.oreLav === "number") {
            oreLavorate += task.oreLav;
          }
        }
      }

      // Add hours from cablaggio if present
      if (
        lavorazioniData.cablaggio &&
        Array.isArray(lavorazioniData.cablaggio.oreLav)
      ) {
        for (const task of lavorazioniData.cablaggio.oreLav) {
          if (task && typeof task.oreLav === "number") {
            oreLavorate += task.oreLav;
          }
        }
      }

      // Add hours from montaggio if present
      if (
        lavorazioniData.montaggio &&
        Array.isArray(lavorazioniData.montaggio.oreLav)
      ) {
        for (const task of lavorazioniData.montaggio.oreLav) {
          if (task && typeof task.oreLav === "number") {
            oreLavorate += task.oreLav;
          }
        }
      }

      // Get orePreviste
      if (
        lavorazioniData.cablaggio.orePreviste &&
        lavorazioniData.montaggio.orePreviste &&
        typeof lavorazioniData.montaggio.orePreviste.ore === "number" &&
        typeof lavorazioniData.cablaggio.orePreviste.potenza === "number" &&
        typeof lavorazioniData.cablaggio.orePreviste.ausiliari === "number"
      ) {
        //console.log("entro qui");
        orePrevisteTotali =
          lavorazioniData.montaggio.orePreviste.ore +
          lavorazioniData.cablaggio.orePreviste.potenza +
          lavorazioniData.cablaggio.orePreviste.ausiliari;
      }
    }

    const oreMancanti = orePrevisteTotali - oreLavorate;
    return { oreLavorate, oreMancanti, orePrevisteTotali };
  };
  const fCalculateStato = (stato: any) => {
    switch (stato) {
      case 0:
        return { text: "🔵 In Corso", color: "blue" };
      case 1:
        return { text: "🟣 Attesa Materiale", color: "purple" };
      case 3:
        return { text: "🟡 Collaudo", color: "yellow" };
      case 4:
        return { text: "🟠 Attesa Collaudo", color: "orange" };
      case 99:
        return { text: "⚫ Archiviata", color: "gray" };
      default:
        return { text: "🟢 Completato", color: "green" };
    }
  };

  const handleOpenAddHour = async (commessa: any) => {
    handleResetCommessa();
    // console(commessa);
    setCommessaSelected(commessa);
    setOpenAddHour(true);
  };
  const handleOpenAddError = async (commessa: any) => {
    await handleResetCommessa();
    setCommessaSelected(commessa);
    setOpenAddError(true);
  };
  const handleOpenAssignCommessa = async (commessa: any) => {
    await handleResetCommessa();
    setCommessaSelected(commessa);
    setOpenAssignCommessa(true);
  };
  const handleResetCommessa = async () => {
    // console(commessaSelected);
    setCommessaSelected({});
  };

  const handleOk = async () => {
    await handleResetCommessa();
    setOpenAddError(false);
    setOpenAddHour(false);
    setOpenAssignCommessa(false);
    setOpenManageTechnicians(false);
    setOpenSearchCommesse(false);
    setOpenRemoveCommesse(false);
    setOpenFilterPropReport(false);
    setOpenRequestUtils(false);
    fetchLoadedCommesse();
  };
  const handleCancel = async () => {
    await handleResetCommessa();
    setOpenAddError(false);
    setOpenAddHour(false);
    setOpenAssignCommessa(false);
    setOpenManageTechnicians(false);
    setOpenSearchCommesse(false);
    setOpenRemoveCommesse(false);
    setOpenFilterPropReport(false);
    setOpenRequestUtils(false);
    fetchLoadedCommesse();
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
        //console.log(response.data)
        if (response.data.length === 0) {
          toast.error("Nessun impegno trovato");
        } else {
          //showSuccessToast("Commessa trovata");
          // console(response.data);
          //const filteredData = response.data.filter((item: any) => item.cod_tipoord === "IMAT");
          const filteredData = response.data;
          const sortedData = filteredData.sort((a: any, b: any) => {
            if (a.des_articolo_riga < b.des_articolo_riga) return -1;
            if (a.des_articolo_riga > b.des_articolo_riga) return 1;
            return 0;
          });
          generatePdfImpegni(sortedData, commessa);
        }
      })
      .catch((error) => {
        console.error(error);
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
        //console.log(response.data)
        if (response.data.length === 0) {
          toast.success("Nessun mancante trovato");
        } else {
          //showSuccessToast("Commessa trovata");
          // console(response.data);
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

  const handleCreateReportTecniciPDF = (tecniciToBeRendered: any[]) => {
    // console(aobTecniciToBeRendered);
    const doc = new jsPDF("landscape");
    const Logo = img;
    doc.addImage(Logo, "JPEG", 15, 15, 67, 40);
    doc.setFontSize(36);
    doc.text("Resoconto Tecnici", 140, 40);

    const formattedData = tecniciToBeRendered.map((tecnico) => ({
      nome: `${tecnico.name} ${tecnico.surname}`,
      ruolo: tecnico.role,
      oreLavorate: tecnico.oreLavorate,
      percentualeOre: `${tecnico.percOreLavorate}%`,
      mese: tecnico.currentMonthName,
    }));

    // console(formattedData);

    autoTable(doc, {
      startY: 73,
      columns: [
        { header: "Tecnico", dataKey: "nome" },
        { header: "Ruolo", dataKey: "ruolo" },
        { header: "Ore Lavorate", dataKey: "oreLavorate" },
        { header: "% Ore/Mese", dataKey: "percentualeOre" },
        { header: "Mese", dataKey: "mese" },
      ],
      body: formattedData,
    });

    doc.setFontSize(10);
    doc.text(
      `Generato il: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
      15,
      doc.internal.pageSize.height - 10
    );
    doc.save(`Resoconto_Tecnici_${new Date().toLocaleDateString()}.pdf`);
  };

  const handleCreateReportTecniciXLSX = (tecniciToBeRendered: any[]) => {
    const formattedData = tecniciToBeRendered.map((tecnico) => ({
      Tecnico: `${tecnico.name} ${tecnico.surname}`,
      Ruolo: tecnico.role,
      "Ore Lavorate": tecnico.oreLavorate,
      "% Ore/Mese": `${tecnico.percOreLavorate}%`,
      Mese: tecnico.currentMonthName,
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Resoconto Tecnici");
    const fileName = `Resoconto_Tecnici_${new Date().toLocaleDateString()}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  //console.log(loadedCommesse);
  //console.log(commessaSelected);
  const renderButtons = () => (
    <div style={{ width: "100%", textAlign: "center", marginBottom: "16px" }}>
      <div style={{ position: "relative", left: "20px" }}>
        {!showCommesse ? (
          <div style={{ display: "flex", alignItems: "center" }}>
            <Button
              onClick={() => setOpenManageTechnicians(true)}
              style={{ marginRight: "16px" }}
            >
              <FaUserGear />
            </Button>
            <Select
              style={{ width: "150px", marginRight: "8px" }}
              value={selectedMonth}
              onChange={(value) => setSelectedMonth(parseInt(value.toString()))}
            >
              {Array.from({ length: 12 }, (_, i) => (
                <Select.Option key={i} value={i}>
                  {monthNamesItalian[i]}
                </Select.Option>
              ))}
            </Select>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center" }}>
            {user && parseInt(user.role) == 99 && (
              <>
                <Button
                  onClick={() => {
                    setSearchCommesseLoading(true);
                    // Add a small delay to show the loading state
                    setTimeout(() => {
                      setOpenSearchCommesse(true);
                      setSearchCommesseLoading(false);
                    }, 500);
                  }}
                  style={{ marginRight: "16px" }}
                  disabled={searchCommesseLoading}
                >
                  {searchCommesseLoading ? (
                    <Spin size="small" />
                  ) : (
                    <RiPlayListAddFill />
                  )}
                </Button>
                <Button
                  onClick={() => setOpenRemoveCommesse(true)}
                  style={{ marginRight: "16px" }}
                >
                  <MdOutlinePlaylistRemove size={20} />
                </Button>
                <Button
                  onClick={() => setOpenRequestUtils(true)}
                  style={{ marginRight: "16px" }}
                >
                  <MdSettingsInputComponent size={17} />
                </Button>
              </>
            )}
            <Input
              placeholder="Cerca commessa..."
              style={{ width: "200px", marginRight: "8px" }}
              value={searchNameQuery}
              onChange={(e) => setSearchNameQuery(e.target.value)}
            />
            {user && parseInt(user.role) == 99 && (
              <Select
                style={{ width: "200px" }}
                value={selectedStatus}
                onChange={(value) => setSelectedStatus(value.toString())}
              >
                <Select.Option value="">Tutte</Select.Option>
                <Select.Option value="0">In Corso</Select.Option>
                <Select.Option value="1">Attesa Materiale</Select.Option>
                <Select.Option value="2">Completato</Select.Option>
                <Select.Option value="3">Collaudo</Select.Option>
                <Select.Option value="4">Attesa Collaudo</Select.Option>
                <Select.Option value="99">Archiviate</Select.Option>
              </Select>
            )}
          </div>
        )}
      </div>
      {user && parseInt(user.role) == 99 && (
        <Button
          onClick={() => setShowCommesse(!showCommesse)}
          style={{ marginRight: "16px" }}
        >
          {showCommesse ? <FaPeopleGroup /> : <FaListUl />}
        </Button>
      )}
      {user &&
        parseInt(user?.role) == 99 &&
        (showCommesse ? (
          <>
            {/* <Button onClick={() => handleCreateReportCommessePDF(aobCommesseToBeRendered, obMappedInCorsoCommesse)} style={{ marginRight: '16px' }}>
              <FaFilePdf />
            </Button> */}
            <Button onClick={() => setOpenFilterPropReport(true)}>
              Report
            </Button>
          </>
        ) : (
          <>
            <Button
              onClick={() =>
                handleCreateReportTecniciPDF(aobTecniciToBeRendered)
              }
              style={{ marginRight: "16px" }}
            >
              <FaFilePdf />
            </Button>
            <Button
              onClick={() =>
                handleCreateReportTecniciXLSX(aobTecniciToBeRendered)
              }
            >
              <PiMicrosoftExcelLogoFill />
            </Button>
          </>
        ))}
    </div>
  );
  return (
    <Layout
      style={{
        minWidth: "100vw", // Ensure minimum width covers viewport
        width: windowDimensions.width,
        height: "100vh",
        background: "#1e2a4a",
        display: "flex", // Use flexbox on the main layout
        justifyContent: "center", // Center content horizontally
        overflow: "hidden", // Prevent scrollbars on the layout itself
        margin: 0,
        padding: 0,
      }}
    >
      <Navbar />
      <Content
        style={{
          padding: "24px",
          margin: "0 auto",
          width: "100%",
          flex: 1,
          overflow: "hidden", // Prevent scrollbars on the content
        }}
      >
        {loading && loadedCommesse.length == 0 ? (
          <Spin />
        ) : showCommesse ? (
          <>
            {renderButtons()}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                maxHeight: "80vh", // Set a maximum height for the content
                paddingRight: "8px", // Add some padding for the scrollbar
              }}
            >
              {loadedCommesse
                .filter((commessa) => {
                  const searchTerm = searchNameQuery.toLowerCase();
                  const matchesSearch =
                    commessa.commessa.toLowerCase().includes(searchTerm) ||
                    (commessa.desCliente?.toLowerCase() || "").includes(
                      searchTerm
                    );
                  const matchesStatus = selectedStatus
                    ? parseInt(commessa.stato) === parseInt(selectedStatus)
                    : parseInt(commessa.stato) !== 99;

                  const isVisible = commessa.visible == true;
                  return matchesSearch && matchesStatus && isVisible;
                })
                .sort((a: any, b: any) => {
                  // Get progression values, defaulting to 0 if undefined/NaN
                  const progressA = parseFloat(a.progression) || 0;
                  const progressB = parseFloat(b.progression) || 0;

                  // Sort in descending order (higher progression first)
                  return progressB - progressA;
                })
                .map((commessa: any) => {
                  // Assuming these values are calculated or available on commessa object
                  // const isRequested = handleCheckCommessaStatus(
                  //   commessa.commessa
                  // );
                  const uniqueKey = commessa.id; // Use a unique key from your data
                  let progress = 0.0;
                  if (
                    commessa.progression != undefined &&
                    commessa.progression !== "" &&
                    commessa.progression !== "NaN"
                  ) {
                    progress = parseFloat(commessa.progression);
                  }
                  const progression = Number(progress.toFixed(1));
                  const oreMancanti = fCalculateOre(commessa).oreMancanti || 0; // Example value
                  const oreLavorate = fCalculateOre(commessa).oreLavorate || 0; // Example value
                  const oreErrori =
                    fCalculateErrori(commessa.errori, oreLavorate).oreErrori ||
                    0;
                  const erroriPerc =
                    fCalculateErrori(commessa.errori, oreLavorate).erroriPerc ||
                    0;
                  const stato = fCalculateStato(parseInt(commessa.stato)); // Example value

                  // Example user data - replace with actual user context

                  return (
                    <Card
                      key={uniqueKey}
                      style={{
                        marginBottom: 16,
                        background: "rgba(255, 255, 255, 0.1)",
                        width: "100%",
                      }}
                      bodyStyle={{ padding: "16px" }}
                    >
                      <Row align="middle" gutter={32}>
                        <Col flex="10%" style={{ textAlign: "center" }}>
                          <Popover
                            content={
                              <Space direction="vertical">
                                <Button
                                  type="link"
                                  onClick={() =>
                                    handleCheckImpegniCommessa(
                                      commessa.commessa
                                    )
                                  }
                                  style={{ width: "100%", marginBottom: 8 }}
                                >
                                  Impegni
                                </Button>
                                <Button
                                  type="link"
                                  onClick={() =>
                                    handleCheckMancantiCommessa(
                                      commessa.commessa
                                    )
                                  }
                                  style={{ width: "100%" }}
                                >
                                  Mancanti
                                </Button>
                                <Button
                                  type="link"
                                  onClick={() =>
                                    navigate(
                                      `/ubication/${commessa.commessa}/Officina`
                                    )
                                  }
                                  style={{ width: "100%" }}
                                >
                                  Ubicazione commessa
                                </Button>
                                <Button
                                  type="link"
                                  onClick={() =>
                                    navigate(
                                      `/ubication/${commessa.commessa}/Magazzino`
                                    )
                                  }
                                  style={{ width: "100%" }}
                                >
                                  Ubicazione materiale
                                </Button>
                                <PrintSignButton records={commessa} />
                              </Space>
                            }
                            trigger="click"
                            placement="bottomLeft"
                          >
                            <Button
                              type="link"
                              style={{
                                fontSize: 20,
                                fontWeight: "bold",
                                color: "white",
                                padding: 0,
                              }}
                            >
                              {commessa.commessa || "N/A"}
                            </Button>
                          </Popover>
                        </Col>
                        <Col
                          flex="25%"
                          style={{
                            textAlign: "center",
                          }}
                        >
                          <Typography.Text
                            style={{ fontSize: 15, color: "white" }}
                          >
                            {commessa.descliente || "N/A"}
                            <br />
                            {commessa.comcliente || "N/A"} -{" "}
                            {commessa.descommessa || "N/A"}
                          </Typography.Text>
                        </Col>
                        {/* Progress Bar (Conditional) */}
                        {user?.reparto === "Officina" && (
                          <Col flex="15%" style={{ marginRight: "30px" }}>
                            <Progress
                              percent={progression}
                              size={[250, 10]}
                              percentPosition={{
                                align: "center",
                                type: "outer",
                              }}
                              status={progression > 100 ? "normal" : "active"}
                              strokeColor={
                                progression > 100 ? "red" : "#4096ff"
                              }
                              style={{ width: "100%" }}
                              showInfo={progression <= 100}
                              format={(percent) =>
                                progression <= 100 ? `${percent}%` : ""
                              }
                            />
                          </Col>
                        )}
                        <Col flex="23%">
                          <ThreeStat
                            oreMancanti={oreMancanti}
                            oreLavorate={oreLavorate}
                            oreErrori={oreErrori}
                            progression={progression}
                            erroriPerc={erroriPerc}
                            user={user}
                            stato={commessa.stato}
                          />
                        </Col>
                        <Col flex="13%" style={{ textAlign: "center" }}>
                          <Typography.Text
                            style={{
                              color: stato.color,
                              fontSize: "16px",
                              fontWeight: "bold",
                            }}
                          >
                            {stato.text}
                          </Typography.Text>
                        </Col>
                        <Col
                          style={{ textAlign: "right", marginRight: "5px" }}
                          flex="10%"
                        >
                          <Space
                            style={{
                              display: "flex",
                              justifyContent: "flex-end",
                            }}
                          >
                            <FourButtons
                              commessa={commessa}
                              user={user}
                              handleOpenAddError={handleOpenAddError}
                              handleOpenAddHour={handleOpenAddHour}
                              handleOpenAssignCommessa={
                                handleOpenAssignCommessa
                              }
                            />
                          </Space>
                        </Col>
                      </Row>
                    </Card>
                  );
                })}
            </div>
          </>
        ) : (
          <>
            {renderButtons()}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                paddingRight: "8px", // Add some padding for the scrollbar
                maxHeight: "80vh",
              }}
            >
              <Row gutter={[16, 16]}>
                {aobTecniciToBeRendered.map(
                  ({
                    uniqueKey,
                    name,
                    surname,
                    role,
                    oreLavorate,
                    percOreLavorate,
                    currentMonthName,
                  }) => (
                    <Col
                      xs={24}
                      sm={24}
                      md={12}
                      lg={12}
                      xl={12}
                      key={uniqueKey}
                    >
                      <Card
                        style={{
                          height: "100%",
                          background: "rgba(255, 255, 255, 0.1)",
                          border: "1px solid rgba(255, 255, 255, 0.2)",
                        }}
                      >
                        <Row justify="space-between" align="middle">
                          <Col span={8} style={{ textAlign: "center" }}>
                            <Typography.Text style={{ color: "white" }}>
                              {name} {surname}
                            </Typography.Text>
                          </Col>
                          <Col span={8} style={{ textAlign: "center" }}>
                            <Typography.Text style={{ color: "white" }}>
                              {role}
                            </Typography.Text>
                          </Col>
                          <Col span={8} style={{ textAlign: "center" }}>
                            <Space
                              direction="vertical"
                              size={0}
                              style={{ width: "100%" }}
                            >
                              <Typography.Text style={{ color: "white" }}>
                                Lavorate a {currentMonthName}
                              </Typography.Text>
                              <Typography.Title
                                level={4}
                                style={{ margin: 0, color: "white" }}
                              >
                                {oreLavorate}h
                              </Typography.Title>
                              <Space align="center">
                                {percOreLavorate > 0 ? (
                                  <ArrowUpOutlined
                                    style={{ color: "#3f8600" }}
                                  />
                                ) : (
                                  <ArrowDownOutlined
                                    style={{ color: "#cf1322" }}
                                  />
                                )}
                                <Typography.Text
                                  style={{
                                    color:
                                      percOreLavorate > 0
                                        ? "#3f8600"
                                        : "#cf1322",
                                  }}
                                >
                                  {Math.floor(percOreLavorate)}%
                                </Typography.Text>
                              </Space>
                            </Space>
                          </Col>
                        </Row>
                      </Card>
                    </Col>
                  )
                )}
              </Row>
            </div>
          </>
        )}
      </Content>
      <Modal
        title={`Aggiungi lavorazione per la Commessa ${
          commessaSelected?.commessa as any
        }`}
        open={openAddHour}
        onOk={handleOk}
        onCancel={handleCancel}
        style={{
          top: 0,
          left: 0,
          margin: 0,
          padding: 0,
          maxWidth: "100vw",
          height: "100vh",
          overflow: "auto",
        }}
        width="100vw"
        centered
        footer={null}
      >
        <AddHour commessa={commessaSelected} />
      </Modal>
      <Modal
        title={`Aggiungi errori per la Commessa ${
          commessaSelected?.commessa as any
        }`}
        open={openAddError}
        onOk={handleOk}
        onCancel={handleCancel}
        style={{ top: 30 }}
        width={1300}
      >
        <AddError commessa={commessaSelected} />
      </Modal>
      <Modal
        title={`Modifica parametri per la Commessa ${
          commessaSelected?.commessa as any
        }`}
        open={openAssignCommessa}
        onOk={handleOk}
        onCancel={handleCancel}
        style={{
          top: 0,
          left: 0,
          margin: 0,
          padding: 0,
          maxWidth: "100vw",
          height: "100vh",
          overflow: "auto",
        }}
        width="100vw"
        centered
        footer={null}
      >
        <AssignCommessa commessa={commessaSelected} />
      </Modal>
      <Modal
        title="Gestione Tecnici"
        open={openManageTechnicians}
        onOk={handleOk}
        onCancel={handleCancel}
        width={1000}
      >
        <ManageTechnicians />
      </Modal>
      <Modal
        title="Cerca Commesse"
        open={openSearchCommesse}
        onOk={handleOk}
        onCancel={handleCancel}
        width={1000}
      >
        <SearchCommessa aobAddableCommesse={aobAddableCommesse} />
      </Modal>
      <Modal
        title="Rimuovi Commesse"
        open={openRemoveCommesse}
        onOk={handleOk}
        onCancel={handleCancel}
        width={1000}
      >
        <RemoveCommessa
          aobAddableCommesse={aobAddableCommesse}
          aobCommesseToBeRendered={loadedCommesse}
        />
      </Modal>
      <Modal
        title="Richiedi materiale per Commesse"
        open={openRequestUtils}
        onOk={handleOk}
        onCancel={handleCancel}
        width={1000}
      >
        <RequestUtils
          aobAddableCommesse={aobAddableCommesse}
          aobCommesseToBeRendered={loadedCommesse}
        />
      </Modal>
      <Modal
        title="Filtro Report"
        open={openFilterPropReport}
        onCancel={handleCancel}
        footer={null}
        width={500}
      >
        <FilterReport
          aobCommesseToBeRendered={loadedCommesse}
          obMappedInCorsoCommesse={loadedCommesse.filter(
            (commessa: any) => commessa.stato !== 99
          )}
        />
      </Modal>
    </Layout>
  );
};

export default Homepage;
