import React from "react";
import { Space, Select, DatePicker, Button } from "antd";
import dayjs from "dayjs";

interface FilterCablaggioProps {
  filterCablaggioTecnico: string;
  setFilterCablaggioTecnico: (value: string) => void;
  filterCablaggioLavorazione: string;
  setFilterCablaggioLavorazione: (value: string) => void;
  filterCablaggioDate: string;
  setFilterCablaggioDate: (value: string) => void;
  clearCablaggioFilters: () => void;
  record: {
    cablaggio?: {
      oreLav: Array<{ tecnico: string; task: string }>;
    };
  };
}

const Lavorazioni = [
  { code: "C1", desc: "Cablaggio Potenza" },
  { code: "C2", desc: "Cablaggio Ausiliari" },
  { code: "C3", desc: "Cablaggio Rete Dati" },
];

const FilterCablaggio: React.FC<FilterCablaggioProps> = ({
  filterCablaggioTecnico,
  setFilterCablaggioTecnico,
  filterCablaggioLavorazione,
  setFilterCablaggioLavorazione,
  filterCablaggioDate,
  setFilterCablaggioDate,
  clearCablaggioFilters,
  record,
}) => {
  return (
    <Space style={{ width: "100%", marginBottom: 16, marginTop: "1%" }}>
      <Select
        placeholder="Filtra per Tecnico"
        value={filterCablaggioTecnico || undefined}
        onChange={setFilterCablaggioTecnico}
        style={{ width: 200 }}
        allowClear
      >
        <Select.Option value="">Tutti</Select.Option>
        {Array.from(
          new Set(record.cablaggio?.oreLav.map((item) => item.tecnico))
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
        value={filterCablaggioLavorazione || undefined}
        onChange={setFilterCablaggioLavorazione}
        style={{ width: 200 }}
        allowClear
      >
        <Select.Option value="">Tutti</Select.Option>
        {Array.from(new Set(record.cablaggio?.oreLav.map((item) => item.task)))
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
        value={filterCablaggioDate ? dayjs(filterCablaggioDate) : null}
        onChange={(date) =>
          setFilterCablaggioDate(
            date
              ? date.format("YYYY-MM-DD") // Force UTC formatting
              : ""
          )
        }
        style={{ width: 200 }}
      />

      <Button onClick={clearCablaggioFilters} style={{ width: "22%" }}>
        Reset
      </Button>
    </Space>
  );
};

export default FilterCablaggio;
