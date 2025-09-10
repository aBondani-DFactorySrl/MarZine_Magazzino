import React, { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { firestore } from "../../provider/firebase";
import { Spin, Typography } from "antd";

interface ChessBoardProps {
  rows: number;
  columns: string;
  title: string;
  item: any;
  shelf: string[];
  onPathClick: ({
    row,
    col,
    status,
    title,
  }: {
    row: number;
    col: string;
    status: string;
    title: string;
  }) => void;
  onDragStart: (
    row: number,
    col: string,
    status: string,
    title: string
  ) => void;
  onDrop: (row: number, col: string, status: string, title: string) => void;
}

interface ToDoItem {
  id: string;
  shelf: string[];
}

const ChessBoardMultiple: React.FC<ChessBoardProps> = ({
  rows,
  columns,
  title,
  item,
  shelf,
  onPathClick,
  onDragStart,
  onDrop,
}) => {
  const board = [];
  const [hoveredCell, setHoveredCell] = useState({ row: -1, col: "-1" });
  const [shelfStatus, setShelfStatus] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  const [highlightedCell, setHighlightedCell] = useState<{
    row: number;
    col: string;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    setLoading(true);
    const unsubscribeRecords = onSnapshot(
      collection(firestore, "records"),
      (snapshot) => {
        const recordsArray: ToDoItem[] = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
          shelf: doc.data().shelf,
        }));
        if (recordsArray.length === 0) {
          console.error("Error fetching records: No records found");
          setLoading(false);
        } else {
          const matchingRecords = recordsArray.filter(
            (record) => record.id === item.idRecords
          );
          onSnapshot(
            collection(firestore, "shelfStatus"),
            (shelfSnapshot) => {
              const shelfRecordsArray: ToDoItem[] = shelfSnapshot.docs.map(
                (doc) => ({
                  ...doc.data(),
                  id: doc.id,
                  shelf: doc.data().shelf,
                })
              );
              if (shelfRecordsArray.length === 0) {
                console.error("Error fetching shelfStatus: No records found");
                setLoading(false);
              } else {
                if (typeof matchingRecords[0]?.shelf === "undefined") {
                  updateShelfStatus(shelfRecordsArray[0], []);
                } else {
                  updateShelfStatus(
                    shelfRecordsArray[0],
                    matchingRecords[0].shelf
                  );
                }
                setShelfStatus(shelfRecordsArray[0]);
                setLoading(false);
              }
            },
            (error) => {
              console.error("Error fetching shelfStatus: ", error);
              setLoading(false);
            }
          );
        }
      }
    );

    return () => {
      unsubscribeRecords();
    };
  }, [shelf]);

  const updateShelfStatus = (
    records: { [key: string]: any },
    arrayShelf: string[]
  ) => {
    //console.log(arrayShelf)
    arrayShelf.forEach((key: string) => {
      if (records.hasOwnProperty(key)) {
        switch (records[key]) {
          case "1":
            records[key] = "991";
            break;
          case "2":
            records[key] = "992";
            break;
          case "3":
            records[key] = "993";
            break;
          case "4":
            records[key] = "994";
            break;
          default:
            records[key] = "99";
            break;
        }
      }
    });
    return records;
  };

  const handleCellClick = (
    row: number,
    col: string,
    status: string,
    title: string
  ) => {
    if (!isDragging) {
      onPathClick({ row, col, status, title });
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLTableCellElement>) => {
    event.preventDefault();
  };

  const handleDragEnter = (row: number, col: string) => {
    setHighlightedCell({ row, col });
  };

  const handleDragLeave = (row: number, col: string) => {
    setHighlightedCell((current) => {
      if (current?.row === row && current?.col === col) {
        return null;
      }
      return current;
    });
  };

  const handleDragStart = (
    _event: React.DragEvent<HTMLTableCellElement>,
    row: number,
    col: string,
    status: string
  ) => {
    onDragStart(row, col, status, title);
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleDrop = (
    event: React.DragEvent<HTMLTableCellElement>,
    row: number,
    col: string,
    value: string
  ) => {
    event.preventDefault();
    onDrop(row, col, value, title);
    handleCellClick(row, col, value !== undefined ? value : "1", title);
    setHighlightedCell(null);
    setIsDragging(false);
  };

  for (let row = 0; row < rows; row++) {
    const currentRow = [];
    const rowName = rows - row;
    currentRow.push(
      <th
        key={`row-header-${title}-${rowName}`}
        style={{
          border: "1px solid grey",
          backgroundColor: "rgba(128, 128, 128, 0.5)",
          width: "25px",
          height: "25px",
        }}
      >
        {rowName}
      </th>
    );

    for (let col = 0; col < Number(columns); col++) {
      let colName = (col + 1).toString();
      if (Number(colName) < 10) {
        colName = `0${colName}`;
      }
      const key = `${title}-${rowName}-${colName}`;
      let isHovered = false;
      let value = "-1";
      isHovered = hoveredCell.row === rowName && hoveredCell.col === colName;
      if (shelfStatus) {
        value = shelfStatus[key];
      }

      const isHighlighted =
        highlightedCell?.row === rowName && highlightedCell?.col === colName;

      currentRow.push(
        <td
          key={key}
          draggable={!!value && value.includes("99")}
          onMouseEnter={() => setHoveredCell({ row: rowName, col: colName })}
          onMouseLeave={() => setHoveredCell({ row: rowName - 1, col: "-1" })}
          onClick={() =>
            handleCellClick(
              rowName,
              colName,
              value !== undefined ? value : "1",
              title
            )
          }
          onDragStart={(event) =>
            handleDragStart(event, rowName, colName, value)
          }
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
          onDragEnter={() => handleDragEnter(rowName, colName)}
          onDragLeave={() => handleDragLeave(rowName, colName)}
          onDrop={(event) =>
            handleDrop(
              event,
              rowName,
              colName,
              value !== undefined ? value : "1"
            )
          }
          style={{
            border: "1px solid grey",
            width: "75px",
            height: "50px",
            backgroundColor: isHighlighted
              ? "#90cdf4"
              : isHovered
              ? "rgba(85, 174, 108,0.85)"
              : value === "2"
              ? "rgba(255, 165, 0, 0.85)"
              : value === "3"
              ? "rgba(255, 0, 0, 0.85)"
              : value === "4"
              ? "rgba(0, 255, 0, 0.85)"
              : value !== undefined && value.includes("99")
              ? "rgba(144, 205, 244, 0.85)"
              : "transparent",
            textAlign: "center",
            color: isHighlighted
              ? "black"
              : isHovered
              ? "white"
              : value === "2"
              ? "#1a202c"
              : value === "3"
              ? "#1a202c"
              : value === "4"
              ? "#1a202c"
              : value !== undefined && value.includes("99")
              ? "#1a202c"
              : "white",
            cursor:
              value !== undefined && value.includes("99") ? "grab" : "pointer",
          }}
        >
          {title}-{rowName}-{colName}
        </td>
      );
    }
    board.push(<tr key={`row-${title}-${rowName}`}>{currentRow}</tr>);
  }

  const columnHeader = [
    <th
      key={`corner-header-${title}`}
      style={{
        border: "1px solid grey",
        backgroundColor: "rgba(128, 128, 128, 0.5)",
        width: "25px",
        height: "25px",
      }}
    >
      {title}
    </th>,
  ];
  for (let col = 0; col < Number(columns); col++) {
    columnHeader.push(
      <th
        key={`col-header-${title}-${col}`}
        style={{
          border: "1px solid grey",
          backgroundColor: "rgba(128, 128, 128, 0.5)",
          width: "25px",
          height: "25px",
        }}
      >
        {col + 1}
      </th>
    );
  }
  board.push(<tr key={`column-headers-${title}`}>{columnHeader}</tr>);

  // console(board);

  return (
    <>
      {loading ? (
        <div style={{ textAlign: "center", padding: "24px" }}>
          <Spin size="large" />
          <Typography.Title level={4} style={{ marginTop: 16 }}>
            Loading... Please wait!!
          </Typography.Title>
        </div>
      ) : (
        <table
          style={{
            borderCollapse: "collapse",
            backgroundColor: "transparent",
            width: "fit-content",
          }}
        >
          <tbody>{board}</tbody>
        </table>
      )}
    </>
  );
};

export default ChessBoardMultiple;
