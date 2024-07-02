const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { Schema } = mongoose;

mongoose.connect(process.env.DBPASSWORD);

const UserSchema = Schema({
  email: {
    type: String,
    required: [true, "User must have an email"],
  },
  password: {
    type: String,
    required: [true, "User must have a password"],
  },
  name: {
    type: String,
  },
});

const QuizSchema = Schema(
  {
    title: {
      type: String,
      required: [true, "Quiz needs a title"],
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "A quiz needs an owner"],
    },
    description: {
      type: String,
    },
    questions: [
      {
        questionText: {
          type: String,
          required: [true, "question needs text"],
        },
        possibleChoices: [
          {
            answerText: {
              type: String,
              required: [true, "answer needs text"],
            },
            isCorrect: {
              type: Boolean,
              required: [true, "question needs to have an option"],
            },
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

UserSchema.methods.setPassword = async function (password) {
  try {
    let hashedPassword = await bcrypt.hash(password, 12);
    this.password = hashedPassword;
  } catch (error) {}
};

UserSchema.methods.verifyPassword = async function (password) {
  let isGood = await bcrypt.compare(password, this.password);
  return isGood;
};

const User = mongoose.model("User", UserSchema);
const Quiz = mongoose.model("Quiz", QuizSchema);

module.exports = {
  Quiz,
  User,
};
