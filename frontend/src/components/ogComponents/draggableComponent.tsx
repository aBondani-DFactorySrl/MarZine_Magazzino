import React, { useState } from "react";
import { Card, Typography } from "antd";

const { Text } = Typography;

interface DraggableComponentProps {
  text: string;
}

const DraggableComponent: React.FC<DraggableComponentProps> = ({ text }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (event: React.DragEvent<HTMLDivElement>) => {
    event.dataTransfer.setData("text/plain", text);
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  if (text !== "") {
    return (
      <div
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        style={{ cursor: isDragging ? "grabbing" : "grab" }}
      >
        <Card
          style={{
            background: "transparent",
            width: "100%",
            padding: 0,
            borderWidth: 2,
            borderRadius: 20,
            borderColor: "#90cdf4",
            cursor: "inherit",
          }}
          bodyStyle={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: 16,
          }}
        >
          <Text style={{ color: "#90cdf4" }}>{text}</Text>
        </Card>
      </div>
    );
  } else {
    return null;
  }
};

export default DraggableComponent;
