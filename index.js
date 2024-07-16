import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const db = new pg.Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: false
  }
});

db.connect();

app.get("/", (req, res) => {
  res.render("home.ejs");
});

app.get("/login", (req, res) => {
  res.render("login.ejs");
});

app.get("/register", (req, res) => {
  res.render("register.ejs");
});

app.post("/register", async (req, res) => {
  try {
    const email = req.body.username;
    const password = req.body.password;
    const existingUser = await db.query("SELECT email FROM users WHERE email = $1", [email]);
    if(existingUser.rows.length > 0) {
      res.send("Email already exists!");
    }
    else {
      const result1 = await db.query("INSERT INTO users (email, password) VALUES ($1, $2)", [email, password]);
      console.log(result1);
      res.render("secrets.ejs");
    }
  } catch (error) {
    console.log(error);
  }
});

app.post("/login", async (req, res) => {
  try {
    const email = req.body.username;
    const password = req.body.password;
    const result2 = await db.query("SELECT password FROM users WHERE email = $1", [email]);
    const userPassword = result2.rows[0];
    if(userPassword.password === password) {
      res.render("secrets.ejs");
    } else {
      res.send("Wrong password! Try again.");
    }
  } catch (error) {
    console.log(error);
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
