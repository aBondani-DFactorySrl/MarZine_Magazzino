import { Button } from "antd";
import { FileExcelOutlined } from "@ant-design/icons";
import axios from "axios";
import { useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import toast from "react-hot-toast";

interface recordsItem {
  id: string;
  commessa: string;
  urgent: boolean;
  com_cliente: string;
  des_commessa: string;
  components_path: string[];
  note: string;
}

interface RecordsProps {
  records: recordsItem;
}

const PrintExcelButton: React.FC<RecordsProps> = ({ records }) => {
  const url = import.meta.env.VITE_BACKEND_URL;
  const [_componenstData, setComponentsData] = useState<any>([]);

  /* const fetchComponents = async (filePath: string) => {
        try {
            const url = new URL(window.location.origin);
            url.port = import.meta.env.VITE_BACKEND_PORT;
            const apiUrl = `${url.toString()}read-excel`; // Ensure the URL is correctly formed
            const response = await axios.post(apiUrl, { filePath }); // Match the payload key with the backend
            setComponentsData(response.data);
        } catch (error) {
            console.error('Error fetching components:', error);
        }
    }; */

  const columns = [
    { header: "Articolo", dataKey: "Articolo" },
    { header: "Descrizione", dataKey: "Descrizione" },
    { header: "UdM", dataKey: "UdM" },
    { header: "Qta", dataKey: "Qta" },
    //{ header: 'Spare', dataKey: 'spare' },
    { header: "Ubicazione", dataKey: "Ubicazione" },
    { header: "Commessa", dataKey: "Commessa" },
    { header: "Commessa Ubicazione", dataKey: "CommessaUbicazione" },
  ];

  /* const data = [
        {
            Articolo: "Doc: 1234",
            Descrizione: "FS17 VK-4 CAVO ENERG.FLEX NPI PVC/ FILO 4 MM NERO ",
            UdM: "M",
            Qta: 100,
            spare: "*",
            Ubicazione: "II-01-23",
            Commessa: "23.0716.99.55",
            CommessaUbicazione: "*",
            __EMPTY_9: "*"
        },
        {
            Articolo: "192.38.0041",
            Descrizione: "FS17 VK-4 CAVO ENERG.FLEX NPI PVC/ FILO 4 MM NERO ",
            UdM: "M",
            Qta: 100,
            spare: "*",
            Ubicazione: "II-01-23",
            Commessa: "23.0716.99.55",
            CommessaUbicazione: "*",
            __EMPTY_9: "*"
        },
        {
            Articolo: "Doc: 5678",
            Descrizione: "FS17 VK-4 CAVO ENERG.FLEX NPI PVC/ FILO 4 MM NERO ",
            UdM: "M",
            Qta: 200,
            spare: "*",
            Ubicazione: "II-01-24",
            Commessa: "23.0717.99.56",
            CommessaUbicazione: "*",
            __EMPTY_9: "*"
        },
        {
            Articolo: "192.38.0042",
            Descrizione: "FS18 VK-5 CAVO ENERG.FLEX NPI PVC/ FILO 5 MM NERO ",
            UdM: "M",
            Qta: 200,
            spare: "*",
            Ubicazione: "II-01-24",
            Commessa: "23.0717.99.56",
            CommessaUbicazione: "*",
            __EMPTY_9: "*"
        }
    ]; */
  const formatDate = (isoString: string): string => {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${year}/${month}/${day} ${hours}:${minutes}`;
  };

  const capitalizeFirstLetterOfEachWord = (str: string): string => {
    return str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const generatePdf = (commessa: string, componenst: any[], note: any) => {
    let startY = 20; // Starting Y position for the first table
    const groupedData: { [key: string]: any[] } = {};
    let currentDoc = "";

    componenst.forEach((item) => {
      if (item.Articolo.startsWith("Doc: ")) {
        currentDoc = item.Articolo;
        groupedData[currentDoc] = [];
      } else if (currentDoc) {
        groupedData[currentDoc].push(item);
      }
    });

    const doc = new jsPDF({
      orientation: "landscape",
    });
    const pageWidth = doc.internal.pageSize.getWidth();
    const maxWidth = pageWidth - 50; // adjust this value to set the max width of the text/*
    doc.setFont("times", "bold");
    doc.setFontSize(24);
    doc.text("Materiale commessa: " + commessa, 148, startY, {
      align: "center",
    });
    startY += 10;
    Object.keys(groupedData).forEach((groupKey) => {
      // doc.setFont('times', 'bold');
      // doc.setFontSize(24);
      // doc.text(groupKey, 148, startY, { align: 'center' });
      // startY += 10;
      // Add some space after the title

      autoTable(doc, {
        //head: [columns.map(col => col.header)],
        head: [
          [
            {
              content: groupKey,
              colSpan: 8,
              styles: { halign: "center", fontSize: 12 },
            },
          ],
          columns.map((col) => ({ content: col.header })),
        ],
        body: groupedData[groupKey].map((item) =>
          columns.map((col) => item[col.dataKey])
        ),
        startY: startY,
        styles: {
          fillColor: [220, 220, 220],
          textColor: [0, 0, 0],
        },
      });

      // Update startY for the next table
      startY = (doc as any).autoTable.previous.finalY + 20;
    });
    startY += 10;

    if (note.length > 0) {
      //console.log(note);
      doc.setFontSize(16);
      doc.text("Note", 148, startY, { align: "center" });
      for (let i = 0; i < note.length; i++) {
        startY += 5;
        doc.setFont("helvetica", "bolditalic");
        doc.setFontSize(12);
        doc.text(
          formatDate(note[i].timestamp) +
            " - " +
            capitalizeFirstLetterOfEachWord(
              note[i].author.split("@")[0].replace(".", " ")
            ),
          148,
          startY,
          { align: "center" }
        );
        startY += 5;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(14);
        let wrappedText = doc.splitTextToSize(note[i].text, maxWidth);
        for (let j = 0; j < wrappedText.length; j++) {
          let textWidth = doc.getTextWidth(wrappedText[j]);
          let textX = (pageWidth - textWidth) / 2;
          doc.text(wrappedText[j], textX, startY);
          startY += 5;

          // Check if the next line exceeds the page height
          if (startY > doc.internal.pageSize.getHeight() - 10) {
            doc.addPage();
            startY = 10; // Reset the startY for the new page
          }
        }
      }
    }

    //doc.save(commessa + '_Components.pdf');
    const pdfUrl = doc.output("bloburl");

    // Open the PDF in a new tab
    const newWindow = window.open();
    if (newWindow) {
      newWindow.document.write(
        `<iframe src="${pdfUrl}" width="100%" height="100%" style="border:none;"></iframe>`
      );
      newWindow.document.title = commessa + "_Components";
    }
  };

  const handlePrint = async (filePath: string[]) => {
    //console.log(records);
    const { commessa } = records;
    try {
      let filteredData = [];
      for (let i = 0; i < filePath.length; i++) {
        const response = await axios.post(`${url}/read-excel`, {
          filePath: filePath[i],
        }); // Match the payload key with the backend
        const responseData = response.data;
        //console.log(responseData)

        let Num = 0;
        for (let i = 0; i < responseData.length; i++) {
          if (responseData[i].Articolo.includes("Num.")) {
            Num = responseData[i].Articolo.split("Num.")[1].trim();
            filteredData.push({ Articolo: "Doc: " + Num });
          }
          if (typeof responseData[i].Qta === "number") {
            //responseData[i].Qta = parseFloat(responseData[i].Qta.replace(',', '.'));
            filteredData.push({
              ...responseData[i],
              doc: Num, // Replace 'newValue' with the actual value you want to assign
            });
          }
        }
      }
      //filteredData = responseData.filter(object => typeof object.Qta === 'number');
      //console.log(filteredData)
      //return;
      setComponentsData(filteredData);
      generatePdf(commessa, filteredData, records.note);
    } catch (error) {
      toast.error("Error fetching components: " + error);
    }
    //console.log(componenstData);
  };

  return (
    <Button
      type="text"
      icon={<FileExcelOutlined />}
      style={{ color: "white" }}
      onClick={() => handlePrint(records.components_path)}
    />
  );
};

export default PrintExcelButton;
