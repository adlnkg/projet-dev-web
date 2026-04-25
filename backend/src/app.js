import express from "express";
import routes from "./routes/index.js";
import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

// Configuration CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  /* Frontend static*/
  res.send("Hello World");
});

app.use("/api", routes);

app.use("/images", express.static(path.join(__dirname, "../public/images")));

app.use((error, req, res, next) => {
  if (error.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      error: "Fichier trop volumineux. Taille maximale: 5 Mo.",
    });
  }

  const statusCode = error.statusCode ?? 500;
  const message = error.message ?? "Erreur interne du serveur.";

  return res.status(statusCode).json({
    error: message,
  });
});

app.listen(3000, () => {
  console.log("Server is running at: http://localhost:3000");
});
