//#region Imports
import { useState, useEffect, useContext } from "react";
import {
  Button,
  Card,
  Space,
  Typography,
  Spin,
  Popover,
  Modal,
  Row,
  Col,
} from "antd";
import { EditOutlined, CloseOutlined } from "@ant-design/icons";
import GeneralAssigmentFields from "../Subcomponents/Comp_AssignmentFieldForCommessa";
import TechniciansSelector from "../Subcomponents/Comp_TechniciansSelectorForCommessa";
import TotalizerMontaggio from "../Subcomponents/Comp_TotalizerHoursMontaggio";
import FilterMontaggio from "../Subcomponents/Comp_FilterHoursMontaggio";
import AddMontaggioHours from "../Subcomponents/Comp_AddNewMontaggioHours";
import TotalizerCablaggio from "../Subcomponents/Comp_TotalizerHoursCablaggio";
import FilterCablaggio from "../Subcomponents/Comp_FilterHoursCablaggio";
import AddCablaggioHours from "../Subcomponents/Comp_AddNewCablaggioHours";
import UserContext from "../../provider/userInfoProvider";
import ModalModify from "../Modal/Modal_ModifyWorkedHour";
import toast from "react-hot-toast";
import axios from "axios";
import {
  collection,
  doc,
  getDocs,
  query,
  where,
  writeBatch,
} from "firebase/firestore";
import { firestore } from "../../provider/firebase";
//#endregion

//#region Interfaces
type RecordType = {
  montaggio: {
    orePreviste: {
      ore: number;
    };
    oreLav: Array<{
      id: number;
      tecnico: string;
      task: string;
      oreLav: number;
      timestamp: string;
      note: string;
    }>;
  };
  cablaggio: {
    orePreviste: {
      ausiliari: number;
      potenza: number;
    };
    oreLav: Array<{
      id: number;
      tecnico: string;
      task: string;
      oreLav: number;
      timestamp: string;
      note: string;
    }>;
  };
};
//#endregion

