//#region Imports
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import { fileURLToPath } from "url";
import XLSX from "xlsx";
import { dirname } from "path";
import path from "path";
import pkg from "pg";
import fs from "fs";
import sql from "mssql";
import multer from "multer";
import { checkImpegni, checkMancanti, checkInformation } from "./checkESA.js";
import {
  modify,
  updateById,
  updateShelf,
  add,
  updateOfficinaPos,
} from "./iterazioni.js";
import { readExcel, popPdf } from "./readFiles.js";
// import { checkImpegni, checkMancanti, checkInformation } from "./checkESA.js";
// import { readExcel, popPdf } from "./readFiles.js";
// import { addErrori, getErrori, updateErrori, removeErrori } from "./errori.js";
// import { getTecnici, addTecnici, removeTecnici } from "./tecnici.js";
// import {
//   getCommesse,
//   updateCommesse,
//   updateMaterialeRichiestoCommesse,
//   addCommesse,
//   updateEditedRowCommesse,
//   removeCommesse,
// } from "./commesse.js";
// import { getWH, removeWH, updateWH } from "./workedHours.js";
import { create } from "domain";
const { Pool } = pkg;
//#endregion

//#region Config
dotenv.config();
const pgConfig = {
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: process.env.POSTGRES_PORT,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};
const configEsa = {
  user: "extMarchiani",
  password: "extMarchiani",
  server: "172.29.1.11", // You can use 'localhost\\instance' to connect to named instance
  database: "AZI_MARSRL", //"AZI_TEST",
  options: {
    encrypt: false, // Use this if you're on Windows Azure
    trustServerCertificate: false, // Use this if you're on a local development environment
  },
};

let pgPool = new Pool(pgConfig);

async function restartPgPool() {
  try {
    await pgPool.end(); // Gracefully shut down current pool
  } catch (err) {
    console.error("Error closing existing pgPool:", err);
  }

  pgPool = new Pool(pgConfig); // Recreate new pool
  //console.log("PostgreSQL pool restarted.");
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT;

const allowedOrigins = [process.env.CORS_ORIGIN];
console.log("Allowed origins:", allowedOrigins);

const corsOptions = {
  origin: (origin, callback) => {
    //console.log("Origin:", origin);
    //console.log(`Request from origin: ${origin}`);

    if (
      allowedOrigins.some((allowedOrigin) => origin.startsWith(allowedOrigin))
    ) {
      callback(null, true);
    } else {
      // console.error(`Blocked by CORS: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: false,
};

// Middleware
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the frontend build directory
app.use(express.static(path.join(__dirname, "../frontend/build")));
//#endregion

//#region Login
app.post("/login", async (req, res) => {
  const { mail, username, password } = req.body;

  try {
    const query =
      "SELECT * FROM users WHERE (email = $1 OR username = $2) AND password = $3";
    const result = await pgPool.query(query, [mail, username, password]);

    if (result.rows.length > 0) {
      const user = result.rows[0];
      res.json({
        success: true,
        user: {
          name: user.name,
          surname: user.surname,
          role: user.role,
          reparto: user.reparto,
          defaultPwd: user.default_pwd,
        },
      });
    } else {
      res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});
//#endregion

//#region Fetch
app.get("/fetchrecords", async (req, res) => {
  try {
    const query = "SELECT * FROM public.records"; // Adjust table name if needed
    const result = await pgPool.query(query);
    //console.log("Loadedcommesse:", result.rows); // Log the fetched data t
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Error fetching records:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error fetching records",
    });
  }
});

app.get("/fetchdepot", async (req, res) => {
  try {
    const query = "SELECT * FROM public.depot"; // Adjust table name if needed
    const result = await pgPool.query(query);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Error fetching depot:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error fetching depot",
    });
  }
});
//#endregion

//#region Esa
app.get("/checkimpegni-commessa", async (req, res) => {
  const result = await checkImpegni(req.query.codCommessa, configEsa);
  res.status(result.status || 200).json(result);
});

app.get("/checkmancanti-commessa", async (req, res) => {
  const result = await checkMancanti(req.query.codCommessa, configEsa);
  res.status(result.status || 200).json(result);
});

app.get("/checkinformation-commessa", async (req, res) => {
  const result = await checkInformation(req.query.codCommessa, configEsa);
  res.status(result.status || 200).json(result);
});
//#endregion

//#region Iterazioni
app.post("/updateiteration", async (req, res) => {
  //console.log("updateiteration");
  const result = await updateById(req.body, pgPool);
  res.status(result.status || 200).json(result);
});

app.post("/modifyiteration", async (req, res) => {
  const result = await modify(req.body, pgPool);
  res.status(result.status || 200).json(result);
});

app.post("/updateshelf", async (req, res) => {
  const result = await updateShelf(req.body, pgPool);
  res.status(result.status || 200).json(result);
});

app.post("/addRecord", async (req, res) => {
  const result = await add(req.body, pgPool);
  res.status(result.status || 200).json(result);
});

app.post("/updateofficinapos", async (req, res) => {
  const result = await updateOfficinaPos(req.body, pgPool);
  res.status(result.status || 200).json(result);
});
//#endregion

//#region Depot
app.post("/updatedepot", async (req, res) => {
  try {
    const query = "UPDATE public.depot SET status = $1 WHERE shelf = $2"; // Adjust table name if needed
    const result = await pgPool.query(query, [req.body.status, req.body.shelf]);
    //console.log(query, req.body.status, req.body.shelf); // Log the fetched data t
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Error updating depot:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error updating depot",
    });
  }
});
//#endregion

