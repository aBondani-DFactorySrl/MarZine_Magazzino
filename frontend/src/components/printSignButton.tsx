import { Button } from "antd";
import { PrinterOutlined } from "@ant-design/icons";
import { jsPDF } from "jspdf";

interface recordsItem {
  id: string;
  commessa: string;
  urgent: boolean;
  com_cliente: string;
  des_commessa: string;
}

interface RecordsProps {
  records: recordsItem;
}

const PrintSignButton: React.FC<RecordsProps> = ({ records }) => {
  const generatePdf = (
    commessa: string,
    com_cliente: string,
    des_commessa: string
  ) => {
    const doc = new jsPDF();

    doc.setFont("times", "bold");
    doc.setFontSize(65);
    doc.text("XXXX", 105, 40, { align: "center" });

    doc.setFont("times", "normal");
    doc.setFontSize(35);
    doc.text(com_cliente, 105, 52, { align: "center" });

    doc.setFont("times", "bold");
    doc.setFontSize(35);
    doc.text(des_commessa, 105, 110, { align: "center", maxWidth: 180 });

    doc.setFontSize(65);
    doc.text("COMM.", 105, 215, { align: "center" });
    doc.text("MARCHIANI", 105, 235, { align: "center" });

    doc.setFontSize(65);
    doc.text(commessa.replace(" - MERGED", ""), 105, 265, { align: "center" });

    const pdfUrl = doc.output("bloburl");

    const newWindow = window.open();
    if (newWindow) {
      newWindow.document.write(
        `<iframe src="${pdfUrl}" width="100%" height="100%" style="border:none;"></iframe>`
      );
      newWindow.document.title = commessa + "_Sign";
    }
  };

  const handlePrint = () => {
    const { commessa, com_cliente, des_commessa } = records;
    generatePdf(commessa, com_cliente, des_commessa);
  };

  return (
    <Button
      type="text"
      icon={<PrinterOutlined />}
      onClick={handlePrint}
      style={{ color: "white" }}
    />
  );
};

export default PrintSignButton;
