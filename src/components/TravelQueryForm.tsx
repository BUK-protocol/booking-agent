import { useEffect, useRef, useState } from "react";
import { LangflowClient } from "../utils/LangflowClient";
import { io } from "socket.io-client";
import { Send } from "lucide-react";
import { Message } from "../types/types";
import VideoStream from "./VideoStream";
import ChatMessage from "./ChatMessage";
import { API_URL } from "../utils/constant";

const client = new LangflowClient();
const socket = io(API_URL);

const TravelQueryForm = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleSocketEvents = () => {
      socket.on("connect", () => {
        setMessages((prev) => [
          ...prev,
          {
            sender: "ai",
            text: "Hi I am kai, where and when are you traveling",
            type: "text",
          },
        ]);
      });

      socket.on("disconnect", () => {
        setMessages((prev) => [
          ...prev,
          {
            sender: "ai",
            text: "Disconnected from Kai travel agent",
            type: "text",
          },
        ]);
        setIsStreaming(false);
      });

      socket.on("automation_message", (message) => {
        setMessages((prev) => [
          ...prev,
          { sender: "ai", text: message, type: "text" },
        ]);
      });

      socket.on("automation_complete", () => {
        // setMessages((prev) => [
        //   ...prev,
        //   {
        //     sender: "ai",
        //     text: "Booking automation completed successfully",
        //     type: "text",
        //   },
        // ]);
        setLoading(false);
        setIsStreaming(false);
      });

      socket.on("automation_error", (error) => {
        setMessages((prev) => [
          ...prev,
          { sender: "ai", text: `Error: ${error}`, type: "text" },
        ]);
        setLoading(false);
        setIsStreaming(false);
      });

      socket.on("display_data", (data) => {
        setMessages((prev) => [
          ...prev,
          { sender: "ai", text: data.text, type: "data", data: data.data },
        ]);
      });
    };

    handleSocketEvents();

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("automation_message");
      socket.off("automation_complete");
      socket.off("automation_error");
      socket.off("display_data");
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const processQuery = async () => {
    if (!input.trim()) return;

    setLoading(true);
    setInput("");

    try {
      const response = await client.processQuery(input);
      setMessages((prev) => [
        ...prev,
        { sender: "user", text: input, type: "text" },
      ]);

      const parsedResponse = JSON.parse(response);

      if (response) {
        setMessages((prev) => [
          ...prev,
          { sender: "ai", text: parsedResponse?.chat_message, type: "text" },
        ]);

        socket.emit("start-automation", {
          city: parsedResponse?.data?.city,
          check_in_date: parsedResponse?.data?.check_in_date,
          check_out_date: parsedResponse?.data?.check_out_date,
          user_filters: parsedResponse?.data?.filters,
        });
      }
    } catch (err) {
      console.log("Error occurred", err);
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "Sorry, an error occurred. Please try again.",
          type: "text",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex  gap-4 h-screen">
      <VideoStream
        socket={socket}
        isStreaming={isStreaming}
        setIsStreaming={setIsStreaming}
      />
      <div className="flex flex-col h-screen bg-[#1a1a1a] rounded-lg p-4 w-[30%]">
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent pr-2">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <ChatMessage key={index} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="mt-4 flex-shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              processQuery();
            }}
            className="flex space-x-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 p-2 bg-[#292929] text-white rounded-md focus:outline-none focus:ring-1 focus:ring-[#cb3f29]"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading}
              className="p-2 bg-[#cb3f29] text-white rounded-md disabled:opacity-50 hover:bg-[#b33821] transition-colors"
            >
              {loading ? "Sending..." : <Send className="w-5 h-5" />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TravelQueryForm;
