//#region Imports
import { Input, Button, Space, Typography, Popover } from "antd";
import toast from "react-hot-toast";
import { useState } from "react";
import {
  collection,
  doc,
  getDocs,
  query,
  where,
  writeBatch,
} from "firebase/firestore";
import { firestore } from "../../provider/firebase";
const { Text } = Typography;
//#endregion

//#region Interfaces
interface RequestUtilsProps {
  aobAddableCommesse: any[];
  aobCommesseToBeRendered: any;
}
//#endregion

const RequestUtils: React.FC<RequestUtilsProps> = ({
  aobAddableCommesse,
  aobCommesseToBeRendered,
}) => {
  //#region Variables
  const url = import.meta.env.VITE_BACKEND_URL;
  const [searchQuery, setSearchQuery] = useState("");
  //#endregion

  //#region Add Commessa
  const handleAddCommessa = async (commessa: any) => {
    try {
      const response = await fetch(
        `${url}/updatematerialerichiesto/${commessa.commessa}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            materialerichiesto: true,
          }),
        }
      );
      const data = await response.json();
      if (data.success) {
        toast.success("Materiale richiesto con successo!");
      }
    } catch (error) {
      toast.error("Errore durante l'aggiunta del materiale richiesto");
    }

    // Make POST request to backend
    try {
      let updateObj = {
        status: 11,
      };
      // Create a query to find matching documents
      const recordsRef = collection(firestore, "records");
      const q = query(
        recordsRef,
        where("status", "==", 10),
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
      toast.success("Commessa aggiornata con successo!");
    } catch (error) {
      toast.error("Errore durante l'aggiornamento della commessa");
    }
  };
  //#endregion

  //#region Main Return
  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          width: "100%",
          marginBottom: 16,
        }}
      >
        <Space>
          <Input
            placeholder="Cerca commessa..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: 300, marginRight: 16 }}
          />
          {/* <Text style={{ marginLeft: 20 }}>Pronte a Magazzino:</Text>
          <Switch
            onChange={() => setTriggerFilter(!triggeerFilter)}
            title="Filtra per commesse pronte"
          /> */}
        </Space>
      </div>

      <div style={{ overflowY: "auto", maxHeight: "400px" }}>
        <Space wrap>
          {aobCommesseToBeRendered
            .filter(
              (commessa: any) =>
                (commessa.stato === 0 || commessa.stato === 1) &&
                commessa.materialerichiesto === false
            )
            .map((commessa: any) => (
              <Popover
                content={
                  <Space direction="vertical">
                    <Typography.Text>
                      Sei sicuro di voler richiedere il materiale per questa
                      commessa?
                    </Typography.Text>
                    <Space
                      direction="horizontal"
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        width: "100%",
                      }}
                    >
                      <Button
                        type="primary"
                        onClick={() => handleAddCommessa(commessa)}
                      >
                        Conferma
                      </Button>
                      <Button type="primary" onClick={() => {}} danger>
                        Annulla
                      </Button>
                    </Space>
                  </Space>
                }
                key={commessa.uniqueKey}
                trigger="click"
                placement="right"
              >
                <Button
                  key={commessa.uniqueKey}
                  style={{
                    width: 200,
                    height: 60,
                    whiteSpace: "normal",
                    wordBreak: "break-word",
                    margin: 8,
                  }}
                >
                  {commessa.commessa}
                </Button>
              </Popover>
            ))}
        </Space>

        {aobAddableCommesse.filter((c: any) =>
          c.commessa.toLowerCase().includes(searchQuery.toLowerCase())
        ).length === 0 && (
          <Text
            style={{
              display: "block",
              textAlign: "center",
              color: "#999",
              marginTop: 16,
            }}
          >
            Nessuna commessa per cui richiedere il materiale
          </Text>
        )}
      </div>
    </>
  );
  //#endregion
};

export default RequestUtils;
