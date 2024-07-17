// import { formatCurrency } from './helpers';
// import dotenv from 'dotenv';

// dotenv.config();

// const INTEREST_RATE = parseFloat(process.env.VITE_DAILY_INTEREST_RATE || '0.01');
// const DISCOUNT_OPTIONS = [
//   { days: 5, interestDiscount: 0.5, debtDiscount: 0.15 },
//   { days: 20, interestDiscount: 0.3, debtDiscount: 0.1 },
//   { days: 30, interestDiscount: 0.15, debtDiscount: 0.05 }
// ];

// export const calculateInterest = (principal: number, rate: number, time: number): number => {
//   if (isNaN(principal) || isNaN(rate) || isNaN(time)) {
//     console.error('Invalid input for calculateInterest:', { principal, rate, time });
//     return 0;
//   }
//   return principal * rate * time;
// };

// export const calculateDaysOverdue = (dueDate: Date): number => {
//   const today = new Date();
//   const diffTime = Math.abs(today.getTime() - dueDate.getTime());
//   const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
//   return diffDays;
// };

// export const calculateTotalDebt = (principal: number, interest: number): number => {
//   return principal + interest;
// };

// export const generatePaymentPlanDescription = (totalDebt: number, days: number): string => {
//   const plan = calculatePaymentPlan(totalDebt, days);
//   return `Plan de pago a ${days} días:
//     - Monto total a pagar: ${formatCurrency(parseFloat(plan.totalAmount))}
//     - Pago diario: ${formatCurrency(parseFloat(plan.dailyPayment))}`;
// };

// const calculatePaymentPlan = (totalDebt: number, days: number): {totalAmount: string; dailyPayment: string; days: number} => {
//   const totalAmount = calculateTotalDebt(totalDebt, INTEREST_RATE);
//   const dailyPayment = totalAmount / days;

//   return {
//     totalAmount: totalAmount.toFixed(2),
//     dailyPayment: dailyPayment.toFixed(2),
//     days: days
//   };
// };

// export const generatePaymentOptions = (debtAmount: number, interestAmount: number) => {
//   const options = [
//     { days: 5, interestDiscount: 0.5, debtDiscount: 0.15 },
//     { days: 20, interestDiscount: 0.3, debtDiscount: 0.1 },
//     { days: 30, interestDiscount: 0.15, debtDiscount: 0.05 }
//   ];

//   let response = "";

//   options.forEach((option, index) => {
//     const discountedDebt = debtAmount * (1 - option.debtDiscount);
//     const discountedInterest = interestAmount * (1 - option.interestDiscount);
//     const totalAmount = discountedDebt + discountedInterest;

//     response += `Opción ${index + 1}: Pago en ${option.days} días\n`;
//     response += `   Monto a pagar: ${formatCurrency(totalAmount)}\n`;
//     response += `   Ahorro: ${formatCurrency((debtAmount + interestAmount) - totalAmount)}\n\n`;
//   });

//   response += "Opción 4: Plan de pagos personalizado\n";
//   response += "   Podemos diseñar un plan de pagos que se ajuste a tu situación actual.\n\n";

//   return response;
// };

// export const generatePaymentAgreement = (userInfo: any, debtInfo: any) => {
//   return `
//   ACUERDO DE PAGO

//   Yo, ${userInfo.name}, identificado con documento número ${userInfo.documentId}, 
//   me comprometo a pagar la suma de [MONTO ACORDADO] en [PLAZO ACORDADO] a Colectora Latam.

//   Este pago corresponde a la deuda pendiente por un valor original de ${formatCurrency(debtInfo.amount)} 
//   más intereses por ${formatCurrency(debtInfo.interest)}.

//   Fecha de acuerdo: [FECHA ACTUAL]
//   Fecha límite de pago: [FECHA LÍMITE]

//   Firmado electrónicamente al aceptar este acuerdo.

//   ¿Estás de acuerdo con estos términos? Por favor, responde 'Sí, acepto' para confirmar.
//   `;
// };