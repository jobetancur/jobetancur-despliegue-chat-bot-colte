import { HumanMessage, AIMessage, BaseMessage } from "@langchain/core/messages";

export interface CustomMessage {
  type: 'human' | 'ai';
  data: {
    content: string;
    additional_kwargs?: Record<string, unknown>;
  };
}

export type Message = CustomMessage | HumanMessage | AIMessage;

export interface ChatHistory {
  messages: Message[];
}

export type ConversationalRetrievalResponse = string | {
  text?: string;
  output?: string;
  content?: string;
  [key: string]: unknown;
};