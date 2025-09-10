import React from "react";
import {
  Card,
  Row,
  Col,
  Button,
  DatePicker,
  Input,
  Space,
  Typography,
} from "antd";
import { CheckOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

interface AddCablaggioHoursProps {
  handleSubmit: (e: React.FormEvent, type: string) => void;
  dataCablaggioNew: Date;
  setTecnicoCablaggioNew: (value: string) => void;
  setTasksCablaggioNew: (value: string) => void;
  setOreCablaggioNew: (value: number) => void;
  setNoteCableggioNew: (value: string) => void;
  setDataCablaggioNew: (date: Date) => void;
  tecnicoCableggioNew: string;
  tasksCablaggioNew: string;
  oreCablaggioNew: number;
  noteCableggioNew: string;
  tecniciAssegnatiCommessa: Array<string>;
}

const { TextArea } = Input;

const AddCablaggioHours: React.FC<AddCablaggioHoursProps> = ({
  handleSubmit,
  dataCablaggioNew,
  setDataCablaggioNew,
  tecniciAssegnatiCommessa,
  setTecnicoCablaggioNew,
  setTasksCablaggioNew,
  setOreCablaggioNew,
  setNoteCableggioNew,
  tecnicoCableggioNew,
  tasksCablaggioNew,
  oreCablaggioNew,
  noteCableggioNew,
}) => {
  const formatDateForInput = (date: Date) => {
    return dayjs(date);
  };

  const Lavorazioni = [
    { code: "C1", desc: "Cablaggio Potenza" },
    { code: "C2", desc: "Cablaggio Ausiliari" },
    { code: "C3", desc: "Cablaggio Rete Dati" },
  ];

  return (
    <Card
      style={{
        marginTop: 16,
        padding: 8,
        border: "1px solid #d9d9d9",
        borderRadius: 8,
      }}
    >
      <form onSubmit={(e) => handleSubmit(e, "cablaggio")}>
        <Space direction="vertical" style={{ width: "100%" }} size="middle">
          {/* Tecnici Section */}
          <Row gutter={[8, 8]} justify="center">
            {tecniciAssegnatiCommessa.map((tecnico: string, index: number) => (
              <Col key={index} span={6}>
                <Button
                  type={tecnicoCableggioNew === tecnico ? "primary" : "default"}
                  style={{
                    width: "100%",
                    position: "relative",
                    height: "auto",
                    padding: "12px",
                  }}
                  onClick={() => setTecnicoCablaggioNew(tecnico)}
                >
                  {tecnico}
                  {tecnicoCableggioNew === tecnico && (
                    <CheckOutlined
                      style={{ position: "absolute", right: 8, top: 8 }}
                    />
                  )}
                </Button>
              </Col>
            ))}
          </Row>

          {/* Lavorazioni Section */}
          <Row gutter={[8, 8]} justify="center">
            {Lavorazioni.map((task, index) => (
              <Col key={index} span={8}>
                <Button
                  type={tasksCablaggioNew === task.code ? "primary" : "default"}
                  style={{
                    width: "100%",
                    position: "relative",
                    height: "auto",
                    padding: "12px",
                  }}
                  onClick={() => setTasksCablaggioNew(task.code)}
                >
                  <Typography.Text>
                    {task.code} - {task.desc}
                  </Typography.Text>
                  {tasksCablaggioNew === task.code && (
                    <CheckOutlined
                      style={{ position: "absolute", right: 8, top: 8 }}
                    />
                  )}
                </Button>
              </Col>
            ))}
          </Row>

          {/* Hours Selection */}
          <div
            style={{
              overflowX: "auto",
              whiteSpace: "nowrap",
              padding: 12,
              border: "1px solid #d9d9d9",
              borderRadius: 8,
            }}
          >
            <Space size={[8, 8]} wrap>
              {Array.from({ length: 30 }, (_, i) => (i + 1) / 2).map((ore) => (
                <Button
                  key={ore}
                  type={oreCablaggioNew === ore ? "primary" : "default"}
                  onClick={() => setOreCablaggioNew(ore)}
                  style={{ minWidth: 50, position: "relative" }}
                >
                  {ore}
                  {oreCablaggioNew === ore && (
                    <CheckOutlined
                      style={{ position: "absolute", right: 4, top: 4 }}
                    />
                  )}
                </Button>
              ))}
            </Space>
          </div>

          {/* Date and Notes */}
          <DatePicker
            value={formatDateForInput(dataCablaggioNew)}
            onChange={(date) => {
              if (date) {
                const newDate = date.toDate();
                setDataCablaggioNew(newDate);
              }
            }}
            style={{ width: "100%" }}
          />

          <TextArea
            placeholder="Note"
            rows={2}
            value={noteCableggioNew}
            onChange={(e) => setNoteCableggioNew(e.target.value)}
          />

          <Button
            type="primary"
            htmlType="submit"
            disabled={!tecnicoCableggioNew || !tasksCablaggioNew}
          >
            Salva
          </Button>
        </Space>
      </form>
    </Card>
  );
};

export default AddCablaggioHours;
