const express = require("express");
// const cors = require("cors");
const model = require("./model");
const session = require("express-session");
const app = express();
// app.use(cors());

app.use(express.json());

app.use(express.static("public"));

app.use(
  session({
    secret:
      "miuamiaumiaumaiuamiuamiuamiuamiuamiaumiaumaiuamiuamiuamiuamiuamiaumiaumaiuamiuamiuamiuamiuamiaumiaumaiuamiuamiuamiuamiuamiaumiaumaiuamiuamiuamiuamiuamiaumiaumaiuamiuamiuamiuamiuamiaumiaumaiuamiuamiuamiuamiuamiaumiaumaiuamiuamiuamiuamiuamiaumiaumaiuamiuamiuamiua",
    saveUninitialized: true,
    resave: false,
  })
);

async function AuthMiddleware(request, response, next) {
  if (request.session && request.session.userID) {
    let user = await model.User.findOne({ _id: request.session.userID });
    if (!user) {
      return resposne.status(401).send("Unauthenticated");
    }
    request.user = user;
    console.log(request.session.userID);
    next();
  } else {
    return response.status(401).send("Unauthenticated");
  }
}

app.get("/users", async (request, response) => {
  try {
    let users = await model.User.find({}, { password: 0 });
    response.send(users);
  } catch (error) {
    response.status(500).send("Server error");
  }
});

app.get("/session", AuthMiddleware, (request, response) => {
  response.send(request.session);
});

app.post("/session", async (request, response) => {
  try {
    let user = await model.User.findOne({ email: request.body.email });
    if (!user) {
      response.status(401).send("You failed to authenticate");
    }

    let isGoodPassword = await user.verifyPassword(request.body.password);

    if (!isGoodPassword) {
      response.status(401).send("You failed to authenticate");
    }

    request.session.userID = user._id;

    response.status(201).send(request.session);
  } catch (error) {
    response.status(500);
    console.log(error);
  }
});

app.post("/users", async (request, response) => {
  try {
    let newUser = await new model.User({
      email: request.body.email,
      name: request.body.name,
    });
    await newUser.setPassword(request.body.password);

    const error = await newUser.validateSync();

    if (error) {
      response.status(422).send(error);
      return;
    }

    await newUser.save();
    response.status(201).send("YIPPI");
  } catch (error) {
    response.status(500).send("Server Error");
    console.log(error);
  }
});

app.get("/quizzes", async function (req, res) {
  try {
    let quizzes = await model.Quiz.find();
    if (!quizzes) {
      res.status(404).send("Quizzes Not Found");
      return;
    }
    res.json(quizzes);
  } catch (error) {
    console.log(error);
    res.status(404).send("Quizzes Not Found");
  }
});

app.get("/quizzes/:quizID", async function (req, res) {
  try {
    console.log(req.params.quizID);
    let quiz = await model.Quiz.find({ _id: req.params.quizID });
    console.log(quiz);
    if (!quiz) {
      console.log("Quiz not found.");
      res.status(404).send("Quiz not found.");
      return;
    }

    res.json(quiz);
  } catch (error) {
    console.log(error);
    console.log("Bad request (GET quiz).");
    res.status(400).send("Quiz not found.");
  }
});

app.post("/quizzes", AuthMiddleware, async function (request, response) {
  try {
    const newQuiz = new model.Quiz({
      title: request.body.title,
      description: request.body.description,
      questions: request.body.questions,
      owner: request.session.userID,
    });

    const error = await newQuiz.validateSync();
    if (error) {
      response.status(422).send(error);
      console.log(error);
      return;
    }

    await newQuiz.save();
    response.status(201).send("Created Quiz :3");
  } catch (error) {
    console.error(error);
    response.status(422).send(error);
  }
});

app.put("/quizzes/:quizID", AuthMiddleware, async function (request, response) {
  try {
    let quiz = await model.Quiz.findOne({
      _id: request.params.quizID,
      owner: request.session.userID,
    }).populate("owner");

    if (!quiz) {
      response.status(404).send("Quiz not found");
      return;
    }

    if (request.session.userID !== quiz.owner._id.toString()) {
      response.status(400).send("Wrong user");
      return;
    }

    quiz.title = request.body.title;
    quiz.description = request.body.description;
    quiz.questions = request.body.questions;

    const error = await quiz.validateSync();
    if (error) {
      response.status(422).send(error);
      console.log(error);
      return;
    }
    await quiz.save();
    response.status(204).send();
  } catch (error) {
    console.log(error);
    response.status(422).send(error);
  }
});

app.delete(
  "/quizzes/:quizID",
  AuthMiddleware,
  async function (request, response) {
    try {
      let isDeleted = await model.Quiz.findOneAndDelete({
        _id: request.params.quizID,
        owner: request.session.userID,
      });
      if (!isDeleted) {
        response.status(404).send("Quiz Not Found");
        return;
      }
      if (request.session.userID !== quiz.owner._id.toString()) {
        response.status(400).send("Wrong user");
        return;
      }

      response.status(204).send("Removed");
    } catch (error) {
      console.log(error);
      response.status(500).json(error);
    }
  }
);

app.delete("/session", function (req, res) {
  req.session.userID = undefined;
  res.status(204).send();
});

app.listen(8080, function () {
  console.log("Server is running on http://localhost:8080");
});
