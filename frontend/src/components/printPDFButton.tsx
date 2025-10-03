import { Button } from "antd";
import { FilePdfOutlined } from "@ant-design/icons";
import axios from "axios";
import toast from "react-hot-toast";

interface recordsItem {
  id: string;
  commessa: string;
  urgent: boolean;
  com_cliente: string;
  des_commessa: string;
  components_path: string[];
}

interface RecordsProps {
  records: recordsItem;
}

const PrintPDFButton: React.FC<RecordsProps> = ({ records }) => {
  const url = import.meta.env.VITE_BACKEND_URL;

  const handlePrint = async (filePath: string[]) => {
    try {
      let baseHTML =
        "<html><head><style>body { display: flex; }</style></head><body>";
      let containerHTML = baseHTML;

      function createGroupedFilePaths(filePaths: any) {
        const groupedFilePaths = [];
        for (let i = 0; i < filePaths.length; i += 2) {
          const group = filePaths.slice(i, i + 2);
          groupedFilePaths.push(group);
        }
        return groupedFilePaths;
      }

      const groupedFilePaths = createGroupedFilePaths(filePath);

      for (let i = groupedFilePaths.length - 1; i >= 0; i--) {
        const group = groupedFilePaths[i];
        containerHTML += `<title>Multiple PDFs</title>`;

        for (let j = 0; j < group.length; j++) {
          const apiUrl = `${url}/read-pdf`;
          const response = await axios.get(apiUrl, {
            responseType: "blob",
            params: { filePath: group[j] },
          });

          const fileURL = window.URL.createObjectURL(new Blob([response.data]));
          const iframeWidth = group.length === 1 ? "100%" : "50%";
          containerHTML += `<iframe src="${fileURL}" style="width:${iframeWidth}; height:1080px;" frameborder="0"></iframe>`;
        }

        containerHTML += `</body></html>`;
        const pdfWindow = window.open();
        pdfWindow?.document.write(containerHTML);
        pdfWindow?.document.close();
        containerHTML = baseHTML;
      }
    } catch (error) {
      toast.error("Error fetching pdf: " + error);
    }
  };

  return (
    <Button
      type="text"
      icon={<FilePdfOutlined />}
      style={{ color: "white" }}
      onClick={() => handlePrint(records.components_path)}
    />
  );
};

export default PrintPDFButton;
