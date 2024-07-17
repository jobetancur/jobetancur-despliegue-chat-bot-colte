import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { searchVectors } from "../utils/retrievers";
import { 
    fetchUser, 
    fetchDebts, 
    generatePaymentOptions, 
    calculatePaymentPlan,
    summarizePaymentOption,
    sendEmailWithPaymentArrengement,
} from "../utils/functions";

export const retrieverTool = tool(
    async ({ query }: { query: string }) => {
      const results = await searchVectors(query);
      return results;
    },
    {
      name: "retriever",
      description: "Busca documentos relacionados con la consulta.",
      schema: z.object({
        query: z.string(),
      }),
    }
);

export const fetchUserTool = tool(
    async ({ documentId }: { documentId: string }) => {
      const user = await fetchUser(documentId);
      return user;
    },
    {
      name: "fetch_user",
      description: "Pide el número de documento de un cliente para conocer su nombre y correo.",
      schema: z.object({
        documentId: z.string(),
      }),
    }
);

export const fetchDebtsTool = tool(
    async ({ documentId }: { documentId: string }) => {
      const debts = await fetchDebts(documentId);
      return debts;
    },
    {
      name: "fetch_debts",
      description: "Obtiene las deudas de un usuario por su document_id y responde con nombre de cliente asociado al documento.",
      schema: z.object({
        documentId: z.string(),
      }),
    }
);

export const calculatePaymentPlanTool = tool(
    async ({ totalDebt, days }: { totalDebt: number, days: number }) => {
      const paymentPlan = calculatePaymentPlan(totalDebt, days);
      return paymentPlan;
    },
    {
      name: "calculate_payment_plan",
      description: "Calcula un plan de pagos.",
      schema: z.object({
        totalDebt: z.number(),
        days: z.number(),
      }),
    }
);

export const generatePaymentOptionsTool = tool(
    async ({ totalDebt }: { totalDebt: number }) => {
      const paymentOptions = generatePaymentOptions(totalDebt);
      return paymentOptions;
    },
    {
      name: "generate_payment_options",
      description: "Genera opciones de pago.",
      schema: z.object({
        totalDebt: z.number(),
      }),
    }
);

export const summarizePaymentOptionTool = tool(
    async ({ selectedOption }: { selectedOption: string }) => {
      const result = summarizePaymentOption(selectedOption);
      return result;
    },
    {
      name: "summarize_payment_option",
      description: "Genera un mensaje con los detalles del acuerdo del acuerdo de pago seleccionado.",
      schema: z.object({
        selectedOption: z.string()
      }),
    }
);

export const sendEmailWithPaymentArrengementTool = tool(
    async ({ name, documentId, days, dailyPayment, totalAmount, email }: { name: string, documentId: string, days: number, dailyPayment: number, totalAmount: number, email: string }) => {
      const result = await sendEmailWithPaymentArrengement(name, documentId, days, dailyPayment, totalAmount, email);
      return result;
    },
    {
      name: "send_email_with_payment_arrengement",
      description: "Envía un correo con el acuerdo de pago. Pregunta siempre por el correo electrónico del cliente antes de enviar el acuerdo.",
      schema: z.object({
        name: z.string(),
        documentId: z.string(),
        days: z.number(),
        dailyPayment: z.number(),
        totalAmount: z.number(),
        email: z.string(),
      }),
    }
);