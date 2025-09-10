import { useContext, useEffect, useState } from "react";
import { Modal, Button, Typography, Space } from "antd";
import {
  arrayUnion,
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { firestore } from "../../provider/firebase";
import toast from "react-hot-toast";
import axios from "axios";
import UserContext from "../../provider/userInfoProvider";

const { Text } = Typography;

type ItemId = {
  commessa: string;
  test: any[];
  shelf: string;
  id: string;
};

interface NewPlaceConfirmationDialogProps {
  item: ItemId;
  onClose: () => void;
  isOpen: boolean;
}

function NewPlaceConfirmationDialogOfficina({
  item,
  isOpen,
  onClose,
}: NewPlaceConfirmationDialogProps) {
  const { user } = useContext(UserContext);
  const [loadingButton, setLoadingButton] = useState(false);
  const [_esaUbicazione, setEsaUbicazione] = useState<string>("");
  const [ubicazione, setUbicazione] = useState("");
  const url = import.meta.env.VITE_BACKEND_URL;

  async function handleConfirmation() {
    setLoadingButton(true);

    let newUbicazione = item.shelf;
    // console(newUbicazione);

    handleUpdateCommessaESA(newUbicazione);

    try {
      // console(item);
      if (item.commessa != "") {
        // Query for documents where commessa field matches the parameter
        const recordsCollection = collection(firestore, "records");
        const q = query(
          recordsCollection,
          where("commessa", "==", item.commessa)
        );

        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          // Get the first matching document
          const docSnapshot = querySnapshot.docs[0];
          const docRef = doc(firestore, "records", docSnapshot.id);

          await updateDoc(docRef, {
            shelf: [item.shelf],
            shelfHistory: arrayUnion({
              shelf: item.shelf,
              timestamp: new Date().toISOString(),
              author: user?.name,
            }),
          });
        }
      }
      toast.success(`Posizione aggiornata correttamente`);
      // console("Posizione aggiornata correttamente");
      setLoadingButton(false);
    } catch (error) {
      toast.error("Errore posizione: " + error);
      setLoadingButton(false);
    }

    onClose();
  }

  const handleUpdateCommessaESA = async (newUbicazione: string) => {
    // console(item.commessa);
    if (item.commessa === "") {
      return;
    }
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
          toast.error("ESA - Commessa non trovata");
        } else {
          toast.success("ESA - Commessa trovata");
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

  useEffect(() => {
    // console(item.shelf.replace("Officina.", ""));
    switch (item.shelf.replace("Officina.", "")) {
      case "inCommesse":
        setUbicazione("Officina - Commesse da lavorare");
        break;
      case "cablaggioA":
        setUbicazione("Officina - Cablaggio A");
        break;
      case "cablaggioB":
        setUbicazione("Officina - Cablaggio B");
        break;
      case "collaudoC":
        setUbicazione("Officina - Collaudo C");
        break;
      case "collaudoD":
        setUbicazione("Officina - Collaudo D");
        break;
      case "collaudoE":
        setUbicazione("Officina - Collaudo E");
        break;
      case "fissaggio":
        setUbicazione("Officina - Fissaggio");
        break;
      case "outCommesse":
        setUbicazione("Officina - Commesse finite");
        break;
      default:
        setUbicazione("Officina - Faulted commessa");
        break;
    }
  }, [item]);

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
      </Space>
    </div>
  );

  return (
    <Modal
      title="Spostamento lavoro in officina"
      open={isOpen}
      onCancel={onClose}
      footer={renderFooter()}
      centered
      width={500}
    >
      <div style={{ textAlign: "center" }}>
        <Text>
          Sei sicuro di voler spostare la commessa
          <br /> {item.commessa}
          <br /> nella postazione: "{ubicazione}" ?
        </Text>
      </div>
    </Modal>
  );
}

export default NewPlaceConfirmationDialogOfficina;
