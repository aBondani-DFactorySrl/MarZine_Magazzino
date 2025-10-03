import React, { useContext, useEffect, useRef, useState } from "react";
import {
  Button,
  Input,
  Layout,
  Modal,
  Popover,
  Row,
  Space,
  Typography,
} from "antd";
import { FilterOutlined, FilterFilled } from "@ant-design/icons";
import { GiNuclearBomb } from "react-icons/gi";
import { useNavigate } from "react-router-dom";
import UserContext from "../provider/userInfoProvider";
import axios from "axios";
import toast from "react-hot-toast";
import IterationCard from "./iterationCard";

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

interface ToDoListProps {
  title: string;
  todos: ToDoItem[];
}

type ItemId = {
  commessa: string;
  id: string;
  nextStatus: number;
  nextShelf: string;
  actualStatus: number;
  allIteration: any;
};

const ToDoList: React.FC<ToDoListProps> = ({ title, todos }) => {
  const todosWithPlaceholder = todos.length
    ? todos
    : [
        {
          commessa: "Niente da fare",
          urgent: false,
          id: "",
          com_cliente: "",
          des_commessa: "",
          arrivoOfficina: "",
          components_path: [""],
          data_inserimento: new Date().toISOString(),
          stato: 0,
          iterationLength: 0,
          iterationHigherStatus: 0,
          iterationHigherShelf: "",
          allIteration: [],
          external: false,
          note: [],
          shelf: [],
        },
      ];

  const navigate = useNavigate();
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const { user } = useContext(UserContext);
  const [isOpen, setIsOpen] = useState(false);
  const [loadingButton, setLoadingButton] = useState(false);
  const [textTitle, setTextTitle] = useState<string>("");
  const [textBodyFirst, setTextBodyFirst] = useState<string>("");
  const [textBodySecond, setTextBodySecond] = useState<string>("");
  const [textBodyThird, setTextBodyThird] = useState<string>("");
  const [item, setItem] = useState<ItemId>({
    commessa: "",
    id: "",
    nextStatus: 0,
    nextShelf: "",
    actualStatus: 0,
    allIteration: [],
  });
  const [selectedTodo, setSelectedTodo] = useState<any>(null);
  const [isOpena, setIsOpena] = useState(false);
  const [filterValue, setFilterValue] = useState("");
  const [_esaUbicazione, _setEsaUbicazione] = useState<string>("");

  const url = import.meta.env.VITE_BACKEND_URL;
  const [windowDimensions, setWindowDimensions] = useState(
    getWindowDimensions()
  );

  function getWindowDimensions() {
    const { innerWidth: width, innerHeight: height } = window;
    return {
      width,
      height: height - 235,
    };
  }

  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isOpena) {
      setTimeout(() => {
        firstFieldRef.current?.focus();
      }, 100);
    }
  }, [isOpena, firstFieldRef]);

  // Helper function to handle status updates
  const handleStatusUpdate = (
    todo: ToDoItem,
    nextStatus: number,
    nextShelf: string,
    title: string,
    bodyFirst: string,
    bodySecond: string,
    bodyThird: string
  ) => {
    setItem({
      commessa: todo.commessa,
      id: todo.id,
      nextStatus,
      nextShelf,
      actualStatus: todo.stato,
      allIteration: todo.allIteration,
    });
    setSelectedTodo(todo);
    setTextTitle(title);
    setTextBodyFirst(bodyFirst);
    setTextBodySecond(bodySecond);
    setTextBodyThird(bodyThird);
    setIsOpen(true);
  };

  const handleConfirmation = async () => {
    setLoadingButton(true);
    let updateObj: any = {};
    let idToDelete;

    // Find if there's an iteration with the same status as the next status
    const matchingIteration = selectedTodo.allIteration.find(
      (element: any) => item.nextStatus == element.stato
    );

    if (matchingIteration) {
      // If there's a matching iteration, merge with it
      idToDelete = matchingIteration.id;
      updateObj = {
        id: selectedTodo.id,
        stato: item.nextStatus,
        shelf: [...selectedTodo.shelf, ...matchingIteration.shelf],
        note: [...selectedTodo.note, ...matchingIteration.note],
        urgent: selectedTodo.urgent || matchingIteration.urgent ? true : false,
        external:
          selectedTodo.external || matchingIteration.external ? true : false,
        unique_docs: [
          ...(selectedTodo.unique_docs || []),
          ...(matchingIteration.unique_docs || []),
        ],
        shelfHistory: [
          ...(selectedTodo.shelfHistory || []),
          ...(matchingIteration.shelfHistory || []),
        ],
        arrivoOfficina: (() => {
          // If both are null/undefined, return null
          if (
            !selectedTodo.arrivoOfficina &&
            !matchingIteration.arrivoOfficina
          ) {
            return null;
          }

          // If one is null/undefined, return the other
          if (!selectedTodo.arrivoOfficina)
            return matchingIteration.arrivoOfficina;
          if (!matchingIteration.arrivoOfficina)
            return selectedTodo.arrivoOfficina;

          // Both exist, compare and return the older date
          const selectedDate = new Date(selectedTodo.arrivoOfficina);
          const elementDate = new Date(matchingIteration.arrivoOfficina);

          return selectedDate < elementDate
            ? selectedTodo.arrivoOfficina
            : matchingIteration.arrivoOfficina;
        })(),
        components_path: [
          ...selectedTodo.components_path,
          ...matchingIteration.components_path,
        ],
        data_inserimento: (() => {
          const selectedDate = new Date(selectedTodo.data_inserimento);
          const elementDate = new Date(matchingIteration.data_inserimento);

          // Return the older (earlier) date
          return selectedDate < elementDate
            ? selectedTodo.data_inserimento
            : matchingIteration.data_inserimento;
        })(),
      };

      try {
        await axios.post(`${url}/modifyiteration`, {
          commessa: item.commessa,
          iterationModified: updateObj,
          idToDelete: idToDelete,
        });
        toast.success("Commessa aggiornata con successo");
        setLoadingButton(false);
        setIsOpen(false);
        // Refresh the page or update the state to reflect changes
        window.location.reload();
      } catch (error) {
        toast.error("Errore richiesta: " + error);
        setLoadingButton(false);
      }
    } else {
      // If no matching iteration, just update the status
      updateObj = {
        id: selectedTodo.id,
        shelf: selectedTodo.shelf,
        note: selectedTodo.note,
        urgent: selectedTodo.urgent,
        external: selectedTodo.external,
        unique_docs: selectedTodo.unique_docs || [],
        shelfHistory: selectedTodo.shelfHistory || [],
        arrivoOfficina: selectedTodo.arrivoOfficina || null,
        components_path: selectedTodo.components_path,
        data_inserimento: selectedTodo.data_inserimento,
        stato: item.nextStatus,
      };

      try {
        await axios.post(`${url}/updateiteration`, {
          commessa: item.commessa,
          iterationId: selectedTodo.id,
          updateData: updateObj,
        });
        toast.success("Commessa aggiornata con successo");
        setLoadingButton(false);
        setIsOpen(false);
        // Refresh the page or update the state to reflect changes
        window.location.reload();
      } catch (error) {
        toast.error("Errore richiesta: " + error);
        setLoadingButton(false);
      }
    }
  };

  return (
    <Layout.Content>
      <div
        style={{
          width: user?.reparto === "Officina" ? 355 : 242,
          overflowY: "auto",
        }}
      >
        <Row
          justify="space-between"
          align="middle"
          style={{ marginBottom: 16 }}
        >
          <Typography.Title level={4} style={{ margin: 0 }}>
            {title}
          </Typography.Title>
          <Popover
            placement="right"
            open={isOpena}
            onOpenChange={setIsOpena}
            title={`Filtra ${title} per:`}
            content={
              <Space direction="horizontal" align="center">
                <Input
                  ref={firstFieldRef as any}
                  placeholder="Commessa"
                  value={filterValue}
                  onChange={(e) => setFilterValue(e.target.value)}
                />
                <Button
                  icon={<GiNuclearBomb />}
                  onClick={() => {
                    setFilterValue("");
                    setIsOpena(false);
                  }}
                  danger={filterValue !== ""}
                />
              </Space>
            }
            trigger="click"
          >
            <Button
              icon={filterValue !== "" ? <FilterFilled /> : <FilterOutlined />}
              type="text"
            />
          </Popover>
        </Row>

        <div
          key={Math.random()}
          style={{
            overflowY: "auto",
            overflowX: "hidden",
            height: windowDimensions.height + 80,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {todosWithPlaceholder
            .filter((todo) => {
              return todo.commessa
                .toLowerCase()
                .includes(filterValue.toLowerCase());
            })
            .sort((a, b) => {
              if (user?.reparto === "Magazzino") {
                // Sort by urgent, true values first
                if (a.urgent && !b.urgent) return -1;
                if (!a.urgent && b.urgent) return 1;
              }
              const dateA = new Date(a.data_inserimento).getTime();
              const dateB = new Date(b.data_inserimento).getTime();

              return dateA - dateB;
            })
            .map((todo) => (
              <React.Fragment key={Math.random()}>
                {todos.length ? (
                  <IterationCard
                    todo={todo}
                    navigate={navigate}
                    todos={todos}
                    onStatusUpdate={handleStatusUpdate}
                  />
                ) : (
                  <Typography.Text
                    style={{
                      fontSize: 20,
                      fontWeight: "bold",
                      textAlign: "center",
                      padding: 16,
                    }}
                  >
                    Niente da fare
                  </Typography.Text>
                )}
              </React.Fragment>
            ))}
        </div>
      </div>

      <Modal
        title={textTitle}
        open={isOpen}
        onOk={handleConfirmation}
        onCancel={() => setIsOpen(false)}
        confirmLoading={loadingButton}
        centered
      >
        <Typography.Text>
          {textBodyFirst}
          <br />
          {textBodySecond}
          <br />
          {textBodyThird}
        </Typography.Text>
      </Modal>
    </Layout.Content>
  );
};

export default ToDoList;
