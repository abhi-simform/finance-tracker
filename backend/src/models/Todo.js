// Mongoose schema/model for a persisted Todo document.
import mongoose from 'mongoose';

const todoSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, trim: true },
    completed: { type: Boolean, default: false }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Todo = mongoose.model('Todo', todoSchema);

export default Todo;
