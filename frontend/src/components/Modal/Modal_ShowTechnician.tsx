//#region Imports
import React, { useEffect, useState } from "react";
import {
  Button,
  Modal,
  Form,
  Input,
  Select,
  Card,
  Row,
  Col,
  Popconfirm,
  Typography,
} from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import axios from "axios";
import toast from "react-hot-toast";
const { Text } = Typography;
//#endregion

const ManageTechnicians: React.FC = () => {
  //#region Variables
  const [tecnici, setTecnici] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const url = import.meta.env.VITE_BACKEND_URL;
  //#endregion

  //#region Effects
  useEffect(() => {
    handleFetchTechnicians();
  }, []);
  //#endregion

  //#region Fetch and Remove Technicians
  const handleFetchTechnicians = async () => {
    try {
      const response = await axios.get(`${url}/gettecnici`);
      if (response.data.success) {
        setTecnici(response.data.data);
      } else {
        toast.error("Failed to fetch technicians");
      }
    } catch (error) {
      toast.error("Error fetching technicians");
    }
  };

  const handleDeleteTechnician = async (technicianId: string) => {
    try {
      const response = await axios.delete(
        `${url}/removetechnicians/${technicianId}`
      );
      if (response.data.success) {
        toast.success("Technician deleted successfully");
        handleFetchTechnicians();
      } else {
        toast.error(response.data.message || "Failed to delete technician");
      }
    } catch (error) {
      toast.error("Error deleting technician");
    }
  };
  //#endregion

  //#region Modal Functions
  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    form.resetFields();
    setIsModalOpen(false);
  };
  //#endregion

  //#region Submit
  const handleSubmit = async (values: any) => {
    try {
      const response = await axios.post(`${url}/newtechnician`, values);
      if (response.data.success) {
        toast.success("Technician added successfully");
        form.resetFields();
        setIsModalOpen(false);
        handleFetchTechnicians();
      } else {
        toast.error(response.data.message || "Failed to add technician");
      }
    } catch (error) {
      toast.error("Error adding technician");
    }
  };
  //#endregion

  //#region Main Return
  return (
    <>
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={showModal} />
      </div>

      <Row gutter={[16, 16]}>
        {tecnici.map((tecnico) => (
          <Col key={tecnico.id} xs={24} sm={12} md={8} lg={6}>
            <Card size="small" bordered>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text>
                  {tecnico.name} {tecnico.surname}
                </Text>
                <Popconfirm
                  title="Cancella Tecnico"
                  description="Sei sicuro? Non puoi tornare indietro."
                  onConfirm={() => handleDeleteTechnician(tecnico.id)}
                  okText="Elimina"
                  cancelText="Indietro"
                >
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    size="small"
                  />
                </Popconfirm>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Modal
        title="Aggiungi Nuovo Tecnico"
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="Nome"
            rules={[{ required: true, message: "Inserisci il nome" }]}
          >
            <Input placeholder="Nome" />
          </Form.Item>

          <Form.Item
            name="surname"
            label="Cognome"
            rules={[{ required: true, message: "Inserisci il cognome" }]}
          >
            <Input placeholder="Cognome" />
          </Form.Item>

          <Form.Item
            name="role"
            label="Ruolo"
            rules={[{ required: true, message: "Seleziona il ruolo" }]}
          >
            <Select placeholder="Seleziona il ruolo">
              <Select.Option value="Operaio">Operaio</Select.Option>
              <Select.Option value="CapoCommessa">Capo Commessa</Select.Option>
              <Select.Option value="Responsabile">Responsabile</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <div
              style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}
            >
              <Button onClick={handleCancel}>Annulla</Button>
              <Button type="primary" htmlType="submit">
                Salva
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
  //#endregion
};

export default ManageTechnicians;
