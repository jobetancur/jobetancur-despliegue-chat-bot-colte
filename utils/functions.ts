import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Supabase connection
const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseKey = process.env.SUPABASE_ANON_KEY as string;
export const supabase = createClient(supabaseUrl, supabaseKey);

export async function addUser(documentId: string, name: string, lastName: string, phone: string, birthDate: Date) {
  const { data, error } = await supabase
    .from('Users')
    .insert([{ document_id: documentId, name: name, lastname: lastName, phone: phone, birth_date: birthDate }]);
  
  if (error) console.log('Error:', error);
  else console.log('User added:', data);
}
  
// Función para obtener un usuario por su document_id
export async function fetchUser(documentId: string) {
  const { data, error } = await supabase
    .from('Users')
    .select('*')
    .eq('document_id', documentId)
    .single();

  if (error) {
    return null;
  }
  return data;
}

// Esta función está adaptada para trabajar con el archivo migrationAgent.ts
export async function fetchDebts(documentId: string) {
    const { data, error } = await supabase
      .from('Debts')
      .select('*')
      .eq('document_id', documentId)
      .single();

    if (error) {
      console.error('Error fetching debts:', error);
      return "No se pudo recuperar la información de deudas.";
    }

    if (!data) {
      return "No se encontraron deudas para este documento.";
    }

    const userData = await fetchUser(documentId);

    const createNewDataDebts = {
      document_id: data.document_id,
      created_at: data.created_at,
      amount: data.amount,
      description: data.description,
      due_date: data.due_date,
      interest: data.interest,
      name: userData.name,
      lastname: userData.lastname,
      phone: userData.phone,
      birth_date: userData.birth_date,
      email: userData.email
    };

    if (!createNewDataDebts) {
      return "Parece que no tienes deudas pendientes. Puedes validar tu número de documento e intentar nuevamente.";
    }

    console.log('Debts:', createNewDataDebts);
    return JSON.stringify(createNewDataDebts); 
}

export function calculatePaymentPlan (totalDebt: number, days: number) {
  const interestRate = 0.01; // 1% de interés diario, ajusta según las políticas de Coltefinanciera
  const totalInterest = totalDebt * interestRate * days;
  const totalAmount = totalDebt + totalInterest;
  const dailyPayment = totalAmount / days;

  const paymentPlan = {
    totalAmount: totalAmount.toFixed(2),
    dailyPayment: dailyPayment.toFixed(2),
    days: days
  };

  return JSON.stringify(paymentPlan);
}

export function generatePaymentOptions (totalDebt: number) {
  const options = [5, 15, 30].map(days => calculatePaymentPlan(totalDebt, days));
  return JSON.stringify(options);
}

// Crear resúmen con condiciones de pago sobre la opción de pago seleccionada
export function summarizePaymentOption (selectedOption: string) {
  const parsedOption = JSON.parse(selectedOption);
  const summary = `El deudor se compromete a pagar $${parsedOption.dailyPayment} diarios, hasta completar un total de $${parsedOption.totalAmount}. El acuerdo de pago tiene una duración de ${parsedOption.days} días. ¿Desea confirmar este acuerdo?`;
  return summary;
}

// Enviar correo electrónico con el acuerdo de pago
export async function sendEmailWithPaymentArrengement(name: string, documentId: string, days: number, dailyPayment: number, totalAmount: number, email: string) {

  if (!email) {
    return "El correo electrónico es requerido para poder enviarte el acuerdo.";
  }

  const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
      }
    });
  const mailOptions = {
    from: '"Colectora Latam 🪙" <alejandro.b@ultimmarketing.com>',
    to: email,
    subject: 'Hemos generado un acuerdo de pago para tu deuda',
    html: `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          background-color: #f4f4f4;
        }
        .container {
          background-color: #ffffff;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          max-width: 600px;
          margin: 0 auto;
        }
        h1 {
          color: #333333;
          font-size: 24px;
          text-align: center;
        }
        p {
          color: #666666;
          line-height: 1.6;
          font-size: 16px;
        }
        .highlight {
          color: #000000;
          font-weight: bold;
        }
        .payment-channels {
          margin-top: 20px;
        }
        .payment-channels h2 {
          color: #333333;
          font-size: 20px;
          text-align: center;
        }
        .payment-channels p {
          color: #666666;
          font-size: 16px;
        }
        .payment-channels .section-title {
          font-weight: bold;
          color: #333333;
          margin-top: 10px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Gracias por confiar en nosotros</h1>
        <p>Por medio de este documento, <span class="highlight">${days} días</span> después de la fecha de creación de este acuerdo, el deudor <span class="highlight">${name}</span> con número de idenficicación <span class="highlight">${documentId}</span> se compromete a pagar la suma de <span class="highlight">$${dailyPayment} pesos</span> diarios, hasta completar un total de <span class="highlight">$${totalAmount} pesos</span>.</p>
        <div class="payment-channels">
          <h2>Canales de Pago</h2>
          <div>
            <p class="section-title">¡SUCURSALES BANCARIAS!</p>
            <p><strong>Bancolombia:</strong></p>
            <p>1. Indica que es un recaudo para RIN VALIDA S.A.S.<br>
               2. Indica número de convenio "54245".<br>
               3. Informa número de referencia: "627" seguido del número de cédula.<br>
               4. Indica el valor a cancelar.</p>
          </div>
          <div>
            <p class="section-title">¡OTRAS ENTIDADES!</p>
            <p>1. Ingresa a <a href="http://www.colectoralatam.com">www.colectoralatam.com</a> > Pagos.<br>
               2. Ingresa el número de cédula y selecciona el pago a realizar en la opción ($).<br>
               3. Selecciona el Tipo de Pago > Medio de Pago > Crear Pago y Descarga el Cupón de Pago.</p>
            <p>IMPORTANTE: En el cupón encontrarás el número de referencia y el valor a cancelar, tendrán una vigencia de 24 horas para efectuar el pago.</p>
            <p><strong>Sured/Apostar/Susuertes PAYVALIDA</strong><br>
               Convenio "110342"</p>
            <p><strong>efecty/Puntored</strong><br>
               Convenio "110342"</p>
            <p><strong>Gana</strong><br>
               Convenio "260"</p>
          </div>
          <div>
            <p class="section-title">¡CANALES DIGITALES!</p>
            <p>1. Ingresa a la página web <a href="http://www.colectoralatam.com">www.colectoralatam.com</a> opción Pagos.<br>
               2. Ingresa el número de cédula y selecciona el pago a realizar en la opción ($).<br>
               3. Selecciona el valor que deseas pagar e indica como medio de pago PSE Débito e ingresa tus datos.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `
  };
  
  try {
      // Envía el correo electrónico
      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent:', info);
      return `Acuerdo de pago enviado tu correo registrado ${email}. En unos minutos recibirás un correo con los detalles del acuerdo.`;
    } catch (error) {
      console.error('Error al enviar el correo: ', error);
      return "Error al enviar el correo.";
  }
}