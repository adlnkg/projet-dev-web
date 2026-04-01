import express from "express";
import prisma from "./config/db.js";
import register from "./routes/auth/register.js";

const app = express();
app.use(express.json());

app.get("/", async (req, res) => {
  res.send("Hello World");
});

app.post("/register", register);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
