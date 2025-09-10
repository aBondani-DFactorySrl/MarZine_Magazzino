import React from "react";
import { Row, Col, Typography } from "antd";

interface OreLav {
  task: string;
  oreLav: number;
}

interface Montaggio {
  oreLav: OreLav[];
}

interface Record {
  montaggio?: Montaggio;
}

interface TotalizerMontaggioProps {
  record: Record;
}

const { Title, Text } = Typography;

const TotalizerMontaggio: React.FC<TotalizerMontaggioProps> = ({ record }) => {
  return (
    <Row
      justify="space-between"
      style={{
        marginTop: "5%",
        padding: 20,
      }}
    >
      <Col span={6} style={{ textAlign: "center" }}>
        <Title level={5}>M1 - Montaggio Canale: </Title>
        <Text>
          {record.montaggio?.oreLav
            .filter((item) => item.task === "M1")
            .reduce((total, item) => total + item.oreLav, 0)}{" "}
          ore
        </Text>
      </Col>
      <Col span={6} style={{ textAlign: "center" }}>
        <Title level={5}>M2 - Inst. componenti: </Title>
        <Text>
          {record.montaggio?.oreLav
            .filter((item) => item.task === "M2")
            .reduce((total, item) => total + item.oreLav, 0)}{" "}
          ore
        </Text>
      </Col>
      <Col span={6} style={{ textAlign: "center" }}>
        <Title level={5}>M3 - Montaggio morsetti: </Title>
        <Text>
          {record.montaggio?.oreLav
            .filter((item) => item.task === "M3")
            .reduce((total, item) => total + item.oreLav, 0)}{" "}
          ore
        </Text>
      </Col>
      <Col span={6} style={{ textAlign: "center" }}>
        <Title level={5}>M4 - Etic. componenti: </Title>
        <Text>
          {record.montaggio?.oreLav
            .filter((item) => item.task === "M4")
            .reduce((total, item) => total + item.oreLav, 0)}{" "}
          ore
        </Text>
      </Col>
    </Row>
  );
};

export default TotalizerMontaggio;
