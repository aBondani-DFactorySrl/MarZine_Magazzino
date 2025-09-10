//#region Imports
import React from "react";
import {
  Modal,
  Typography,
  Select,
  Button,
  Spin,
  Form,
  DatePicker,
} from "antd";
import dayjs from "dayjs";
import TextArea from "antd/es/input/TextArea";
//#endregion

//#region Interfaces
interface ModalModifyProps {
  isOpenModify: boolean;
  onCloseModify: (value: boolean) => void;
  rowToBeModified: any;
  tecniciAssegnatiCommessa: any[];
  tecniciEdit: string;
  setTecniciEdit: (value: string) => void;
  tasksEdit: string;
  setTasksEdit: (value: string) => void;
  oreEdit: number;
  setOreEdit: (value: number) => void;
  dataEdit: Date;
  setDataEdit: (date: Date) => void;
  notesEdit: string;
  setNotesEdit: (value: string) => void;
  handleSaveEditedRow: () => void;
  methodToBeModified: string;
}

const { Title } = Typography;
//#endregion

const ModalModify: React.FC<ModalModifyProps> = ({
  isOpenModify,
  onCloseModify,
  rowToBeModified,
  tecniciAssegnatiCommessa,
  tecniciEdit,
  setTecniciEdit,
  tasksEdit,
  setTasksEdit,
  oreEdit,
  setOreEdit,
  dataEdit,
  notesEdit,
  setNotesEdit,
  setDataEdit,
  handleSaveEditedRow,
  methodToBeModified,
}) => {
  //#region Main Return
  return (
    <Modal
      title="Modifica Dati Lavorazione"
      open={isOpenModify}
      onCancel={() => onCloseModify(false)}
      footer={[
        <Button key="cancel" danger onClick={() => onCloseModify(false)}>
          Annulla
        </Button>,
        <Button key="submit" type="primary" onClick={handleSaveEditedRow}>
          Salva
        </Button>,
      ]}
      width={600}
      centered
    >
      {rowToBeModified != null ? (
        <Form layout="vertical">
          <Form.Item
            label={<Title level={5}>Tecnico</Title>}
            style={{ marginBottom: "-10px" }}
          >
            <Select
              value={tecniciEdit || rowToBeModified.tecnico}
              onChange={setTecniciEdit}
              style={{
                width: "100%",
                textAlign: "center",
              }}
            >
              <Select.Option value="" disabled>
                Seleziona un tecnico
              </Select.Option>
              {tecniciAssegnatiCommessa.map((tecnico: any) => (
                <Select.Option key={tecnico} value={tecnico}>
                  {tecnico}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label={<Title level={5}>Tipo Lavorazione</Title>}
            style={{ marginBottom: "-10px" }}
          >
            <Select
              value={tasksEdit || rowToBeModified.task}
              onChange={setTasksEdit}
              style={{ width: "100%", textAlign: "center" }}
            >
              <Select.Option value="" disabled>
                Seleziona un task
              </Select.Option>
              {methodToBeModified === "montaggio" ? (
                <>
                  <Select.Option value="M1">
                    M1 - Montaggio Canale
                  </Select.Option>
                  <Select.Option value="M2">
                    M2 - Installazione Componenti
                  </Select.Option>
                  <Select.Option value="M3">
                    M3 - Montaggio Morsetti
                  </Select.Option>
                  <Select.Option value="M4">
                    M4 - Etichettatura su componenti e morsetti
                  </Select.Option>
                </>
              ) : (
                <>
                  <Select.Option value="C1">
                    C1 - Cablaggio Potenza
                  </Select.Option>
                  <Select.Option value="C2">
                    C2 - Cablaggio Ausiliari
                  </Select.Option>
                  <Select.Option value="C3">
                    C3 - Cablaggio Rete Dati
                  </Select.Option>
                </>
              )}
            </Select>
          </Form.Item>

          <Form.Item
            label={<Title level={5}>Ore Lavorate</Title>}
            style={{ marginBottom: "-10px" }}
          >
            <Select
              value={oreEdit || rowToBeModified.oreLav}
              onChange={(value) => setOreEdit(parseFloat(value))}
              style={{ width: "100%", textAlign: "center" }}
            >
              {Array.from({ length: 48 }, (_, i) => (i + 1) / 2).map((ore) => (
                <Select.Option key={ore} value={ore}>
                  {ore}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label={<Title level={5}>Data Lavorazione</Title>}
            style={{ marginBottom: "-10px" }}
          >
            <DatePicker
              value={dayjs(dataEdit || new Date(rowToBeModified.timestamp))}
              onChange={(date) => {
                if (date) {
                  setDataEdit(date.toDate());
                }
              }}
              style={{ width: "100%" }}
            />
          </Form.Item>

          <Form.Item label={<Title level={5}>Note</Title>}>
            <TextArea
              value={notesEdit || rowToBeModified.note}
              onChange={(e) => setNotesEdit(e.target.value)}
              style={{ width: "100%", textAlign: "center" }}
              rows={4}
            />
          </Form.Item>
        </Form>
      ) : (
        <div style={{ textAlign: "center", padding: "20px" }}>
          <Spin size="large" />
        </div>
      )}
    </Modal>
  );
  //#endregion
};

export default ModalModify;
