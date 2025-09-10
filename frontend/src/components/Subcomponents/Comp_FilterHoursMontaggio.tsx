import React from "react";
import { Space, Select, DatePicker, Button } from "antd";
import dayjs from "dayjs";

interface FilterMontaggioProps {
  filterMontaggioTecnico: string;
  setFilterMontaggioTecnico: (value: string) => void;
  filterMontaggioLavorazione: string;
  setFilterMontaggioLavorazione: (value: string) => void;
  filterMontaggioDate: string;
  setFilterMontaggioDate: (value: string) => void;
  clearMontaggioFilters: () => void;
  record: {
    montaggio?: {
      oreLav: Array<{ tecnico: string; task: string }>;
    };
  };
}

const Lavorazioni = [
  { code: "M1", desc: "Montaggio Canale" },
  { code: "M2", desc: "Installazione Componenti" },
  { code: "M3", desc: "Montaggio Morsetti" },
  { code: "M4", desc: "Etichettatura su componenti e morsetti" },
];

const FilterMontaggio: React.FC<FilterMontaggioProps> = ({
  filterMontaggioTecnico,
  setFilterMontaggioTecnico,
  filterMontaggioLavorazione,
  setFilterMontaggioLavorazione,
  filterMontaggioDate,
  setFilterMontaggioDate,
  clearMontaggioFilters,
  record,
}) => {
  return (
    <Space style={{ width: "100%", marginBottom: 16, marginTop: "1%" }}>
      <Select
        placeholder="Filtra per Tecnico"
        value={filterMontaggioTecnico || undefined}
        onChange={setFilterMontaggioTecnico}
        style={{ width: 200 }}
        allowClear
      >
        <Select.Option value="">Tutti</Select.Option>
        {Array.from(
          new Set(record.montaggio?.oreLav.map((item) => item.tecnico))
        )
          .filter(Boolean)
          .sort((a, b) => a.localeCompare(b))
          .map((tecnico) => (
            <Select.Option key={tecnico} value={tecnico}>
              {tecnico}
            </Select.Option>
          ))}
      </Select>

      <Select
        placeholder="Filtra per Lavorazione"
        value={filterMontaggioLavorazione || undefined}
        onChange={setFilterMontaggioLavorazione}
        style={{ width: 200 }}
        allowClear
      >
        <Select.Option value="">Tutti</Select.Option>
        {Array.from(new Set(record.montaggio?.oreLav.map((item) => item.task)))
          .filter(Boolean)
          .map((task) => (
            <Select.Option key={task} value={task}>
              {(() => {
                const found = Lavorazioni.find((lav) => lav.code === task);
                return found ? `${task} - ${found.desc}` : task;
              })()}
            </Select.Option>
          ))}
      </Select>

      <DatePicker
        placeholder="Filtra per Data"
        value={filterMontaggioDate ? dayjs(filterMontaggioDate) : null}
        onChange={(date) =>
          setFilterMontaggioDate(date ? date.format("YYYY-MM-DD") : "")
        }
        style={{ width: 200 }}
      />

      <Button onClick={clearMontaggioFilters} style={{ width: "22%" }}>
        Reset
      </Button>
    </Space>
  );
};

export default FilterMontaggio;
