import React, { useEffect, useState } from "react";
import Navbar from "../components/navbar";
import {
  Layout,
  Spin,
  Typography,
  Row,
  Col,
  Card,
  Button,
  Form,
  Input,
  Table,
} from "antd";

import { useLocation, useNavigate } from "react-router-dom";
import { FaBell, FaBellSlash } from "react-icons/fa";
import { HiOutlineLocationMarker } from "react-icons/hi";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FiExternalLink } from "react-icons/fi";
//import ChatComponent from "../components/chatComponent";
import toast from "react-hot-toast";
import ChatComponent from "../components/chatComponent";

interface ExcelDataRow {
  Articolo: string;
  Descrizione: string;
  UdM: string;
  Qta: number | string;
  Ubicazione: string;
  Commessa: string;
  CommessaUbicazione: string;
}

const Details: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const todoObject = location.state?.todo;
  //const isFirstLoad = useRef(true);
  const [isClickedReadExcel, setIsClickedReadExcel] = useState(false);
  const [isClickedImpegni, setIsClickedImpegni] = useState(false);
  const [isClickedMancanti, setIsClickedMancanti] = useState(false);
  const [uniqueDocs, _setUniqueDocs] = useState<string[]>([]);
  const [loading, _setLoading] = useState(false);
  const [ubicazione, setUbicazione] = useState<string>("");
  const [posData, setPosData] = useState<any>("");
  const url = import.meta.env.VITE_BACKEND_URL;
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
    console.log(todoObject);
    if (todoObject.shelf.length > 0) {
      if (todoObject.shelf[0].includes("Officina")) {
        switch (todoObject.shelf[0].split(".")[1]) {
          case "inCommesse":
            setUbicazione("Officina - Commesse da lavorare");
            break;
          case "cablaggioA":
            setUbicazione("Officina - Cablaggio A");
            break;
          case "cablaggioB":
            setUbicazione("Officina - Cablaggio B");
            break;
          case "collaudoC":
            setUbicazione("Officina - Collaudo C");
            break;
          case "collaudoD":
            setUbicazione("Officina - Collaudo D");
            break;
          case "collaudoE":
            setUbicazione("Officina - Collaudo E");
            break;
          case "fissaggio":
            setUbicazione("Officina - Fissaggio");
            break;
          case "outCommesse":
            setUbicazione("Officina - Commesse finite");
            break;
          default:
            setUbicazione("Officina - Faulted commessa");
            break;
        }
        setPosData("Officina");
      } else {
        setPosData("Magazzino");
        setUbicazione(todoObject.shelf.sort().join(" / "));
      }
    } else {
      setPosData("Magazzino");
      setUbicazione("Ubicazione non ancora assegnata");
    }
  }, []);

  /*   useEffect(() => {
      setLoading(true);
      if (isFirstLoad.current) {
        // Set it to false so the next time useEffect is called, the logic runs
        isFirstLoad.current = false;
        return; // Skip the rest of the useEffect logic on the first render
      }
      //console.log(todoObject)
      handleExcelRead(todoObject.componentsPath);
  
    }, []); */

  const handleExcelRead = async (filePath: string[]) => {
    setExcelData([
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
    let filteredData: any = [];
    for (let i = 0; i < filePath.length; i++) {
      try {
        await axios
          .post(
            `${url}/read-excel`,
            {
              filePath: filePath[i],
            },
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          )
          .then((response) => {
            const responseData = response.data.data;
            //console.log(responseData);

            let Num = 0;
            for (let i = 0; i < responseData.length; i++) {
              if (responseData[i].Articolo.includes("Num.")) {
                Num = responseData[i].Articolo.split("Num.")[1].trim();
                filteredData.push({ Descrizione: "Doc: " + Num, doc: Num });
              }
              if (typeof responseData[i].Qta === "number") {
                //responseData[i].Qta = parseFloat(responseData[i].Qta.replace(',', '.'));
                filteredData.push({
                  ...responseData[i],
                  doc: Num, // Replace 'newValue' with the actual value you want to assign
                });
              }
            }
            //filteredData = responseData.filter(object => typeof object.Qta === 'number');
            //console.log(filteredData)
            filteredData.forEach((item: any) => {
              if (!uniqueDocs.includes(item.doc)) {
                uniqueDocs.push(item.doc);
              }
            });
          })
          .catch((error) => {
            console.error(error);
            toast.error("Error reading file");
          });

        setIsClickedReadExcel(false);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          toast.error("Error: " + error.response?.data.error);
        } else if (error instanceof Error) {
          toast.error("Error: " + error.message);
        }
      }
    }
    //console.log(filteredData);
    setExcelData(filteredData);

    toast.success("File/s letto/i correttamente.");
  };

  const handleCheckImpegniCommessa = async () => {
    setIsClickedImpegni(true);
    if (todoObject.commessa === "") {
      toast.error("Inserisci il numero della commessa.");
      return;
    }
    await axios
      .get(`${url}/checkimpegni-commessa`, {
        params: {
          codCommessa: todoObject.commessa.replace(" - MERGED", ""),
        },
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((response) => {
        //console.log(response.data)
        if (response.data.length === 0) {
          toast.error("Nessun impegno trovato");
          setIsClickedImpegni(false);
        } else {
          //toast.success("Commessa trovata");
          //console.log(response.data);
          //const filteredData = response.data.filter((item: any) => item.cod_tipoord === "IMAT");
          const filteredData = response.data;
          const sortedData = filteredData.sort((a: any, b: any) => {
            if (a.des_articolo_riga < b.des_articolo_riga) return -1;
            if (a.des_articolo_riga > b.des_articolo_riga) return 1;
            return 0;
          });
          generatePdfImpegni(sortedData);
          setIsClickedImpegni(false);
        }
      })
      .catch((error) => {
        console.error(error);
        toast.error("Error checking commessa");
        setIsClickedImpegni(false);
      });
  };

  const handleCheckMancantiCommessa = async () => {
    if (todoObject.commessa === "") {
      toast.error("Inserisci il numero della commessa.");
      return;
    }
    await axios
      .get(`${url}/checkmancanti-commessa`, {
        params: {
          codCommessa: todoObject.commessa.replace(" - MERGED", ""),
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
          //toast.success("Commessa trovata");
          //console.log(response.data);
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
          generatePdfMancanti(formattedData);
          setIsClickedMancanti(false);
        }
      })
      .catch((error) => {
        console.error(error);
        toast.error("Error checking commessa");
      });
  };

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

  const generatePdfImpegni = (components: any[]) => {
    let startY = 20; // Starting Y position for the first table

    const doc = new jsPDF({
      orientation: "landscape",
    });
    doc.setFont("times", "bold");
    doc.setFontSize(24);
    doc.text(
      "Materiale impegnato per la commessa: " +
        todoObject.commessa.replace(" - MERGED", ""),
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
      newWindow.document.title = todoObject.commessa + "_Impegni";
    }
  };

  const generatePdfMancanti = (components: any[]) => {
    let startY = 20; // Starting Y position for the first table

    const doc = new jsPDF({
      orientation: "landscape",
    });
    doc.setFont("times", "bold");
    doc.setFontSize(24);
    doc.text(
      "Materiale mancante per la commessa: " +
        todoObject.commessa.replace(" - MERGED", ""),
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
      newWindow.document.title = todoObject.commessa + "_Mancanti";
    }
  };

  const handleShowPdf = async (filePath: string[]) => {
    try {
      let baseHTML =
        "<html><head><style>body { display: flex; }</style></head><body>";
      let containerHTML = baseHTML; // Initialize containerHTML with the base structure
      // Reverse the filePath array
      // Function to create a group of two documents
      function createGroupedFilePaths(filePaths: any) {
        const groupedFilePaths = [];
        for (let i = 0; i < filePaths.length; i += 2) {
          const group = filePaths.slice(i, i + 2);
          groupedFilePaths.push(group);
        }
        return groupedFilePaths;
      }

      // Group the file paths
      const groupedFilePaths = createGroupedFilePaths(filePath);

      // Iterate over the grouped file paths in reverse order
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
        // Reset containerHTML to its initial structure for the next pair of PDFs
        containerHTML = baseHTML;
      }
    } catch (error) {
      toast.error("Error fetching pdf: " + error);
    }
    //console.log(componenstData);
  };

  //console.log(todoObject);

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
      {loading ? (
        <Row justify="center" align="middle" style={{ height: "100vh" }}>
          <Spin size="large" />
          <Typography.Title level={3} style={{ marginTop: 16 }}>
            Loading... Please wait!!
          </Typography.Title>
        </Row>
      ) : (
        <Row justify="center" style={{ padding: 24 }}>
          <Col xs={24} md={20} lg={18}>
            <Card bordered style={{ borderRadius: 8 }}>
              <Row
                justify="space-between"
                align="middle"
                style={{ marginBottom: 24 }}
              >
                <Row align="middle" gutter={16}>
                  <Button
                    icon={<HiOutlineLocationMarker />}
                    type="default"
                    style={{ marginRight: 8 }}
                    // onClick={() => {
                    //   if (
                    //     todoObject.shelf[0] == undefined ||
                    //     todoObject.shelf == null
                    //   ) {
                    //     navigate(
                    //       `/comPlace/${todoObject.id}/${todoObject.commessa}`
                    //     );
                    //   } else {
                    //     if (todoObject.shelf[0].includes("Officina")) {
                    //       console.log(todoObject.shelf);

                    //       navigate(
                    //         `/newPlace/${todoObject.id}/${todoObject.commessa}/Officina`
                    //       );
                    //       localStorage.removeItem("shelf");
                    //       localStorage.setItem(
                    //         "shelf",
                    //         JSON.stringify(todoObject)
                    //       );
                    //     } else {
                    //       localStorage.setItem(
                    //         "todoSelected",
                    //         JSON.stringify(todoObject)
                    //       );
                    //       navigate(
                    //         `/comPlace/${todoObject.id}/${todoObject.commessa}`
                    //       );
                    //     }
                    //   }
                    // }}
                    onClick={() => {
                      let fullParam = { todo: todoObject, pos: posData };
                      localStorage.setItem(
                        "locationsParams",
                        JSON.stringify(fullParam)
                      );
                      // let objectToSend = {
                      //   id: todoObject.id,
                      //   commessa: todoObject.commessa,
                      //   shelf: todoObject.shelf,
                      //   sector: "Magazzino",
                      //   scaffale: "",
                      // };
                      // if (
                      //   todoObject.shelf[0] === undefined ||
                      //   todoObject.shelf === null
                      // ) {
                      //   objectToSend.sector = "Magazzino";
                      // } else {
                      //   if (todoObject.shelf[0].includes("Officina")) {
                      //     objectToSend.sector = "Officina";
                      //   } else {
                      //     objectToSend.sector = "Magazzino";
                      //   }
                      // }
                      // //console.log(objectToSend);
                      // localStorage.setItem(
                      //   "Warehouse_Parameter",
                      //   JSON.stringify(objectToSend)
                      // );
                      /* localStorage.removeItem("shelf");
                      localStorage.setItem("shelf", JSON.stringify(todoObject));
                      console.log(todoObject);
                      if (
                        todoObject.shelf[0] === undefined ||
                        todoObject.shelf === null
                      ) {
                        localStorage.setItem("parameter", "Void");
                      } else {
                        if (todoObject.shelf[0].includes("Officina")) {
                          localStorage.setItem("parameter", "Officina");
                        } else {
                          localStorage.setItem("parameter", "Magazzino");
                        }
                      } */
                      navigate("/locations");
                    }}
                  />
                  <Typography.Title level={4} style={{ margin: 0 }}>
                    Ubicazione: {ubicazione}
                  </Typography.Title>
                </Row>
                <Row gutter={16}>
                  <Button
                    icon={<FiExternalLink />}
                    type={todoObject.external ? "primary" : "default"}
                    style={{ marginRight: 8 }}
                    disabled
                  />
                  <Button
                    icon={todoObject.urgent ? <FaBell /> : <FaBellSlash />}
                    type={todoObject.urgent ? "primary" : "default"}
                    danger={todoObject.urgent}
                  />
                </Row>
              </Row>

              <Row gutter={24} style={{ marginBottom: 24 }}>
                <Col span={12}>
                  <Form.Item
                    label="Numero Commessa"
                    wrapperCol={{ span: 24 }}
                    colon={false}
                  >
                    <Input readOnly value={todoObject.commessa} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label={
                      <div style={{ textAlign: "center", width: "100%" }}>
                        Commessa Cliente
                      </div>
                    }
                    colon={false}
                    wrapperCol={{ span: 24 }}
                  >
                    <Input readOnly value={todoObject.com_cliente} />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label={
                  <div style={{ textAlign: "center", width: "100%" }}>
                    Descrizione Commessa
                  </div>
                }
                colon={false}
              >
                <Input.TextArea readOnly value={todoObject.des_commessa} />
              </Form.Item>

              <Row justify="end" gutter={16}>
                <Button
                  aria-label="home"
                  style={{ marginRight: 8 }}
                  onClick={() => handleCheckMancantiCommessa()}
                  loading={isClickedMancanti}
                >
                  Mancanti
                </Button>
                <Button
                  aria-label="home"
                  style={{ marginRight: 8 }}
                  onClick={() => handleCheckImpegniCommessa()}
                  loading={isClickedImpegni}
                >
                  Impegni
                </Button>
                <Button
                  aria-label="home"
                  onClick={() => {
                    todoObject.external
                      ? handleShowPdf(todoObject.components_path)
                      : handleExcelRead(todoObject.components_path);
                  }}
                  loading={isClickedReadExcel}
                >
                  {todoObject.external ? "Show Pdf" : "Read Excel"}
                </Button>
              </Row>
              <Table
                size="small"
                pagination={false}
                style={{ marginTop: 24 }}
                scroll={{ y: 200 }}
                dataSource={excelData}
                rowClassName={(record) =>
                  record.Commessa !== todoObject.commessa &&
                  record.Commessa !== ""
                    ? "row-highlight"
                    : ""
                }
                columns={[
                  {
                    title: "Articolo",
                    dataIndex: "Articolo",
                    key: "Articolo",
                    align: "center" as const,
                    width: 150,
                  },
                  {
                    title: "Descrizione",
                    dataIndex: "Descrizione",
                    key: "Descrizione",
                    width: 350,
                  },
                  {
                    title: "UdM",
                    dataIndex: "UdM",
                    key: "UdM",
                    align: "center" as const,
                    width: 50,
                  },
                  {
                    title: "Qta",
                    dataIndex: "Qta",
                    key: "Qta",
                    align: "center" as const,
                    width: 50,
                  },
                  {
                    title: "Ubicazione",
                    dataIndex: "Ubicazione",
                    key: "Ubicazione",
                    align: "center" as const,
                    width: 100,
                  },
                  {
                    title: "Commessa",
                    dataIndex: "Commessa",
                    key: "Commessa",
                    align: "center" as const,
                  },
                  {
                    title: "Commessa Ubicaz.",
                    dataIndex: "CommessaUbicazione",
                    key: "CommessaUbicazione",
                    align: "center" as const,
                  },
                ]}
              />
              <Form.Item
                colon={false}
                wrapperCol={{ span: 24 }}
                style={{ marginTop: "30px" }}
              >
                <ChatComponent notes={todoObject.note} />
              </Form.Item>
            </Card>
          </Col>
        </Row>
      )}
    </Layout>
  );
};

export default Details;
