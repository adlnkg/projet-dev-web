import express from "express";
import routes from "./routes/index.js";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.use("/api", routes);

app.listen(3000, () => {
  console.log("Server is running at: http://localhost:3000");
});
