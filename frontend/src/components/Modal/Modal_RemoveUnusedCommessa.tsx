//#region Imports
import React, { useState } from "react";
import { Input, Button, Space, Typography } from "antd";
import toast from "react-hot-toast";
import axios from "axios";
const { Text } = Typography;
//#endregion

//#region Interfaces
interface RemoveCommessaProps {
  aobCommesseToBeRendered: any;
  aobAddableCommesse: any;
}
//#endregion

const RemoveCommessa: React.FC<RemoveCommessaProps> = ({
  aobCommesseToBeRendered,
  aobAddableCommesse,
}) => {
  //#region Variables
  const [searchQuery, setSearchQuery] = useState("");
  const url = import.meta.env.VITE_BACKEND_URL;
  //#endregion

  //#region Remove Commessa
  const handleRemoveCommessa = async (commessa: string) => {
    try {
      const commessaKey = commessa.split(" - ")[0];
      const response = await axios.delete(
        `${url}/removecommessa/${commessaKey}`
      );

      // The response is already parsed by axios, no need for response.json()
      if (response.status === 200) {
        // Check HTTP status instead of response.data.success
        toast.success("Commessa rimossa con successo");
        // You might want to trigger a refresh of the commesse list here
        window.location.reload(); // Or use a more elegant way to refresh the data
      } else {
        toast.error(response.data.message || "Commessa non trovata");
      }
    } catch (error: any) {
      console.error("Error removing commessa:", error);
      toast.error(
        error.response?.data?.message ||
          "Errore durante la rimozione della commessa"
      );
    }
  };
  //#endregion

  //#region Main Render
  return (
    <>
      <Input
        placeholder="Cerca commessa..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{ marginBottom: 16 }}
      />

      <div style={{ overflowY: "auto", maxHeight: "400px" }}>
        <Space wrap>
          {aobCommesseToBeRendered
            .filter(
              (commessa: any) =>
                commessa?.stato === 0 &&
                (commessa?.progression === 0 || commessa?.progression === null)
            )
            .map((commessa: any) => (
              <Button
                key={commessa.uniqueKey}
                onClick={() => handleRemoveCommessa(commessa.commessa)}
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
            Nessuna commessa trovata
          </Text>
        )}
      </div>
    </>
  );
  //#endregion
};

export default RemoveCommessa;
