import { Button } from "antd";
import { jsPDF } from "jspdf";

interface recordsItem {
  id: string;
  commessa: string;
  urgent: boolean;
  comcliente: string;
  descommessa: string;
}

interface RecordsProps {
  records: recordsItem;
}

const PrintSignButton: React.FC<RecordsProps> = ({ records }) => {
  // console(records);
  const generatePdf = (
    commessa: string,
    comCliente: string,
    desCommessa: string
  ) => {
    const doc = new jsPDF();

    doc.setFont("times", "bold");
    doc.setFontSize(65);
    doc.text("XXXX", 105, 40, { align: "center" });

    doc.setFont("times", "normal");
    doc.setFontSize(35);
    doc.text(comCliente, 105, 52, { align: "center" });

    doc.setFont("times", "bold");
    doc.setFontSize(35);
    doc.text(desCommessa, 105, 110, { align: "center", maxWidth: 180 });

    doc.setFontSize(65);
    doc.text("COMM.", 105, 215, { align: "center" });
    doc.text("MARCHIANI", 105, 235, { align: "center" });

    doc.setFontSize(65);
    doc.text(commessa.replace(" - MERGED", ""), 105, 265, { align: "center" });

    //doc.save(commessa + '_Sign.pdf');
    const pdfUrl = doc.output("bloburl");

    // Open the PDF in a new tab
    const newWindow = window.open();
    if (newWindow) {
      newWindow.document.write(
        `<iframe src="${pdfUrl}" width="100%" height="100%" style="border:none;"></iframe>`
      );
      newWindow.document.title = commessa + "_Sign";
    }
  };

  const handlePrint = () => {
    //console.log(records);
    const { commessa, comcliente, descommessa } = records;
    //console.log(desCommessa);
    generatePdf(commessa, comcliente, descommessa);
  };

  return (
    <Button type="link" onClick={handlePrint} style={{ width: "100%" }}>
      {" "}
      Stampa Cartello
    </Button>
  );
};

export default PrintSignButton;
