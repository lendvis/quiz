import mongoose from "mongoose";

const QuizStats = new mongoose.Schema(
    {
        quizId: {type: String},
        userId: {type: String},

        answers: [Number],
        date: {type: Date, default: Date.now }
    }
)

export default mongoose.model("QuizStats", QuizStats)