import dotenv from 'dotenv';
import { ChatOpenAI } from "@langchain/openai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { BaseMessage, SystemMessage } from "@langchain/core/messages";
import { MemorySaver } from "@langchain/langgraph";
import { 
  fetchDebtsTool, 
  fetchUserTool, 
  retrieverTool,
  calculatePaymentPlanTool,
  generatePaymentOptionsTool,
  summarizePaymentOptionTool,
  sendEmailWithPaymentArrengementTool
} from '../tools/tools';
import { MESSAGES } from '../config/constants';

dotenv.config();

const memory = new MemorySaver();

const llm = new ChatOpenAI({ 
    temperature: 0,
    model: "gpt-3.5-turbo",
    apiKey: process.env.OPENAI_API_KEY,
});

const tools = [
  fetchUserTool, 
  fetchDebtsTool, 
  retrieverTool,
  calculatePaymentPlanTool,
  generatePaymentOptionsTool,
  summarizePaymentOptionTool,
  sendEmailWithPaymentArrengementTool
];

const modifyMessages = (messages: BaseMessage[]) => {
    return [
      new SystemMessage(MESSAGES.SYSTEM_PROMPT),
      ...messages,
    ];
};

export const appWithMemory = createReactAgent({
    llm,
    tools,
    messageModifier: modifyMessages,
    checkpointSaver: memory,
});

export const config = {
    configurable: {
      thread_id: "test-thread",
    },
};