const AssignCommessa = ({ commessa }: { commessa: any }) => {
  //#region Variables
  const { Title } = Typography;
  const { user } = useContext(UserContext);
  const [capoCommessa, setCapoCommessa] = useState("");
  const [orePrevistePotenza, setOrePrevistePotenza] = useState(0);
  const [orePrevisteAusiliari, setOrePrevisteAusiliari] = useState(0);
  const [orePrevisteMontaggio, setOrePrevisteMontaggio] = useState(0);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [addHourCablaggio, setAddHourCablaggio] = useState(false);
  const [addHourMontaggio, setAddHourMontaggio] = useState(false);
  const [record, setRecord] = useState<RecordType>({
    montaggio: {
      orePreviste: {
        ore: 0,
      },
      oreLav: [],
    },
    cablaggio: {
      orePreviste: {
        ausiliari: 0,
        potenza: 0,
      },
      oreLav: [],
    },
  });
  const [tecnici, setTecnici] = useState([]);
  const [stato, setStato] = useState(0);
  const [statushistory, setStatushistory] = useState<any[]>([]);

  const [oreCableggioNew, setOreCableggioNew] = useState(0);
  const [dataCableggioNew, setDataCableggioNew] = useState(new Date());
  const [taskCableggioNew, setTaskCableggioNew] = useState("");
  const [noteCableggioNew, setNoteCableggioNew] = useState("");
  const [tecnicoCableggioNew, setTecnicoCableggioNew] = useState("");
  const [oreMontaggioNew, setOreMontaggioNew] = useState(0);
  const [tasksMontaggioNew, setTasksMontaggioNew] = useState("");
  const [dataMontaggioNew, setDataMontaggioNew] = useState(new Date());
  const [notesMontaggioNew, setNotesMontaggioNew] = useState("");
  const [tecnicoMontaggioNew, setTecnicoMontaggioNew] = useState("");
  const [tecniciAssegnatiCommessa, setTecniciAssegnatiCommessa] = useState<
    string[]
  >([]);

  const [isOpenModify, setIsOpenModify] = useState(false);
  const [rowToBeModified, setRowToBeModified] = useState<any>(null);
  const [methodToBeModified, setMethodToBeModified] = useState<any>(null);

  const [tecniciEdit, setTecniciEdit] = useState<string | undefined>(undefined);
  const [tasksEdit, setTasksEdit] = useState<string | undefined>(undefined);
  const [oreEdit, setOreEdit] = useState<number | undefined>(undefined);
  const [dataEdit, setDataEdit] = useState<any>(new Date());
  const [notesEdit, setNotesEdit] = useState<string | undefined>(undefined);

  const [isOpenRemoveMontaggio, setIsOpenRemoveMontaggio] = useState(false);
  const [isOpenRemoveCablaggio, setIsOpenRemoveCablaggio] = useState(false);
  const [taskToBeRemoved, setTaskToBeRemoved] = useState<any | undefined>(
    undefined
  );
  const [filterMontaggioTecnico, setFilterMontaggioTecnico] = useState("");
  const [filterMontaggioLavorazione, setFilterMontaggioLavorazione] =
    useState("");
  const [filterMontaggioDate, setFilterMontaggioDate] = useState("");

  const [filterCablaggioTecnico, setFilterCablaggioTecnico] = useState("");
  const [filterCablaggioLavorazione, setFilterCablaggioLavorazione] =
    useState("");
  const [filterCablaggioDate, setFilterCablaggioDate] = useState("");
  const url = import.meta.env.VITE_BACKEND_URL;

  const clearMontaggioFilters = () => {
    setFilterMontaggioTecnico("");
    setFilterMontaggioLavorazione("");
    setFilterMontaggioDate("");
  };

  const clearCablaggioFilters = () => {
    setFilterCablaggioTecnico("");
    setFilterCablaggioLavorazione("");
    setFilterCablaggioDate("");
  };

  const Lavorazioni = [
    { code: "M1", desc: "Montaggio Canale" },
    { code: "M2", desc: "Installazione Componenti" },
    { code: "M3", desc: "Montaggio Morsetti" },
    { code: "M4", desc: "Etichettatura su componenti e morsetti" },
    { code: "C1", desc: "Cablaggio Potenza" },
    { code: "C2", desc: "Cablaggio Ausiliari" },
    { code: "C3", desc: "Cablaggio Rete Dati" },
  ];
  //#endregion

  //#region Fetch and Save data
  const fetchOptions = async () => {
    try {
      // Set initial values immediately
      setCapoCommessa(commessa.capocommessa || "");
      setOrePrevistePotenza(commessa.cablaggio?.orePreviste?.potenza || 0);
      setOrePrevisteAusiliari(commessa.cablaggio?.orePreviste?.ausiliari || 0);
      setOrePrevisteMontaggio(commessa.montaggio?.orePreviste?.ore || 0);
      setRecord(commessa);
      setTecniciAssegnatiCommessa(commessa.tecniciassegnati || []);
      setStato(commessa.stato || 0);
      setStatushistory(commessa.statushistory || []);
      // console(commessa.statushistory);

      // Add a 3-second timer before fetching data

      try {
        const response = await fetch(`${url}/gettecnici`);
        const data = await response.json();
        if (data.success) {
          setTecnici(data.data);
        }
      } catch (error) {
        toast.error("Errore durante il recupero dei tecnici");
      }
      toast.success("Dati recuperati con successo");
    } catch (error) {
      toast.error("Errore durante il recupero dei dati");
    }
  };
  const fetchAll = async () => {
    setLoading(true);
    await fetchOptions();
    setLoading(false);
  };
  useEffect(() => {
    fetchAll();
  }, []);
  useEffect(() => {
    if (
      commessa.tecniciassegnati !== null &&
      commessa.tecniciassegnati !== undefined
    ) {
      // Update state when commessa prop changes
      setCapoCommessa(commessa.capocommessa || "");
      setOrePrevistePotenza(commessa.cablaggio?.orePreviste?.potenza || 0);
      setOrePrevisteAusiliari(commessa.cablaggio?.orePreviste?.ausiliari || 0);
      setOrePrevisteMontaggio(commessa.montaggio?.orePreviste?.ore || 0);
      setRecord(commessa);
      setTecniciAssegnatiCommessa(commessa.tecniciassegnati || []);
      setStato(commessa.stato || 0);
    }
  }, [commessa]);

  //#endregion

  //#region Function removing Rows
  const handleRemoveMontaggioRow = (index: number) => {
    // console(index);
    const Montaggio = [...(record.montaggio?.oreLav || [])];
    const updatedMontaggio = Montaggio.filter((item) => item.id !== index); // Remove the row at the given index

    const localRecord = {
      ...record,
      cablaggio: {
        ...record.cablaggio,
        oreLav: [...((record.cablaggio as any)?.oreLav || [])],
      },
    };

    const rootRecordCablaggio = localRecord.cablaggio;
    const rootRecordMontaggio = localRecord.montaggio;

    // Calculate expected hours
    const expectedHours =
      (rootRecordMontaggio?.orePreviste?.ore || 0) +
      (rootRecordCablaggio?.orePreviste?.ausiliari || 0) +
      (rootRecordCablaggio?.orePreviste?.potenza || 0);

    // Calculate worked hours
    const workedHoursCablaggio = rootRecordCablaggio?.oreLav.reduce(
      (total: number, item: any) => total + item.oreLav,
      0
    );
    const workedHoursMontaggio = updatedMontaggio.reduce(
      (total: number, item: any) => total + item.oreLav,
      0
    );

    const totalWorkedHours =
      (workedHoursCablaggio || 0) + (workedHoursMontaggio || 0);
    const percentageWorked =
      expectedHours > 0 ? (totalWorkedHours / expectedHours) * 100 : 0;

    setRecord((prevRecord) => ({
      ...prevRecord,
      montaggio: {
        ...prevRecord.montaggio,
        oreLav: updatedMontaggio,
        orePreviste: prevRecord.montaggio?.orePreviste || { ore: 0 },
      },
    }));
    //// console(percentageWorked);

    // Update using the backend API instead of Firestore
    fetch(`${url}/removehours/${commessa.commessa}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        method: "montaggio",
        id: index,
        progression: percentageWorked,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setTaskToBeRemoved(undefined);
          toast.success("Riga rimossa con successo");
        } else {
          throw new Error(data.message || "Failed to remove row");
        }
      })
      .catch(() => {
        toast.error("Errore durante la rimozione della riga");
      });
  };
  const handleRemoveCablaggioRow = (index: number) => {
    const Cablaggio = [...(record.cablaggio?.oreLav || [])];
    const updatedCablaggio = Cablaggio.filter((item) => item.id !== index); // Remove the row at the given index

    const localRecord = {
      ...record,
      montaggio: {
        ...record.montaggio,
        oreLav: [...((record.montaggio as any)?.oreLav || [])],
      },
    };

    const rootRecordCablaggio = localRecord.cablaggio;
    const rootRecordMontaggio = localRecord.montaggio;

    // Calculate expected hours
    const expectedHours =
      (rootRecordMontaggio?.orePreviste?.ore || 0) +
      (rootRecordCablaggio?.orePreviste?.ausiliari || 0) +
      (rootRecordCablaggio?.orePreviste?.potenza || 0);

    // Calculate worked hours
    const workedHoursCablaggio = updatedCablaggio.reduce(
      (total: number, item: any) => total + item.oreLav,
      0
    );
    const workedHoursMontaggio = rootRecordMontaggio?.oreLav.reduce(
      (total: number, item: any) => total + item.oreLav,
      0
    );
    const totalWorkedHours =
      (workedHoursCablaggio || 0) + (workedHoursMontaggio || 0);
    const percentageWorked =
      expectedHours > 0 ? (totalWorkedHours / expectedHours) * 100 : 0;

    setRecord((prevRecord) => ({
      ...prevRecord,
      cablaggio: {
        ...prevRecord.cablaggio,
        oreLav: updatedCablaggio,
        orePreviste: prevRecord.cablaggio?.orePreviste || { ore: 0 },
      },
    }));

    // Update using the backend API instead of Firestore
    fetch(`${url}/removehours/${commessa.commessa}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        method: "cablaggio",
        id: index,
        progression: percentageWorked,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (!data.success) {
          throw new Error(data.message || "Failed to remove row");
        } else {
          toast.success("Riga rimossa con successo");
          setTaskToBeRemoved(undefined);
        }
      })
      .catch(() => {
        toast.error("Errore durante la rimozione della riga");
      });
  };
  //#endregion

  const handleUpdateCommessaESA = async (
    newUbicazione: string,
    codCommessa: string
  ) => {
    await axios
      .post(
        `${url.toString()}update-commessa`,
        {
          codCommessa: codCommessa,
          newUbicazione: newUbicazione,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then((response) => {
        if (response.data.length === 0) {
          toast.error("Commessa non trovata");
        } else {
          toast.success("Commessa trovata");
        }
      })
      .catch(() => {
        toast.error("Error checking commessa");
      });
  };

  //#region Save Commessa Planned Hours and Technicians Assignment
  const handleSubmitInfo = async () => {
    // Update the record state

    const updatedStatusHistory = [
      ...(statushistory && statushistory.length > 0
        ? statushistory.map((entry, index) => {
            if (index === statushistory.length - 1) {
              return {
                ...entry,
                endtimestamp: new Date().toISOString(),
              };
            }
            return entry;
          })
        : statushistory || []),
      {
        stato: stato,
        fromtimestamp: new Date().toISOString(),
        endtimestamp: null,
      },
    ];

    const updatedRecord = {
      ...record,
      capoCommessa: capoCommessa,
      cablaggio: {
        ...record.cablaggio,
        orePreviste: {
          potenza: orePrevistePotenza,
          ausiliari: orePrevisteAusiliari,
        },
      },
      montaggio: {
        ...record.montaggio,
        orePreviste: {
          ore: orePrevisteMontaggio,
        },
      },
      stato: stato,
      ...(stato === 99 && { fineLav: new Date().toISOString() }),
      tecniciassegnati: tecniciAssegnatiCommessa,
      statushistory: updatedStatusHistory,
    };
    setStatushistory(updatedStatusHistory);
    setRecord((prevRecord: any) => ({
      ...prevRecord,
      capoCommessa: updatedRecord.capoCommessa,
      cablaggio: {
        ...prevRecord.cablaggio,
        orePreviste: updatedRecord.cablaggio.orePreviste,
      },
      montaggio: {
        ...prevRecord.montaggio,
        orePreviste: updatedRecord.montaggio.orePreviste,
      },
    }));

    // Calculate expected hours for progression
    const expectedHours =
      (updatedRecord.montaggio?.orePreviste?.ore || 0) +
      (updatedRecord.cablaggio?.orePreviste?.ausiliari || 0) +
      (updatedRecord.cablaggio?.orePreviste?.potenza || 0);

    // Calculate worked hours
    const workedHoursCablaggio =
      updatedRecord.cablaggio?.oreLav?.reduce(
        (total: number, item: any) => total + item.oreLav,
        0
      ) || 0;
    const workedHoursMontaggio =
      updatedRecord.montaggio?.oreLav?.reduce(
        (total: number, item: any) => total + item.oreLav,
        0
      ) || 0;

    const totalWorkedHours = workedHoursCablaggio + workedHoursMontaggio;
    const percentageWorked =
      expectedHours > 0 ? (totalWorkedHours / expectedHours) * 100 : 0;

    // Add progression to the updated record
    (updatedRecord as any).progression = percentageWorked;

    setTimeout(() => {
      // console(updatedRecord);
      // Use the backend API instead of Firestore
      fetch(`${url}/updatecommessa/${commessa.commessa}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedRecord),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            toast.success("Salvato con successo");
          } else {
            throw new Error(data.message || "Failed to save");
          }
          setLoadingSubmit(false);
        })
        .catch(() => {
          toast.error("Errore durante il salvataggio");
          setLoadingSubmit(false);
        });
    }, 1000);
    if (stato === 99) {
      let newUbicazione = "Pronto per spedizione";
      if (newUbicazione.length < 30) {
        handleUpdateCommessaESA(newUbicazione, commessa.commessa);
      } else {
        toast.error("Lunghezza della ubicazione troppo lunga");
      }
      let updateObj = {
        status: 33,
        shelf: [newUbicazione],
      };

      try {
        // Create a query to find matching documents
        const recordsRef = collection(firestore, "records");
        const q = query(
          recordsRef,
          where("status", "==", 20),
          where("commessa", "==", commessa.commessa)
        );

        // Fetch documents matching the query
        const querySnapshot = await getDocs(q);
        // console(querySnapshot);
        // Initialize a batch for updates
        const batch = writeBatch(firestore);

        querySnapshot.forEach((docSnapshot) => {
          const docRef = doc(firestore, "records", docSnapshot.id);
          batch.update(docRef, updateObj);
        });

        // Commit the batch
        await batch.commit();
        // console("All matching records updated successfully!");
      } catch (error) {
        console.error("Error updating records:", error);
      }
    }
  };
  const handleSave = async () => {
    setLoadingSubmit(true);
    await handleSubmitInfo();
  };
  const handleAddTecnicoToCommessa = (tecnico: string) => {
    if (!tecniciAssegnatiCommessa.includes(tecnico)) {
      const arrayTecniciAssegnati = [...tecniciAssegnatiCommessa];
      arrayTecniciAssegnati.push(tecnico);
      setTecniciAssegnatiCommessa(arrayTecniciAssegnati);

      // Only update the technicians array, not the entire record
      fetch(`${url}/updatecommessa/${commessa.commessa}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tecniciassegnati: arrayTecniciAssegnati,
        }),
      }).catch(() => {
        toast.error("Errore durante il salvataggio dei tecnici");
      });
    } else {
      toast.error("Tecnico già aggiunto");
    }
    //setTecnicoSelected("");
  };

  const handleRemoveTecnicoFromCommessa = (tecnico: string) => {
    const tecnici = [...tecniciAssegnatiCommessa];
    const updatedTecnici = tecnici.filter(
      (tecnicoAssegnato: string) => tecnicoAssegnato !== tecnico
    );

    setTecniciAssegnatiCommessa(updatedTecnici);
    fetch(`${url}/updatecommessa/${commessa.commessa}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tecniciassegnati: updatedTecnici,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          toast.success("Tecnico rimosso con successo");
          // Update record with the updated technicians
          setRecord((prevRecord) => ({
            ...prevRecord,
            tecniciassegnati: updatedTecnici,
          }));
        }
      })
      .catch(() => {
        toast.error("Errore durante il salvataggio dei tecnici");
      });
  };
  //#endregion

  //#region Functions to save new Hours
  const handleSubmit = async (e: any, method: string) => {
    e.preventDefault();
    if (
      (method === "montaggio" &&
        tecnicoMontaggioNew !== "" &&
        tasksMontaggioNew !== "") ||
      (method === "cablaggio" &&
        tecnicoCableggioNew !== "" &&
        taskCableggioNew !== "")
    ) {
      const newOreLavEntry = {
        tecnico:
          method === "montaggio" ? tecnicoMontaggioNew : tecnicoCableggioNew,
        task: method === "montaggio" ? tasksMontaggioNew : taskCableggioNew,
        oreLav: method === "montaggio" ? oreMontaggioNew : oreCableggioNew,
        timestamp:
          method === "montaggio"
            ? new Date(dataMontaggioNew).toISOString()
            : new Date(dataCableggioNew).toISOString(),
        note: method === "montaggio" ? notesMontaggioNew : noteCableggioNew,
      };

      // Calculate progression for the update
      const localRecord = {
        ...record,
        [method]: {
          ...record[method as keyof RecordType],
          oreLav: [
            ...((record[method as keyof RecordType] as any)?.oreLav || []),
            newOreLavEntry,
          ],
        },
      };

      // Extract root records for cablaggio and montaggio
      const rootRecordCablaggio = localRecord.cablaggio;
      const rootRecordMontaggio = localRecord.montaggio;

      // Calculate expected hours
      const expectedHours =
        (rootRecordMontaggio?.orePreviste?.ore || 0) +
        (rootRecordCablaggio?.orePreviste?.ausiliari || 0) +
        (rootRecordCablaggio?.orePreviste?.potenza || 0);

      // Calculate worked hours
      const workedHoursCablaggio = rootRecordCablaggio?.oreLav.reduce(
        (total: number, item: any) => total + item.oreLav,
        0
      );
      const workedHoursMontaggio = rootRecordMontaggio?.oreLav.reduce(
        (total: number, item: any) => total + item.oreLav,
        0
      );

      const totalWorkedHours =
        (workedHoursCablaggio || 0) + (workedHoursMontaggio || 0);
      const percentageWorked =
        expectedHours > 0 ? (totalWorkedHours / expectedHours) * 100 : 0;

      // Use the backend API instead of Firestore
      try {
        const response = await fetch(
          `${url}/updatehours/${commessa.commessa}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              method: method,
              newEntry: newOreLavEntry,
              progression: percentageWorked,
            }),
          }
        );

        const data = await response.json();
        if (data.success) {
          setRecord((prevRecord) => ({
            ...prevRecord,
            [method]: {
              ...prevRecord[method as keyof RecordType],
              oreLav: [
                ...((prevRecord[method as keyof RecordType] as any)?.oreLav ||
                  []),
                newOreLavEntry,
              ],
            },
          }));

          // Reset form fields
          if (method !== "montaggio") {
            setTecnicoCableggioNew("");
            setTaskCableggioNew("");
            setOreCableggioNew(0.5);
            setDataCableggioNew(new Date());
            setNoteCableggioNew("");
          } else {
            setTecnicoMontaggioNew("");
            setTasksMontaggioNew("");
            setOreMontaggioNew(0.5);
            setDataMontaggioNew(new Date());
            setNotesMontaggioNew("");
          }
          toast.success("Ora aggiunta con successo");
        } else {
          throw new Error(data.message || "Failed to add hours");
        }
      } catch (error) {
        toast.error("Errore durante l'aggiunta dell'ora");
      }
    } else {
      toast.error("Non hai selezionato tutti i campi necessari");
    }
  };
  //#endregion

  //#region Date displaying and formatting
  const formatDateForDisplay = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${day}/${month}/${year}`;
  };
  //#endregion

  //#region Save Edit Data and open Modify Modal
  const handleEditRow = (item: number, method: string) => {
    setTecniciEdit(undefined);
    setTasksEdit(undefined);
    setOreEdit(undefined);
    setNotesEdit(undefined);
    setDataEdit(undefined);
    setRowToBeModified(item);
    setMethodToBeModified(method);
    setIsOpenModify(true);
  };
  const handleSaveEditedRow = async () => {
    if (
      rowToBeModified !== null &&
      rowToBeModified !== undefined &&
      methodToBeModified !== null
    ) {
      const method = methodToBeModified as keyof RecordType;
      const updatedRecord = {
        ...record,
        [method]: {
          ...record[method],
          oreLav: record[method]?.oreLav.map((item: any) => {
            if (item.id === rowToBeModified.id) {
              //// console(tecniciEdit, tasksEdit, oreEdit, notesEdit, dataEdit);
              //// console(item.tecnico, item.task, item.oreLav, item.note, item.timestamp);
              return {
                ...item,
                tecnico: tecniciEdit || item.tecnico,
                task: tasksEdit || item.task,
                oreLav: oreEdit || item.oreLav,
                note: notesEdit || item.note || "",
                timestamp: dataEdit ? dataEdit.toISOString() : item.timestamp,
                id: item.id,
              };
            }
            return item;
          }),
        },
      };
      //console.log(updatedRecord);
      setRecord(updatedRecord);

      // Calculate expected hours
      const expectedHours =
        (record.montaggio?.orePreviste?.ore || 0) +
        (record.cablaggio?.orePreviste?.ausiliari || 0) +
        (record.cablaggio?.orePreviste?.potenza || 0);

      // Calculate worked hours
      const workedHoursCablaggio = updatedRecord.cablaggio?.oreLav.reduce(
        (total: number, item: any) => total + item.oreLav,
        0
      );
      const workedHoursMontaggio = updatedRecord.montaggio?.oreLav.reduce(
        (total: number, item: any) => total + item.oreLav,
        0
      );

      const totalWorkedHours =
        (workedHoursCablaggio || 0) + (workedHoursMontaggio || 0);
      const percentageWorked =
        expectedHours > 0 ? (totalWorkedHours / expectedHours) * 100 : 0;

      // Update using the backend API instead of Firestore
      fetch(`${url}/updateeditedrow/${commessa.commessa}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          method: method,
          updatedData: updatedRecord[method]?.oreLav,
          progression: percentageWorked,
          rowId: rowToBeModified.id,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            setRecord(updatedRecord);
            toast.success("Riga modificata con successo");
          } else {
            throw new Error(data.message || "Failed to update row");
          }
        })
        .catch(() => {
          toast.error("Errore durante il salvataggio");
        });

      setIsOpenModify(false);
    }
  };
  //#endregion

  //#region Main Return
  return (
    <>
      {loading ? (
        <div style={{ textAlign: "center", padding: "20px" }}>
          <Spin size="large" />
        </div>
      ) : (
        <>
          <Space direction="vertical" style={{ width: "100%" }} size="large">
            <Card
              title={<Title level={4}>Assegnazione Commessa</Title>}
              style={{ marginBottom: "20px" }}
            >
              <Row gutter={[24, 24]}>
                <Col span={12}>
                  <GeneralAssigmentFields
                    user={user}
                    tecnici={tecnici}
                    capoCommessa={capoCommessa}
                    setCapoCommessa={setCapoCommessa}
                    orePrevistePotenza={orePrevistePotenza}
                    setOrePrevistePotenza={setOrePrevistePotenza}
                    orePrevisteAusiliari={orePrevisteAusiliari}
                    setOrePrevisteAusiliari={setOrePrevisteAusiliari}
                    orePrevisteMontaggio={orePrevisteMontaggio}
                    setOrePrevisteMontaggio={setOrePrevisteMontaggio}
                    stato={stato}
                    setStato={setStato}
                  />
                </Col>
                <Col span={12}>
                  <TechniciansSelector
                    tecnici={tecnici}
                    tecniciAssegnatiCommessa={tecniciAssegnatiCommessa}
                    record={record}
                    handleAddTecnicoToCommessa={handleAddTecnicoToCommessa}
                    handleRemoveTecnicoFromCommessa={
                      handleRemoveTecnicoFromCommessa
                    }
                  />
                </Col>
              </Row>
              <Space
                style={{
                  width: "100%",
                  justifyContent: "center",
                  marginTop: 24,
                }}
                size="large"
              >
                {loadingSubmit ? (
                  <Spin />
                ) : (
                  <Button onClick={handleSave}>Salva</Button>
                )}
              </Space>
            </Card>
          </Space>

          <Row gutter={[24, 24]}>
            <Col span={12}>
              <div style={{ position: "relative", marginBottom: 24 }}>
                <Title
                  level={4}
                  style={{
                    position: "absolute",
                    left: "50%",
                    transform: "translateX(-50%)",
                  }}
                >
                  Montaggio -{" "}
                  {record.montaggio?.oreLav.reduce(
                    (total, item) => total + item.oreLav,
                    0
                  )}
                  h
                </Title>
                <Button
                  style={{ position: "absolute", right: 0 }}
                  onClick={() => {
                    setAddHourMontaggio(!addHourMontaggio);
                    setTasksMontaggioNew("");
                    setTecnicoMontaggioNew("");
                    setOreMontaggioNew(0.5);
                    setDataMontaggioNew(new Date());
                    setNotesMontaggioNew("");
                  }}
                >
                  {addHourMontaggio ? "Chiudi" : "Aggiungi ora"}
                </Button>
              </div>
              <TotalizerMontaggio record={record} />
              <FilterMontaggio
                filterMontaggioTecnico={filterMontaggioTecnico}
                setFilterMontaggioTecnico={setFilterMontaggioTecnico}
                filterMontaggioLavorazione={filterMontaggioLavorazione}
                setFilterMontaggioLavorazione={setFilterMontaggioLavorazione}
                filterMontaggioDate={filterMontaggioDate}
                clearMontaggioFilters={clearMontaggioFilters}
                record={record}
                setFilterMontaggioDate={setFilterMontaggioDate}
              />
              <Card
                style={{
                  width: "100%",
                  minHeight: "auto",
                  maxHeight: 500,
                  overflowY: "auto",
                  textAlign: "center",
                }}
              >
                {record.montaggio !== undefined &&
                  record.montaggio.oreLav
                    .filter((item) => {
                      const matchesTecnico =
                        !filterMontaggioTecnico ||
                        item.tecnico === filterMontaggioTecnico;
                      const matchesLavorazione =
                        !filterMontaggioLavorazione ||
                        item.task === filterMontaggioLavorazione;
                      const matchesDate =
                        !filterMontaggioDate ||
                        new Date(item.timestamp).toISOString().split("T")[0] ===
                          filterMontaggioDate;
                      return (
                        matchesTecnico && matchesLavorazione && matchesDate
                      );
                    })
                    .sort((a: any, b: any) => {
                      // Convert timestamps to Date objects for comparison
                      const dateA: any = new Date(a.timestamp);
                      const dateB: any = new Date(b.timestamp);
                      return dateB - dateA; // Sort in ascending order by date
                    })
                    .map((item: any) => (
                      <Card
                        key={item.id}
                        style={{
                          marginBottom: 8,
                          width: "100%",
                        }}
                      >
                        <Row
                          align="middle"
                          justify="space-between"
                          style={{ width: "100%" }}
                        >
                          <Col span={5}>
                            <Typography.Text
                              style={{
                                marginLeft: 8,
                                display: "block",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {item.tecnico}
                            </Typography.Text>
                          </Col>
                          <Col span={7}>
                            <Typography.Text
                              style={{
                                display: "block",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {(() => {
                                const found = Lavorazioni.find(
                                  (lav) => lav.code === item.task
                                );
                                return found
                                  ? `${item.task} - ${found.desc}`
                                  : item.task;
                              })()}
                            </Typography.Text>
                          </Col>
                          <Col span={3} style={{ textAlign: "center" }}>
                            <Typography.Text>{item.oreLav}</Typography.Text>
                          </Col>
                          <Col span={4} style={{ textAlign: "center" }}>
                            <Typography.Text>
                              {formatDateForDisplay(new Date(item.timestamp))}
                            </Typography.Text>
                          </Col>
                          <Col span={5} style={{ textAlign: "right" }}>
                            <Space>
                              <Popover
                                content={
                                  <div style={{ padding: 16, maxWidth: 300 }}>
                                    {item.note}
                                  </div>
                                }
                                trigger="click"
                              >
                                <Button
                                  size="small"
                                  disabled={item.note.trim() === ""}
                                >
                                  ...
                                </Button>
                              </Popover>
                              <Button
                                size="small"
                                onClick={() => {
                                  handleEditRow(item, "montaggio");
                                }}
                                icon={<EditOutlined />}
                              />
                              <Button
                                size="small"
                                type="primary"
                                danger
                                icon={<CloseOutlined />}
                                onClick={() => {
                                  // console(item);
                                  setTaskToBeRemoved(item);
                                  setIsOpenRemoveMontaggio(true);
                                }}
                              />
                            </Space>
                          </Col>

                          {taskToBeRemoved && (
                            <Modal
                              title="Conferma Rimozione"
                              open={isOpenRemoveMontaggio}
                              onCancel={() => setIsOpenRemoveMontaggio(false)}
                              footer={[
                                <Button
                                  key="cancel"
                                  onClick={() =>
                                    setIsOpenRemoveMontaggio(false)
                                  }
                                >
                                  Annulla
                                </Button>,
                                <Button
                                  key="remove"
                                  type="primary"
                                  danger
                                  onClick={() => {
                                    handleRemoveMontaggioRow(
                                      taskToBeRemoved.id
                                    );
                                    setIsOpenRemoveMontaggio(false);
                                  }}
                                >
                                  Rimuovi
                                </Button>,
                              ]}
                            >
                              <p>Sei sicuro di voler rimuovere:</p>
                              <Card style={{ marginTop: 12, marginBottom: 12 }}>
                                <Row align="middle" justify="space-between">
                                  <Col span={6}>
                                    <Typography.Text>
                                      {taskToBeRemoved.tecnico}
                                    </Typography.Text>
                                  </Col>
                                  <Col span={8}>
                                    <Typography.Text>
                                      {taskToBeRemoved.task}
                                    </Typography.Text>
                                  </Col>
                                  <Col span={4} style={{ textAlign: "center" }}>
                                    <Typography.Text>
                                      {taskToBeRemoved.oreLav}
                                    </Typography.Text>
                                  </Col>
                                  <Col span={6} style={{ textAlign: "right" }}>
                                    <Typography.Text>
                                      {formatDateForDisplay(
                                        new Date(taskToBeRemoved.timestamp)
                                      )}
                                    </Typography.Text>
                                  </Col>
                                </Row>
                              </Card>
                              <p>
                                L'opzione selezionata verrà rimossa
                                definitivamente.
                              </p>
                            </Modal>
                          )}
                        </Row>
                      </Card>
                    ))}
              </Card>
              {addHourMontaggio && (
                <AddMontaggioHours
                  handleSubmit={(e) => handleSubmit(e, "montaggio")}
                  dataMontaggioNew={dataMontaggioNew}
                  setDataMontaggioNew={setDataMontaggioNew}
                  tecniciAssegnatiCommessa={tecniciAssegnatiCommessa}
                  setTecnicoMontaggioNew={setTecnicoMontaggioNew}
                  setTasksMontaggioNew={setTasksMontaggioNew}
                  setOreMontaggioNew={setOreMontaggioNew}
                  setNoteMontaggioNew={setNotesMontaggioNew}
                  tecnicoMontaggioNew={tecnicoMontaggioNew}
                  tasksMontaggioNew={tasksMontaggioNew}
                  oreMontaggioNew={oreMontaggioNew}
                  noteMontaggioNew={notesMontaggioNew}
                />
              )}
            </Col>
            <Col span={12}>
              <div style={{ position: "relative", marginBottom: 24 }}>
                <Title
                  level={4}
                  style={{
                    position: "absolute",
                    left: "50%",
                    transform: "translateX(-50%)",
                  }}
                >
                  Cablaggio -{" "}
                  {record.cablaggio?.oreLav.reduce(
                    (total, item) => total + item.oreLav,
                    0
                  )}
                  h
                </Title>
                <Button
                  style={{ position: "absolute", right: 0 }}
                  onClick={() => {
                    setAddHourCablaggio(!addHourCablaggio);
                    setTaskCableggioNew("");
                    setTecnicoCableggioNew("");
                    setOreCableggioNew(0.5);
                    setDataCableggioNew(new Date());
                    setNoteCableggioNew("");
                  }}
                >
                  {addHourCablaggio ? "Chiudi" : "Aggiungi ora"}
                </Button>
              </div>
              <TotalizerCablaggio record={record} />
              <FilterCablaggio
                filterCablaggioTecnico={filterCablaggioTecnico}
                setFilterCablaggioTecnico={setFilterCablaggioTecnico}
                filterCablaggioLavorazione={filterCablaggioLavorazione}
                setFilterCablaggioLavorazione={setFilterCablaggioLavorazione}
                filterCablaggioDate={filterCablaggioDate}
                clearCablaggioFilters={clearCablaggioFilters}
                record={record}
                setFilterCablaggioDate={setFilterCablaggioDate}
              />
              <Card
                style={{
                  width: "100%",
                  minHeight: "auto",
                  maxHeight: 500,
                  overflowY: "auto",
                  textAlign: "center",
                }}
              >
                {record.cablaggio !== undefined &&
                  record.cablaggio.oreLav
                    .filter((item) => {
                      const matchesTecnico =
                        !filterCablaggioTecnico ||
                        item.tecnico === filterCablaggioTecnico;
                      const matchesLavorazione =
                        !filterCablaggioLavorazione ||
                        item.task === filterCablaggioLavorazione;
                      const matchesDate =
                        !filterCablaggioDate ||
                        new Date(item.timestamp).toISOString().split("T")[0] ===
                          filterCablaggioDate;
                      return (
                        matchesTecnico && matchesLavorazione && matchesDate
                      );
                    })
                    .sort((a: any, b: any) => {
                      // Convert timestamps to Date objects for comparison
                      const dateA: any = new Date(a.timestamp);
                      const dateB: any = new Date(b.timestamp);
                      return dateB - dateA; // Sort in ascending order by date
                    })
                    .map((item: any) => (
                      <Card
                        key={item.id}
                        style={{
                          marginBottom: 8,
                          width: "100%",
                        }}
                      >
                        <Row
                          align="middle"
                          justify="space-between"
                          style={{ width: "100%" }}
                        >
                          <Col span={5}>
                            <Typography.Text
                              style={{
                                marginLeft: 8,
                                display: "block",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {item.tecnico}
                            </Typography.Text>
                          </Col>
                          <Col span={7}>
                            <Typography.Text
                              style={{
                                display: "block",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {(() => {
                                const found = Lavorazioni.find(
                                  (lav) => lav.code === item.task
                                );
                                return found
                                  ? `${item.task} - ${found.desc}`
                                  : item.task;
                              })()}
                            </Typography.Text>
                          </Col>
                          <Col span={3} style={{ textAlign: "center" }}>
                            <Typography.Text>{item.oreLav}</Typography.Text>
                          </Col>
                          <Col span={4} style={{ textAlign: "center" }}>
                            <Typography.Text>
                              {formatDateForDisplay(new Date(item.timestamp))}
                            </Typography.Text>
                          </Col>
                          <Col span={5} style={{ textAlign: "right" }}>
                            <Space>
                              <Popover
                                content={
                                  <div style={{ padding: 16, maxWidth: 300 }}>
                                    {item.note}
                                  </div>
                                }
                                trigger="click"
                              >
                                <Button
                                  size="small"
                                  disabled={item.note.trim() === ""}
                                >
                                  ...
                                </Button>
                              </Popover>
                              <Button
                                size="small"
                                onClick={() => {
                                  handleEditRow(item, "cablaggio");
                                }}
                                icon={<EditOutlined />}
                              />
                              <Button
                                size="small"
                                type="primary"
                                danger
                                icon={<CloseOutlined />}
                                onClick={() => {
                                  // console(item);
                                  setTaskToBeRemoved(item);
                                  setIsOpenRemoveCablaggio(true);
                                }}
                              />
                            </Space>
                          </Col>

                          {taskToBeRemoved && (
                            <Modal
                              title="Conferma Rimozione"
                              open={isOpenRemoveCablaggio}
                              onCancel={() => setIsOpenRemoveCablaggio(false)}
                              footer={[
                                <Button
                                  key="cancel"
                                  onClick={() =>
                                    setIsOpenRemoveCablaggio(false)
                                  }
                                >
                                  Annulla
                                </Button>,
                                <Button
                                  key="remove"
                                  type="primary"
                                  danger
                                  onClick={() => {
                                    handleRemoveCablaggioRow(
                                      taskToBeRemoved.id
                                    );
                                    setIsOpenRemoveCablaggio(false);
                                  }}
                                >
                                  Rimuovi
                                </Button>,
                              ]}
                            >
                              <p>Sei sicuro di voler rimuovere:</p>
                              <Card style={{ marginTop: 12, marginBottom: 12 }}>
                                <Row align="middle" justify="space-between">
                                  <Col span={6}>
                                    <Typography.Text>
                                      {taskToBeRemoved.tecnico}
                                    </Typography.Text>
                                  </Col>
                                  <Col span={8}>
                                    <Typography.Text>
                                      {taskToBeRemoved.task}
                                    </Typography.Text>
                                  </Col>
                                  <Col span={4} style={{ textAlign: "center" }}>
                                    <Typography.Text>
                                      {taskToBeRemoved.oreLav}
                                    </Typography.Text>
                                  </Col>
                                  <Col span={6} style={{ textAlign: "right" }}>
                                    <Typography.Text>
                                      {formatDateForDisplay(
                                        new Date(taskToBeRemoved.timestamp)
                                      )}
                                    </Typography.Text>
                                  </Col>
                                </Row>
                              </Card>
                              <p>
                                L'opzione selezionata verrà rimossa
                                definitivamente.
                              </p>
                            </Modal>
                          )}
                        </Row>
                      </Card>
                    ))}
              </Card>
              {addHourCablaggio && (
                <AddCablaggioHours
                  handleSubmit={(e) => handleSubmit(e, "cablaggio")}
                  dataCablaggioNew={dataCableggioNew}
                  setDataCablaggioNew={setDataCableggioNew}
                  tecniciAssegnatiCommessa={tecniciAssegnatiCommessa}
                  setTecnicoCablaggioNew={setTecnicoCableggioNew}
                  setTasksCablaggioNew={setTaskCableggioNew}
                  setOreCablaggioNew={setOreCableggioNew}
                  setNoteCableggioNew={setNoteCableggioNew}
                  tecnicoCableggioNew={tecnicoCableggioNew}
                  tasksCablaggioNew={taskCableggioNew}
                  oreCablaggioNew={oreCableggioNew}
                  noteCableggioNew={noteCableggioNew}
                />
              )}
            </Col>
          </Row>
          <ModalModify
            isOpenModify={isOpenModify}
            onCloseModify={setIsOpenModify}
            rowToBeModified={rowToBeModified}
            tecniciAssegnatiCommessa={tecniciAssegnatiCommessa}
            tecniciEdit={tecniciEdit || ""}
            setTecniciEdit={setTecniciEdit}
            tasksEdit={tasksEdit || ""}
            setTasksEdit={setTasksEdit}
            oreEdit={oreEdit as any}
            setOreEdit={setOreEdit}
            dataEdit={dataEdit as any}
            setDataEdit={setDataEdit}
            notesEdit={notesEdit || ""}
            setNotesEdit={setNotesEdit}
            handleSaveEditedRow={handleSaveEditedRow}
            methodToBeModified={methodToBeModified}
          />
        </>
      )}
    </>
  );
  //#endregion
};

export default AssignCommessa;
