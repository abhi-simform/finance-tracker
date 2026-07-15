import 'dotenv/config';
import { createApp } from './app.js';
import { TodoService } from './services/todoService.js';
import { createMongoTodoStore } from './store/mongoTodoStore.js';
import { connectDB } from './config/db.js';

const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/todo-app';

async function start() {
  try {
    await connectDB(MONGODB_URI);
    const todoService = new TodoService(createMongoTodoStore());
    const app = createApp(todoService);
    app.listen(PORT, () => {
      console.log(`Todo API listening on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

start();
