import { useEffect, useState } from "react";
import { Modal, Button, Select, Typography, Space } from "antd";
import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { firestore } from "../../provider/firebase";
import { useCustomToast } from "../Subcomponents/Comp_Toast";
import axios from "axios";

type ItemId = {
  commessa: string;
  status: string;
  test: any[];
  shelfOld: string;
  shelfNew: string;
  id: string;
};

interface MovedPlaceConfirmationDialogProps {
  item: ItemId;
  onClose: () => void;
  isOpen: boolean;
}

function MovedPlaceConfirmationDialog({
  item,
  isOpen,
  onClose,
}: MovedPlaceConfirmationDialogProps) {
  // const navigate = useNavigate();

  const { showErrorToast, showSuccessToast } = useCustomToast();
  const [shelfStatusOld, setShelfStatusOld] = useState<string>(item.status);
  const [shelfStatusNew, setShelfStatusNew] = useState<string>(item.status);
  const [loadingButton, setLoadingButton] = useState(false);
  const [_esaUbicazione, setEsaUbicazione] = useState<string>("");

  async function handleConfirmation() {
    // Your logic to handle the confirmation
    // For example, deleting a record
    setLoadingButton(true);
    //console.log(shelfStatusNew);
    if (
      !shelfStatusNew ||
      !shelfStatusOld ||
      (item.commessa != "" && shelfStatusNew == "1")
    ) {
      showErrorToast("Per favore seleziona lo stato.");
      setLoadingButton(false);
      return;
    }

    const ubicazioneEsa = await handleCheckCommessaESA();

    //console.log(ubicazioneEsa);
    let newUbicazione = ubicazioneEsa.replace(item.shelfOld, item.shelfNew);
    if (newUbicazione.length < 30) {
      handleUpdateCommessaESA(newUbicazione);
    } else {
      showErrorToast("Lunghezza della ubicazione troppo lunga");
    }

    try {
      if (item.id != "") {
        const docRef = doc(firestore, "records", item.id);

        // Fetch the current document
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          const currentShelf = data.shelf || [];

          // Replace old value with new value
          const updatedShelf = currentShelf.map((shelfItem: string) =>
            shelfItem === item.shelfOld ? item.shelfNew : shelfItem
          );

          // Update the document with the new array
          await updateDoc(docRef, {
            shelf: updatedShelf,
            shelfHistory: arrayUnion(item.shelfNew),
            //status: 1
          });
        } else {
          // console("No such document!");
        }
      }

      const shelfStatusCollection = collection(firestore, "shelfStatus");
      const fetchedShelfStatus = await getDocs(shelfStatusCollection);
      //console.log(fetchedShelfStatus.docs.map(doc => doc.data()))
      for (const docSnapshot of fetchedShelfStatus.docs) {
        const docRef = doc(firestore, "shelfStatus", docSnapshot.id);
        await updateDoc(docRef, {
          [item.shelfOld]: shelfStatusOld,
          [item.shelfNew]: shelfStatusNew,
        });
      }

      //await deleteDoc(doc(collection(firestore, 'records'), itemId));
      showSuccessToast(`Posizione aggiornata correttamente`);
      //console.log('Posizione aggiornata correttamente');
      setLoadingButton(false);
      setShelfStatusOld("");
      setShelfStatusNew("");
    } catch (error) {
      showErrorToast("Errore posizione: " + error);
      setLoadingButton(false);
      setShelfStatusOld("");
      setShelfStatusNew("");
    }

    onClose(); // Close the modal
  }

  const handleCheckCommessaESA = async () => {
    //console.log(item.commessa);
    if (item.commessa === "") {
      //showErrorToast('Inserisci il numero della commessa.');
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

      //console.log(response.data);
      if (response.data.length === 0) {
        //showErrorToast("Commessa non trovata");
        return ""; // Return an empty string if no data found
      } else {
        //showSuccessToast("Commessa trovata");
        if (
          response.data[0].des_campo_libero42 === "" ||
          response.data[0].des_campo_libero42 === null
        ) {
          setEsaUbicazione("");
          return ""; // Return an empty string if the specific field is empty or null
        } else {
          setEsaUbicazione(response.data[0].des_campo_libero42);
          return response.data[0].des_campo_libero42; // Return the desired string
        }
      }
    } catch (error) {
      console.error(error);
      showErrorToast("Error checking commessa");
      return ""; // Return an empty string in case of an error
    }
  };

  const handleUpdateCommessaESA = async (newUbicazione: string) => {
    //console.log(item.commessa);
    if (item.commessa === "") {
      //showErrorToast('Inserisci il numero della commessa.');
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
        //console.log(response.data)
        if (response.data.length === 0) {
          showErrorToast("Commessa non trovata");
        } else {
          showSuccessToast("Commessa trovata");
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
        showErrorToast("Error checking commessa");
      });
  };

  useEffect(() => {
    //console.log(item);
    if (item.status !== undefined && item.status.includes("99")) {
      const statusWithoutPrefix = item.status.slice(2); // Extracts everything after "99"
      setShelfStatusNew(statusWithoutPrefix);
    } else {
      setShelfStatusNew(item.status);
    }
  }, [item]);

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      centered
      width={600}
      title={
        <div style={{ textAlign: "center" }}>
          {item.commessa !== "" ? "Conferma locazione" : "Controllo locazione"}
        </div>
      }
    >
      <div style={{ textAlign: "center" }}>
        {item.commessa !== "" ? (
          <Typography.Text>
            Sei sicuro di voler spostare dalla locazione:
            <br /> "{item.shelfOld}" {"->"} "{item.shelfNew}"?
          </Typography.Text>
        ) : (
          <Typography.Text>
            Commesse presenti nella locazione "{item.shelfNew}":
          </Typography.Text>
        )}

        {item.commessa == "" &&
          item.test &&
          item.test.length > 0 &&
          item.test.map((testItem, index) => (
            <div key={index}>
              <Typography.Text>
                {index + 1}) {testItem.commessa} - Docs:{" "}
                {testItem.uniqueDocs.join(" / ")}
              </Typography.Text>
            </div>
          ))}

        <div style={{ marginTop: 20 }}>
          <Typography.Text>
            Qual'è lo stato della vecchia locazione?
          </Typography.Text>
          <Select
            placeholder="Inserisci uno stato..."
            value={shelfStatusOld}
            onChange={(value) => setShelfStatusOld(value)}
            style={{ width: "75%", margin: "8px auto", display: "block" }}
          >
            <Select.Option value="1">Vuoto</Select.Option>
            <Select.Option value="2">Usabile</Select.Option>
            <Select.Option value="3">Pieno</Select.Option>
          </Select>
        </div>

        <div style={{ marginTop: 20 }}>
          <Typography.Text>
            Qual'è lo stato della nuova locazione?
          </Typography.Text>
          <Select
            placeholder="Inserisci uno stato..."
            value={shelfStatusNew}
            onChange={(value) => setShelfStatusNew(value)}
            style={{ width: "75%", margin: "8px auto", display: "block" }}
          >
            {(item.commessa == "" || item.status.includes("99")) && (
              <Select.Option value="1">Vuoto</Select.Option>
            )}
            <Select.Option value="2">Usabile</Select.Option>
            <Select.Option value="3">Pieno</Select.Option>
          </Select>
        </div>

        <Space style={{ marginTop: 24 }}>
          <Button
            type="primary"
            onClick={handleConfirmation}
            loading={loadingButton}
          >
            Yes
          </Button>
          <Button onClick={onClose}>No</Button>
        </Space>
      </div>
    </Modal>
  );
}

export default MovedPlaceConfirmationDialog;
