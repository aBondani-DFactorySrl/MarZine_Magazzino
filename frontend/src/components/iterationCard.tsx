import { Button, Card, Space, Tooltip } from "antd";
import React, { useContext, useEffect, useState } from "react";
import { EditOutlined, RightOutlined } from "@ant-design/icons";
import {
  FaPlaneDeparture,
  FaRegHandPaper,
  FaRegThumbsUp,
  FaWrench,
} from "react-icons/fa";
import { GrMapLocation } from "react-icons/gr";
import PrintExcelButton from "./printExcelButton";
import PrintPDFButton from "./printPDFButton";
import PrintSignButton from "./printSignButton";
import DeleteConfirmationDialog from "./deletePopUp";
import UserContext from "../provider/userInfoProvider";

interface ToDoItem {
  id: string;
  commessa: string;
  com_cliente: string;
  des_commessa: string;
  components_path: string[];
  data_inserimento: string;
  stato: number;
  iterationLength: number;
  iterationHigherStatus: number;
  iterationHigherShelf: string;
  allIteration: any;
  external: boolean;
  note: {
    author: string;
    text: string;
    timestamp: string;
  }[];
  urgent: boolean;
  shelf: string[];
}

interface IterationCardProps {
  todo: ToDoItem;
  navigate: (path: string, options?: any) => void;
  todos: ToDoItem[];
  onStatusUpdate: (
    todo: ToDoItem,
    nextStatus: number,
    nextShelf: string,
    title: string,
    bodyFirst: string,
    bodySecond: string,
    bodyThird: string
  ) => void;
}

