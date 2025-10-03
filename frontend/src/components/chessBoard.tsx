import React, { useEffect, useState } from "react";
import { Modal, Select, Button } from "antd";

interface ChessBoardProps {
  rows: number;
  columns: string;
  title: string;
  items: any[];
  commessa: string;
  shelf: string[];
  onPathClick: ({
    row,
    col,
    status,
  }: {
    row: number;
    col: string;
    status: number;
  }) => void;
  onShelfMove?: (fromShelf: string, toShelf: string) => void;
  onShelfMoveWithStatus?: (
    fromShelf: string,
    toShelf: string,
    fromStatus: number,
    toStatus: number
  ) => void;
}

const ChessBoard: React.FC<ChessBoardProps> = ({
  rows,
  columns,
  title,
  items,
  commessa,
  shelf,
  onPathClick,
  onShelfMove,
  onShelfMoveWithStatus,
}) => {
  const board = [];

  const [hoveredCell, setHoveredCell] = useState({ row: -1, col: "-1" });
  const [allShelfs, setAllShelfs] = useState<any[]>([]);
  const [highlightedCell, setHighlightedCell] = useState<{
    row: number;
    col: string;
  } | null>(null);

  // Modal state for shelf move
  const [openShelfMoveModal, setOpenShelfMoveModal] = useState<boolean>(false);
  const [pendingMove, setPendingMove] = useState<{
    fromShelf: string;
    toShelf: string;
  } | null>(null);
  const [selectedFromStatus, setSelectedFromStatus] = useState<number>(1); // Default to "Disponibile" for from shelf
  const [selectedToStatus, setSelectedToStatus] = useState<number>(2); // Default to "Usabile" for to shelf

  // Update allShelfs when items prop changes
  useEffect(() => {
    // Filter items for current shelf section (title)
    if (items && Array.isArray(items)) {
      const filteredItems = items.filter((record: any) => {
        if (record && record.shelf && typeof record.shelf === "string") {
          const shelfPrefix = record.shelf.split("-")[0];
          return shelfPrefix === title;
        }
        return false;
      });

      //console.log(`Filtered items for ${title}:`, filteredItems);
      setAllShelfs(filteredItems);
    } else {
      setAllShelfs([]);
    }
  }, [items, title]);

  // Helper function to get status for a specific shelf
  const getShelfStatus = (shelfKey: string) => {
    if (!allShelfs || allShelfs.length === 0) {
      return 0; // Return 0 for void/empty shelfs when no data available
    }

    // Find the shelf data in allShelfs array
    const shelfData = allShelfs.find((item: any) => {
      return item && item.shelf === shelfKey;
    });

    // Handle different status values properly
    if (shelfData && shelfData.status !== undefined) {
      return shelfData.status;
    }

    // Return 0 for void/empty shelfs when no specific data found
    return 0;
  };

  const handleCellClick = (row: number, col: string, status: number) => {
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

  const handleShelfDragStart = (
    event: React.DragEvent<HTMLTableCellElement>,
    shelfKey: string
  ) => {
    event.dataTransfer.setData("text/plain", `shelf-move:${shelfKey}`);
  };

  const handleDrop = (
    event: React.DragEvent<HTMLTableCellElement>,
    row: number,
    col: string,
    value: number
  ) => {
    event.preventDefault();
    const dragData = event.dataTransfer.getData("text/plain");

    if (dragData.startsWith("shelf-move:")) {
      // Handle shelf move
      const fromShelf = dragData.replace("shelf-move:", "");
      const toShelf = `${title}-${row}-${col}`;

      if (fromShelf !== toShelf) {
        // Show modal for status selection
        setPendingMove({ fromShelf, toShelf });
        setSelectedFromStatus(1); // Reset to default
        setSelectedToStatus(1); // Reset to default
        setOpenShelfMoveModal(true);
      }
    } else {
      // Handle regular drag (from draggable element)
      handleCellClick(row, col, value !== undefined ? value : 0);
    }

    setHighlightedCell(null);
  };

  const handleShelfMoveConfirmation = () => {
    if (pendingMove) {
      if (onShelfMoveWithStatus) {
        onShelfMoveWithStatus(
          pendingMove.fromShelf,
          pendingMove.toShelf,
          selectedFromStatus,
          selectedToStatus
        );
      } else if (onShelfMove) {
        // Fallback to original method if new prop not provided
        onShelfMove(pendingMove.fromShelf, pendingMove.toShelf);
      }
    }
    setOpenShelfMoveModal(false);
    setPendingMove(null);
  };

  const handleShelfMoveCancel = () => {
    setOpenShelfMoveModal(false);
    setPendingMove(null);
    setSelectedFromStatus(1);
    setSelectedToStatus(2);
  };

  // Generate column headers
  const columnHeader = [
    <th
      key="corner-header"
      style={{
        border: "1px solid #444",
        backgroundColor: "#2c3e50",
        color: "white",
        width: "30px",
        height: "30px",
        fontSize: "14px",
        fontWeight: "bold",
        textAlign: "center",
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
          border: "1px solid #444",
          backgroundColor: "#2c3e50",
          color: "white",
          width: "80px",
          height: "30px",
          fontSize: "14px",
          fontWeight: "bold",
          textAlign: "center",
        }}
      >
        {col + 1}
      </th>
    );
  }
  board.unshift(<tr key="column-headers">{columnHeader}</tr>);

  // Generate the board
  for (let row = 0; row < rows; row++) {
    const currentRow = [];
    const rowName = rows - row;

    // Row header
    currentRow.push(
      <th
        key={`row-header-${rowName}`}
        style={{
          border: "1px solid #444",
          backgroundColor: "#2c3e50",
          color: "white",
          width: "30px",
          height: "50px",
          fontSize: "14px",
          fontWeight: "bold",
          textAlign: "center",
        }}
      >
        {rowName}
      </th>
    );

    // Generate cells for this row
    for (let col = 0; col < Number(columns); col++) {
      let colName = (col + 1).toString();
      if (Number(colName) < 10) {
        colName = `0${colName}`;
      }

      const key = `${title}-${rowName}-${colName}`;
      let isHovered = false;
      let value: number = 0;

      // Always get the status from allShelfs for normal coloring
      value = getShelfStatus(key);
      isHovered = hoveredCell.row === rowName && hoveredCell.col === colName;

      // Check if this cell is in the shelf array (for highlighting specific positions)
      const isInShelfArray = shelf && shelf.length > 0 && shelf.includes(key);

      const isHighlighted =
        highlightedCell?.row === rowName && highlightedCell?.col === colName;

      // Determine background color based on status
      let backgroundColor = "#1e2a4a";
      let textColor = "white";
      let borderColor = "#444";
      let boxShadow = "none";

      if (isInShelfArray) {
        // Special color for cells in the shelf array
        backgroundColor = "#3498db"; // Blue color
        textColor = "white";
        borderColor = "#2980b9";
        boxShadow = "0 0 10px rgba(52, 152, 219, 0.5)";
      } else if (isHighlighted) {
        backgroundColor = "#3498db";
        textColor = "white";
        borderColor = "#2980b9";
        boxShadow = "0 0 10px rgba(52, 152, 219, 0.5)";
      } else if (isHovered) {
        backgroundColor = "#34495e";
        textColor = "white";
        borderColor = "#2c3e50";
      } else {
        switch (value) {
          case 0:
            // Void/Empty shelf
            backgroundColor = "#1e2a4a";
            textColor = "#aaa";
            borderColor = "#2c3e50";
            break;
          case 1:
            // Available shelf
            backgroundColor = "#2ecc71";
            textColor = "#1a202c";
            borderColor = "#27ae60";
            break;
          case 2:
            // Occupied shelf
            backgroundColor = "#e67e22";
            textColor = "#1a202c";
            borderColor = "#d35400";
            break;
          case 3:
            // Reserved/Blocked shelf
            backgroundColor = "#e74c3c";
            textColor = "white";
            borderColor = "#c0392b";
            break;
          case 4:
            // Selected/Highlighted shelf
            backgroundColor = "#2ecc71";
            textColor = "#1a202c";
            borderColor = "#27ae60";
            boxShadow = "0 0 10px rgba(46, 204, 113, 0.5)";
            break;
          default:
            backgroundColor = "#1e2a4a";
            textColor = "#aaa";
            borderColor = "#2c3e50";
            break;
        }
      }

      currentRow.push(
        <td
          key={key}
          draggable={isInShelfArray}
          onDragStart={
            isInShelfArray
              ? (event) => handleShelfDragStart(event, key)
              : undefined
          }
          onMouseEnter={() => setHoveredCell({ row: rowName, col: colName })}
          onMouseLeave={() => setHoveredCell({ row: -1, col: "-1" })}
          onClick={() =>
            handleCellClick(rowName, colName, value !== undefined ? value : 0)
          }
          onDragOver={handleDragOver}
          onDragEnter={() => handleDragEnter(rowName, colName)}
          onDragLeave={() => handleDragLeave(rowName, colName)}
          onDrop={(event) =>
            handleDrop(event, rowName, colName, value !== undefined ? value : 0)
          }
          style={{
            border: `1px solid ${borderColor}`,
            width: "80px",
            height: "50px",
            backgroundColor,
            textAlign: "center",
            color: textColor,
            cursor: isInShelfArray ? "move" : "pointer",
            transition: "all 0.2s ease",
            fontSize: "13px",
            fontWeight: "500",
            boxShadow,
            borderRadius: "2px",
          }}
        >
          {title}-{rowName}-{colName}
          {isInShelfArray && (
            <div
              style={{
                fontSize: "10px",
                color: "#fff",
                marginTop: "2px",
                fontWeight: "bold",
              }}
            >
              <div style={{ fontSize: "9px", color: "#fff", marginTop: "1px" }}>
                {(() => {
                  switch (value) {
                    case 1:
                      return "Libero";
                    case 2:
                      return "Usabile";
                    case 3:
                      return "Pieno";
                    case 4:
                      return "Selezionato";
                    default:
                      return "";
                  }
                })()}
              </div>
            </div>
          )}
        </td>
      );
    }
    board.push(<tr key={`row-${rowName}`}>{currentRow}</tr>);
  }

  return (
    <div style={{ margin: "20px 0" }}>
      <h1
        style={{
          color: "white",
          fontSize: "54px",
          marginBottom: "15px",
          paddingBottom: "8px",
          display: "block",
          textAlign: "center",
        }}
      >
        Scaffale {title}
      </h1>
      <table
        style={{
          borderCollapse: "separate",
          borderSpacing: "2px",
          margin: "0 auto",
        }}
      >
        <tbody>{board}</tbody>
      </table>

      {/* Color Legend */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap",
          gap: "15px",
          margin: "20px auto",
          maxWidth: "600px",
          padding: "10px",
          backgroundColor: "rgba(0,0,0,0.2)",
          borderRadius: "8px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              width: "20px",
              height: "20px",
              backgroundColor: "#2ecc71",
              border: "1px solid #27ae60",
              marginRight: "8px",
              borderRadius: "4px",
            }}
          ></div>
          <span style={{ color: "white" }}>Libero</span>
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              width: "20px",
              height: "20px",
              backgroundColor: "#e67e22",
              border: "1px solid #d35400",
              marginRight: "8px",
              borderRadius: "4px",
            }}
          ></div>
          <span style={{ color: "white" }}>Usabile</span>
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              width: "20px",
              height: "20px",
              backgroundColor: "#e74c3c",
              border: "1px solid #c0392b",
              marginRight: "8px",
              borderRadius: "4px",
            }}
          ></div>
          <span style={{ color: "white" }}>Pieno</span>
        </div>
        {commessa && commessa.length > 0 && (
          <div style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{
                width: "20px",
                height: "20px",
                backgroundColor: "#3498db",
                border: "1px solid #2980b9",
                marginRight: "8px",
                borderRadius: "4px",
              }}
            ></div>
            <span style={{ color: "white" }}>{commessa}</span>
          </div>
        )}
      </div>

      {/* Shelf Move Modal */}
      <Modal
        title="Conferma spostamento scaffale"
        open={openShelfMoveModal}
        onCancel={handleShelfMoveCancel}
        footer={null}
        width={700}
      >
        <p>
          Stai spostando il materiale da{" "}
          <strong>{pendingMove?.fromShelf}</strong> a{" "}
          <strong>{pendingMove?.toShelf}</strong>.
        </p>

        <div style={{ marginBottom: 16 }}>
          <p>
            <strong>
              Stato della posizione di partenza ({pendingMove?.fromShelf}):
            </strong>
          </p>
          <Select
            placeholder="Seleziona lo stato della posizione di partenza"
            value={selectedFromStatus}
            onChange={setSelectedFromStatus}
            style={{ width: 250, marginBottom: 16 }}
          >
            <Select.Option value={1}>Posizione Disponibile</Select.Option>
            <Select.Option value={2}>Posizione Usabile</Select.Option>
            <Select.Option value={3}>Posizione Piena</Select.Option>
          </Select>
        </div>

        <div style={{ marginBottom: 16 }}>
          <p>
            <strong>
              Stato della posizione di destinazione ({pendingMove?.toShelf}):
            </strong>
          </p>
          <Select
            placeholder="Seleziona lo stato della posizione di destinazione"
            value={selectedToStatus}
            onChange={setSelectedToStatus}
            style={{ width: 250, marginBottom: 16 }}
          >
            <Select.Option value={1}>Posizione Disponibile</Select.Option>
            <Select.Option value={2}>Posizione Usabile</Select.Option>
            <Select.Option value={3}>Posizione Piena</Select.Option>
          </Select>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <Button onClick={handleShelfMoveCancel}>Annulla</Button>
          <Button type="primary" onClick={handleShelfMoveConfirmation}>
            Conferma Spostamento
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default ChessBoard;
