import { useEffect, useState } from "react";

interface OfficinaComponentProps {
  onPathClick: (shelf: string) => void; // Define the prop type
  todo: any;
}

const OfficinaComponent: React.FC<OfficinaComponentProps> = ({
  onPathClick,
  todo,
}) => {
  const [fillColorInCommesse, setFillColorInCommesse] = useState("transparent");
  const [fillColorCablaggioA, setFillColorCablaggioA] = useState("transparent");
  const [fillColorCablaggioB, setFillColorCablaggioB] = useState("transparent");
  const [fillColorFissaggio, setFillColorFissaggio] = useState("transparent");
  const [fillColorCollaudoC, setFillColorCollaudoC] = useState("transparent");
  const [fillColorCollaudoD, setFillColorCollaudoD] = useState("transparent");
  const [fillColorCollaudoE, setFillColorCollaudoE] = useState("transparent");
  const [fillColorOutCommesse, setFillColorOutCommesse] =
    useState("transparent");

  const [originalColorInCommesse, setOriginalColorInCommesse] =
    useState(fillColorInCommesse);
  const [originalColorCablaggioA, setOriginalColorCablaggioA] =
    useState(fillColorCablaggioA);
  const [originalColorCablaggioB, setOriginalColorCablaggioB] =
    useState(fillColorCablaggioB);
  const [originalColorFissaggio, setOriginalColorFissaggio] =
    useState(fillColorFissaggio);
  const [originalColorCollaudoC, setOriginalColorCollaudoC] =
    useState(fillColorCollaudoC);
  const [originalColorCollaudoD, setOriginalColorCollaudoD] =
    useState(fillColorCollaudoD);
  const [originalColorCollaudoE, setOriginalColorCollaudoE] =
    useState(fillColorCollaudoE);
  const [originalColorOutCommesse, setOriginalColorOutCommesse] =
    useState(fillColorOutCommesse);

  const [textInCommesse, setTextInCommesse] = useState("grey");
  const [textCablaggioA, setTextCablaggioA] = useState("grey");
  const [textCablaggioB, setTextCablaggioB] = useState("grey");
  const [textFissaggio, setTextFissaggio] = useState("grey");
  const [textCollaudoC, setTextCollaudoC] = useState("grey");
  const [textCollaudoD, setTextCollaudoD] = useState("grey");
  const [textCollaudoE, setTextCollaudoE] = useState("grey");
  const [textOutCommesse, setTextOutCommesse] = useState("grey");

  useEffect(() => {
    //console.log(todo.shelf);
    setFillColorInCommesse("transparent");
    setOriginalColorInCommesse("transparent");
    setFillColorCablaggioA("transparent");
    setOriginalColorCablaggioA("transparent");
    setFillColorCablaggioB("transparent");
    setOriginalColorCablaggioB("transparent");
    setFillColorFissaggio("transparent");
    setOriginalColorFissaggio("transparent");
    setFillColorCollaudoC("transparent");
    setOriginalColorCollaudoC("transparent");
    setFillColorCollaudoD("transparent");
    setOriginalColorCollaudoD("transparent");
    setFillColorCollaudoE("transparent");
    setOriginalColorCollaudoE("transparent");
    setFillColorOutCommesse("transparent");
    setOriginalColorOutCommesse("transparent");
    if (Object.keys(todo).length > 0) {
      todo.shelf.forEach((item: string) => {
        if (item.includes("inCommesse")) {
          let color = "rgba(0, 250, 0, 0.5)"; // Set to desired color for items starting with 'A'
          setFillColorInCommesse(color);
          setOriginalColorInCommesse(color);
        }
        if (item.includes("cablaggioA")) {
          let color = "rgba(0, 250, 0, 0.5)"; // Set to desired color for items starting with 'A'
          setFillColorCablaggioA(color);
          setOriginalColorCablaggioA(color);
        }
        if (item.includes("cablaggioB")) {
          let color = "rgba(0, 250, 0, 0.5)"; // Set to desired color for items starting with 'A'
          setFillColorCablaggioB(color);
          setOriginalColorCablaggioB(color);
        }
        if (item.includes("fissaggio")) {
          let color = "rgba(0, 250, 0, 0.5)"; // Set to desired color for items starting with 'A'
          setFillColorFissaggio(color);
          setOriginalColorFissaggio(color);
        }
        if (item.includes("collaudoC")) {
          let color = "rgba(0, 250, 0, 0.5)"; // Set to desired color for items starting with 'A'
          setFillColorCollaudoC(color);
          setOriginalColorCollaudoC(color);
        }
        if (item.includes("collaudoD")) {
          let color = "rgba(0, 250, 0, 0.5)"; // Set to desired color for items starting with 'A'
          setFillColorCollaudoD(color);
          setOriginalColorCollaudoD(color);
        }
        if (item.includes("collaudoE")) {
          let color = "rgba(0, 250, 0, 0.5)"; // Set to desired color for items starting with 'A'
          setFillColorCollaudoE(color);
          setOriginalColorCollaudoE(color);
        }
        if (item.includes("outCommesse")) {
          let color = "rgba(0, 250, 0, 0.5)"; // Set to desired color for items starting with 'A'
          setFillColorOutCommesse(color);
          setOriginalColorOutCommesse(color);
        }
      });
    }
  }, [todo]);

  function handleTextColor(fill: string) {
    if (fill === "transparent") {
      return "grey";
    }
    return "#1a1f2b";
  }

  useEffect(() => {
    setTextInCommesse(handleTextColor(fillColorInCommesse));
  }, [fillColorInCommesse]);

  useEffect(() => {
    setTextCablaggioA(handleTextColor(fillColorCablaggioA));
  }, [fillColorCablaggioA]);

  useEffect(() => {
    setTextCablaggioB(handleTextColor(fillColorCablaggioB));
  }, [fillColorCablaggioB]);

  useEffect(() => {
    setTextFissaggio(handleTextColor(fillColorFissaggio));
  }, [fillColorFissaggio]);

  useEffect(() => {
    setTextCollaudoC(handleTextColor(fillColorCollaudoC));
  }, [fillColorCollaudoC]);

  useEffect(() => {
    setTextCollaudoD(handleTextColor(fillColorCollaudoD));
  }, [fillColorCollaudoD]);

  useEffect(() => {
    setTextCollaudoE(handleTextColor(fillColorCollaudoE));
  }, [fillColorCollaudoE]);

  useEffect(() => {
    setTextOutCommesse(handleTextColor(fillColorOutCommesse));
  }, [fillColorOutCommesse]);

  const handleClick = (shelf: string) => {
    if (todo.shelf.toString().includes(shelf)) {
      // console("Already in shelf");
    } else {
      //console.log(`Path "${shelf}" clicked!`);
      onPathClick(shelf); // Call the passed-in callback function
    }
  };

  return (
    <svg
      width="755"
      height="790.69"
      version="1.1"
      id="svg57"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
    >
      {/* Background grid */}
      <defs>
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path
            d="M 20 0 L 0 0 0 20"
            fill="none"
            stroke="gray"
            strokeWidth="0.5"
            id="path2"
          />
        </pattern>
      </defs>
      {/* Ingresso Commesse da Lavorare */}
      <rect
        x="99.625923"
        y="61.240082"
        width="358.83328"
        height="130.45923"
        fill={fillColorInCommesse}
        cursor="pointer"
        stroke="grey"
        strokeWidth="2.41901"
        strokeDasharray="14.5141, 14.5141"
        strokeOpacity="1"
        id="inCommesse"
        onMouseOver={() => setFillColorInCommesse("grey")} // Change to your desired hover color
        onMouseOut={() => setFillColorInCommesse(originalColorInCommesse)} // Change back to original color
        onClick={() => handleClick("inCommesse")} // Add your click event handler here
      />
      <text
        x="347.89612"
        y="123.66702"
        fontFamily="Verdana"
        fontSize="14px"
        textAnchor="middle"
        cursor="pointer"
        onMouseOver={() => setFillColorInCommesse("grey")} // Change to your desired hover color
        onMouseOut={() => setFillColorInCommesse(originalColorInCommesse)} // Change back to original color
        onClick={() => handleClick("inCommesse")} // Add your click event handler here
      >
        <tspan x="347.89612" y="123.66702" fill={textInCommesse}>
          INGRESSO COMMESSE
        </tspan>
        <tspan x="347.89612" y="141.16702" fill={textInCommesse}>
          DA LAVORARE
        </tspan>
      </text>

      {/* Zona Cablaggio A */}
      <rect
        x="100"
        y="200"
        width="160"
        height="200"
        fill={fillColorCablaggioA}
        stroke="grey"
        strokeWidth="2"
        id="cablaggioA"
        cursor="pointer"
        onMouseOver={() => setFillColorCablaggioA("grey")} // Change to your desired hover color
        onMouseOut={() => setFillColorCablaggioA(originalColorCablaggioA)} // Change back to original color
        onClick={() => handleClick("cablaggioA")} // Add your click event handler here
      />
      <text
        x="120"
        y="300"
        fontFamily="Verdana"
        fontSize="14px"
        fill={textCablaggioA}
        cursor="pointer"
        onMouseOver={() => setFillColorCablaggioA("grey")} // Change to your desired hover color
        onMouseOut={() => setFillColorCablaggioA(originalColorCablaggioA)} // Change back to original color
        onClick={() => handleClick("cablaggioA")} // Add your click event handler here
      >
        ZONA CABLAGGIO
      </text>
      <text
        x="180"
        y="330"
        fontFamily="Verdana"
        fontSize="14px"
        fill={textCablaggioA}
        cursor="pointer"
        onMouseOver={() => setFillColorCablaggioA("grey")} // Change to your desired hover color
        onMouseOut={() => setFillColorCablaggioA(originalColorCablaggioA)} // Change back to original color
        onClick={() => handleClick("cablaggioA")} // Add your click event handler here
      >
        A
      </text>
      {/* Zona Cablaggio B */}
      <rect
        x="300"
        y="200"
        width="160"
        height="200"
        fill={fillColorCablaggioB}
        stroke="grey"
        strokeWidth="2"
        id="cablaggioB"
        cursor="pointer"
        onMouseOver={() => setFillColorCablaggioB("grey")} // Change to your desired hover color
        onMouseOut={() => setFillColorCablaggioB(originalColorCablaggioB)} // Change back to original color
        onClick={() => handleClick("cablaggioB")} // Add your click event handler here
      />
      <text
        x="320"
        y="300"
        fontFamily="Verdana"
        fontSize="14px"
        fill={textCablaggioB}
        cursor="pointer"
        onMouseOver={() => setFillColorCablaggioB("grey")} // Change to your desired hover color
        onMouseOut={() => setFillColorCablaggioB(originalColorCablaggioB)} // Change back to original color
        onClick={() => handleClick("cablaggioB")} // Add your click event handler here
      >
        ZONA CABLAGGIO
      </text>
      <text
        x="380"
        y="330"
        fontFamily="Verdana"
        fontSize="14px"
        fill={textCablaggioB}
        cursor="pointer"
        onMouseOver={() => setFillColorCablaggioB("grey")} // Change to your desired hover color
        onMouseOut={() => setFillColorCablaggioB(originalColorCablaggioB)} // Change back to original color
        onClick={() => handleClick("cablaggioB")} // Add your click event handler here
      >
        B
      </text>
      {/* Zona Fissaggio F */}
      <rect
        x="499.97302"
        y="59.973011"
        width="240.05397"
        height="340.7536"
        fill={fillColorFissaggio}
        stroke="grey"
        strokeWidth="1.94602"
        id="fissaggio"
        cursor="pointer"
        onMouseOver={() => setFillColorFissaggio("grey")} // Change to your desired hover color
        onMouseOut={() => setFillColorFissaggio(originalColorFissaggio)} // Change back to original color
        onClick={() => handleClick("fissaggio")} // Add your click event handler here
      />
      <text x="564.29431" y="230" fontFamily="Verdana" fontSize="14px">
        <tspan
          x="564.29431"
          y="230"
          fill={textFissaggio}
          cursor="pointer"
          onMouseOver={() => setFillColorFissaggio("grey")} // Change to your desired hover color
          onMouseOut={() => setFillColorFissaggio(originalColorFissaggio)} // Change back to original color
          onClick={() => handleClick("fissaggio")} // Add your click event handler here
        >
          ZONA FISSAGGIO
        </tspan>
      </text>
      <text
        x="620"
        y="260"
        fontFamily="Verdana"
        fontSize="14px"
        fill={textFissaggio}
        cursor="pointer"
        onMouseOver={() => setFillColorFissaggio("grey")} // Change to your desired hover color
        onMouseOut={() => setFillColorFissaggio(originalColorFissaggio)} // Change back to original color
        onClick={() => handleClick("fissaggio")} // Add your click event handler here
      >
        F
      </text>
      {/* Zona Collaudo C */}
      <rect
        x="100"
        y="408"
        width="160"
        height="200"
        fill={fillColorCollaudoC}
        stroke="grey"
        strokeWidth="2"
        id="collaudoC"
        cursor="pointer"
        onMouseOver={() => setFillColorCollaudoC("grey")} // Change to your desired hover color
        onMouseOut={() => setFillColorCollaudoC(originalColorCollaudoC)} // Change back to original color
        onClick={() => handleClick("collaudoC")} // Add your click event handler here
      />
      <text
        x="120"
        y="508"
        fontFamily="Verdana"
        fontSize="14px"
        fill={textCollaudoC}
        cursor="pointer"
        onMouseOver={() => setFillColorCollaudoC("grey")} // Change to your desired hover color
        onMouseOut={() => setFillColorCollaudoC(originalColorCollaudoC)} // Change back to original color
        onClick={() => handleClick("collaudoC")} // Add your click event handler
      >
        ZONA COLLAUDO
      </text>
      <text
        x="180"
        y="538"
        fontFamily="Verdana"
        fontSize="14px"
        fill={textCollaudoC}
        cursor="pointer"
        onMouseOver={() => setFillColorCollaudoC("grey")} // Change to your desired hover color
        onMouseOut={() => setFillColorCollaudoC(originalColorCollaudoC)} // Change back to original color
        onClick={() => handleClick("collaudoC")} // Add your click event handler
      >
        C
      </text>
      {/* Zona Collaudo D */}
      <rect
        x="300"
        y="408"
        width="160"
        height="200"
        fill={fillColorCollaudoD}
        stroke="grey"
        strokeWidth="2"
        id="collaudoD"
        cursor="pointer"
        onMouseOver={() => setFillColorCollaudoD("grey")} // Change to your desired hover color
        onMouseOut={() => setFillColorCollaudoD(originalColorCollaudoD)} // Change back to original color
        onClick={() => handleClick("collaudoD")} // Add your click event handler
      />
      <text
        x="320"
        y="508"
        fontFamily="Verdana"
        fontSize="14px"
        fill={textCollaudoD}
        cursor="pointer"
        onMouseOver={() => setFillColorCollaudoD("grey")} // Change to your desired hover color
        onMouseOut={() => setFillColorCollaudoD(originalColorCollaudoD)} // Change back to original color
        onClick={() => handleClick("collaudoD")} // Add your click event handler
      >
        ZONA COLLAUDO
      </text>
      <text
        x="380"
        y="538"
        fontFamily="Verdana"
        fontSize="14px"
        fill={textCollaudoD}
        cursor="pointer"
        onMouseOver={() => setFillColorCollaudoD("grey")} // Change to your desired hover color
        onMouseOut={() => setFillColorCollaudoD(originalColorCollaudoD)} // Change back to original color
        onClick={() => handleClick("collaudoD")} // Add your click event handler
      >
        D
      </text>
      {/* Zona Box + Collaudo E */}
      <rect
        x="500"
        y="408"
        width="240"
        height="200"
        fill={fillColorCollaudoE}
        stroke="grey"
        strokeWidth="2"
        id="collaudoE"
        cursor="pointer"
        onMouseOver={() => setFillColorCollaudoE("grey")} // Change to your desired hover color
        onMouseOut={() => setFillColorCollaudoE(originalColorCollaudoE)} // Change back to original color
        onClick={() => handleClick("collaudoE")} // Add your click event handler
      />
      <text
        x="537.22186"
        y="509.81152"
        fontFamily="Verdana"
        fontSize="14px"
        fill={textCollaudoE}
        cursor="pointer"
        onMouseOver={() => setFillColorCollaudoE("grey")} // Change to your desired hover color
        onMouseOut={() => setFillColorCollaudoE(originalColorCollaudoE)} // Change back to original color
        onClick={() => handleClick("collaudoE")} // Add your click event handler
      >
        ZONA BOX + COLLAUDO
      </text>
      <text
        x="615.90576"
        y="535.71735"
        fontFamily="Verdana"
        fontSize="14px"
        fill={textCollaudoE}
        cursor="pointer"
        onMouseOver={() => setFillColorCollaudoE("grey")} // Change to your desired hover color
        onMouseOut={() => setFillColorCollaudoE(originalColorCollaudoE)} // Change back to original color
        onClick={() => handleClick("collaudoE")} // Add your click event handler
      >
        E
      </text>
      {/* Uscita Armadi Finiti */}
      <rect
        x="99.410652"
        y="625.16748"
        width="639.13013"
        height="132.94244"
        fill={fillColorOutCommesse}
        stroke="grey"
        strokeWidth="3.25898"
        strokeDasharray="19.5539, 19.5539"
        strokeOpacity="1"
        id="outCommesse"
        cursor="pointer"
        onMouseOver={() => setFillColorOutCommesse("grey")} // Change to your desired hover color
        onMouseOut={() => setFillColorOutCommesse(originalColorOutCommesse)} // Change back to original color
        onClick={() => handleClick("outCommesse")} // Add your click event handler
      />
      <text
        x="339.77203"
        y="706.65955"
        fontFamily="Verdana"
        fontSize="14px"
        fill={textOutCommesse}
        cursor="pointer"
        onMouseOver={() => setFillColorOutCommesse("grey")} // Change to your desired hover color
        onMouseOut={() => setFillColorOutCommesse(originalColorOutCommesse)} // Change back to original color
        onClick={() => handleClick("outCommesse")} // Add your click event handler
      >
        USCITA ARMADI FINITI
      </text>
      <path
        style={{
          fill: "#000000",
          stroke: "grey",
          strokeWidth: "3.25898",
          strokeLinecap: "square",
          //strokeDasharray: '15.4265, 15.4265',
          strokeOpacity: "1",
        }}
        d="m 18.212596,110.48096 94.915194,-0.21733 -0.66841,-25.42743 57.26104,38.68447 -56.14702,40.20576 v -22.60216 l -95.137993,-0.43465 z"
        id="arrowIn"
      />
      <path
        style={{
          fill: "#000000",
          stroke: "grey",
          strokeWidth: "3.25898",
          strokeLinecap: "square",
          //strokeDasharray: '15.4265, 15.4265',
          strokeOpacity: "1",
        }}
        d="m 171.29069,706.68335 -94.915186,0.21733 0.66841,25.42743 -57.26104,-38.68447 56.14702,-40.20576 v 22.60216 l 95.137986,0.43465 z"
        id="arrowOut"
      />
    </svg>
  );
};

export default OfficinaComponent;
