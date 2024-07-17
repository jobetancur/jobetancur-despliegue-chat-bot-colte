import React, { useState, useEffect } from 'react';
import './Chat.css';
import axios from 'axios';

interface Message {
  content: string;
  direction: 'sent' | 'received';
}

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    // Iniciar la conversación con un mensaje de bienvenida
    const welcomeMessage: Message = {
      content: "Te hablamos de la Colectora Latam. Puedes cumplir tus metas si te pones al día con tus teudas, ¿Quieres quedar al día con tus pagos?",
      direction: 'received'
    };
    setMessages([welcomeMessage]);
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      const userMessage: Message = { content: input, direction: 'sent' };
      setMessages(prevMessages => [...prevMessages, userMessage]);

      try {
        
        const response = await axios.post('http://localhost:3000/api/chat', {
          input,
        });

        const agentOutput = response.data;
        console.log("Agent output:", agentOutput);
        const lastMessage = agentOutput.messages[agentOutput.messages.length - 1].kwargs.content;

        if (lastMessage) {
          const botMessage: Message = { content: lastMessage, direction: 'received' };
          setMessages(prevMessages => [...prevMessages, botMessage]);
        } else {
          console.error("Respuesta inesperada del servidor:", response.data);
          const errorMessage: Message = { content: "Lo siento, ha ocurrido un error inesperado.", direction: 'received' };
          setMessages(prevMessages => [...prevMessages, errorMessage]);
        }
      } catch (error) {
        console.error("Error sending message:", error);
        let errorMessage = "Lo siento, ha ocurrido un error de conexión.";
        if (axios.isAxiosError(error) && error.response) {
          // El servidor respondió con un estado fuera del rango de 2xx
          errorMessage = `Error del servidor: ${error.response.data.error || error.message}`;
        }
        setMessages(prevMessages => [...prevMessages, { content: errorMessage, direction: 'received' }]);
      }

      setInput('');
    }
  };

  return (
    <div className="chat-container">
      <div className="header">
        <img src="https://via.placeholder.com/40" alt="profile" className="profile-pic" />
        <div className="header-details">
          <div className="contact-name">Asistente de Latam</div>
          <div className="last-seen">Disponible</div>
        </div>
      </div>
      <div className="messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.direction}`}>
            <p>{msg.content}</p>
          </div>
        ))}
      </div>
      <form className="input-container" onSubmit={handleSend}>
        <input 
          id="chat"
          type='text'
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          className="input" 
          placeholder="Escribe un mensaje..."
        />
        <button type="submit" className="send-button">
          <svg className="w-6 h-6 rotate-90" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path>
          </svg>
        </button>
      </form>
    </div>
  );
};

export default Chat;