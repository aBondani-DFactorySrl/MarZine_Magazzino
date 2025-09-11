//#region Imports
import { Button, Space, Typography, Switch, Select } from "antd";
import { RiFileExcel2Fill, RiFilePdf2Fill } from "react-icons/ri";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import img from "../../assets/Logo Marchiani R base 40 cm HR.png";
import toast from "react-hot-toast";
import { useState } from "react";
import axios from "axios";
const { Text } = Typography;
//#endregion

//#region Interfaces
interface FilterReportProps {
  aobCommesseToBeRendered: any[];
  obMappedInCorsoCommesse: any;
}
//#endregion

const FilterReport: React.FC<FilterReportProps> = ({
  aobCommesseToBeRendered,
}) => {
  //#region Variables
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [filterMode, setFilterMode] = useState<boolean>(false);
  const [selectedStatusRepFilter, _setSelectedStatusRepFilter] = useState("");
  const [selectedComFilter, setSelectedComFilter] = useState<string[]>([]);
  const url = import.meta.env.VITE_BACKEND_URL;
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

  //#region Calculation for Reports
  const calculateTotalHours = (commessa: any) => {
    const cablaggioHours =
      commessa.cablaggio?.oreLav?.reduce(
        (acc: number, curr: any) => acc + (curr.oreLav || 0), // Changed from 'ore' to 'oreLav'
        0
      ) || 0;
    const montaggioHours =
      commessa.montaggio?.oreLav?.reduce(
        (acc: number, curr: any) => acc + (curr.oreLav || 0), // Changed from 'ore' to 'oreLav'
        0
      ) || 0;
    return cablaggioHours + montaggioHours;
  };

  const calculatePlannedHours = (commessa: any) => {
    const cablaggioPreviste =
      (commessa.cablaggio?.orePreviste?.potenza || 0) +
      (commessa.cablaggio?.orePreviste?.ausiliari || 0);
    const montaggioPreviste = commessa.montaggio?.orePreviste?.ore || 0;
    return cablaggioPreviste + montaggioPreviste;
  };

  const calculateMissingHours = (commessa: any) => {
    const totalHours = calculateTotalHours(commessa);
    const plannedHours = calculatePlannedHours(commessa);
    return Math.abs(plannedHours - totalHours);
  };

  const calculateExceededPercentage = (commessa: any) => {
    const totalHours = calculateTotalHours(commessa);
    const plannedHours = calculatePlannedHours(commessa);
    const missingHours = plannedHours - totalHours;

    if (missingHours >= 0) return "0.00%";

    const percentage = (Math.abs(missingHours) / plannedHours) * 100;
    return isFinite(percentage) && !isNaN(percentage)
      ? `${percentage.toFixed(2)}%`
      : "0.00%";
  };

  const calculateErrorHours = (commessa: any) => {
    const allErrors = [
      ...(commessa.errori?.df || []),
      ...(commessa.errori?.nu || []),
      ...(commessa.errori?.cp || []),
      ...(commessa.errori?.ca || []),
      ...(commessa.errori?.co || []),
    ];
    return allErrors.reduce(
      (acc: number, curr: any) => acc + (curr.ore || 0),
      0
    );
  };

  const calculateErrorPercentage = (commessa: any) => {
    const errorHours = calculateErrorHours(commessa);
    const totalHours = calculateTotalHours(commessa);

    if (totalHours === 0) return "0.00%";

    const percentage = (errorHours / totalHours) * 100;
    return `${percentage.toFixed(2)}%`;
  };
  //#endregion

  //#region get Label
  const getStatoLabel = (stato: number) => {
    switch (stato) {
      case 0:
        return "In Corso";
      case 1:
        return "Attesa Materiale";
      case 2:
        return "Completato";
      case 3:
        return "Collaudo";
      case 4:
        return "Attesa Collaudo";
      case 99:
        return "Archiviate";
      default:
        return "Sconosciuto";
    }
  };

  const getTaskLabel = (taskCode: string) => {
    const found = Lavorazioni.find((lav) => lav.code === taskCode);
    return found ? `${taskCode} - ${found.desc}` : taskCode;
  };

  const getRepartoErrorLabel = (
    reparto: string,
    provenienzaSchemista: string,
    nomeSchemista: string
  ) => {
    switch (reparto) {
      case "O":
        return `Officina`;
      case "S":
        return `Schemisti - ${provenienzaSchemista} - ${nomeSchemista}`;
      case "M":
        return "Magazzino";
    }
  };
  //#endregion

  //#region Archived Report
  const handleCreateArchivedReportXLSX = (allCommesse: any[]) => {
    const formattedData = allCommesse
      .filter((commessa) => commessa)
      .map((commessa) => {
        return {
          "Commessa Cliente": commessa.comcliente || "",
          "Descrizione Cliente": commessa.descommessa || "",
          "Commessa ID": commessa.commessa.split(" - ")[0],
          "Data Archiviazione": commessa.finelav
            ? new Date(commessa.finelav).toLocaleDateString()
            : "",
          "Progressione (%)": `${(commessa.progression || 0).toFixed(2)}%`,
          "Ore Totali Lavorate": calculateTotalHours(commessa),
          "Ore Preventivate": calculatePlannedHours(commessa),
          "Ore Mancanti/Superate": calculateMissingHours(commessa),
          "Ore Superate (%)": calculateExceededPercentage(commessa),
          "Ore Errori": calculateErrorHours(commessa),
          "Errori (%)": calculateErrorPercentage(commessa),
        };
      });

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Resoconto Commesse Archiviate"
    );
    const fileName = `Resoconto_Commesse_Archiviate_${new Date().toLocaleDateString()}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const handleCreateArchivedReportPDF = (allCommesse: any[]) => {
    const doc = new jsPDF("landscape");
    const Logo = img;
    doc.addImage(Logo, "JPEG", 15, 15, 67, 40);
    doc.setFontSize(36);
    doc.text("Resoconto Commesse Archiviate", 140, 40);
    const formattedData = allCommesse.map((commessa) => {
      return {
        cliente: commessa.comcliente || "",
        idCommessa: commessa.commessa.split(" - ")[0],
        dataArchiviazione: commessa.finelav
          ? new Date(commessa.finelav).toLocaleDateString()
          : "",
        progression: `${(commessa.progression || 0).toFixed(2)}%`,
        totalOreLavorate: calculateTotalHours(commessa),
        oreMancanti: calculateMissingHours(commessa),
        oreErrori: calculateErrorHours(commessa),
        erroriPerc: calculateErrorPercentage(commessa),
      };
    });

    autoTable(doc, {
      startY: 73,
      columns: [
        { header: "Commessa Cliente", dataKey: "cliente" },
        { header: "Commessa ID", dataKey: "idCommessa" },
        { header: "Data Archiviazione", dataKey: "dataArchiviazione" },
        { header: "Progressione (%)", dataKey: "progression" },
        { header: "Ore Totali Lavorate", dataKey: "totalOreLavorate" },
        { header: "Ore Mancanti", dataKey: "oreMancanti" },
        { header: "Ore Errori", dataKey: "oreErrori" },
        { header: "Errori (%)", dataKey: "erroriPerc" },
      ],
      body: formattedData,
    });
    // Add footer
    const pageHeight = doc.internal.pageSize.height;

    // Footer line
    doc.setDrawColor(236, 240, 241); // Light gray
    doc.setLineWidth(1);
    doc.line(
      15,
      pageHeight - 20,
      doc.internal.pageSize.width - 15,
      pageHeight - 20
    );

    // Footer text
    doc.setFontSize(8);
    doc.setTextColor(52, 73, 94); // Dark gray

    const timestamp = new Date();
    const dateStr = timestamp.toLocaleDateString();
    const timeStr = timestamp.toLocaleTimeString();

    // Left side: Generation timestamp
    doc.text(`Generato il: ${dateStr} alle ${timeStr}`, 15, pageHeight - 12);

    // Right side: Page number
    doc.text(`Pagina 1`, doc.internal.pageSize.width - 30, pageHeight - 12);

    doc.save(
      `Resoconto_Commesse_Archiviate_${
        new Date().toISOString().split("T")[0]
      }.pdf`
    );
  };
  //#endregion

  //#region Active Report
  const handleCreateActiveReportXLSX = (allCommesse: any[]) => {
    const workbook = XLSX.utils.book_new();

    // Create a summary sheet with all commesse overview
    const summaryData: any[] = [];

    allCommesse.forEach((commessa) => {
      let commessaFinded = aobCommesseToBeRendered.find(
        (item) => item.commessa === commessa
      );
      // console(commessaFinded);

      if (commessaFinded) {
        const commessaId = commessaFinded.commessa.split(" - ")[0];

        // Add to summary
        summaryData.push({
          "Commessa Cliente": commessaFinded.comcliente || "",
          "Descrizione Cliente": commessaFinded.descommessa || "",
          "Commessa ID": commessaId,
          Stato: getStatoLabel(commessaFinded.stato),
          "Progressione (%)": `${(commessaFinded.progression || 0).toFixed(
            2
          )}%`,
          "Ore Totali Lavorate": calculateTotalHours(commessaFinded),
          "Ore Preventivate": calculatePlannedHours(commessaFinded),
          "Ore Mancanti/Superate": calculateMissingHours(commessaFinded),
          "Ore Superate (%)": calculateExceededPercentage(commessaFinded),
          "Ore Errori": calculateErrorHours(commessaFinded),
          "Errori (%)": calculateErrorPercentage(commessaFinded),
        });

        // Create individual worksheet for this commessa
        const commessaData = [];

        // Add commessa info header
        commessaData.push({
          Sezione: "INFORMAZIONI GENERALI",
          Campo: "",
          Valore: "",
          Dettagli: "",
          Data: "",
          Note: "",
        });

        commessaData.push({
          Sezione: "",
          Campo: "Commessa Cliente",
          Valore: commessaFinded.comcliente || "",
          Dettagli: "",
          Data: "",
          Note: "",
        });

        commessaData.push({
          Sezione: "",
          Campo: "Descrizione",
          Valore: `${commessaFinded.descommessa} - ${commessaFinded.descliente}`,
          Dettagli: "",
          Data: "",
          Note: "",
        });

        commessaData.push({
          Sezione: "",
          Campo: "Stato",
          Valore: getStatoLabel(commessaFinded.stato),
          Dettagli: "",
          Data: "",
          Note: "",
        });

        commessaData.push({
          Sezione: "",
          Campo: "Progressione",
          Valore: `${(commessaFinded.progression || 0).toFixed(2)}%`,
          Dettagli: "",
          Data: "",
          Note: "",
        });

        // Add empty row
        commessaData.push({
          Sezione: "",
          Campo: "",
          Valore: "",
          Dettagli: "",
          Data: "",
          Note: "",
        });

        // Add hours section
        commessaData.push({
          Sezione: "ORE LAVORATE",
          Campo: "",
          Valore: "",
          Dettagli: "",
          Data: "",
          Note: "",
        });

        // Add cablaggio hours
        if (commessaFinded.cablaggio?.oreLav) {
          commessaFinded.cablaggio.oreLav.forEach((ore: any) => {
            commessaData.push({
              Sezione: "Cablaggio",
              Campo: ore.tecnico || "",
              Valore: `${ore.oreLav || 0}h`,
              Dettagli: getTaskLabel(ore.task || ""),
              Data: ore.timestamp
                ? new Date(ore.timestamp).toLocaleDateString()
                : "",
              Note: ore.note || "",
            });
          });
        }

        // Add montaggio hours
        if (commessaFinded.montaggio?.oreLav) {
          commessaFinded.montaggio.oreLav.forEach((ore: any) => {
            commessaData.push({
              Sezione: "Montaggio",
              Campo: ore.tecnico || "",
              Valore: `${ore.oreLav || 0}h`,
              Dettagli: getTaskLabel(ore.task || ""),
              Data: ore.timestamp
                ? new Date(ore.timestamp).toLocaleDateString()
                : "",
              Note: ore.note || "",
            });
          });
        }

        // Add empty row
        commessaData.push({
          Sezione: "",
          Campo: "",
          Valore: "",
          Dettagli: "",
          Note: "",
        });

        // Add errors section
        commessaData.push({
          Sezione: "ERRORI",
          Campo: "",
          Valore: "",
          Dettagli: "",
          Note: "Note",
        });

        if (commessaFinded.errori) {
          const allErrors = [
            ...(commessaFinded.errori.df || []),
            ...(commessaFinded.errori.nu || []),
            ...(commessaFinded.errori.cp || []),
            ...(commessaFinded.errori.ca || []),
            ...(commessaFinded.errori.co || []),
          ];

          allErrors.forEach((errore: any) => {
            commessaData.push({
              Sezione: errore.categoria || "",
              Campo: errore.titolo || "",
              Valore: `${errore.ore || 0}h`,
              Dettagli: getRepartoErrorLabel(
                errore.repartodisbaglio || "Non specificato",
                errore.provenienzaSchemista || "Non specificato",
                errore.nomeSchemista || "Non specificato"
              ),
              Data: "",
              Note: `${errore.note || ""} ${
                errore.causaEsterna ? "(Causa Esterna)" : ""
              }`,
            });
          });
        }

        // Create worksheet for this commessa
        const commessaWorksheet = XLSX.utils.json_to_sheet(commessaData, {
          skipHeader: true,
        });

        // Clean sheet name (remove invalid characters)
        const cleanSheetName = commessaId
          .replace(/[\\/*?:\[\]]/g, "")
          .substring(0, 31);

        XLSX.utils.book_append_sheet(
          workbook,
          commessaWorksheet,
          cleanSheetName
        );
      }
    });

    // Create summary worksheet
    const summaryWorksheet = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(
      workbook,
      summaryWorksheet,
      "Riepilogo Generale"
    );

    // Save the file
    const fileName = `Resoconto_Commesse_${new Date().toLocaleDateString()}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const handleCreateActiveReportPDF = (allCommesse: any) => {
    const doc = new jsPDF("portrait");
    const Logo = img;

    // Helper function to add a new page for each commessa
    const addNewCommessaPage = (
      commessaId: string,
      isFirst: boolean = false
    ) => {
      if (!isFirst) {
        doc.addPage();
      }

      // Header with logo and title
      doc.addImage(Logo, "JPEG", 20, 8, 40, 22);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text(`Commessa: ${commessaId}`, 120, 29);

      // Divider line
      doc.setLineWidth(0.2);
      doc.line(15, 33, 195, 33);

      return 38; // Starting Y position for content
    };

    // Process each commessa
    allCommesse.forEach((commessa: any, index: any) => {
      const commessaFinded = aobCommesseToBeRendered.find(
        (item) => item.commessa === commessa
      );

      if (!commessaFinded) return;

      const commessaId = commessaFinded.commessa.split(" - ")[0];
      let yPosition = addNewCommessaPage(commessaId, index === 0);

      // Basic Information Section
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(
        `Commessa Cliente: ${commessaFinded.comcliente || "N/A"} - ${
          commessaFinded.descommessa?.endsWith("SPA") ||
          commessaFinded.descommessa?.endsWith("SRL") ||
          commessaFinded.descommessa?.endsWith("B.V.")
            ? commessaFinded.descommessa
            : commessaFinded.descliente
        }`,
        15,
        yPosition
      );
      yPosition += 5;
      doc.text(
        `Descrizione: ${
          commessaFinded.descommessa?.endsWith("SPA") ||
          commessaFinded.descommessa?.endsWith("SRL") ||
          commessaFinded.descommessa?.endsWith("B.V.")
            ? commessaFinded.descliente
            : commessaFinded.descommessa
        }`,
        15,
        yPosition
      );
      yPosition += 5;
      doc.text(`Stato: ${getStatoLabel(commessaFinded.stato)}`, 15, yPosition);
      yPosition += 5;
      doc.text(
        `Progressione: ${(commessaFinded.progression || 0).toFixed(2)}%`,
        15,
        yPosition
      );
      yPosition += 10;

      // Prepare Hours Data
      const hoursData: any[] = [];
      ["cablaggio", "montaggio"].forEach((section) => {
        const sectionData = commessaFinded[section];
        if (sectionData?.oreLav) {
          sectionData.oreLav.forEach((ore: any) => {
            hoursData.push([
              section.charAt(0).toUpperCase() + section.slice(1),
              ore.tecnico || "N/A",
              `${ore.oreLav || 0}h`,
              getTaskLabel(ore.task || ""),
              ore.timestamp
                ? new Date(ore.timestamp).toLocaleDateString()
                : "N/A",
            ]);
          });
        }
      });

      // Hours Table
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("ORE LAVORATE", 15, yPosition);
      yPosition += 5;

      if (hoursData.length > 0) {
        autoTable(doc, {
          startY: yPosition,
          head: [["Sezione", "Tecnico", "Ore", "Task", "Data"]],
          body: hoursData,
          theme: "striped",
          headStyles: {
            fillColor: [41, 128, 185],
            textColor: [255, 255, 255],
            fontSize: 10,
            fontStyle: "bold",
          },
          bodyStyles: {
            fontSize: 9,
          },
          margin: { left: 15, right: 15 },
        });
        yPosition = (doc as any).lastAutoTable.finalY + 15;
      } else {
        doc.setFontSize(10);
        doc.text("Nessuna ora lavorata registrata", 15, yPosition);
        yPosition += 15;
      }

      // Prepare Errors Data
      const errorsData: any[] = [];
      console.log(commessaFinded.errori);
      if (commessaFinded.errori) {
        const allErrors = [
          ...(commessaFinded.errori.df || []),
          ...(commessaFinded.errori.nu || []),
          ...(commessaFinded.errori.cp || []),
          ...(commessaFinded.errori.ca || []),
          ...(commessaFinded.errori.co || []),
        ];

        allErrors.forEach((errore) => {
          const notes = `${errore.note || ""} ${
            errore.causaEsterna ? "(Causa Esterna)" : ""
          }`.trim();
          errorsData.push([
            errore.titolo || "N/A",
            `${errore.ore || 0}h`,
            getRepartoErrorLabel(
              errore.repartodisbaglio || "Non specificato",
              errore.provenienzaSchemista || "Non specificato",
              errore.schemista || "Non specificato"
            ),
            notes || "N/A",
          ]);
        });
      }

      // Check if we need a new page for errors table
      const remainingSpace = 297 - yPosition - 20; // A4 height minus margins
      if (errorsData.length > 0 && remainingSpace < 60) {
        doc.addPage();
        yPosition = addNewCommessaPage(commessaId + " (Continua)");
      }

      // Errors Table
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("ERRORI", 15, yPosition);
      yPosition += 10;

      if (errorsData.length > 0) {
        autoTable(doc, {
          startY: yPosition,
          head: [["Titolo", "Ore", "Reparto - INT/EXT - Schemista", "Note"]],
          body: errorsData,
          theme: "striped",
          headStyles: {
            fillColor: [231, 76, 60],
            textColor: [255, 255, 255],
            fontSize: 10,
            fontStyle: "bold",
          },
          bodyStyles: {
            fontSize: 9,
          },
          margin: { left: 15, right: 15 },
        });
      } else {
        doc.setFontSize(10);
        doc.text("Nessun errore registrato", 15, yPosition);
      }

      // Add page footer
      const pageHeight = doc.internal.pageSize.height;
      doc.setFontSize(8);
      doc.text(
        `Generato il: ${new Date().toLocaleDateString()}`,
        15,
        pageHeight - 15
      );
      doc.text(`Pagina ${index + 1}`, 180, pageHeight - 15);
    });

    // Save the PDF
    const timestamp = new Date().toISOString().split("T")[0];
    doc.save(`Resoconto_Commesse_${timestamp}.pdf`);
  };
  //#endregion

  //#region Filter Commesse by Filter Mode
  const filterCommesse = async (commesse: any[]) => {
    if (filterMode) {
      try {
        const params = new URLSearchParams();
        if (startDate) params.append("startDate", startDate.toISOString());
        if (endDate) params.append("endDate", endDate.toISOString());

        const response = await axios.get(
          `${url}/fetchcommesse?${params.toString()}`
        );

        if (response.status !== 200) {
          throw new Error("Failed to fetch filtered commesse");
        }

        // Filter commesse by finelav date
        const filteredData = response.data.data.filter((commessa: any) => {
          if (!commessa.finelav) return false;

          const fineLavDate = new Date(commessa.finelav);
          const normalizedFineLav = new Date(
            Date.UTC(
              fineLavDate.getUTCFullYear(),
              fineLavDate.getUTCMonth(),
              fineLavDate.getUTCDate()
            )
          );

          const normalizedStart = startDate
            ? new Date(
                Date.UTC(
                  startDate.getUTCFullYear(),
                  startDate.getUTCMonth(),
                  startDate.getUTCDate()
                )
              )
            : null;

          const normalizedEnd = endDate
            ? new Date(
                Date.UTC(
                  endDate.getUTCFullYear(),
                  endDate.getUTCMonth(),
                  endDate.getUTCDate()
                )
              )
            : null;

          return (
            (!normalizedStart || normalizedFineLav >= normalizedStart) &&
            (!normalizedEnd || normalizedFineLav <= normalizedEnd)
          );
        });

        return filteredData || [];
      } catch (error) {
        toast.error("Error filtering commesse by date");
        return [];
      }
    } else {
      return commesse.filter(
        (commessa) =>
          (!selectedComFilter ||
            commessa.commessa.split(" - ")[0] === selectedComFilter) &&
          (!selectedStatusRepFilter ||
            commessa.stato === parseInt(selectedStatusRepFilter))
      );
    }
  };
  //#endregion

  //#region Main Return
  return (
    <Space direction="vertical" style={{ width: "100%" }} size="large">
      <div>
        <Text style={{ marginBottom: 8, display: "block" }}>
          Modalità filtro:
        </Text>
        <Switch
          checked={filterMode}
          onChange={(checked) => setFilterMode(checked)}
        />
      </div>

      {filterMode && (
        <div>
          <Text style={{ marginBottom: 8, display: "block" }}>
            Filtra per periodo di archiviazione:
          </Text>
          <Space>
            <DatePicker
              value={startDate ? dayjs(startDate) : null}
              onChange={(date) => setStartDate(date ? date.toDate() : null)}
              style={{ width: 200 }}
            />
            <DatePicker
              value={endDate ? dayjs(endDate) : null}
              onChange={(date) => setEndDate(date ? date.toDate() : null)}
              style={{ width: 200 }}
            />
          </Space>
        </div>
      )}

      {!filterMode && (
        <Space direction="vertical" style={{ width: "100%" }}>
          <div>
            <Text style={{ marginBottom: 8, display: "block" }}>
              Seleziona le commesse:
            </Text>
            <Select
              mode="tags"
              style={{ width: "100%" }}
              placeholder="Tutte le commesse"
              onChange={(value) => setSelectedComFilter(value)}
              showSearch
              filterOption={(input, option) => {
                const searchValue = input.toLowerCase();
                const optionValue =
                  option?.label?.toString().toLowerCase() || "";
                return (
                  optionValue.includes(searchValue) ||
                  option?.data?.descliente
                    ?.toLowerCase()
                    .includes(searchValue) ||
                  option?.data?.descommessa
                    ?.toLowerCase()
                    .includes(searchValue) ||
                  option?.data?.comcliente?.toLowerCase().includes(searchValue)
                );
              }}
              options={aobCommesseToBeRendered
                .map((commessa: any) => ({
                  value: commessa.commessa.split(" - ")[0],
                  label: `${commessa.commessa} - ${
                    commessa.descommessa?.endsWith("SPA") ||
                    commessa.descommessa?.endsWith("SRL") ||
                    commessa.descommessa?.endsWith("B.V.")
                      ? commessa.descliente
                      : commessa.descommessa
                  }`,
                  data: commessa, // Pass the entire commessa object for searching
                }))
                .sort((a, b) => {
                  // Split the commessa code by dots and compare each segment numerically
                  const aParts = a.value.split(".");
                  const bParts = b.value.split(".");

                  // Compare each segment numerically
                  const minLength = Math.min(aParts.length, bParts.length);
                  for (let i = 0; i < minLength; i++) {
                    const aNum = parseInt(aParts[i], 10);
                    const bNum = parseInt(bParts[i], 10);

                    if (!isNaN(aNum) && !isNaN(bNum) && aNum !== bNum) {
                      return aNum - bNum;
                    }
                  }

                  // If all segments are equal up to the minimum length, the shorter one comes first
                  if (aParts.length !== bParts.length) {
                    return aParts.length - bParts.length;
                  }

                  // Fallback to alphabetical sorting if numeric comparison is equal
                  return a.label.localeCompare(b.label);
                })}
            />
          </div>
        </Space>
      )}

      <Space style={{ width: "100%", justifyContent: "center" }} size="large">
        <Button
          type="default"
          style={{
            height: "auto",
            padding: "12px 24px",
            border: "2px solid #73d13d",
            borderRadius: "8px",
            background: "transparent",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            width: "180px",
            justifyContent: "center",
          }}
          icon={
            <RiFileExcel2Fill style={{ color: "#73d13d", fontSize: "24px" }} />
          }
          onClick={async () => {
            const filteredCommesse = await filterCommesse(
              aobCommesseToBeRendered
            );
            if (filterMode) {
              handleCreateArchivedReportXLSX(filteredCommesse);
            } else {
              handleCreateActiveReportXLSX(selectedComFilter);
            }
          }}
        >
          <span style={{ color: "#73d13d", fontWeight: 500 }}>
            Genera Excel
          </span>
        </Button>

        <Button
          type="default"
          style={{
            height: "auto",
            padding: "12px 24px",
            border: "2px solid #ff4d4f",
            borderRadius: "8px",
            background: "transparent",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            width: "180px",
            justifyContent: "center",
          }}
          icon={
            <RiFilePdf2Fill style={{ color: "#ff4d4f", fontSize: "24px" }} />
          }
          onClick={async () => {
            const filteredCommesse = await filterCommesse(
              aobCommesseToBeRendered
            );
            if (filterMode) {
              handleCreateArchivedReportPDF(filteredCommesse);
            } else {
              handleCreateActiveReportPDF(selectedComFilter);
            }
          }}
        >
          <span style={{ color: "#ff4d4f", fontWeight: 500 }}>Genera PDF</span>
        </Button>
      </Space>
    </Space>
  );
  //#endregion
};

export default FilterReport;
