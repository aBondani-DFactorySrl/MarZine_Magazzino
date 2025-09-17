import React, { memo } from "react";
import {
  Card,
  Button,
  Typography,
  Popover,
  Row,
  Col,
  Space,
  Select,
  Input,
} from "antd";
import { EditOutlined, CloseOutlined } from "@ant-design/icons";

const { Text, Title } = Typography;

type ItemErrorProps = {
  item: any;
  method: string;
  onEdit: (it: any, m: string) => void;
  onRemove: (it: any, m: string) => void;
  user: any;
  truncateText: (t: string, n: number) => string;
};

type ErrorFormProps = {
  onSubmit: (e: React.FormEvent, method: string) => void;
  activeMethod: string;
  formData: {
    repartoDisbaglio: string;
    titolo: string;
    provenienzaSchemista: string;
    schemista: string;
    ore: number;
    note: string;
  };
  setters: {
    setRepartoDisbaglio: (v: string) => void;
    setTitolo: (v: string) => void;
    setProvenienzaSchemista: (v: string) => void;
    setSchemista: (v: string) => void;
    setOre: (v: number) => void;
    setNote: (v: string) => void;
  };
};

type ErrorCardProps = {
  title: string;
  method: string;
  errors: any[];
  isAddingHour: boolean;
  onToggleAdd: () => void;
  // pass-through props
  onEdit: (it: any, m: string) => void;
  onRemove: (it: any, m: string) => void;
  user: any;
  truncateText: (t: string, n: number) => string;
};

export const ItemError: React.FC<ItemErrorProps> = memo(
  ({ item, method, onEdit, onRemove, user, truncateText }) => {
    return (
      <Card key={item.id} size="small" style={{ marginBottom: 8 }}>
        <Row align="middle" justify="space-between">
          {item.repartodisbaglio && (
            <>
              <Col span={4}>
                <Text>{item.repartodisbaglio.charAt(0).toUpperCase()}</Text>
              </Col>
              <Col span={8}>
                <Text>{truncateText(item.titolo, 10)}</Text>
              </Col>
              <Col span={4}>
                <Text>{item.ore}h</Text>
              </Col>
              <Col span={8}>
                <Space>
                  <Popover
                    content={<div style={{ padding: 8 }}>{item.note}</div>}
                    trigger="click"
                  >
                    <Button size="small" disabled={!item.note?.trim()}>
                      ...
                    </Button>
                  </Popover>
                  {(user as any)?.reparto === "Officina" &&
                    parseInt((user as any)?.role) >= 20 && (
                      <>
                        <Button
                          size="small"
                          icon={<EditOutlined />}
                          onClick={() => onEdit(item, method)}
                        />
                        <Popover
                          content={
                            <div style={{ textAlign: "center" }}>
                              <Text>
                                Sei sicuro di voler rimuovere questo errore?
                              </Text>
                              <Button
                                danger
                                size="small"
                                style={{ marginTop: 8 }}
                                onClick={() => onRemove(item, method)}
                              >
                                Rimuovi
                              </Button>
                            </div>
                          }
                          trigger="click"
                        >
                          <Button
                            size="small"
                            danger
                            icon={<CloseOutlined />}
                          />
                        </Popover>
                      </>
                    )}
                </Space>
              </Col>
            </>
          )}
        </Row>
      </Card>
    );
  }
);

export const ErrorCard: React.FC<ErrorCardProps> = memo(
  ({
    title,
    method,
    errors,
    isAddingHour,
    onToggleAdd,
    onEdit,
    onRemove,
    user,
    truncateText,
  }) => {
    return (
      <Card
        title={<Title level={4}>{title}</Title>}
        style={{ height: "100%", minHeight: 200 }}
        bodyStyle={{ overflowY: "auto", maxHeight: 500 }}
      >
        {errors?.map((item: any, idx: number) => (
          <ItemError
            key={item.id ?? `${method}-${idx}`} // niente Math.random()
            item={item}
            method={method}
            onEdit={onEdit}
            onRemove={onRemove}
            user={user}
            truncateText={truncateText}
          />
        ))}
        <Button style={{ marginTop: 16 }} onClick={onToggleAdd}>
          {isAddingHour ? "Chiudi" : "Aggiungi ora"}
        </Button>
      </Card>
    );
  }
);