//#region Manage files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const tempPath = path.join(__dirname, "uploads", "temp");

    // Create temp directory if it doesn't exist
    if (!fs.existsSync(tempPath)) {
      fs.mkdirSync(tempPath, { recursive: true });
    }

    cb(null, tempPath);
  },
  filename: function (req, file, cb) {
    // Use timestamp + original name to avoid conflicts
    const uniqueName = `${Date.now()}_${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept only specific file types
    const allowedTypes = [
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/pdf",
      "text/csv",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Invalid file type. Only Excel, PDF, and CSV files are allowed."
        )
      );
    }
  },
});

app.post("/read-excel", async (req, res) => {
  const result = await readExcel(req.body.filePath);
  res.json(result);
});

app.get("/read-pdf", async (req, res) => {
  //console.log(req.query);
  const filePath = req.query.filePath;
  if (!filePath) {
    return res.status(400).json({
      success: false,
      message: "File path is missing in request parameters",
    });
  }
  try {
    const pdfPath = await popPdf(filePath);
    res.sendFile(pdfPath);
  } catch (error) {
    console.error("Error reading PDF:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Error reading PDF file",
    });
  }
});

app.post("/uploadFile", upload.single("file"), async (req, res) => {
  console.log("=== FILE UPLOAD START ===");

  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    // Get metadata from form data
    const commessa = req.body.commessa;
    const type = req.body.type;
    const isTemp = req.body.isTemp === "true";

    console.log("Upload details:", {
      originalName: req.file.originalname,
      tempPath: req.file.path,
      commessa: commessa,
      type: type,
      isTemp: isTemp,
      size: req.file.size,
    });

    // Validate required fields
    if (!commessa || !type) {
      // Clean up temp file
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: "Missing commessa or type information",
      });
    }

    let finalPath;
    let responseFilePath;

    if (isTemp) {
      // Keep file in temp with organized naming
      const tempFileName = `${commessa}_${type}_${req.file.originalname}`;
      finalPath = path.join(__dirname, "uploads", "temp", tempFileName);
      fs.renameSync(req.file.path, finalPath);
      responseFilePath = `/uploads/temp/${tempFileName}`;
      console.log("File saved to temp:", finalPath);
    } else {
      // Create target directory structure for permanent storage
      const targetDir = path.join(__dirname, "uploads", commessa, type);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
        console.log("Created directory:", targetDir);
      }

      // Move file from temp to final location
      finalPath = path.join(targetDir, req.file.originalname);
      fs.renameSync(req.file.path, finalPath);
      responseFilePath = `/uploads/${commessa}/${type}/${req.file.originalname}`;
      console.log("File moved to final location:", finalPath);
    }

    // Return success response
    res.json({
      success: true,
      message: isTemp
        ? "File uploaded to temporary storage"
        : "File uploaded successfully",
      filePath: responseFilePath,
      file: {
        originalname: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        path: finalPath,
      },
    });

    console.log("=== FILE UPLOAD SUCCESS ===");
  } catch (error) {
    console.error("Upload error:", error);

    // Clean up temp file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.error("Error cleaning up temp file:", cleanupError);
      }
    }

    res.status(500).json({
      success: false,
      message: error.message || "Internal server error uploading file",
    });
  }
});

app.post("/moveFilesToFinal", async (req, res) => {
  console.log("=== MOVE FILES TO FINAL START ===");

  try {
    const { filePaths, commessa, type } = req.body;

    if (!filePaths || !Array.isArray(filePaths) || filePaths.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No file paths provided",
      });
    }

    if (!commessa || !type) {
      return res.status(400).json({
        success: false,
        message: "Missing commessa or type information",
      });
    }

    // Create target directory structure
    const targetDir = path.join(__dirname, "uploads", commessa, type);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
      console.log("Created directory:", targetDir);
    }

    const finalPaths = [];

    for (const filePath of filePaths) {
      // Extract filename from temp path
      const fileName = path.basename(filePath);
      // Remove the temp prefix (commessa_type_originalname -> originalname)
      const originalName = fileName.replace(`${commessa}_${type}_`, "");

      // Source path (temp file)
      const sourcePath = path.join(__dirname, "uploads", "temp", fileName);

      // Target path (final location)
      const targetPath = path.join(targetDir, originalName);

      if (fs.existsSync(sourcePath)) {
        // Move file from temp to final location
        fs.renameSync(sourcePath, targetPath);
        console.log(`Moved file from ${sourcePath} to ${targetPath}`);

        // Add final path to response
        finalPaths.push(`/uploads/${commessa}/${type}/${originalName}`);
      } else {
        console.warn(`Temp file not found: ${sourcePath}`);
      }
    }

    res.json({
      success: true,
      message: "Files moved to final location successfully",
      finalPaths: finalPaths,
    });

    console.log("=== MOVE FILES TO FINAL SUCCESS ===");
  } catch (error) {
    console.error("Move files error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error moving files",
    });
  }
});
//#endregion

app.listen(port, () => {
  console.log(
    `Server version 0.0.2, is running on port ${port}, updated 2025-05-05`
  );
});
