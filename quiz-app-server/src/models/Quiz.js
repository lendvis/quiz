import mongoose from "mongoose";


const questionSchema = new mongoose.Schema({
  text: String,
  answers: [String],
  rightAnswer: Number,
  image: String
});

const quizSchema = new mongoose.Schema({
  name: String,
  description: String,
  image: String,
  questions: [questionSchema]
});

export default mongoose.model('Quiz', quizSchema);