import { useContext, useEffect, useState } from "react";
import { Modal, Button, Select, Typography, Space, Divider } from "antd";
import {
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { firestore } from "../../provider/firebase";
import axios from "axios";
import UserContext from "../../provider/userInfoProvider";
import toast from "react-hot-toast";

const { Text } = Typography;

type ItemId = {
  commessa: string;
  status: string;
  test: any[];
  shelf: string;
  id: string;
};

interface NewPlaceConfirmationDialogProps {
  item: ItemId;
  onClose: () => void;
  isOpen: boolean;
}

function NewPlaceConfirmationDialog({
  item,
  isOpen,
  onClose,
}: NewPlaceConfirmationDialogProps) {
  const { user } = useContext(UserContext);
  const [shelfStatus, setShelfStatus] = useState<string>(item.status);
  const [loadingButton, setLoadingButton] = useState(false);
  const [loadingDeleteButton, setLoadingDeleteButton] = useState(false);
  const [_esaUbicazione, setEsaUbicazione] = useState<string>("");

  async function handleConfirmation() {
    setLoadingButton(false);
    // console(shelfStatus);
    if (!shelfStatus || (item.commessa != "" && shelfStatus == "1")) {
      toast.error("Per favore seleziona lo stato.");
      setLoadingButton(false);
      return;
    }
    const ubicazioneEsa = await handleCheckCommessaESA();

    // console(ubicazioneEsa);
    let newUbicazione = ubicazioneEsa + " - " + item.shelf;
    if (ubicazioneEsa === "") {
      newUbicazione = item.shelf;
    }
    // console(newUbicazione);
    if (!ubicazioneEsa.includes(item.shelf)) {
      if (newUbicazione.length < 30) {
        handleUpdateCommessaESA(newUbicazione);
      } else {
        toast.error("Lunghezza della ubicazione troppo lunga");
      }
    }

    try {
      if (item.id != "") {
        const docRef = doc(firestore, "records", item.id);
        await updateDoc(docRef, {
          shelf: arrayUnion(item.shelf),
          shelfHistory: arrayUnion({
            shelf: item.shelf,
            timestamp: new Date().toISOString(),
            author: user?.name,
          }),
          status: 1,
        });
      }
      const shelfStatusCollection = collection(firestore, "shelfStatus");
      const fetchedShelfStatus = await getDocs(shelfStatusCollection);

      for (const docSnapshot of fetchedShelfStatus.docs) {
        const docRef = doc(firestore, "shelfStatus", docSnapshot.id);
        await updateDoc(docRef, {
          [item.shelf]: shelfStatus,
        });
      }

      toast.success(`Posizione aggiornata correttamente`);
      // console("Posizione aggiornata correttamente");
      setLoadingButton(false);
      setShelfStatus("");
    } catch (error) {
      toast.error("Errore posizione: " + error);
      setLoadingButton(false);
      setShelfStatus("");
    }

    onClose();
  }

  const handleCheckCommessaESA = async () => {
    // console(item.commessa);
    if (item.commessa === "") {
      return "";
    }
    const url = new URL(window.location.origin);
    url.port = import.meta.env.VITE_BACKEND_PORT;
    try {
      const response = await axios.get(`${url.toString()}check-commessa`, {
        params: {
          codCommessa: item.commessa,
        },
        headers: {
          "Content-Type": "application/json",
        },
      });

      // console(response.data);
      if (response.data.length === 0) {
        return "";
      } else {
        if (
          response.data[0].des_campo_libero42 === "" ||
          response.data[0].des_campo_libero42 === null
        ) {
          setEsaUbicazione("");
          return "";
        } else {
          setEsaUbicazione(response.data[0].des_campo_libero42);
          return response.data[0].des_campo_libero42;
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Error checking commessa");
      return "";
    }
  };

  const handleUpdateCommessaESA = async (newUbicazione: string) => {
    // console(item.commessa);
    if (item.commessa === "") {
      return;
    }
    const url = new URL(window.location.origin);
    url.port = import.meta.env.VITE_BACKEND_PORT;
    await axios
      .post(
        `${url.toString()}update-commessa`,
        {
          codCommessa: item.commessa,
          newUbicazione: newUbicazione,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then((response) => {
        // console(response.data);
        if (response.data.length === 0) {
          toast.error("Commessa non trovata");
        } else {
          toast.success("Commessa trovata");
          if (
            response.data[0].des_campo_libero42 === "" ||
            response.data[0].des_campo_libero42 === null
          ) {
            setEsaUbicazione("");
          } else {
            setEsaUbicazione(response.data[0].des_campo_libero42);
          }
        }
      })
      .catch((error) => {
        console.error(error);
        toast.error("Error checking commessa");
      });
  };

  async function handleDeleteConfirmation() {
    setLoadingDeleteButton(true);
    try {
      if (item.id != "") {
        const docRef = doc(firestore, "records", item.id);
        await updateDoc(docRef, {
          shelf: arrayRemove(item.shelf),
        });
        // console(item.shelf);
        // console(shelfStatus);
        const shelfStatusCollection = collection(firestore, "shelfStatus");
        const fetchedShelfStatus = await getDocs(shelfStatusCollection);

        for (const docSnapshot of fetchedShelfStatus.docs) {
          const docRef = doc(firestore, "shelfStatus", docSnapshot.id);
          await updateDoc(docRef, {
            [item.shelf]: shelfStatus,
          });
        }

        const ubicazioneEsa = await handleCheckCommessaESA();
        // console(ubicazioneEsa);
        let newUbicazione = ubicazioneEsa.replace(item.shelf, "");
        // console(newUbicazione);
        if (!newUbicazione.includes(item.shelf)) {
          if (newUbicazione.trim().endsWith("-")) {
            newUbicazione = newUbicazione.trim().slice(0, -1);
          }
          if (newUbicazione.trim().startsWith("-")) {
            newUbicazione = newUbicazione.trim().slice(1);
          }
          if (!newUbicazione) {
            newUbicazione = "";
          }
          // console("INSIDE: " + item.shelf);
          handleUpdateCommessaESA(newUbicazione.trim());
        }

        toast.success(`Posizione cancellata correttamente`);
        setLoadingDeleteButton(false);
        setShelfStatus("");
      }
    } catch (error) {
      toast.error("Errore delete: " + error);
      setLoadingDeleteButton(false);
      setShelfStatus("");
    }
    onClose();
  }

  useEffect(() => {
    if (item.status !== undefined && item.status.includes("99")) {
      const statusWithoutPrefix = item.status.slice(2);
      setShelfStatus(statusWithoutPrefix);
    } else {
      setShelfStatus(item.status);
    }
  }, [item]);

  const modalTitle =
    item.commessa !== "" ? "Conferma locazione" : "Controllo locazione";

  const renderModalContent = () => (
    <div style={{ textAlign: "center" }}>
      {item.commessa !== "" ? (
        !item.status.includes("99") ? (
          <Text>
            Sei sicuro di voler caricare
            <br /> nella locazione: "{item.shelf}" ?
          </Text>
        ) : (
          <Text>
            La commessa {item.commessa} è già presente
            <br /> nella locazione "{item.shelf}"
          </Text>
        )
      ) : (
        <Text>Commesse presenti nella locazione "{item.shelf}":</Text>
      )}

      {item.commessa === "" &&
        item.test &&
        item.test.length > 0 &&
        item.test.map((testItem, index) => (
          <Text key={index} style={{ display: "block", margin: "4px 0" }}>
            {index + 1}) {testItem.commessa} - Docs:{" "}
            {testItem.uniqueDocs.join(" / ")}
          </Text>
        ))}

      <Divider style={{ margin: "12px 0" }} />

      <Text style={{ display: "block", marginTop: 16 }}>
        {item.status.includes("99")
          ? "Lo stato attuale della locazione è"
          : "Qual'è lo stato attuale della locazione?"}
      </Text>

      <Select
        placeholder="Inserisci uno stato..."
        value={shelfStatus}
        onChange={(value) => setShelfStatus(value)}
        style={{
          width: "75%",
          margin: "8px auto",
          textAlign: "center",
        }}
      >
        {(item.commessa === "" || item.status.includes("99")) && (
          <Select.Option value="1">Vuoto</Select.Option>
        )}
        <Select.Option value="2">Usabile</Select.Option>
        <Select.Option value="3">Pieno</Select.Option>
      </Select>
    </div>
  );

  const renderFooter = () => (
    <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
      <Space>
        <Button
          type="primary"
          onClick={handleConfirmation}
          loading={loadingButton}
        >
          Yes
        </Button>
        <Button onClick={onClose}>No</Button>
        {item.status.includes("99") && (
          <Button
            danger
            onClick={handleDeleteConfirmation}
            loading={loadingDeleteButton}
          >
            Cancella
          </Button>
        )}
      </Space>
    </div>
  );

  return (
    <Modal
      title={modalTitle}
      open={isOpen}
      onCancel={onClose}
      footer={renderFooter()}
      centered
      width={500}
    >
      {renderModalContent()}
    </Modal>
  );
}

export default NewPlaceConfirmationDialog;
