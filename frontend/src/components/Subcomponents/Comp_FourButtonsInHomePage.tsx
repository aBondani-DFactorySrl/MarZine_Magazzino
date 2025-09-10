import React from "react";
import { Button, Space, Tooltip } from "antd"; // Import Ant Design components
import {
  ClockCircleOutlined, // Ant Design equivalent for TbClockHour4Filled
  UserSwitchOutlined, // Ant Design equivalent for MdAssignmentInd
  ExclamationCircleOutlined, // Ant Design equivalent for MdError
  FilePdfOutlined, // Ant Design equivalent for GrDocumentPdf
} from "@ant-design/icons";

// Renamed interface to FourButtonsProps
interface FourButtonsProps {
  commessa: any;
  user: any;
  handleOpenAddHour: (commessa: any) => void;
  handleOpenAssignCommessa: (commessa: any) => void;
  handleOpenAddError: (commessa: any) => void;
}

// Renamed component to FourButtons
const FourButtons: React.FC<FourButtonsProps> = ({
  commessa,
  user,
  handleOpenAddHour,
  handleOpenAssignCommessa,
  handleOpenAddError,
}) => {
  // Destructure commessa and user props
  //// console(user);
  return (
    <Space>
      {" "}
      {/* Use Space for layout instead of mr prop */}
      <Tooltip title="Add Hours">
        <Button
          icon={<ClockCircleOutlined />}
          type="default" // 'outline' variant is similar to default or 'ghost' in AntD
          aria-label="Add Hours"
          onClick={() => handleOpenAddHour(commessa)}
        />
      </Tooltip>
      {user?.reparto === "Officina" && parseInt(user?.role) >= 20 && (
        <Tooltip title="Assign Commessa">
          <Button
            icon={<UserSwitchOutlined />}
            type="default"
            aria-label="Assign Commessa"
            onClick={() => handleOpenAssignCommessa(commessa)}
          />
        </Tooltip>
      )}
      <Tooltip title="Add Error">
        <Button
          icon={<ExclamationCircleOutlined />}
          type="default"
          aria-label="Add Error"
          onClick={() => handleOpenAddError(commessa)}
        />
      </Tooltip>
      {commessa.commessa.includes("24.0598") &&
        user?.reparto === "Officina" &&
        parseInt(user?.role) < 20 && (
          <Tooltip title="View PDF">
            <Button
              icon={<FilePdfOutlined />}
              type="default"
              aria-label="View PDF" // Changed aria-label to be more descriptive
              onClick={() => {
                const link = document.createElement("a");
                link.href =
                  "https://drive.google.com/file/d/1-_liUKUIE3j1c5gmWRNGAjEXt4_ZcxVD/view?usp=sharing";
                link.target = "_blank"; // Open in new tab
                link.rel = "noopener noreferrer"; // Security best practice
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
            />
          </Tooltip>
        )}
    </Space>
  );
};

export default FourButtons; // Exported the renamed component
