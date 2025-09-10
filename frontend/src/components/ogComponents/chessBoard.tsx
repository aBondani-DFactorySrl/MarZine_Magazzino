import React, { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { firestore } from "../../provider/firebase";

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
  }: {
    row: number;
    col: string;
    status: string;
  }) => void;
}

interface ToDoItem {
  id: string;
  shelf: string[];
}

const ChessBoard: React.FC<ChessBoardProps> = ({
  rows,
  columns,
  title,
  item,
  shelf,
  onPathClick,
}) => {
  const board = [];
  const [hoveredCell, setHoveredCell] = useState({ row: -1, col: "-1" });
  const [shelfStatus, setShelfStatus] = useState<any>([]);
  const [_loading, setLoading] = useState(false);
  const [highlightedCell, setHighlightedCell] = useState<{
    row: number;
    col: string;
  } | null>(null);

  useEffect(() => {
    //console.log(shelf)
    if (shelf.length === 0) {
      //console.log(item);
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
            //console.log(matchingRecords);
            // Fetch "shelfStatus" only if there's a change in "records"
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
                  //console.log(matchingRecords)
                  if (typeof matchingRecords[0]?.shelf === "undefined") {
                    updateShelfStatus(shelfRecordsArray[0], []);
                  } else {
                    updateShelfStatus(
                      shelfRecordsArray[0],
                      matchingRecords[0].shelf
                    );
                  }
                  //// console(item.shelf);
                  //// console(matchingRecords[0].shelf);
                  setShelfStatus(shelfRecordsArray[0]);
                  setLoading(false);
                }
              },
              (error) => {
                console.error("Error fetching shelfStatus: ", error);
                setLoading(false);
              }
            );
            // Remember to unsubscribe from "shelfStatus" when appropriate
            // This could be done inside a cleanup function or when you no longer need the subscription
          }
        },
        (error) => {
          console.error("Error fetching records: ", error);
          setLoading(false);
        }
      );
      return () => {
        unsubscribeRecords();
      };
    } else {
      setShelfStatus(shelf);
    }
  }, [shelf]);

  const updateShelfStatus = (
    records: { [key: string]: any },
    arrayShelf: string[]
  ) => {
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

  const handleCellClick = (row: number, col: string, status: string) => {
    onPathClick({ row, col, status });
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

  const handleDrop = (
    event: React.DragEvent<HTMLTableCellElement>,
    row: number,
    col: string,
    value: string
  ) => {
    event.preventDefault();
    //const data = event.dataTransfer.getData('text');
    handleCellClick(row, col, value !== undefined ? value : "1");
    //console.log(`Dropped item: ${data} on cell: (${row}, ${col})`);
    setHighlightedCell(null);
  };

  for (let row = 0; row < rows; row++) {
    const currentRow = [];
    const rowName = rows - row;
    currentRow.push(
      <th
        key={`row-header-${rowName}`}
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
      if (shelf.length === 0) {
        value = shelfStatus[key];
        isHovered = hoveredCell.row === rowName && hoveredCell.col === colName;
      } else {
        if (shelfStatus.includes(key)) {
          value = "4";
        }
      }

      const isHighlighted =
        highlightedCell?.row === rowName && highlightedCell?.col === colName;

      currentRow.push(
        <td
          key={key}
          onMouseEnter={() => setHoveredCell({ row: rowName, col: colName })}
          onMouseLeave={() => setHoveredCell({ row: rowName - 1, col: "-1" })}
          onClick={() =>
            handleCellClick(rowName, colName, value !== undefined ? value : "1")
          }
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
              ? "grey"
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
            cursor: shelf.length === 0 ? "pointer" : "auto",
          }}
        >
          {title}-{rowName}-{colName}
        </td>
      );
    }
    board.push(<tr key={`row-${rowName}`}>{currentRow}</tr>);
  }

  const columnHeader = [
    <th
      key="corner-header"
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
        key={`col-header-${col}`}
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
  board.push(<tr key="column-headers">{columnHeader}</tr>);

  return (
    <table style={{ borderCollapse: "collapse" }}>
      <tbody>{board}</tbody>
    </table>
  );
};

export default ChessBoard;
