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

interface AddMontaggioHoursProps {
  handleSubmit: (e: React.FormEvent, type: string) => void;
  dataMontaggioNew: Date;
  setDataMontaggioNew: (date: Date) => void;
  setTecnicoMontaggioNew: (value: string) => void;
  setTasksMontaggioNew: (value: string) => void;
  setOreMontaggioNew: (value: number) => void;
  setNoteMontaggioNew: (value: string) => void;
  tecnicoMontaggioNew: string;
  tasksMontaggioNew: string;
  oreMontaggioNew: number;
  noteMontaggioNew: string;
  tecniciAssegnatiCommessa: Array<string>;
  //   formatDateForInput: (date: Date) => string;
}

const { TextArea } = Input;

const AddMontaggioHours: React.FC<AddMontaggioHoursProps> = ({
  handleSubmit,
  dataMontaggioNew,
  setDataMontaggioNew,
  tecniciAssegnatiCommessa,
  setTecnicoMontaggioNew,
  setTasksMontaggioNew,
  setOreMontaggioNew,
  setNoteMontaggioNew,
  tecnicoMontaggioNew,
  tasksMontaggioNew,
  oreMontaggioNew,
  noteMontaggioNew,
}) => {
  const formatDateForInput = (date: Date) => {
    return dayjs(date);
  };

  const Lavorazioni = [
    { code: "M1", desc: "Montaggio Canale" },
    { code: "M2", desc: "Installazione Componenti" },
    { code: "M3", desc: "Montaggio Morsetti" },
    { code: "M4", desc: "Etichettatura su componenti e morsetti" },
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
      <form onSubmit={(e) => handleSubmit(e, "montaggio")}>
        <Space direction="vertical" style={{ width: "100%" }} size="middle">
          {/* Tecnici Section */}
          <Row gutter={[8, 8]} justify="center">
            {tecniciAssegnatiCommessa.map((tecnico: string, index: number) => (
              <Col key={index} span={6}>
                <Button
                  type={tecnicoMontaggioNew === tecnico ? "primary" : "default"}
                  style={{
                    width: "100%",
                    position: "relative",
                    height: "auto",
                    padding: "12px",
                  }}
                  onClick={() => setTecnicoMontaggioNew(tecnico)}
                >
                  {tecnico}
                  {tecnicoMontaggioNew === tecnico && (
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
                  type={tasksMontaggioNew === task.code ? "primary" : "default"}
                  style={{
                    width: "100%",
                    position: "relative",
                    height: "auto",
                    padding: "12px",
                  }}
                  onClick={() => setTasksMontaggioNew(task.code)}
                >
                  <Typography.Text>
                    {task.code} - {task.desc}
                  </Typography.Text>
                  {tasksMontaggioNew === task.code && (
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
                  type={oreMontaggioNew === ore ? "primary" : "default"}
                  onClick={() => setOreMontaggioNew(ore)}
                  style={{ minWidth: 50, position: "relative" }}
                >
                  {ore}
                  {oreMontaggioNew === ore && (
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
            value={formatDateForInput(dataMontaggioNew)}
            onChange={(date) => {
              if (date) {
                // Instead of creating a fake event, directly update the date
                const newDate = date.toDate();
                // Call the parent component's function with the new date
                setDataMontaggioNew(newDate);
              }
            }}
            style={{ width: "100%" }}
          />

          <TextArea
            placeholder="Note"
            rows={3}
            value={noteMontaggioNew}
            onChange={(e) => setNoteMontaggioNew(e.target.value)}
          />

          <Button
            type="primary"
            htmlType="submit"
            disabled={!tecnicoMontaggioNew || !tasksMontaggioNew}
          >
            Salva
          </Button>
        </Space>
      </form>
    </Card>
  );
};

export default AddMontaggioHours;
