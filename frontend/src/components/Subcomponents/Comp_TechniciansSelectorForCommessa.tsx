import React, { useState } from "react";
import { Select, Typography, Card, Row, Col, Button, Modal, Space } from "antd";
import { CloseOutlined } from "@ant-design/icons";

interface TechniciansSelectorProps {
  tecnici: { name: string; surname: string }[];
  tecniciAssegnatiCommessa: string[];
  record: {
    montaggio: { oreLav: { tecnico: string }[] };
    cablaggio: { oreLav: { tecnico: string }[] };
  };
  handleAddTecnicoToCommessa: (tecnico: string) => void;
  handleRemoveTecnicoFromCommessa: (tecnico: string) => void;
}

const { Text } = Typography;

const TechniciansSelector: React.FC<TechniciansSelectorProps> = ({
  tecnici,
  tecniciAssegnatiCommessa,
  record,
  handleAddTecnicoToCommessa,
  handleRemoveTecnicoFromCommessa,
}) => {
  const [tecnicoSelected] = useState("");
  const [tecnicoToBeRemoved, setTecnicoToBeRemoved] = useState<string | null>(
    null
  );
  const [isOpenRemoveTecnico, setIsOpenRemoveTecnico] = useState(false);

  return (
    <div style={{ width: "100%" }}>
      <div style={{ marginBottom: 20 }}>
        <Select
          placeholder="Seleziona un tecnico"
          value={tecnicoSelected}
          onChange={handleAddTecnicoToCommessa}
          style={{ width: "100%" }}
        >
          {tecnici
            .sort((a, b) => a.surname.localeCompare(b.surname))
            .map((tecnico) => (
              <Select.Option
                key={`${tecnico.name}-${tecnico.surname}`}
                value={`${tecnico.name} ${tecnico.surname}`}
              >
                {tecnico.surname} {tecnico.name}
              </Select.Option>
            ))}
        </Select>
      </div>

      <Card style={{ marginBottom: 20 }}>
        <Row gutter={[16, 16]}>
          {tecniciAssegnatiCommessa.map((tecnico, index) => (
            <Col key={index} span={6}>
              <Card size="small">
                <Row justify="space-between" align="middle">
                  <Col>
                    <Text>{tecnico}</Text>
                  </Col>
                  <Col>
                    <Button
                      type="text"
                      danger
                      icon={<CloseOutlined />}
                      size="small"
                      onClick={() => {
                        setTecnicoToBeRemoved(tecnico);
                        setIsOpenRemoveTecnico(true);
                      }}
                    />
                  </Col>
                </Row>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      <Modal
        title="Conferma Rimozione"
        open={isOpenRemoveTecnico}
        onCancel={() => setIsOpenRemoveTecnico(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsOpenRemoveTecnico(false)}>
            Annulla
          </Button>,
          <Button
            key="confirm"
            danger
            onClick={() => {
              if (
                tecnicoToBeRemoved &&
                !record.montaggio.oreLav.some(
                  (item) => item.tecnico === tecnicoToBeRemoved
                ) &&
                !record.cablaggio.oreLav.some(
                  (item) => item.tecnico === tecnicoToBeRemoved
                )
              ) {
                handleRemoveTecnicoFromCommessa(tecnicoToBeRemoved);
                setIsOpenRemoveTecnico(false);
              }
            }}
            disabled={
              !tecnicoToBeRemoved ||
              record.montaggio.oreLav.some(
                (item) => item.tecnico === tecnicoToBeRemoved
              ) ||
              record.cablaggio.oreLav.some(
                (item) => item.tecnico === tecnicoToBeRemoved
              )
            }
          >
            Sì
          </Button>,
        ]}
      >
        <Space direction="vertical">
          <Text>Sei sicuro di voler rimuovere:</Text>
          <Text strong>{tecnicoToBeRemoved}</Text>
          {tecnicoToBeRemoved &&
          (record.montaggio.oreLav.some(
            (item) => item.tecnico === tecnicoToBeRemoved
          ) ||
            record.cablaggio.oreLav.some(
              (item) => item.tecnico === tecnicoToBeRemoved
            )) ? (
            <Text type="danger">
              Il tecnico ha già registrato delle ore e non può essere rimosso.
            </Text>
          ) : (
            <Text>L'opzione selezionata verrà rimossa definitivamente.</Text>
          )}
        </Space>
      </Modal>
    </div>
  );
};

export default TechniciansSelector;
