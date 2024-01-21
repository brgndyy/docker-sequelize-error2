const fs = require("fs");
const path = require("path");

const express = require("express");
const Sequelize = require("sequelize");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const dotenv = require("dotenv");

dotenv.config({ path: "./env/mysql.env" });

const Goal = require("./models/goal");

const app = express();

const sequelize = new Sequelize(
  process.env.MYSQL_DATABASE,
  process.env.MYSQL_USER,
  process.env.MYSQL_ROOT_PASSWORD,
  {
    port: process.env.MYSQL_PORT,
    host: "127.0.0.1",
    dialect: "mysql",
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

sequelize.authenticate();

app.set("port", process.env.PORT || 80);

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "logs", "access.log"),
  { flags: "a" }
);

app.use(morgan("combined", { stream: accessLogStream }));

app.use(bodyParser.json());

sequelize
  .sync({ force: false })
  .then(() => {
    console.log("Database connect is succeed!");
  })
  .catch((err) => {
    console.log(err);
  });

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.get("/goals", async (req, res) => {
  console.log("TRYING TO FETCH GOALS");
  try {
    const goals = await Goal.findAll();
    res.status(200).json({
      goals: goals.map((goal) => ({
        id: goal.id,
        text: goal.text,
      })),
    });
    console.log("FETCHED GOALS");
  } catch (err) {
    console.error("ERROR FETCHING GOALS");
    console.error(err.message);
    res.status(500).json({ message: "Failed to load goals." });
  }
});

app.post("/goals", async (req, res) => {
  console.log("TRYING TO STORE GOAL");
  const goalText = req.body.text;

  if (!goalText || goalText.trim().length === 0) {
    console.log("INVALID INPUT - NO TEXT");
    return res.status(422).json({ message: "Invalid goal text." });
  }

  const goal = await Goal.create({
    text: goalText,
  });

  try {
    await goal.save();
    res
      .status(201)
      .json({ message: "Goal saved", goal: { id: goal.id, text: goalText } });
    console.log("STORED NEW GOAL");
  } catch (err) {
    console.error("ERROR FETCHING GOALS");
    console.error(err.message);
    res.status(500).json({ message: "Failed to save goal." });
  }
});

app.delete("/goals/:id", async (req, res) => {
  console.log("TRYING TO DELETE GOAL");
  try {
    await Goal.destroy({
      where: {
        id: req.params.id,
      },
    });
    res.status(200).json({ message: "Deleted goal!" });
    console.log("DELETED GOAL");
  } catch (err) {
    console.error("ERROR FETCHING GOALS");
    console.error(err.message);
    res.status(500).json({ message: "Failed to delete goal." });
  }
});

app.listen(app.get("port"), () => {
  console.log(app.get("port"), "port is ready");
});

// mongoose.connect(
//   "mongodb://localhost:27017/course-goals",
//   {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   },
//   (err) => {
//     if (err) {
//       console.error("FAILED TO CONNECT TO MONGODB");
//       console.error(err);
//     } else {
//       console.log("CONNECTED TO MONGODB");
//       app.listen(80);
//     }
//   }
// );
