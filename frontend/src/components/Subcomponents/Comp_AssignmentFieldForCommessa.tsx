import React from "react";
import {
  Row,
  Col,
  Select,
  InputNumber,
  Checkbox,
  Space,
  Typography,
} from "antd";
import {
  CrownOutlined,
  ThunderboltOutlined,
  ApiOutlined,
  SettingOutlined,
} from "@ant-design/icons";

interface Tecnico {
  name: string;
  surname: string;
  role: string;
}

interface GeneralAssigmentFieldsProps {
  tecnici: Tecnico[];
  user: any;
  capoCommessa: string;
  setCapoCommessa: (value: string) => void;
  orePrevistePotenza: number;
  setOrePrevistePotenza: (value: number) => void;
  orePrevisteAusiliari: number;
  setOrePrevisteAusiliari: (value: number) => void;
  orePrevisteMontaggio: number;
  setOrePrevisteMontaggio: (value: number) => void;
  stato: number;
  setStato: (value: number) => void;
}

const GeneralAssigmentFields: React.FC<GeneralAssigmentFieldsProps> = ({
  user,
  tecnici,
  capoCommessa,
  setCapoCommessa,
  orePrevistePotenza,
  setOrePrevistePotenza,
  orePrevisteAusiliari,
  setOrePrevisteAusiliari,
  orePrevisteMontaggio,
  setOrePrevisteMontaggio,
  stato,
  setStato,
}) => {
  return (
    <div style={{ width: "100%" }}>
      {/* First Select in the Middle */}
      <Row justify="center" style={{ marginBottom: 20 }}>
        <Col>
          <Space>
            <Select
              value={capoCommessa}
              onChange={(value) => setCapoCommessa(value)}
              style={{ width: 200 }}
              placeholder="Seleziona un capo commessa"
            >
              {tecnici
                .filter((tecnico) => tecnico.role === "CapoCommessa")
                .map((tecnico) => (
                  <Select.Option
                    key={tecnico.name}
                    value={tecnico.name + " " + tecnico.surname}
                  >
                    {tecnico.name} {tecnico.surname}
                  </Select.Option>
                ))}
            </Select>
            <CrownOutlined style={{ fontSize: "16px", color: "#1890ff" }} />
          </Space>
        </Col>
      </Row>

      {/* Next Three Inputs */}
      <Space direction="vertical" style={{ width: "100%" }} size="middle">
        {/* First Two Inputs in a Row */}
        <Row justify="center" align="middle" gutter={20}>
          <Col>
            <Space>
              <Typography.Text>Potenza</Typography.Text>
              <InputNumber
                value={
                  orePrevistePotenza === 0 ? undefined : orePrevistePotenza
                }
                disabled={parseInt(user.role) !== 99}
                onChange={(value) => {
                  // Round to nearest 0.5
                  if (value !== null) {
                    const rounded = Math.round(value * 2) / 2;
                    setOrePrevistePotenza(rounded);
                  } else {
                    setOrePrevistePotenza(0);
                  }
                }}
                style={{ width: 70 }}
                step={0.5}
                min={0}
                placeholder="0"
                precision={1}
              />
              <ThunderboltOutlined
                style={{ fontSize: "16px", color: "#1890ff" }}
              />
            </Space>
          </Col>
          <Col>
            <Space>
              <Typography.Text>Ausiliari</Typography.Text>
              <InputNumber
                value={
                  orePrevisteAusiliari === 0 ? undefined : orePrevisteAusiliari
                }
                disabled={parseInt(user.role) !== 99}
                onChange={(value) => {
                  // Round to nearest 0.5
                  if (value !== null) {
                    const rounded = Math.round(value * 2) / 2;
                    setOrePrevisteAusiliari(rounded);
                  } else {
                    setOrePrevisteAusiliari(0);
                  }
                }}
                style={{ width: 70 }}
                step={0.5}
                min={0}
                placeholder="0"
                precision={1}
              />
              <ApiOutlined style={{ fontSize: "16px", color: "#1890ff" }} />
            </Space>
          </Col>
        </Row>

        {/* Third Input Below */}
        <Row justify="center" align="middle">
          <Col>
            <Space>
              <Typography.Text>Montaggio</Typography.Text>
              <InputNumber
                value={
                  orePrevisteMontaggio === 0 ? undefined : orePrevisteMontaggio
                }
                disabled={parseInt(user.role) !== 99}
                onChange={(value) => {
                  // Round to nearest 0.5
                  if (value !== null) {
                    const rounded = Math.round(value * 2) / 2;
                    setOrePrevisteMontaggio(rounded);
                  } else {
                    setOrePrevisteMontaggio(0);
                  }
                }}
                style={{ width: 70 }}
                step={0.5}
                min={0}
                placeholder="0"
                precision={1}
              />
              <SettingOutlined style={{ fontSize: "16px", color: "#1890ff" }} />
            </Space>
          </Col>
        </Row>
      </Space>

      <Row
        justify="center"
        align="middle"
        style={{ marginTop: 40 }}
        gutter={[40, 0]}
      >
        <Col>
          <Checkbox
            checked={stato === 1}
            onChange={() => setStato(stato === 1 ? 0 : 1)}
          >
            Attesa Materiali
          </Checkbox>
        </Col>
        <Col>
          <Checkbox
            checked={stato === 3}
            onChange={() => setStato(stato === 3 ? 0 : 3)}
          >
            Collaudo
          </Checkbox>
        </Col>
        <Col>
          <Checkbox
            checked={[2, 99].includes(stato)}
            onChange={(e) => setStato(e.target.checked ? 2 : 0)}
          >
            Completato
          </Checkbox>
        </Col>
        <Col>
          <Checkbox
            checked={stato === 4}
            onChange={() => setStato(stato === 4 ? 0 : 4)}
          >
            Attesa Collaudo
          </Checkbox>
        </Col>
        {[2, 99].includes(stato) && (
          <Col>
            <Checkbox
              checked={stato === 99}
              onChange={(e) => setStato(e.target.checked ? 99 : 2)}
            >
              Archivia
            </Checkbox>
          </Col>
        )}
      </Row>
    </div>
  );
};

export default GeneralAssigmentFields;
