import React from "react";
import { Row, Col, Typography } from "antd";

interface OreLav {
  task: string;
  oreLav: number;
}

interface Cablaggio {
  oreLav: OreLav[];
}

interface Record {
  cablaggio?: Cablaggio;
}

interface TotalizerCablaggioProps {
  record: Record;
}

const { Title, Text } = Typography;

const TotalizerCablaggio: React.FC<TotalizerCablaggioProps> = ({ record }) => {
  return (
    <Row
      justify="space-between"
      style={{
        marginTop: "5%",
        padding: 20,
      }}
    >
      <Col span={8} style={{ textAlign: "center" }}>
        <Title level={5}>C1 - Cablaggio Potenza: </Title>
        <Text>
          {record.cablaggio?.oreLav
            .filter((item) => item.task === "C1")
            .reduce((total, item) => total + item.oreLav, 0)}{" "}
          ore
        </Text>
      </Col>
      <Col span={8} style={{ textAlign: "center" }}>
        <Title level={5}>C2 - Cablaggio Ausiliari: </Title>
        <Text>
          {record.cablaggio?.oreLav
            .filter((item) => item.task === "C2")
            .reduce((total, item) => total + item.oreLav, 0)}{" "}
          ore
        </Text>
      </Col>
      <Col span={8} style={{ textAlign: "center" }}>
        <Title level={5}>C3 - Cablaggio Rete e Dati: </Title>
        <Text>
          {record.cablaggio?.oreLav
            .filter((item) => item.task === "C3")
            .reduce((total, item) => total + item.oreLav, 0)}{" "}
          ore
        </Text>
      </Col>
    </Row>
  );
};

export default TotalizerCablaggio;
