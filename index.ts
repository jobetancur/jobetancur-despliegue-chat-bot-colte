import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import chatRoutes from './routes/chatRoutes';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.use(express.urlencoded({ extended: true })); 

app.use('/api', chatRoutes);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});