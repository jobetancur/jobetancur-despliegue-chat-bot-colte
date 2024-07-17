/* eslint-disable @typescript-eslint/no-unused-vars */
import express from 'express';
import dotenv from 'dotenv';
import { appWithMemory, config } from '../agents/mainAgent';
import { HumanMessage } from '@langchain/core/messages';
import twilio from 'twilio';
import fetch from 'node-fetch';
import { OpenAI, toFile } from 'openai';
import { initializeApp } from "firebase/app";
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import { ElevenLabsClient } from 'elevenlabs';
import { saveChatHistory } from '../utils/saveHistoryDb';

dotenv.config();

const router = express.Router();

const MessagingResponse = twilio.twiml.MessagingResponse; // mandar un texto simple
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken); // mandar un texto con media
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
const elevenlabsClient = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const storage = getStorage();

const createAudioStreamFromText = async (text: string): Promise<Buffer> => {
  const audioStream = await elevenlabsClient.generate({
    voice: "Marian",
    model_id: "eleven_multilingual_v2",
    text,
  });

  const chunks: Buffer[] = [];
  for await (const chunk of audioStream) {
    chunks.push(chunk);
  }

  const content = Buffer.concat(chunks);
  return content;
};

router.post('/whatsapp', async (req, res) => {
  const twiml = new MessagingResponse();
  const from = req.body.From;
  const to = req.body.To;

  // Parseo de numeros de telefono
  const fromColonIndex = from.indexOf(':');
  const toColonIndex = to.indexOf(':');
  // Numero de telefono que pasa de "whatsapp:+57XXXXXXXXX" a "+57XXXXXXXXX"
  const fromNumber = from.slice(fromColonIndex + 1); // Número del cliente
  const toNumber = to.slice(toColonIndex + 1);
  
  try {
    let incomingMessage;

    if(req.body.MediaContentType0 && req.body.MediaContentType0.includes('audio')) {
      const mediaUrl = req.body.MediaUrl0;

      const response = await fetch(mediaUrl, {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`
        }
      });

      const file = await toFile(response.body, 'recording.wav');

      const transcription = await openai.audio.transcriptions.create({
        file,
        model: 'whisper-1',
      });

      const { text } = transcription;
      incomingMessage = text;
    } else {
      incomingMessage = req.body.Body;
    }

    // Ejecutar la función si el mensaje es del cliente
    await saveChatHistory(fromNumber, incomingMessage, true);

    const agentOutput = await appWithMemory.invoke(
      {
        messages: [
          new HumanMessage(incomingMessage),
        ],
      },
      config
    );

    const responseMessage = agentOutput.messages[agentOutput.messages.length - 1].content;

    // Ejecutar la función si el mensaje es del agente
    await saveChatHistory(fromNumber, responseMessage, false);

    // Si la respuesta es menor a 240 caracteres && no contiene números, hacer TTS y enviar el audio
    if (responseMessage.length <= 350 && !/\d/.test(responseMessage)) {
      const audioBuffer = await createAudioStreamFromText(responseMessage);
      const audioName = `${uuidv4()}.wav`;
      // Subir el archivo de audio a Firebase Storage
      const storageRef = ref(storage, `audios/${audioName}`);
      const metadata = {
        contentType: 'audio/mpeg',
      };
      const uploadTask = uploadBytesResumable(storageRef, audioBuffer, metadata);

      // Esperar a que la subida complete y obtener la URL pública
      uploadTask.on('state_changed',
        (snapshot) => {
          // Progreso de la subida (opcional)
          console.log('Upload is in progress...');
        },
        (error) => {
          throw new Error(`Upload failed: ${error.message}`);
        },
        async () => {
          // Subida completada
          const audioUrl = await getDownloadURL(uploadTask.snapshot.ref);

          // Envía el archivo de audio a través de Twilio
          await client.messages.create({
            body: "Audio message",
            from: to,
            to: from,
            mediaUrl: [audioUrl],
          });

          console.log('Audio message sent successfully');

          res.writeHead(200, { 'Content-Type': 'text/xml' });
          res.end(twiml.toString());
        }
      );

    } else {
      // Responder con el texto si es mayor de 240 caracteres
      twiml.message(responseMessage);
      res.writeHead(200, { 'Content-Type': 'text/xml' });
      res.end(twiml.toString());
    }

  } catch (error) {
    console.error('Error in chat route:', error);
    res.status(500).send({ 
      error: error instanceof Error ? error.message : "An unknown error occurred" 
    });
  }
});

// router.post('/chat', async (req, res) => {
//   try {
//     const { input } = req.body;

//     const agentOutput = await appWithMemory.invoke(
//       {
//         messages: [
//           new HumanMessage(input),
//         ],
//       },
//       config
//     );

//     res.send(agentOutput);

//   } catch (error) {
//     console.error('Error in chat route:', error);
//     res.status(500).send({ 
//       error: error instanceof Error ? error.message : "An unknown error occurred" 
//     });
//   }
// });

export default router;