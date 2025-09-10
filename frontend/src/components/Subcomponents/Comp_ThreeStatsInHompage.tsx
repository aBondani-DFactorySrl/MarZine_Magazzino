import React from "react";
import { Statistic, Row, Col, Typography } from "antd"; // Import Ant Design components

const { Text } = Typography;

interface ThreeStatProps {
  oreMancanti: number;
  oreLavorate: number;
  oreErrori: number;
  progression: number;
  erroriPerc: number;
  user: any;
  stato: any;
}

const ThreeStat: React.FC<ThreeStatProps> = ({
  oreMancanti,
  oreLavorate,
  oreErrori,
  progression,
  erroriPerc,
  user,
  stato,
}) => {
  // Ant Design's theme is typically handled globally or via ConfigProvider.
  // For direct color control similar to Chakra's colorMode, we'll use conditional styling.
  // Assuming a dark theme means white text, light theme means black text for simplicity.
  // You might want to integrate this with Ant Design's theme context if you have one set up.
  const isDarkTheme = true; // Placeholder: determine if dark theme is active
  const defaultTextColor = isDarkTheme ? "white" : "black";

  const getProgressioneColor = () => {
    if (oreLavorate > oreMancanti + oreLavorate) return "red";
    return defaultTextColor;
  };

  const getRisparmiateColor = () => {
    if (oreLavorate > oreMancanti + oreLavorate) return "red";
    if (parseInt(stato) === 99 && oreLavorate < oreMancanti + oreLavorate)
      return "green";
    return defaultTextColor;
  };

  const getErroriColor = () => (oreErrori === 0 ? "green" : "red");

  const commonStatStyle = {
    title: {
      color: isDarkTheme ? "rgba(255, 255, 255, 0.65)" : "rgba(0, 0, 0, 0.45)",
      fontSize: "12px",
    }, // Adjusted for AntD look
    value: { fontSize: "20px" },
  };

  const officinaStatStyle = {
    title: {
      color: isDarkTheme ? "rgba(255, 255, 255, 0.85)" : "rgba(0, 0, 0, 0.85)",
    }, // Default AntD title color
    value: {}, // Default AntD value style
  };

  return (
    <Row gutter={16} justify="space-around">
      {" "}
      {/* gutter for spacing between stats, justify to spread them */}
      {user?.reparto === "Officina" && parseInt(user?.role) >= 20 ? (
        <>
          <Col>
            <Statistic
              title={<Text style={officinaStatStyle.title}>Progressione</Text>}
              value={`${Math.abs(oreLavorate)}h / ${
                oreMancanti + oreLavorate
              }h`}
              valueStyle={{
                color: getProgressioneColor(),
                ...officinaStatStyle.value,
              }}
              suffix={
                <Text
                  style={{
                    color: isDarkTheme
                      ? "rgba(255,255,255,0.45)"
                      : "rgba(0,0,0,0.45)",
                    fontSize: "12px",
                  }}
                >
                  {progression < 100
                    ? Math.floor(Math.abs(progression)).toFixed(0)
                    : Math.floor(Math.abs(progression - 100)).toFixed(0)}
                  %
                </Text>
              }
            />
          </Col>
          <Col>
            <Statistic
              title={
                <Text style={officinaStatStyle.title}>
                  {oreMancanti < 0 ? "Superate" : "Risparmiate"}
                </Text>
              }
              value={`${Math.abs(oreLavorate - (oreLavorate + oreMancanti))}h`}
              valueStyle={{
                color: getRisparmiateColor(),
                ...officinaStatStyle.value,
              }}
            />
          </Col>
          <Col>
            <Statistic
              title={<Text style={officinaStatStyle.title}>Errori</Text>}
              value={`${oreErrori}h`}
              valueStyle={{
                color: getErroriColor(),
                ...officinaStatStyle.value,
              }}
              suffix={
                <Text
                  style={{
                    color: isDarkTheme
                      ? "rgba(255,255,255,0.45)"
                      : "rgba(0,0,0,0.45)",
                    fontSize: "12px",
                  }}
                >
                  {Math.floor(erroriPerc).toFixed(0)}%
                </Text>
              }
            />
          </Col>
        </>
      ) : (
        <>
          <Col>
            <Statistic
              title={<Text style={commonStatStyle.title}>Progressione</Text>}
              value={`${Math.abs(oreLavorate)}h / ${
                oreMancanti + oreLavorate
              }h`}
              valueStyle={{
                color: oreMancanti < 0 ? "red" : defaultTextColor,
                ...commonStatStyle.value,
              }}
              suffix={
                <Text
                  style={{
                    color: isDarkTheme
                      ? "rgba(255,255,255,0.45)"
                      : "rgba(0,0,0,0.45)",
                    fontSize: "11px",
                  }}
                >
                  {progression < 100
                    ? Math.floor(Math.abs(progression)).toFixed(0)
                    : Math.floor(Math.abs(progression - 100)).toFixed(0)}
                  %
                </Text>
              }
            />
          </Col>
          <Col>
            <Statistic
              title={
                <Text style={commonStatStyle.title}>
                  {oreMancanti < 0 ? "Superate" : "Risparmiate"}
                </Text>
              }
              value={`${Math.abs(oreLavorate - (oreLavorate + oreMancanti))}h`}
              valueStyle={{
                color: oreMancanti < 0 ? "red" : defaultTextColor,
                ...commonStatStyle.value,
              }}
            />
          </Col>
          <Col>
            <Statistic
              title={<Text style={commonStatStyle.title}>Errori</Text>}
              value={`${oreErrori}h`}
              valueStyle={{ color: getErroriColor(), ...commonStatStyle.value }}
              suffix={
                <Text
                  style={{
                    color: isDarkTheme
                      ? "rgba(255,255,255,0.45)"
                      : "rgba(0,0,0,0.45)",
                    fontSize: "11px",
                  }}
                >
                  {Math.floor(erroriPerc).toFixed(0)}%
                </Text>
              }
            />
          </Col>
        </>
      )}
    </Row>
  );
};

export default ThreeStat;
