import express from "express";
import routes from "./routes/index.js";
import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  /* Frontend static*/
  res.send("Hello World");
});

app.use("/api", routes);

app.use("/images", express.static(path.join(__dirname, "../public/images")));

app.listen(3000, () => {
  console.log("Server is running at: http://localhost:3000");
});
