const URL = "http://localhost:8080";

Vue.createApp({
  data() {
    return {
      currentPage: "loading",
      user: {
        name: "",
        email: "",
        password: "",
      },
      currentUser: null,
      newQuiz: {
        title: "",
        description: "",
        questions: [],
      },
      newQuestions: [
        {
          questionText: "",
          possibleChoices: [{ answerText: "", isCorrect: false }],
        },
      ],
      quizzes: [],
      currentQuiz: {},
      currentQuizQuestion: 0,
      currentQuizQuestionAnswered: false,
      currentQuizTotalScore: 0,
      editingQuiz: false,
    };
  },
  methods: {
    setPage: function (page) {
      this.currentPage = page;
    },

    registerUser: async function () {
      console.log(this.user);
      let myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");

      let requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: JSON.stringify(this.user),
      };
      let response = await fetch(`${URL}/users`, requestOptions);
      if (response.status === 201) {
        console.log("successfully registered");
        this.loginUser();
      } else {
        console.log("failed to register");
      }
    },

    loginUser: async function () {
      let myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");

      let requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: JSON.stringify(this.user),
      };
      let response = await fetch(`${URL}/session`, requestOptions);
      let data = await response.json();
      if (response.status === 201) {
        console.log("successfully logged in");
        this.currentUser = data;
        this.user.name = "";
        this.user.email = "";
        this.user.password = "";
        this.currentPage = "quizzes";
      } else {
        console.log("miau");
      }
      this.getQuiz();
    },
    getSession: async function () {
      let response = await fetch(`${URL}/session`);

      if (response.status === 200) {
        let data = await response.json();
        this.currentUser = data;
        this.currentPage = "quizzes";
      } else {
        this.currentPage = "login";
      }
      this.getQuiz();
    },
    deleteSession: async function () {
      let requestOptions = {
        method: "DELETE",
      };
      let response = await fetch(`${URL}/session`, requestOptions);
      if (response.status === 204) {
        this.currentPage = "login";
        this.currentUser = null;
      }
    },

    addQuestion: function () {
      this.newQuestions.push({
        questionText: "",
        possibleChoices: [{ answerText: "", isCorrect: false }],
      });
    },

    addAnswer: function (index) {
      this.newQuestions[index].possibleChoices.push({
        answerText: "",
        isCorrect: false,
      });
    },

    createQuiz: async function () {
      let myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");

      this.newQuiz.questions = this.newQuestions;

      let requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: JSON.stringify(this.newQuiz),
      };

      let response = await fetch(`${URL}/quizzes`, requestOptions);
      if (response.status === 201) {
        this.currentPage = "quizzes";
        console.log("Successfully created quiz");
      } else {
        console.log("failed to create quiz");
      }
      this.getQuiz();
      this.clearQuiz();
    },
    getQuiz: async function () {
      let response = await fetch(`${URL}/quizzes`);

      let data = await response.json();
      this.quizzes = data;
    },
    clearQuiz: function () {
      this.newQuiz = {
        title: "",
        description: "",
        questions: [],
      };
      this.newQuestions = [
        {
          questionText: "",
          possibleChoices: [{ answerText: "", isCorrect: false }],
        },
      ];
      this.currentQuiz = {};
      this.currentQuizQuestion = 0;
      this.currentQuizQuestionAnswered = false;
      this.currentQuizTotalScore = 0;
      this.editingQuiz = false;
    },
    deleteQuiz: async function (quizID) {
      requestOptions = {
        method: "DELETE",
      };

      let response = await fetch(`${URL}/quizzes/${quizID}`, requestOptions);
      if (response.status === 204) {
        this.getQuiz();
      }
    },
    startQuiz: async function (quizID) {
      let response = await fetch(`${URL}/quizzes/${quizID}`);
      let data = await response.json();
      this.currentQuiz = data[0];
      this.currentPage = "singleQuiz";
    },
    nextQuestion: function () {
      this.currentQuizQuestion++;
      this.currentQuizQuestionAnswered = false;
    },
    answerQuestion: function (answer) {
      if (answer.isCorrect) {
        this.currentQuizTotalScore++;
      }
      this.currentQuizQuestionAnswered = true;
    },
    editQuiz: function (quiz) {
      this.newQuiz = quiz;
      this.newQuestions = quiz.questions;
      this.currentPage = "createQuiz";
      this.editingQuiz = true;
    },
    saveQuiz: async function () {
      let myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");

      this.newQuiz.questions = this.newQuestions;

      let requestOptions = {
        method: "PUT",
        headers: myHeaders,
        body: JSON.stringify(this.newQuiz),
      };

      let response = await fetch(
        `${URL}/quizzes/${this.newQuiz._id}`,
        requestOptions
      );

      if (response.status === 204) {
        this.getQuiz();
        this.clearQuiz();
        this.currentPage = "quizzes";
      } else {
        console.log("miau");
      }
    },
  },
  created: function () {
    console.log("app loaded");
    this.getSession();
    console.log(this.quizzes);
  },
}).mount("#miau");