const IterationCard: React.FC<IterationCardProps> = ({
  todo,
  navigate,
  todos,
  onStatusUpdate,
}) => {
  const { user } = useContext(UserContext);
  const [bgColor, setBgColor] = useState("transparent");
  const [bgWidth, setBgWidth] = useState("0px");

  useEffect(() => {
    const url = new URL(window.location.origin);
    if (!url.host.includes("172.29.5.142")) {
      setBgColor("rgb(234, 255, 0)");
      setBgWidth("2px");
    }
  }, []);

  // Helper function to render print buttons
  const renderPrintButtons = () => (
    <>
      {todo.components_path.length > 0 && !todo.external && (
        <PrintExcelButton records={todo as any} />
      )}
      {todo.components_path.length > 0 && todo.external && (
        <PrintPDFButton records={todo as any} />
      )}
    </>
  );

  const renderLocationsPage = () => {
    let fullParam = { todo: todo, pos: "Magazzino" };
    localStorage.setItem("locationsParams", JSON.stringify(fullParam));
    navigate(`/locations`);
  };

  // Helper function to render action buttons based on status
  const renderActionButtons = () => {
    const buttons = [];

    // Define status conditions for clarity
    const isStatus0to9 = todo.stato >= 0 && todo.stato <= 9;
    const isStatus0 = todo.stato === 0;
    const isStatus1to9 = todo.stato >= 1 && todo.stato <= 9;
    const isStatus10 = todo.stato === 10;
    const isStatus11 = todo.stato === 11;
    const isStatus20to29 = todo.stato >= 20 && todo.stato <= 29;
    const isStatus33 = todo.stato === 33;

    const hasMultipleIterations = todo.iterationLength > 1;
    const higherStatusLow = todo.iterationHigherStatus < 20;
    const higherStatusHigh = todo.iterationHigherStatus >= 20;

    // Generate unique IDs for keys
    const uniqueId = (prefix: string) =>
      `${prefix}_${todo.id}_${Math.random().toString(36).substr(2, 9)}`;

    // Edit button (Status 0-9) - Always show for status 0
    if (isStatus0to9) {
      buttons.push(
        <Tooltip
          key={uniqueId("edit-tooltip")}
          title="Modifica posizione commessa"
          placement="top"
        >
          <Button
            key={uniqueId("edit")}
            icon={<EditOutlined />}
            type="text"
            onClick={() => {
              renderLocationsPage();
            }}
          />
        </Tooltip>
      );
    }

    // Status 0 specific buttons
    if (isStatus0) {
      // Forward to status 1 (if multiple iterations) or status 10 (if no other iterations)
      const targetStatus = hasMultipleIterations ? 1 : 10;
      const buttonTitle = hasMultipleIterations
        ? "Segna come posizionato a magazzino"
        : "Segna come pronto per magazzino";

      buttons.push(
        <Tooltip
          key={uniqueId("forward-status-tooltip")}
          title={buttonTitle}
          placement="top"
        >
          <Button
            key={uniqueId("forward-status")}
            icon={<RightOutlined />}
            type="text"
            onClick={() =>
              onStatusUpdate(
                todo,
                targetStatus,
                "",
                hasMultipleIterations
                  ? "Avanzamento stato?"
                  : "Commessa pronta a magazzino?",
                "Vuoi segnare il materiale",
                `della commessa "${todo.commessa}"`,
                hasMultipleIterations
                  ? "come posizionato a magazzino?"
                  : "come pronto a magazzino ?"
              )
            }
          />
        </Tooltip>
      );

      // Position button (Status 0 with multiple iterations and lower status)
      if (hasMultipleIterations && higherStatusLow) {
        buttons.push(
          <Tooltip
            key={uniqueId("position-lower-tooltip")}
            title="Posiziona materiale"
            placement="top"
          >
            <Button
              key={uniqueId("position-lower")}
              aria-label="edit"
              icon={<FaRegThumbsUp />}
              onClick={() =>
                onStatusUpdate(
                  todo,
                  todo.iterationHigherStatus,
                  todo.iterationHigherShelf,
                  `Commessa posizionata?${todo.iterationHigherStatus}`,
                  "Vuoi segnare il materiale",
                  `della commessa "${todo.commessa}"`,
                  "come posizionato ?"
                )
              }
            />
          </Tooltip>
        );
      }
    }

    // Workshop button (Status 0-19 with multiple iterations and higher status)
    if (
      todo.stato >= 0 &&
      todo.stato < 20 &&
      hasMultipleIterations &&
      higherStatusHigh
    ) {
      buttons.push(
        <Tooltip
          key={uniqueId("workshop-tooltip")}
          title="Pronto da spedire"
          placement="top"
        >
          <Button
            key={uniqueId("workshop")}
            aria-label="edit"
            icon={<FaWrench />}
            onClick={() =>
              onStatusUpdate(
                todo,
                todo.iterationHigherStatus,
                todo.iterationHigherShelf,
                `Commessa posizionata?${todo.iterationHigherStatus}`,
                "Vuoi segnare il materiale",
                `della commessa "${todo.commessa}"`,
                "come pronto da spedire ?"
              )
            }
          />
        </Tooltip>
      );
    }

    // Ready for warehouse button (Status 1-9)
    if (isStatus1to9) {
      buttons.push(
        <Tooltip
          key={uniqueId("ready-warehouse-1-9-tooltip")}
          title="Conferma pronto per magazzino"
          placement="top"
        >
          <Button
            key={uniqueId("ready-warehouse-1-9")}
            aria-label="edit"
            icon={<FaRegThumbsUp />}
            onClick={() =>
              onStatusUpdate(
                todo,
                10,
                "",
                "Commessa pronta a magazzino?",
                "Vuoi segnare il materiale",
                `della commessa "${todo.commessa}"`,
                "come pronto a magazzino ?"
              )
            }
          />
        </Tooltip>
      );
    }

    // Ready to ship button (Status 10 - Warehouse dept only)
    if (isStatus10 && user?.reparto === "Magazzino") {
      buttons.push(
        <Tooltip
          key={uniqueId("ready-ship-tooltip")}
          title="Segna come pronto da spedire"
          placement="top"
        >
          <Button
            key={uniqueId("ready-ship")}
            aria-label="edit"
            icon={<FaPlaneDeparture />}
            onClick={() =>
              onStatusUpdate(
                todo,
                33,
                "",
                "Commessa pronta da spedire?",
                "Vuoi segnare la commessa",
                `"${todo.commessa}"`,
                "come pronta da spedire ?"
              )
            }
          />
        </Tooltip>
      );
    }

    // Request material button (Status 10 - Workshop dept only)
    if (isStatus10 && user?.reparto === "Officina") {
      buttons.push(
        <Tooltip
          key={uniqueId("request-material-tooltip")}
          title="Richiedi materiale"
          placement="top"
        >
          <Button
            key={uniqueId("request-material")}
            aria-label="edit"
            icon={<FaRegHandPaper />}
            onClick={() =>
              onStatusUpdate(
                todo,
                11,
                "",
                "Richiesta materiale",
                "Vuoi richierede il materiale",
                `della commessa "${todo.commessa}"`,
                ""
              )
            }
          />
        </Tooltip>
      );
    }

    // Move to workshop button (Status 11)
    if (isStatus11) {
      buttons.push(
        <Tooltip
          key={uniqueId("to-workshop-tooltip")}
          title="Trasferisci in officina"
          placement="top"
        >
          <Button
            key={uniqueId("to-workshop")}
            aria-label="edit"
            icon={<FaRegThumbsUp />}
            onClick={() =>
              onStatusUpdate(
                todo,
                20,
                "",
                "Commessa portata in officina?",
                "Vuoi segnare il materiale",
                `della commessa "${todo.commessa}"`,
                "come portato in officina ?"
              )
            }
          />
        </Tooltip>
      );
    }

    // Map location button (Status 20-29 - Workshop dept only)
    if (isStatus20to29 && user?.reparto === "Officina") {
      buttons.push(
        <Tooltip
          key={uniqueId("map-location-tooltip")}
          title="Gestisci posizione in officina"
          placement="top"
        >
          <Button
            key={uniqueId("map-location")}
            aria-label="edit"
            icon={<GrMapLocation />}
            onClick={() =>
              navigate(`/newPlace/${todo.id}/${todo.commessa}/Officina`)
            }
          />
        </Tooltip>
      );
    }

    // Mark as completed button (Status 20-29)
    if (isStatus20to29) {
      buttons.push(
        <Tooltip
          key={uniqueId("completed-tooltip")}
          title="Segna come terminato"
          placement="top"
        >
          <Button
            key={uniqueId("completed")}
            aria-label="edit"
            icon={<FaRegThumbsUp />}
            onClick={() =>
              onStatusUpdate(
                todo,
                33,
                "",
                "Commessa terminata",
                "Vuoi segnare la commessa",
                `"${todo.commessa}"`,
                "come terminata ?"
              )
            }
          />
        </Tooltip>
      );
    }

    // Mark as shipped button (Status 33)
    if (isStatus33) {
      buttons.push(
        <Tooltip
          key={uniqueId("shipped-tooltip")}
          title="Conferma spedizione"
          placement="top"
        >
          <Button
            key={uniqueId("shipped")}
            aria-label="edit"
            icon={<FaRegThumbsUp />}
            onClick={() =>
              onStatusUpdate(
                todo,
                99,
                "",
                "Commessa spedita?",
                "Vuoi segnare la commessa",
                `"${todo.commessa}"`,
                "come spedita ?"
              )
            }
          />
        </Tooltip>
      );
    }

    return buttons;
  };

  return (
    <Card
      size="small"
      style={{
        border: bgWidth ? `${bgWidth} solid ${bgColor}` : undefined,
        marginBottom: 8,
      }}
    >
      <div style={{ display: "flex", gap: 8 }}>
        <Button
          type={todo.urgent ? "primary" : "default"}
          danger={todo.urgent}
          block
          onClick={() => navigate("/details", { state: { todo: todo } })}
          style={{ fontSize: 20, fontWeight: "bold", flex: 1 }}
        >
          {todo.commessa}
        </Button>
        <PrintSignButton records={todo as any} />
      </div>

      <Space style={{ marginTop: 8 }}>
        {todos.length && (
          <>
            {renderPrintButtons()}
            {user?.role === "99" && (
              <DeleteConfirmationDialog itemId={todo.id} />
            )}
            {renderActionButtons()}
          </>
        )}
      </Space>
    </Card>
  );
};

export default IterationCard;
