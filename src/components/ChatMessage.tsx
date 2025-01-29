import { User } from "lucide-react";
import { Message } from "../types/types";
import kai from "../assets/kai.png";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {

  function generateMessage() {
    const messageType = message.type;
    if (messageType === "text") {
      return <p className="whitespace-pre-wrap break-words">{message.text}</p>;
    } else if (messageType === "markdown") {
      return (
        <Markdown
          components={{
            // Every `<a>` in the markdown will use this component
            a: ({ node, ...props }) => {
              return <a target="_blank" style={{ color: "#cb3f29" ,textDecoration: "underline"}} {...props} />;
            },
          }}
          remarkPlugins={[remarkGfm]}
        >
          {message.text}
        </Markdown>
      );
    } else {
      return (
        <div>
          <p className="font-semibold mb-1 break-words">{message.text}</p>
          <ul className="list-disc list-inside">
            {message.data &&
              (Array.isArray(message.data)
                ? message.data
                : Object.keys(message.data)
              ).map((item: string, itemIndex) => (
                <li key={itemIndex} className="break-words">
                  {item}
                </li>
              ))}
          </ul>
        </div>
      );
    }
  }

  return (
    <div
      className={`flex ${
        message.sender === "user" ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`flex items-end gap-2 max-w-[80%] text-sm ${
          message.sender === "user" ? "flex-row-reverse" : "flex-row"
        }`}
      >
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center fontPixel flex-shrink-0 ${
            message.sender === "user" ? "bg-white" : "bg-[#cb3f29] text-white"
          }`}
        >
          {message.sender === "user" ? (
            <User className="w-4 h-4 text-black" />
          ) : (
            <img src={kai} className="w-8 h-8 rounded-full" />
          )}
        </div>
        <div
          className={`rounded-lg p-3 ${
            message.sender === "user"
              ? "bg-[#cb3f29] text-white"
              : "bg-white text-black fontPixel"
          }`}
        >
          {generateMessage()}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