export const ErrorForm: React.FC<ErrorFormProps> = memo(function ErrorForm({
  onSubmit,
  activeMethod,
  formData,
  setters,
}) {
  const schemistaOptions = [
    "Giacomo Menegalli",
    "Danil Puscov",
    "Alfio Lena",
    "Luca Borlenghi",
    "Nicolas Arbasi",
    "Andrea Marchese",
  ];

  return (
    <Card style={{ padding: 16, width: 800 }}>
      <form onSubmit={(e) => onSubmit(e, activeMethod)}>
        <Row gutter={[16, 16]} style={{ marginBottom: "8px" }}>
          <Col span={12}>
            <Select
              style={{ marginBottom: 8, width: "100%" }}
              value={formData.repartoDisbaglio}
              onChange={setters.setRepartoDisbaglio}
            >
              <Select.Option value="" disabled>
                Seleziona un reparto
              </Select.Option>
              <Select.Option value="S">S - Schemisti</Select.Option>
              <Select.Option value="M">M - Magazzino</Select.Option>
              <Select.Option value="O">O - Officina</Select.Option>
            </Select>
          </Col>
          <Col span={12}>
            <Input
              style={{ marginBottom: 8, width: "100%" }}
              required
              placeholder="Titolo"
              value={formData.titolo}
              onChange={(e) => setters.setTitolo(e.target.value)}
            />
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginBottom: "16px" }}>
          <Col span={12}>
            {formData.repartoDisbaglio === "S" ||
            formData.repartoDisbaglio === "M" ? (
              <Space.Compact style={{ width: "100%" }}>
                <Select
                  style={{ width: "40%" }}
                  value={formData.provenienzaSchemista}
                  onChange={setters.setProvenienzaSchemista}
                >
                  <Select.Option value="INT">Interno</Select.Option>
                  <Select.Option value="EXT">Esterno</Select.Option>
                </Select>
                {formData.repartoDisbaglio === "S" &&
                formData.provenienzaSchemista === "EXT" ? (
                  <Input
                    style={{ width: "60%" }}
                    placeholder="Seleziona Schemista"
                    value={formData.schemista}
                    onChange={(e) => setters.setSchemista(e.target.value)}
                  />
                ) : (
                  formData.repartoDisbaglio === "S" &&
                  formData.provenienzaSchemista === "INT" && (
                    <Select
                      style={{ width: "60%" }}
                      value={formData.schemista}
                      onChange={setters.setSchemista}
                    >
                      <Select.Option value="" disabled>
                        Schemista
                      </Select.Option>
                      {schemistaOptions.map((name) => (
                        <Select.Option key={name} value={name}>
                          {name}
                        </Select.Option>
                      ))}
                    </Select>
                  )
                )}
              </Space.Compact>
            ) : (
              <Input
                style={{ width: "100%" }}
                placeholder="Titolo"
                value={formData.titolo}
                onChange={(e) => setters.setTitolo(e.target.value)}
              />
            )}
          </Col>
          <Col span={12}>
            <Select
              style={{ width: "100%" }}
              value={formData.ore}
              onChange={setters.setOre}
            >
              <Select.Option value="" disabled>
                Ore
              </Select.Option>
              {Array.from({ length: 48 }, (_, i) => (i + 1) / 2).map((ore) => (
                <Select.Option key={ore} value={ore}>
                  {ore}h
                </Select.Option>
              ))}
            </Select>
          </Col>
        </Row>

        <Input.TextArea
          style={{ marginBottom: 8 }}
          placeholder="Note"
          rows={2}
          value={formData.note}
          onChange={(e) => setters.setNote(e.target.value)}
        />

        <Button
          style={{ marginTop: 8, display: "block", margin: "8px auto" }}
          type="primary"
          htmlType="submit"
        >
          Salva
        </Button>
      </form>
    </Card>
  );
});
