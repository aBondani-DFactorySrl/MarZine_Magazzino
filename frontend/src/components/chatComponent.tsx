import { Typography } from "antd";

interface Note {
  text: string;
  author: string;
  timestamp: string;
}

interface ChatComponentProps {
  notes: Note[];
}
const ChatComponent: React.FC<ChatComponentProps> = ({ notes }) => {
  const formatDate = (isoString: string): string => {
    if (isoString === "") return "No Data";
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${year}/${month}/${day} ${hours}:${minutes}`;
  };
  let sortedNotes = [{ text: "", author: "", timestamp: "" }];
  if (Array.isArray(notes)) {
    sortedNotes = notes.sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  } else {
    sortedNotes = [{ text: notes, author: "No Author", timestamp: "" }];
  }

  const capitalizeFirstLetterOfEachWord = (str: string): string => {
    return str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  return (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 1000,
          overflowY: "auto",
          borderTop: "1px solid #f0f0f0",
        }}
      >
        {sortedNotes.map((note) => (
          <div
            key={Math.random()}
            style={{
              width: "100%",
              padding: 8,
              borderBottom: "1px solid #f0f0f0",
              textAlign: "center",
            }}
          >
            {note.text !== "" && (
              <>
                <Typography.Text
                  italic
                  strong
                  style={{
                    fontSize: 15,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "block",
                  }}
                >
                  {formatDate(note.timestamp)} -{" "}
                  {capitalizeFirstLetterOfEachWord(
                    note.author.split("@")[0].replace(".", " ")
                  )}
                </Typography.Text>
                <Typography.Text
                  style={{ fontSize: 18, marginTop: 4, marginBottom: 80 }}
                >
                  {note.text}
                </Typography.Text>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatComponent;
