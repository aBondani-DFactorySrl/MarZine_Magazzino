import { useState } from "react";
import { Button, Modal, Space } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { collection, deleteDoc, doc } from "firebase/firestore";
import { firestore } from "../provider/firebase";
import toast from "react-hot-toast";

interface DeleteConfirmationDialogProps {
  itemId: string;
}

function DeleteConfirmationDialog({ itemId }: DeleteConfirmationDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [itemIdToDelete, setItemIdToDelete] = useState<string | null>(null);
  const [isDelLoading, setDelIsLoading] = useState(false);

  async function deleteRecords() {
    setDelIsLoading(true);
    const recordsCollection = collection(firestore, "records");
    try {
      if (!itemIdToDelete) {
        toast.error("Item ID not provided.");
        return;
      }
      await deleteDoc(doc(recordsCollection, itemIdToDelete));
      toast.success(`Document deleted successfully.`);
      setDelIsLoading(false);
    } catch (error) {
      toast.error("Error deleting document: " + error);
      setDelIsLoading(false);
    }
    setIsOpen(false);
  }

  return (
    <>
      <Button
        type="text"
        icon={<DeleteOutlined />}
        danger
        onClick={() => {
          setIsOpen(true);
          setItemIdToDelete(itemId);
        }}
      />
      <Modal
        title="Cancella richiesta"
        open={isOpen}
        onCancel={() => setIsOpen(false)}
        centered
        footer={[
          <Space
            key="footer"
            style={{ display: "flex", justifyContent: "center", width: "100%" }}
          >
            <Button onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button
              danger
              type="primary"
              onClick={deleteRecords}
              loading={isDelLoading}
            >
              Delete
            </Button>
          </Space>,
        ]}
      >
        <div style={{ textAlign: "center" }}>
          Sei sicuro?
          <br />
          Non puoi tornare indietro!!
        </div>
      </Modal>
    </>
  );
}

export default DeleteConfirmationDialog;
