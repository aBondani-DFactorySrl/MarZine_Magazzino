import axios from "axios";
import React, { useState, useEffect } from "react";

interface WindowDimensions {
  width: number;
  height: number;
}

interface SectorInfo {
  name: string;
  row: number;
  record: any[];
  column: number;
}

interface WarehouseComponentProps {
  onSectorSelect?: (sector: string, sectorInfo: SectorInfo) => void;
}

const WarehouseComponent: React.FC<WarehouseComponentProps> = ({
  onSectorSelect,
}) => {
  const [depot, setDepot] = useState<any[]>([]);
  const url = import.meta.env.VITE_BACKEND_URL;
  const fetchDepot = async () => {
    try {
      const response = await axios.get(`${url}/fetchdepot`);
      const data = response.data;
      if (data.success) {
        //console.log("Fetched depot:", data.data);
        setDepot(data.data);
      }
    } catch (error) {
      console.error("Error fetching depot:", error);
    }
  };

  useEffect(() => {
    fetchDepot();
  }, []);

  const [windowDimensions, setWindowDimensions] = useState<WindowDimensions>({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // State for each sector's fill color
  const [fillColorA, setFillColorA] = useState<string>("transparent");
  const [fillColorB, setFillColorB] = useState<string>("transparent");
  const [fillColorC, setFillColorC] = useState<string>("transparent");
  const [fillColorD, setFillColorD] = useState<string>("transparent");
  const [fillColorE, setFillColorE] = useState<string>("transparent");
  const [fillColorF, setFillColorF] = useState<string>("transparent");
  const [fillColorG, setFillColorG] = useState<string>("transparent");
  const [fillColorZ, setFillColorZ] = useState<string>("transparent");
  const [fillColorMar2, setFillColorMar2] = useState<string>("transparent");

  // Original colors (could be different based on status)
  const originalColorA = "transparent";
  const originalColorB = "transparent";
  const originalColorC = "transparent";
  const originalColorD = "transparent";
  const originalColorE = "transparent";
  const originalColorF = "transparent";
  const originalColorG = "transparent";
  const originalColorZ = "transparent";
  const originalColorMar2 = "transparent";

  // Text colors
  const textA = "white";
  const textB = "white";
  const textC = "white";
  const textD = "white";
  const textE = "white";
  const textF = "white";
  const textG = "white";
  const textZ = "white";
  const textMar2 = "white";

  // Sector information
  const [_selectedSector, setSelectedSector] = useState<string | null>(null);
  // const [hoveredSector, setHoveredSector] = useState<string | null>(null);

  const sectorInfo: Record<string, SectorInfo> = {
    A: {
      name: "Settore A",
      record: depot.filter((item) => item.shelf.includes("A")),
      row: 5,
      column: 15,
    },
    B: {
      name: "Settore B",
      record: depot.filter((item) => item.shelf.includes("B")),
      row: 6,
      column: 2,
    },
    C: {
      name: "Settore C",
      record: depot.filter((item) => item.shelf.includes("C")),
      row: 4,
      column: 15,
    },
    D: {
      name: "Settore D",
      record: depot.filter((item) => item.shelf.includes("D")),
      row: 4,
      column: 15,
    },
    E: {
      name: "Settore E",
      record: depot.filter((item) => item.shelf.includes("E")),
      row: 8,
      column: 1,
    },
    F: {
      name: "Settore F",
      record: depot.filter((item) => item.shelf.includes("F")),
      row: 8,
      column: 1,
    },
    G: {
      name: "Settore G",
      record: depot.filter((item) => item.shelf.includes("G")),
      row: 6,
      column: 16,
    },
    Z: {
      name: "Settore Z",
      record: depot.filter((item) => item.shelf.includes("Z")),
      row: 1,
      column: 1,
    },
    Mar2: {
      name: "Marchiani 2",
      record: depot.filter((item) => item.shelf.includes("Mar2")),
      row: 1,
      column: 1,
    },
  };

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Initialize colors based on status
  useEffect(() => {
    const getStatusColor = () => {
      return "transparent";
    };

    setFillColorA(getStatusColor());
    setFillColorB(getStatusColor());
    setFillColorC(getStatusColor());
    setFillColorD(getStatusColor());
    setFillColorE(getStatusColor());
    setFillColorF(getStatusColor());
    setFillColorG(getStatusColor());
    setFillColorZ(getStatusColor());
    setFillColorMar2(getStatusColor());
  }, []);

  const handleClick = (sector: string) => {
    setSelectedSector(sector);
    if (onSectorSelect) {
      onSectorSelect(sector, sectorInfo[sector]);
    }
    //console.log(`Sector ${sector} clicked:`, sectorInfo[sector]);
  };

  // const handleMouseEnter = (sector: string) => {
  //   setHoveredSector(sector);
  // };

  // const handleMouseLeave = () => {
  //   setHoveredSector(null);
  // };

  // const getStatusBadge = (status: string) => {
  //   const badges = {
  //     available: {
  //       text: "Disponibile",
  //       className: "bg-green-100 text-green-800",
  //     },
  //     occupied: {
  //       text: "Occupato",
  //       className: "bg-yellow-100 text-yellow-800",
  //     },
  //     maintenance: {
  //       text: "Manutenzione",
  //       className: "bg-red-100 text-red-800",
  //     },
  //   };
  //   return (
  //     badges[status as keyof typeof badges] || {
  //       text: "Sconosciuto",
  //       className: "bg-gray-100 text-gray-800",
  //     }
  //   );
  // };

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlSpace="preserve"
      width={windowDimensions.width * 0.75}
      height={windowDimensions.height * 0.75}
      viewBox="0 0 155 107"
    >
      <path
        id="BPath"
        d="M46.528 94.51H79.309V105.079H46.528V94.51Z"
        stroke="#808080"
        stroke-width="0.217"
        stroke-linecap="square"
        fill={fillColorB}
        onMouseOver={() => setFillColorB("grey")} // Change to your desired hover color
        onMouseOut={() => setFillColorB(originalColorB)} // Change back to original color
        onClick={() => handleClick("B")} // Add your click event handler here
        style={{
          cursor: "pointer",
        }}
      />
      <path
        id="B"
        d="M61.4256 97.84H63.0885C63.4177 97.84 63.6626 97.8542 63.8234 97.8826C63.9861 97.9091 64.1309 97.9658 64.2576 98.0529C64.3862 98.1399 64.4931 98.2562 64.5783 98.4019C64.6634 98.5457 64.7059 98.7074 64.7059 98.8871C64.7059 99.082 64.653 99.2607 64.547 99.4234C64.443 99.5861 64.3011 99.7081 64.1214 99.7895C64.3749 99.8633 64.5697 99.9891 64.7059 100.167C64.8422 100.345 64.9103 100.554 64.9103 100.794C64.9103 100.983 64.8658 101.168 64.7769 101.347C64.6899 101.525 64.5697 101.668 64.4165 101.776C64.2652 101.882 64.0779 101.947 63.8547 101.972C63.7147 101.987 63.377 101.996 62.8416 102H61.4256V97.84ZM62.2656 98.5324V99.4944H62.8161C63.1434 99.4944 63.3467 99.4896 63.4262 99.4802C63.5699 99.4632 63.6825 99.414 63.7639 99.3326C63.8471 99.2494 63.8887 99.1406 63.8887 99.0063C63.8887 98.8777 63.8528 98.7736 63.7809 98.6942C63.7109 98.6128 63.6059 98.5636 63.4659 98.5466C63.3827 98.5371 63.1434 98.5324 62.748 98.5324H62.2656ZM62.2656 100.187V101.299H63.0431C63.3458 101.299 63.5378 101.291 63.6191 101.274C63.744 101.251 63.8452 101.196 63.9228 101.109C64.0022 101.02 64.0419 100.902 64.0419 100.754C64.0419 100.629 64.0117 100.523 63.9511 100.436C63.8906 100.349 63.8026 100.286 63.6872 100.246C63.5737 100.207 63.3259 100.187 62.9438 100.187H62.2656Z"
        fill={textB}
        onMouseOver={() => setFillColorB("grey")} // Change to your desired hover color
        onMouseOut={() => setFillColorB("transparent")} // Change back to original color
        onClick={() => handleClick("B")} // Add your click event handler here
      />
      <path
        id="EPath"
        d="M118 98H138V106H118V98Z"
        stroke="#808080"
        stroke-width="0.217"
        stroke-linecap="square"
        fill={fillColorE}
        onMouseOver={() => setFillColorE("grey")} // Change to your desired hover color
        onMouseOut={() => setFillColorE(originalColorE)} // Change back to original color
        onClick={() => handleClick("E")} // Add your click event handler here
        style={{
          cursor: "pointer",
        }}
      />
      <path
        id="FPath"
        d="M144 98H162V106H144V98Z"
        stroke="#808080"
        stroke-width="0.217"
        stroke-linecap="square"
        fill={fillColorF}
        onMouseOver={() => setFillColorF("grey")} // Change to your desired hover color
        onMouseOut={() => setFillColorF(originalColorF)} // Change back to original color
        onClick={() => handleClick("F")} // Add your click event handler here
        style={{
          cursor: "pointer",
        }}
      />
      <path
        id="GPath"
        d="M169.412 0.108002H186.25V76.776H169.412V0.108002Z"
        stroke="#808080"
        stroke-width="0.217"
        stroke-linecap="square"
        fill={fillColorG}
        onMouseOver={() => setFillColorG("grey")} // Change to your desired hover color
        onMouseOut={() => setFillColorG(originalColorG)} // Change back to original color
        onClick={() => handleClick("G")} // Add your click event handler here
        style={{
          cursor: "pointer",
        }}
      />
      <path
        id="DPath"
        d="M120.33 0.286987H136.81V76.776H120.33V0.286987Z"
        stroke="#808080"
        stroke-width="0.217"
        stroke-linecap="square"
        fill={fillColorD}
        onMouseOver={() => setFillColorD("grey")} // Change to your desired hover color
        onMouseOut={() => setFillColorD(originalColorD)} // Change back to original color
        onClick={() => handleClick("D")} // Add your click event handler here
        style={{
          cursor: "pointer",
        }}
      />
      <path
        id="CPath"
        d="M95.789 0.286987H112.269V76.776H95.789V0.286987Z"
        stroke="#808080"
        stroke-width="0.217"
        stroke-linecap="square"
        fill={fillColorC}
        onMouseOver={() => setFillColorC("grey")} // Change to your desired hover color
        onMouseOut={() => setFillColorC(originalColorC)} // Change back to original color
        onClick={() => handleClick("C")} // Add your click event handler here
        style={{
          cursor: "pointer",
        }}
      />
      <path
        id="APath"
        d="M38.108 0.108002H54.588V63.162H38.108V0.108002Z"
        stroke="#808080"
        stroke-width="0.217"
        stroke-linecap="square"
        fill={fillColorA}
        onMouseOver={() => setFillColorA("grey")} // Change to your desired hover color
        onMouseOut={() => setFillColorA(originalColorA)} // Change back to original color
        onClick={() => handleClick("A")} // Add your click event handler here
        style={{
          cursor: "pointer",
        }}
      />
      <path
        id="E"
        d="M126.423 104V99.84H129.507V100.544H127.263V101.466H129.351V102.167H127.263V103.299H129.587V104H126.423Z"
        fill={textE}
        onMouseOver={() => setFillColorE("grey")} // Change to your desired hover color
        onMouseOut={() => setFillColorE("transparent")} // Change back to original color
        onClick={() => handleClick("E")} // Add your click event handler here
      />
      <path
        id="A"
        d="M48.1742 38H47.2604L46.8972 37.0551H45.2344L44.891 38H44L45.6203 33.84H46.5085L48.1742 38ZM46.6276 36.3542L46.0544 34.8105L45.4926 36.3542H46.6276Z"
        fill={textA}
        onMouseOver={() => setFillColorA("grey")} // Change to your desired hover color
        onMouseOut={() => setFillColorA("transparent")} // Change back to original color
        onClick={() => handleClick("A")} // Add your click event handler here
      />
      <path
        id="F"
        d="M151.428 104V99.84H154.28V100.544H152.268V101.528H154.005V102.232H152.268V104H151.428Z"
        fill={textF}
        onMouseOver={() => setFillColorF("grey")} // Change to your desired hover color
        onMouseOut={() => setFillColorF("transparent")} // Change back to original color
        onClick={() => handleClick("F")} // Add your click event handler here
      />
      <path
        id="C"
        d="M105.085 38.4705L105.899 38.7287C105.774 39.1828 105.566 39.5204 105.275 39.7418C104.985 39.9612 104.617 40.0709 104.171 40.0709C103.618 40.0709 103.164 39.8827 102.809 39.5063C102.453 39.1279 102.275 38.6115 102.275 37.9569C102.275 37.2645 102.454 36.7273 102.812 36.3451C103.169 35.9611 103.639 35.7691 104.222 35.7691C104.731 35.7691 105.144 35.9195 105.462 36.2203C105.651 36.3981 105.793 36.6535 105.888 36.9864L105.056 37.1851C105.007 36.9694 104.904 36.7992 104.747 36.6743C104.592 36.5494 104.403 36.487 104.179 36.487C103.871 36.487 103.62 36.5977 103.427 36.819C103.236 37.0403 103.141 37.3988 103.141 37.8945C103.141 38.4204 103.235 38.795 103.424 39.0182C103.614 39.2414 103.86 39.353 104.162 39.353C104.386 39.353 104.578 39.2821 104.738 39.1402C104.899 38.9983 105.015 38.7751 105.085 38.4705Z"
        fill={textC}
        onMouseOver={() => setFillColorC("grey")} // Change to your desired hover color
        onMouseOut={() => setFillColorC("transparent")} // Change back to original color
        onClick={() => handleClick("C")} // Add your click event handler here
      />
      <path
        id="D"
        d="M126.42 35.84H127.955C128.301 35.84 128.565 35.8665 128.747 35.9195C128.991 35.9914 129.2 36.1191 129.374 36.3026C129.548 36.4861 129.68 36.7112 129.771 36.9779C129.862 37.2428 129.907 37.57 129.907 37.9597C129.907 38.3021 129.865 38.5973 129.78 38.8451C129.676 39.1478 129.527 39.3927 129.334 39.58C129.189 39.7219 128.992 39.8326 128.744 39.912C128.559 39.9707 128.311 40 128.001 40H126.42V35.84ZM127.26 36.5438V39.2991H127.887C128.122 39.2991 128.291 39.2859 128.395 39.2594C128.531 39.2253 128.644 39.1676 128.733 39.0863C128.823 39.0049 128.897 38.8716 128.954 38.6862C129.011 38.4989 129.039 38.2445 129.039 37.9229C129.039 37.6013 129.011 37.3544 128.954 37.1822C128.897 37.0101 128.818 36.8758 128.716 36.7793C128.613 36.6828 128.484 36.6175 128.327 36.5835C128.21 36.557 127.98 36.5438 127.637 36.5438H127.26Z"
        fill={textD}
        onMouseOver={() => setFillColorD("grey")} // Change to your desired hover color
        onMouseOut={() => setFillColorD("transparent")} // Change back to original color
        onClick={() => handleClick("D")} // Add your click event handler here
      />
      <path
        id="G"
        d="M178.358 38.4705V37.7696H180.168V39.4268C179.993 39.5971 179.737 39.7475 179.402 39.878C179.069 40.0066 178.732 40.0709 178.389 40.0709C177.954 40.0709 177.575 39.9801 177.251 39.7985C176.928 39.615 176.685 39.354 176.522 39.0153C176.359 38.6748 176.278 38.305 176.278 37.9058C176.278 37.4726 176.369 37.0876 176.551 36.7509C176.732 36.4142 176.998 36.156 177.348 35.9762C177.615 35.8381 177.947 35.7691 178.344 35.7691C178.86 35.7691 179.263 35.8779 179.553 36.0954C179.844 36.3111 180.031 36.61 180.115 36.9921L179.28 37.1482C179.222 36.9439 179.111 36.7831 178.948 36.6658C178.788 36.5466 178.586 36.487 178.344 36.487C177.977 36.487 177.685 36.6034 177.467 36.836C177.251 37.0687 177.144 37.414 177.144 37.8718C177.144 38.3655 177.253 38.7363 177.473 38.9841C177.692 39.2301 177.98 39.353 178.335 39.353C178.511 39.353 178.687 39.319 178.863 39.2509C179.041 39.1809 179.193 39.0967 179.32 38.9983V38.4705H178.358Z"
        fill={textG}
        onMouseOver={() => setFillColorG("grey")} // Change to your desired hover color
        onMouseOut={() => setFillColorG("transparent")} // Change back to original color
        onClick={() => handleClick("G")} // Add your click event handler here
      />

      <path
        id="Marchiani2Path"
        d="M1 71H35V98H1V71Z"
        stroke="#808080"
        stroke-width="0.217"
        stroke-linecap="square"
        fill={fillColorMar2}
        onMouseOver={() => setFillColorMar2("grey")} // Change to your desired hover color
        onMouseOut={() => setFillColorMar2(originalColorMar2)} // Change back to original color
        onClick={() => handleClick("Mar2")} // Add your click event handler here
        style={{
          cursor: "pointer",
        }}
      />
      <path
        id="Marchiani2"
        d="M4.83622 84V79.84H6.09329L6.8481 82.6777L7.5944 79.84H8.85431V84H8.07396V80.7254L7.24821 84H6.43949L5.61657 80.7254V84H4.83622ZM10.2788 81.9058L9.55521 81.7753C9.63655 81.484 9.77654 81.2683 9.97518 81.1283C10.1738 80.9883 10.4689 80.9183 10.8605 80.9183C11.2162 80.9183 11.481 80.9609 11.6551 81.046C11.8291 81.1293 11.9511 81.2361 12.0211 81.3667C12.093 81.4953 12.1289 81.7327 12.1289 82.0789L12.1204 83.0097C12.1204 83.2745 12.1327 83.4703 12.1573 83.5971C12.1838 83.7219 12.232 83.8562 12.302 84H11.5132C11.4924 83.947 11.4668 83.8685 11.4366 83.7645C11.4233 83.7172 11.4139 83.686 11.4082 83.6708C11.272 83.8033 11.1263 83.9026 10.9712 83.9688C10.8161 84.035 10.6505 84.0681 10.4746 84.0681C10.1644 84.0681 9.91937 83.9839 9.73965 83.8156C9.56183 83.6472 9.47291 83.4344 9.47291 83.1771C9.47291 83.0068 9.51359 82.8555 9.59493 82.7231C9.67628 82.5888 9.78978 82.4866 9.93545 82.4166C10.083 82.3447 10.2949 82.2823 10.5711 82.2293C10.9438 82.1593 11.202 82.0941 11.3458 82.0335V81.9541C11.3458 81.8008 11.3079 81.6921 11.2322 81.6277C11.1566 81.5615 11.0137 81.5284 10.8038 81.5284C10.6619 81.5284 10.5512 81.5568 10.4718 81.6136C10.3923 81.6684 10.328 81.7658 10.2788 81.9058ZM11.3458 82.5528C11.2436 82.5869 11.0819 82.6275 10.8605 82.6748C10.6392 82.7221 10.4945 82.7685 10.4264 82.8139C10.3223 82.8876 10.2703 82.9813 10.2703 83.0948C10.2703 83.2064 10.3119 83.3029 10.3951 83.3842C10.4784 83.4656 10.5843 83.5063 10.713 83.5063C10.8567 83.5063 10.9939 83.459 11.1244 83.3644C11.2209 83.2925 11.2843 83.2045 11.3145 83.1005C11.3353 83.0324 11.3458 82.9028 11.3458 82.7117V82.5528ZM13.6811 84H12.8837V80.9864H13.6244V81.4149C13.7511 81.2125 13.8646 81.0791 13.9649 81.0148C14.067 80.9505 14.1824 80.9183 14.3111 80.9183C14.4927 80.9183 14.6677 80.9685 14.836 81.0687L14.5892 81.7639C14.4549 81.6769 14.33 81.6334 14.2146 81.6334C14.103 81.6334 14.0084 81.6646 13.9308 81.7271C13.8533 81.7876 13.7918 81.8983 13.7464 82.0591C13.7029 82.2199 13.6811 82.5566 13.6811 83.0693V84ZM17.8099 81.8775L17.0239 82.0193C16.9974 81.8623 16.9368 81.7441 16.8422 81.6646C16.7495 81.5852 16.6285 81.5454 16.479 81.5454C16.2804 81.5454 16.1215 81.6145 16.0023 81.7526C15.885 81.8888 15.8264 82.1177 15.8264 82.4393C15.8264 82.7968 15.886 83.0494 16.0051 83.197C16.1262 83.3445 16.288 83.4183 16.4904 83.4183C16.6417 83.4183 16.7656 83.3757 16.8621 83.2906C16.9586 83.2036 17.0267 83.0551 17.0664 82.8451L17.8496 82.9785C17.7683 83.3379 17.6122 83.6094 17.3814 83.7929C17.1506 83.9764 16.8413 84.0681 16.4535 84.0681C16.0127 84.0681 15.6608 83.9291 15.3979 83.651C15.1368 83.3729 15.0063 82.9879 15.0063 82.4961C15.0063 81.9985 15.1378 81.6117 15.4007 81.3355C15.6637 81.0574 16.0193 80.9183 16.4677 80.9183C16.8347 80.9183 17.126 80.9978 17.3417 81.1567C17.5592 81.3137 17.7153 81.554 17.8099 81.8775ZM19.2117 79.84V81.3695C19.4689 81.0687 19.7764 80.9183 20.1339 80.9183C20.3174 80.9183 20.4829 80.9524 20.6305 81.0205C20.778 81.0886 20.8887 81.1756 20.9625 81.2815C21.0382 81.3875 21.0892 81.5048 21.1157 81.6334C21.1441 81.7621 21.1583 81.9616 21.1583 82.2322V84H20.3609V82.4081C20.3609 82.0922 20.3458 81.8916 20.3155 81.8065C20.2852 81.7214 20.2313 81.6542 20.1538 81.605C20.0781 81.554 19.9826 81.5284 19.8672 81.5284C19.7347 81.5284 19.6165 81.5606 19.5125 81.6249C19.4084 81.6892 19.3318 81.7866 19.2826 81.9172C19.2353 82.0458 19.2117 82.2369 19.2117 82.4904V84H18.4143V79.84H19.2117ZM21.9698 80.5778V79.84H22.7672V80.5778H21.9698ZM21.9698 84V80.9864H22.7672V84H21.9698ZM24.1832 81.9058L23.4596 81.7753C23.5409 81.484 23.6809 81.2683 23.8796 81.1283C24.0782 80.9883 24.3733 80.9183 24.7649 80.9183C25.1206 80.9183 25.3854 80.9609 25.5595 81.046C25.7335 81.1293 25.8555 81.2361 25.9255 81.3667C25.9974 81.4953 26.0333 81.7327 26.0333 82.0789L26.0248 83.0097C26.0248 83.2745 26.0371 83.4703 26.0617 83.5971C26.0882 83.7219 26.1364 83.8562 26.2064 84H25.4176C25.3968 83.947 25.3712 83.8685 25.341 83.7645C25.3277 83.7172 25.3183 83.686 25.3126 83.6708C25.1764 83.8033 25.0307 83.9026 24.8756 83.9688C24.7205 84.035 24.5549 84.0681 24.379 84.0681C24.0687 84.0681 23.8238 83.9839 23.6441 83.8156C23.4662 83.6472 23.3773 83.4344 23.3773 83.1771C23.3773 83.0068 23.418 82.8555 23.4993 82.7231C23.5807 82.5888 23.6942 82.4866 23.8398 82.4166C23.9874 82.3447 24.1993 82.2823 24.4755 82.2293C24.8482 82.1593 25.1064 82.0941 25.2502 82.0335V81.9541C25.2502 81.8008 25.2123 81.6921 25.1366 81.6277C25.061 81.5615 24.9181 81.5284 24.7082 81.5284C24.5663 81.5284 24.4556 81.5568 24.3762 81.6136C24.2967 81.6684 24.2324 81.7658 24.1832 81.9058ZM25.2502 82.5528C25.148 82.5869 24.9863 82.6275 24.7649 82.6748C24.5436 82.7221 24.3989 82.7685 24.3308 82.8139C24.2267 82.8876 24.1747 82.9813 24.1747 83.0948C24.1747 83.2064 24.2163 83.3029 24.2995 83.3842C24.3828 83.4656 24.4887 83.5063 24.6174 83.5063C24.7611 83.5063 24.8983 83.459 25.0288 83.3644C25.1253 83.2925 25.1887 83.2045 25.2189 83.1005C25.2397 83.0324 25.2502 82.9028 25.2502 82.7117V82.5528ZM29.5634 84H28.766V82.462C28.766 82.1366 28.749 81.9266 28.7149 81.832C28.6808 81.7356 28.625 81.6608 28.5475 81.6079C28.4718 81.5549 28.3801 81.5284 28.2722 81.5284C28.1341 81.5284 28.0102 81.5663 27.9005 81.6419C27.7908 81.7176 27.7151 81.8179 27.6735 81.9427C27.6338 82.0676 27.6139 82.2984 27.6139 82.6351V84H26.8165V80.9864H27.5571V81.4291C27.8201 81.0886 28.1512 80.9183 28.5503 80.9183C28.7263 80.9183 28.887 80.9505 29.0327 81.0148C29.1784 81.0772 29.2881 81.1576 29.3619 81.256C29.4376 81.3544 29.4896 81.466 29.518 81.5909C29.5482 81.7157 29.5634 81.8945 29.5634 82.1272V84ZM30.3749 80.5778V79.84H31.1723V80.5778H30.3749ZM30.3749 84V80.9864H31.1723V84H30.3749ZM19.3223 90.2594V91H16.5273C16.5575 90.72 16.6483 90.4552 16.7997 90.2055C16.951 89.9539 17.2499 89.6209 17.6964 89.2066C18.0558 88.8718 18.2762 88.6448 18.3575 88.5256C18.4673 88.361 18.5221 88.1983 18.5221 88.0375C18.5221 87.8597 18.4739 87.7235 18.3774 87.6289C18.2828 87.5324 18.1513 87.4842 17.983 87.4842C17.8165 87.4842 17.6841 87.5343 17.5857 87.6346C17.4873 87.7348 17.4306 87.9013 17.4154 88.134L16.6209 88.0545C16.6682 87.6157 16.8167 87.3007 17.0664 87.1096C17.3161 86.9185 17.6283 86.823 18.0028 86.823C18.4133 86.823 18.7359 86.9337 18.9705 87.155C19.205 87.3763 19.3223 87.6516 19.3223 87.9808C19.3223 88.168 19.2883 88.3468 19.2202 88.5171C19.154 88.6854 19.048 88.8623 18.9024 89.0477C18.8059 89.1707 18.6318 89.3476 18.3802 89.5783C18.1286 89.8091 17.9688 89.9624 17.9007 90.038C17.8345 90.1137 17.7806 90.1875 17.7389 90.2594H19.3223Z"
        fill={textMar2}
        onMouseOver={() => setFillColorMar2("grey")} // Change to your desired hover color
        onMouseOut={() => setFillColorMar2("transparent")} // Change back to original color
        onClick={() => handleClick("Mar2")} // Add your click event handler here
      />
      <path
        id="ZPath"
        d="M169 98H187V106H169V98Z"
        stroke="#808080"
        stroke-width="0.217"
        stroke-linecap="square"
        fill={fillColorZ}
        onMouseOver={() => setFillColorZ("grey")} // Change to your desired hover color
        onMouseOut={() => setFillColorZ(originalColorZ)} // Change back to original color
        onClick={() => handleClick("Z")} // Add your click event handler here
        style={{
          cursor: "pointer",
        }}
      />
      <path
        id="Z"
        d="M176.062 104V103.242L178.247 100.544H176.309V99.84H179.354V100.493L177.075 103.299H179.442V104H176.062Z"
        fill={textZ}
        onMouseOver={() => setFillColorZ("grey")} // Change to your desired hover color
        onMouseOut={() => setFillColorZ("transparent")} // Change back to original color
        onClick={() => handleClick("Z")} // Add your click event handler here
      />
    </svg>
  );
};

export default WarehouseComponent;
