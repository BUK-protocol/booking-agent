export interface LangflowResponse {
  chat_message: string;
  data: {
    city: string;
    checkInDate: string;
    checkOutDate: string;
    user_filters: { [key: string]: string };
  };
}

export interface Message {
  sender: "user" | "ai";
  text: string;
  type: "text" | "data";
  data?: string[];
}
