import { useEffect, useState } from "react";

interface WarehouseComponentProps {
    onPathClick: (shelf: string) => void; // Define the prop type
    shelf:string[];
}

const WarehouseComponent: React.FC<WarehouseComponentProps> = ({ onPathClick, shelf }) => {
    
    const [fillColorA, setFillColorA] = useState("transparent");
    const [fillColorB, setFillColorB] = useState("transparent");
    const [fillColorC, setFillColorC] = useState("transparent");
    const [fillColorD, setFillColorD] = useState("transparent");
    const [fillColorE, setFillColorE] = useState("transparent");
    const [fillColorF, setFillColorF] = useState("transparent");
    const [fillColorG, setFillColorG] = useState("transparent");

    const [originalColorA, setOriginalColorA] = useState(fillColorA);
    const [originalColorB, setOriginalColorB] = useState(fillColorB);
    const [originalColorC, setOriginalColorC] = useState(fillColorC);
    const [originalColorD, setOriginalColorD] = useState(fillColorD);
    const [originalColorE, setOriginalColorE] = useState(fillColorE);
    const [originalColorF, setOriginalColorF] = useState(fillColorF);
    const [originalColorG, setOriginalColorG] = useState(fillColorG);


    const [textA, setTextA] = useState("grey");
    const [textB, setTextB] = useState("grey");
    const [textC, setTextC] = useState("grey");
    const [textD, setTextD] = useState("grey");
    const [textE, setTextE] = useState("grey");
    const [textF, setTextF] = useState("grey");
    const [textG, setTextG] = useState("grey");

    const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());
    function getWindowDimensions() {
        const { innerWidth: width, innerHeight: height } = window;
        return {
            width,
            height
        };
    }
    useEffect(() => {
        function handleResize() {
            setWindowDimensions(getWindowDimensions());
        }
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        shelf.forEach(item => {
            const firstLetter = item.charAt(0); // Extract the first letter
            
            if (firstLetter === 'A') {
                let color = "rgba(0, 250, 0, 0.5)"; // Set to desired color for items starting with 'A'
                setFillColorA(color);
                setOriginalColorA(color)
            }
            if (firstLetter === 'B') {
                let color = "rgba(0, 250, 0, 0.5)"; // Set to desired color for items starting with 'C'
                setFillColorB(color);
                setOriginalColorB(color)
            }
            if (firstLetter === 'C') {
                let color = "rgba(0, 250, 0, 0.5)"; // Set to desired color for items starting with 'C'
                setFillColorC(color);
                setOriginalColorC(color)
            }
            if (firstLetter === 'D') {
                let color = "rgba(0, 250, 0, 0.5)"; // Set to desired color for items starting with 'C'
                setFillColorD(color);
                setOriginalColorD(color)
            }
            if (firstLetter === 'E') {
                let color = "rgba(0, 250, 0, 0.5)"; // Set to desired color for items starting with 'C'
                setFillColorE(color);
                setOriginalColorE(color)
            }
            if (firstLetter === 'F') {
                let color = "rgba(0, 250, 0, 0.5)"; // Set to desired color for items starting with 'C'
                setFillColorF(color);
                setOriginalColorF(color)
            }
            if (firstLetter === 'G') {
                let color = "rgba(0, 250, 0, 0.5)"; // Set to desired color for items starting with 'C'
                setFillColorG(color);
                setOriginalColorG(color)
            }  
          });
    }, [shelf]);

    function handleTextColor(fill: string) {
        if (fill === "transparent") {
            return "grey";
        }
        return "#1a1f2b";
    }

    useEffect(() => {
        setTextA(handleTextColor(fillColorA));
    }, [fillColorA]);

    useEffect(() => {
        setTextB(handleTextColor(fillColorB));
    }, [fillColorB]);

    useEffect(() => {
        setTextC(handleTextColor(fillColorC));
    }, [fillColorC]);

    useEffect(() => {
        setTextD(handleTextColor(fillColorD));
    }, [fillColorD]);

    useEffect(() => {
        setTextE(handleTextColor(fillColorE));
    }, [fillColorE]);

    useEffect(() => {
        setTextF(handleTextColor(fillColorF));
    }, [fillColorF]);

    useEffect(() => {
        setTextG(handleTextColor(fillColorG));
    }, [fillColorG]);

    const handleClick = (shelf: string) => {
        //console.log(`Path "${shelf}" clicked!`);
        onPathClick(shelf); // Call the passed-in callback function
    };

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            xmlSpace="preserve"
            width={(windowDimensions.width) * 0.75}
            height={(windowDimensions.height) * 0.75}
            viewBox="0 0 148.359 105.188"
        >
            <defs>
                <path id="h" d="M121.189 323.621h32.498v36.56h-32.498z" />
                <path id="f" d="M469.86 357.473h20.988v29.789H469.86z" />
                <path id="e" d="M561.937 122.543h23.696v30.466h-23.696z" />
                <path id="c" d="M377.107 146.239h19.634v36.56h-19.634z" />
                <path id="b" d="M280.968 144.885h35.883v43.33h-35.883z" />
                <path id="a" d="M53.486 121.189h55.517v48.746H53.486z" />
                <path id="d" d="M377.107 146.239h46.038v58.902h-46.038z" />
                <path id="g" d="M469.86 357.473h20.988v29.789H469.86z" />
            </defs>
            <path // B
                d="M35.729 177.74H68.51v10.569H35.729z"
                style={{
                    fill: fillColorB,
                    stroke: "grey",
                    strokeWidth: 0.217,
                    strokeLinecap: "square",
                    strokeDasharray: "none",
                    cursor: 'pointer',
                }}
                transform="translate(-27.201 -83.23)"
                onMouseOver={() => setFillColorB("grey")} // Change to your desired hover color
                onMouseOut={() => setFillColorB(originalColorB)} // Change back to original color
                onClick={() => handleClick("B")} // Add your click event handler here
            />
            <path // E
                d="M109.531 182.398h16.301v5.911h-16.301z"
                style={{
                    fill: fillColorE,
                    stroke: "grey",
                    strokeWidth: 0.217,
                    strokeLinecap: "square",
                    strokeDasharray: "none",
                    cursor: 'pointer',
                }}
                transform="translate(-27.201 -83.23)"
                onMouseOver={() => setFillColorE("grey")} // Change to your desired hover color
                onMouseOut={() => setFillColorE(originalColorE)} // Change back to original color
                onClick={() => handleClick("E")} // Add your click event handler here
            />
            <path // F
                d="M134.072 182.398h16.48v5.911h-16.48z"
                style={{
                    fill: fillColorF,
                    stroke: "grey",
                    strokeWidth: 0.217,
                    strokeLinecap: "square",
                    strokeDasharray: "none",
                    cursor: 'pointer',
                }}
                transform="translate(-27.201 -83.23)"
                onMouseOver={() => setFillColorF("grey")} // Change to your desired hover color
                onMouseOut={() => setFillColorF(originalColorF)} // Change back to original color
                onClick={() => handleClick("F")} // Add your click event handler here
            />
            <path // G
                d="M158.613 83.338h16.838v76.668h-16.838z"
                style={{
                    fill: fillColorG,
                    stroke: "grey",
                    strokeWidth: 0.217,
                    strokeLinecap: "square",
                    strokeDasharray: "none",
                    cursor: 'pointer',
                }}
                transform="translate(-27.201 -83.23)"
                onMouseOver={() => setFillColorG("grey")} // Change to your desired hover color
                onMouseOut={() => setFillColorG(originalColorG)} // Change back to original color
                onClick={() => handleClick("G")} // Add your click event handler here
            />
            <path // D
                d="M109.531 83.517h16.48v76.489h-16.48z"
                style={{
                    fill: fillColorD,
                    stroke: "grey",
                    strokeWidth: 0.217,
                    strokeLinecap: "square",
                    strokeDasharray: "none",
                    cursor: 'pointer',
                }}
                transform="translate(-27.201 -83.23)"
                onMouseOver={() => setFillColorD("grey")} // Change to your desired hover color
                onMouseOut={() => setFillColorD(originalColorD)} // Change back to original color
                onClick={() => handleClick("D")} // Add your click event handler here
            />
            <path // C
                d="M84.99 83.517h16.48v76.489H84.99z"
                style={{
                    fill: fillColorC,
                    stroke: "grey",
                    strokeWidth: 0.217,
                    strokeLinecap: "square",
                    strokeDasharray: "none",
                    cursor: 'pointer',
                }}
                transform="translate(-27.201 -83.23)"
                onMouseOver={() => setFillColorC("grey")} // Change to your desired hover color
                onMouseOut={() => setFillColorC(originalColorC)} // Change back to original color
                onClick={() => handleClick("C")} // Add your click event handler here
            />
            <path // A
                d="M27.309 83.338h16.48v63.054h-16.48z"
                style={{
                    fill: fillColorA,
                    stroke: "grey",
                    strokeWidth: 0.217,
                    strokeLinecap: "square",
                    strokeDasharray: "none",
                    cursor: 'pointer',
                }}
                transform="translate(-27.201 -83.23)"
                onMouseOver={() => setFillColorA("grey")} // Change to your desired hover color
                onMouseOut={() => setFillColorA(originalColorA)} // Change back to original color
                onClick={() => handleClick("A")} // Add your click event handler here
            />
            <text // A
                xmlSpace="preserve"
                style={{
                    fontWeight: 700,
                    fontSize: "29.3333px",
                    lineHeight: 0,
                    fontFamily: "Arial",
                    textAlign: "center",
                    whiteSpace: "pre",
                    display: "inline",
                    fill: textA,
                    stroke: textA,
                    strokeWidth: 0.820157,
                    strokeLinecap: "square",
                    strokeDasharray: "none",
                    cursor: 'pointer',
                }}
                transform="matrix(.26458 0 0 .26458 -12.968 .209)"
                onMouseOver={() => setFillColorA("grey")} // Change to your desired hover color
                onMouseOut={() => setFillColorA("transparent")} // Change back to original color
                onClick={() => handleClick("A")} // Add your click event handler here
            >
                <tspan x={70.652} y={129.278}>
                    {"A"}
                </tspan>
            </text>
            <text //C
                xmlSpace="preserve"
                style={{
                    fontWeight: 700,
                    fontSize: "29.3333px",
                    lineHeight: 0,
                    fontFamily: "Arial",
                    textAlign: "center",
                    whiteSpace: "pre",
                    display: "inline",
                    fill: textC,
                    stroke: textC,
                    strokeWidth: 0.820157,
                    strokeLinecap: "square",
                    strokeDasharray: "none",
                    cursor: 'pointer',
                }}
                transform="matrix(.26458 0 0 .26458 -12.789 .836)"
                onMouseOver={() => setFillColorC("grey")} // Change to your desired hover color
                onMouseOut={() => setFillColorC("transparent")} // Change back to original color
                onClick={() => handleClick("C")} // Add your click event handler here
            >
                <tspan x={288.318} y={152.974}>
                    {"C"}
                </tspan>
            </text>
            <text //D
                xmlSpace="preserve"
                style={{
                    fontWeight: 700,
                    fontSize: "29.3333px",
                    lineHeight: 0,
                    fontFamily: "Arial",
                    textAlign: "center",
                    whiteSpace: "pre",
                    display: "inline",
                    fill: textD,
                    stroke: textD,
                    strokeWidth: 0.820157,
                    strokeLinecap: "square",
                    strokeDasharray: "none",
                    cursor: 'pointer',
                }}
                transform="matrix(.26458 0 0 .26458 -14.939 .478)"
                onMouseOver={() => setFillColorD("grey")} // Change to your desired hover color
                onMouseOut={() => setFillColorD("transparent")} // Change back to original color
                onClick={() => handleClick("D")} // Add your click event handler here
            >
                <tspan x={389.534} y={154.327}>
                    {"D"}
                </tspan>
            </text>
            <text   //G
                xmlSpace="preserve"
                style={{
                    fontWeight: 700,
                    fontSize: "29.3333px",
                    lineHeight: 0,
                    fontFamily: "Arial",
                    textAlign: "center",
                    whiteSpace: "pre",
                    display: "inline",
                    fill: textG,
                    stroke: textG,
                    strokeWidth: 0.820157,
                    strokeLinecap: "square",
                    strokeDasharray: "none",
                    cursor: 'pointer',
                }}
                transform="matrix(.26458 0 0 .26458 -11.893 6.657)"
                onMouseOver={() => setFillColorG("grey")} // Change to your desired hover color
                onMouseOut={() => setFillColorG("transparent")} // Change back to original color
                onClick={() => handleClick("G")} // Add your click event handler here
            >
                <tspan x={562.377} y={130.632}>
                    {"G"}
                </tspan>
            </text>
            <text   //F
                xmlSpace="preserve"
                style={{
                    fontWeight: 700,
                    fontSize: "29.3333px",
                    lineHeight: 0,
                    fontFamily: "Arial",
                    textAlign: "center",
                    whiteSpace: "pre",
                    display: "inline",
                    fill: textF,
                    stroke: textF,
                    strokeWidth: 0.820157,
                    strokeLinecap: "square",
                    strokeDasharray: "none",
                    cursor: 'pointer',
                }}
                transform="matrix(.20615 0 0 .1904 16.468 34.599)"
                onMouseOver={() => setFillColorF("grey")} // Change to your desired hover color
                onMouseOut={() => setFillColorF("transparent")} // Change back to original color
                onClick={() => handleClick("F")} // Add your click event handler here
            >
                <tspan x={471.396} y={365.561}>
                    {"F"}
                </tspan>
            </text>
            <text   //E
                xmlSpace="preserve"
                style={{
                    fontWeight: 700,
                    fontSize: "29.3333px",
                    lineHeight: 0,
                    fontFamily: "Arial",
                    textAlign: "center",
                    whiteSpace: "pre",
                    display: "inline",
                    fill: textE,
                    stroke: textE,
                    strokeWidth: 0.820157,
                    strokeLinecap: "square",
                    strokeDasharray: "none",
                    cursor: 'pointer',
                }}
                transform="matrix(.20615 0 0 .1904 -8.179 34.789)"
                onMouseOver={() => setFillColorE("grey")} // Change to your desired hover color
                onMouseOut={() => setFillColorE("transparent")} // Change back to original color
                onClick={() => handleClick("E")} // Add your click event handler here
            >
                <tspan x={470.572} y={365.561}>
                    {"E"}
                </tspan>
            </text>
            <text //B
                xmlSpace="preserve"
                style={{
                    fontWeight: 700,
                    fontSize: "29.3333px",
                    lineHeight: 0,
                    fontFamily: "Arial",
                    textAlign: "center",
                    whiteSpace: "pre",
                    display: "inline",
                    fill: textB,
                    stroke: textB,
                    strokeWidth: 0.820157,
                    strokeLinecap: "square",
                    strokeDasharray: "none",
                    cursor: 'pointer',
                }}
                transform="matrix(.26458 0 0 .26458 -10.998 14.808)"
                onMouseOver={() => setFillColorB("grey")} // Change to your desired hover color
                onMouseOut={() => setFillColorB("transparent")} // Change back to original color
                onClick={() => handleClick("B")} // Add your click event handler here
            >
                <tspan x={126.846} y={331.71}>
                    {"B"}
                </tspan>
            </text>
        </svg>
    )
}

export default WarehouseComponent
