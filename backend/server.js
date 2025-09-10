import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import { fileURLToPath } from "url";
import { dirname } from "path";
import path from "path";
import pkg from "pg";
import sql from "mssql";
import { create } from "domain";
const { Pool } = pkg;

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
  console.log("PostgreSQL pool restarted.");
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT;

const allowedOrigins = [process.env.CORS_ORIGIN];
console.log("Allowed origins:", allowedOrigins);

const corsOptions = {
  origin: (origin, callback) => {
    console.log("Origin:", origin);
    // console.log(`Request from origin: ${origin}`);

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

async function executeSelectImpegniQuery(codCommessa) {
  try {
    //console.log(codCommessa)
    const pool = await sql.connect(configEsa);
    const result = await pool
      .request()
      .input("codCommessa", sql.VarChar, codCommessa)
      .query(
        "SELECT * FROM XVW_QRY_IMPEGNI_PER_COMMESSA WHERE cod_commessa = @codCommessa"
      );
    return result.recordset; // Return the query result
  } catch (err) {
    console.error("SQL error", err);
    throw err; // Rethrow the error to handle it in the route
  }
}
async function executeSelectMancantiQuery(codCommessa) {
  try {
    //console.log(codCommessa)
    const pool = await sql.connect(configEsa);
    const result = await pool
      .request()
      .input("codCommessa", sql.VarChar, codCommessa)
      .query(
        "SELECT * FROM XVW_QRY_MANCANTI_PER_COMMESSA WHERE cod_commessa = @codCommessa"
      );
    return result.recordset; // Return the query result
  } catch (err) {
    console.error("SQL error", err);
    throw err; // Rethrow the error to handle it in the route
  }
}
function arrayToPostgresArray(arr) {
  if (!Array.isArray(arr) || arr.length === 0) {
    return "{}";
  }

  const escapedItems = arr.map((item) => {
    const str = String(item);
    return `"${str.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
  });

  return `{${escapedItems.join(",")}}`;
}

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

app.get("/checkimpegni-commessa", async (req, res) => {
  try {
    console.log(req.query.codCommessa);
    // Access the query parameter
    const codCommessa = req.query.codCommessa;
    if (!codCommessa) {
      return res.status(400).send("codCommessa is required");
    }
    const queryResult = await executeSelectImpegniQuery(codCommessa);
    res.json(queryResult); // Send the result as JSON
  } catch (error) {
    res.status(500).send("Failed to execute select impegni query");
  }
});

app.get("/checkmancanti-commessa", async (req, res) => {
  try {
    console.log(req.query.codCommessa);
    // Access the query parameter
    const codCommessa = req.query.codCommessa;
    if (!codCommessa) {
      return res.status(400).send("codCommessa is required");
    }
    const queryResult = await executeSelectMancantiQuery(codCommessa);
    res.json(queryResult); // Send the result as JSON
  } catch (error) {
    res.status(500).send("Failed to execute select mancanti query");
  }
});

app.get("/fetchcommesse", async (req, res) => {
  try {
    const query = "SELECT * FROM public.loadedcommesse"; // Adjust table name if needed
    const result = await pgPool.query(query);
    // console.log("Loadedcommesse:", result.rows); // Log the fetched data t
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Error fetching loadedcommesse:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error fetching loadedcommesse",
    });
  }
});

app.get("/gethours/:commessa", async (req, res) => {
  try {
    const { commessa } = req.params;
    console.log(commessa);
    const query = "SELECT * FROM public.loadedcommesse WHERE commessa = $1";
    const result = await pgPool.query(query, [commessa]);

    if (result.rows.length === 0) {
      //console.log("Commessa not found:", commessa);
      return res.status(404).json({
        success: false,
        message: "Commessa not found",
      });
    }
    //console.log("Hours fetched successfully:", result.rows);
    return res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error fetching hours:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

app.post("/updatehours/:commessa", async (req, res) => {
  try {
    const { commessa } = req.params;
    const { method, newEntry, progression } = req.body;

    // First get the current data to calculate the new ID
    const currentDataQuery =
      "SELECT * FROM public.loadedcommesse WHERE commessa = $1";
    const currentData = await pgPool.query(currentDataQuery, [commessa]);

    if (currentData.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Commessa not found",
      });
    }

    const data = currentData.rows[0];
    let maxId = 0;

    // Find the maximum ID in the existing entries
    if (method === "montaggio") {
      maxId =
        data.montaggio?.oreLav?.reduce(
          (max, item) => Math.max(max, item.id || 0),
          0
        ) || 0;
    } else {
      maxId =
        data.cablaggio?.oreLav?.reduce(
          (max, item) => Math.max(max, item.id || 0),
          0
        ) || 0;
    }

    // Add ID to the new entry
    const entryWithId = {
      ...newEntry,
      id: maxId + 1,
    };

    // Update the document using jsonb operations
    const updateQuery = `
      UPDATE public.loadedcommesse 
      SET 
        ${method} = jsonb_set(
          COALESCE(${method}, '{}'::jsonb),
          '{oreLav}',
          COALESCE(${method}->'oreLav', '[]'::jsonb) || $1::jsonb
        ),
        progression = $2
      WHERE commessa = $3
      RETURNING *
    `;

    const result = await pgPool.query(updateQuery, [
      JSON.stringify([entryWithId]),
      progression,
      commessa,
    ]);

    if (result.rows.length === 0) {
      throw new Error("Update failed");
    }

    return res.json({
      success: true,
      message: "Hours updated successfully",
    });
  } catch (error) {
    console.error("Error updating hours:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

app.get("/geterrors/:commessa", async (req, res) => {
  try {
    const { commessa } = req.params;
    console.log("Fetching errors for commessa:", commessa);
    const query = "SELECT * FROM public.loadedcommesse WHERE commessa = $1";
    const result = await pgPool.query(query, [commessa]);

    if (result.rows.length === 0) {
      console.log("Commessa not found:", commessa);
      return res.status(404).json({
        success: false,
        message: "Commessa not found",
      });
    }
    //console.log("Hours fetched successfully:", result.rows);
    console.log("Errors fetched successfully:", result.rows);
    return res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error fetching hours:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

app.post("/adderrors/:commessa", async (req, res) => {
  try {
    const { commessa } = req.params;
    const { method, newEntry } = req.body;

    // First get the current data to calculate the new ID
    const currentDataQuery =
      "SELECT * FROM public.loadedcommesse WHERE commessa = $1";
    const currentData = await pgPool.query(currentDataQuery, [commessa]);

    if (currentData.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Commessa not found",
      });
    }

    const data = currentData.rows[0];
    let maxId = 0;

    // Find the maximum ID in the existing entries
    if (data.errori && data.errori[method]) {
      maxId =
        data.errori[method].reduce(
          (max, item) => Math.max(max, item.id || 0),
          0
        ) || 0;
    }

    // Add ID to the new entry
    const entryWithId = {
      ...newEntry,
      id: maxId + 1,
    };

    // Update the document using jsonb operations
    const updateQuery = `
      UPDATE public.loadedcommesse 
      SET 
        errori = jsonb_set(
          COALESCE(errori, '{}'::jsonb),
          '{${method}}',
          COALESCE(errori->'${method}', '[]'::jsonb) || $1::jsonb
        )
      WHERE commessa = $2
      RETURNING *
    `;

    const result = await pgPool.query(updateQuery, [
      JSON.stringify([entryWithId]),
      commessa,
    ]);
    if (result.rows.length === 0) {
      throw new Error("Update failed");
    }

    return res.json({
      success: true,
      message: "Error added successfully",
      data: result.rows[0], // Include the updated data in the response
    });
  } catch (error) {
    console.error("Error adding error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

app.post("/updateerror/:commessa", async (req, res) => {
  try {
    const { commessa } = req.params;
    const { method, updatedArray } = req.body;

    // First get the current data
    const currentDataQuery =
      "SELECT * FROM public.loadedcommesse WHERE commessa = $1";
    const currentData = await pgPool.query(currentDataQuery, [commessa]);

    if (currentData.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Commessa not found",
      });
    }

    // Update the document using jsonb operations
    const updateQuery = `
      UPDATE public.loadedcommesse 
      SET 
        errori = jsonb_set(
          COALESCE(errori, '{}'::jsonb),
          '{${method}}',
          $1::jsonb
        )
      WHERE commessa = $2
      RETURNING *
    `;

    const result = await pgPool.query(updateQuery, [
      JSON.stringify(updatedArray),
      commessa,
    ]);

    if (result.rows.length === 0) {
      throw new Error("Update failed");
    }

    return res.json({
      success: true,
      message: "Error updated successfully",
    });
  } catch (error) {
    console.error("Error updating error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

app.post("/removeerror/:commessa", async (req, res) => {
  try {
    const { commessa } = req.params;
    const { method, id } = req.body;

    // First get the current data
    const currentDataQuery =
      "SELECT * FROM public.loadedcommesse WHERE commessa = $1";
    const currentData = await pgPool.query(currentDataQuery, [commessa]);

    if (currentData.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Commessa not found",
      });
    }

    const data = currentData.rows[0];

    // Make sure errori and the method exist
    if (!data.errori || !data.errori[method]) {
      return res.status(404).json({
        success: false,
        message: "Error category not found",
      });
    }

    // Filter out the entry with the specified ID
    const updatedErrors = data.errori[method].filter((item) => item.id !== id);

    // Update the document
    const updateQuery = `
      UPDATE public.loadedcommesse 
      SET 
        errori = jsonb_set(
          errori,
          '{${method}}',
          $1::jsonb
        )
      WHERE commessa = $2
      RETURNING *
    `;

    const result = await pgPool.query(updateQuery, [
      JSON.stringify(updatedErrors),
      commessa,
    ]);

    if (result.rows.length === 0) {
      throw new Error("Update failed");
    }

    return res.json({
      success: true,
      message: "Error removed successfully",
    });
  } catch (error) {
    console.error("Error removing error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

app.get("/gettecnici", async (req, res) => {
  try {
    const query = "SELECT * FROM public.tecnici";
    const result = await pgPool.query(query);

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Error fetching tecnici:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

app.post("/newtechnician", async (req, res) => {
  try {
    const { name, surname, role } = req.body;
    const query =
      "INSERT INTO tecnici (name, surname, role) VALUES ($1, $2, $3) RETURNING *";
    const result = await pgPool.query(query, [name, surname, role]);

    res.json({
      success: true,
      data: result.rows[0],
      message: "Technician added successfully",
    });
  } catch (error) {
    console.error("Error adding technician:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

app.delete("/removetechnicians/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const query = "DELETE FROM tecnici WHERE id = $1 RETURNING *";
    const result = await pgPool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Technician not found",
      });
    }

    res.json({
      success: true,
      message: "Technician deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting technician:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

app.post("/removehours/:commessa", async (req, res) => {
  try {
    const { commessa } = req.params;
    const { method, id, progression } = req.body;

    // First get the current data
    const currentDataQuery =
      "SELECT * FROM public.loadedcommesse WHERE commessa = $1";
    const currentData = await pgPool.query(currentDataQuery, [commessa]);

    if (currentData.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Commessa not found",
      });
    }

    const data = currentData.rows[0];

    // Create a copy of the data to work with
    let updatedData = { ...data };

    // Filter out the entry with the specified ID
    if (method === "montaggio" && updatedData.montaggio?.oreLav) {
      updatedData.montaggio.oreLav = updatedData.montaggio.oreLav.filter(
        (item) => item.id !== id
      );
    } else if (method === "cablaggio" && updatedData.cablaggio?.oreLav) {
      updatedData.cablaggio.oreLav = updatedData.cablaggio.oreLav.filter(
        (item) => item.id !== id
      );
    }

    // Update the document
    const updateQuery = `
      UPDATE public.loadedcommesse 
      SET 
        ${method} = $1,
        progression = $2
      WHERE commessa = $3
      RETURNING *
    `;

    const result = await pgPool.query(updateQuery, [
      JSON.stringify(updatedData[method]),
      progression,
      commessa,
    ]);

    if (result.rows.length === 0) {
      throw new Error("Update failed");
    }

    return res.json({
      success: true,
      message: "Hours removed successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error removing hours:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

app.post("/updatecommessa/:commessa", async (req, res) => {
  try {
    const { commessa } = req.params;
    const updatedRecord = req.body;

    // First check if the commessa exists
    const checkQuery =
      "SELECT * FROM public.loadedcommesse WHERE commessa = $1";
    const checkResult = await pgPool.query(checkQuery, [commessa]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Commessa not found",
      });
    }

    // Get the current record
    const currentRecord = checkResult.rows[0];

    // Ensure tecniciassegnati is properly formatted as a PostgreSQL array
    let tecniciAssegnati;
    if (Array.isArray(updatedRecord.tecniciassegnati)) {
      // If it's already an array, use it directly
      tecniciAssegnati = updatedRecord.tecniciassegnati;
    } else if (typeof updatedRecord.tecniciassegnati === "string") {
      try {
        // If it's a string, try to parse it as JSON
        const parsed = JSON.parse(updatedRecord.tecniciassegnati);
        if (Array.isArray(parsed)) {
          tecniciAssegnati = parsed;
        } else {
          // If it parses but isn't an array, wrap it in an array
          tecniciAssegnati = [parsed];
        }
      } catch (e) {
        // If it doesn't parse as JSON, treat it as a single string value
        tecniciAssegnati = [updatedRecord.tecniciassegnati];
      }
    } else {
      // Default to empty array if undefined or null
      tecniciAssegnati = [];
    }

    // Check if we're only updating tecniciassegnati
    if (
      Object.keys(updatedRecord).length === 1 &&
      updatedRecord.tecniciassegnati
    ) {
      // Only update the tecniciassegnati field
      const updateQuery = `
        UPDATE public.loadedcommesse 
        SET tecniciassegnati = $1
        WHERE commessa = $2
        RETURNING *
      `;

      const result = await pgPool.query(updateQuery, [
        arrayToPostgresArray(tecniciAssegnati),
        commessa,
      ]);
      console.log(updateQuery); // Log the value of tecniciAssegnati
      console.log(commessa);
      console.log("TecniciAssegnati:", tecniciAssegnati); // Log the value of tecniciAssegnati
      console.log(result.rows);

      if (result.rows.length === 0) {
        throw new Error("Update failed");
      }

      return res.json({
        success: true,
        message: "Technicians updated successfully",
        data: result.rows[0],
      });
    }

    // If we're here, we're updating multiple fields
    // Prepare query and parameters based on whether fineLav exists
    let updateQuery;
    let params;

    if (updatedRecord.fineLav) {
      updateQuery = `
        UPDATE public.loadedcommesse 
        SET 
          capocommessa = $1,
          cablaggio = $2,
          montaggio = $3,
          stato = $4,
          tecniciassegnati = $5,
          progression = $6,
          finelav = $7
        WHERE commessa = $8
        RETURNING *
      `;

      params = [
        updatedRecord.capoCommessa || currentRecord.capocommessa,
        updatedRecord.cablaggio
          ? JSON.stringify(updatedRecord.cablaggio)
          : currentRecord.cablaggio,
        updatedRecord.montaggio
          ? JSON.stringify(updatedRecord.montaggio)
          : currentRecord.montaggio,
        updatedRecord.stato,
        arrayToPostgresArray(tecniciAssegnati),
        updatedRecord.progression || currentRecord.progression || 0,
        updatedRecord.fineLav,
        commessa,
      ];
    } else {
      updateQuery = `
        UPDATE public.loadedcommesse 
        SET 
          capocommessa = $1,
          cablaggio = $2,
          montaggio = $3,
          stato = $4,
          tecniciassegnati = $5,
          progression = $6,
          statushistory = $7
        WHERE commessa = $8
        RETURNING *
      `;

      params = [
        updatedRecord.capoCommessa || currentRecord.capocommessa,
        updatedRecord.cablaggio
          ? JSON.stringify(updatedRecord.cablaggio)
          : currentRecord.cablaggio,
        updatedRecord.montaggio
          ? JSON.stringify(updatedRecord.montaggio)
          : currentRecord.montaggio,
        updatedRecord.stato,
        arrayToPostgresArray(tecniciAssegnati),
        updatedRecord.progression || currentRecord.progression || 0,
        JSON.stringify(
          updatedRecord.statushistory || currentRecord.statushistory || 0
        ),
        commessa,
      ];
    }
    console.log(updateQuery, params);
    const result = await pgPool.query(updateQuery, params);

    if (result.rows.length === 0) {
      throw new Error("Update failed");
    }

    return res.json({
      success: true,
      message: "Commessa updated successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating commessa:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

app.post("/updatematerialerichiesto/:commessa", async (req, res) => {
  try {
    const { commessa } = req.params;
    const { materialerichiesto } = req.body;

    // Update the document
    const updateQuery = `
      UPDATE public.loadedcommesse 
      SET materialerichiesto = $1
      WHERE commessa = $2
      RETURNING *
    `;

    const result = await pgPool.query(updateQuery, [
      materialerichiesto,
      commessa,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Commessa not found",
      });
    }

    return res.json({
      success: true,
      message: "Material request status updated successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating material request status:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

app.post("/updateeditedrow/:commessa", async (req, res) => {
  try {
    const { commessa } = req.params;
    const { method, updatedData, progression, rowId } = req.body;

    // First get the current data
    const currentDataQuery =
      "SELECT * FROM public.loadedcommesse WHERE commessa = $1";
    const currentData = await pgPool.query(currentDataQuery, [commessa]);

    if (currentData.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Commessa not found",
      });
    }

    // Update the document
    const updateQuery = `
      UPDATE public.loadedcommesse 
      SET 
        ${method} = jsonb_set(
          ${method}, 
          '{oreLav}', 
          $1::jsonb
        ),
        progression = $2
      WHERE commessa = $3
      RETURNING *
    `;

    const result = await pgPool.query(updateQuery, [
      JSON.stringify(updatedData),
      progression,
      commessa,
    ]);

    if (result.rows.length === 0) {
      throw new Error("Update failed");
    }

    return res.json({
      success: true,
      message: "Row updated successfully",
    });
  } catch (error) {
    console.error("Error updating row:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

app.post("/commessa", async (req, res) => {
  try {
    const newRecord = req.body;
    console.log(newRecord);

    // First, check if the commessa already exists
    const checkQuery = `
      SELECT * FROM public.loadedcommesse 
      WHERE commessa = $1
    `;
    const existingRecord = await pgPool.query(checkQuery, [newRecord.commessa]);

    if (existingRecord.rows.length > 0) {
      // Commessa exists, update the visible parameter to true
      const updateQuery = `
        UPDATE public.loadedcommesse 
        SET visible = true 
        WHERE commessa = $1 
        RETURNING *
      `;
      const updateResult = await pgPool.query(updateQuery, [
        newRecord.commessa,
      ]);

      res.json({
        success: true,
        data: updateResult.rows[0],
        message: "Commessa already exists - visibility updated to true",
      });
    } else {
      // Commessa doesn't exist, insert new record
      const insertQuery = `
        INSERT INTO public.loadedcommesse
        (commessa, capocommessa, stato, iniziolav, finelav, comcliente, descliente, descommessa, cablaggio, montaggio, errori, tecniciassegnati, progression, materialerichiesto, visible)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING *
      `;
      const insertResult = await pgPool.query(insertQuery, [
        newRecord.commessa,
        newRecord.capocommessa,
        newRecord.stato,
        newRecord.iniziolav,
        newRecord.fineLav,
        newRecord.comcliente,
        newRecord.descommessa,
        newRecord.descliente,
        JSON.stringify(newRecord.cablaggio),
        JSON.stringify(newRecord.montaggio),
        JSON.stringify(newRecord.errori),
        newRecord.tecniciassegnati,
        newRecord.progression,
        newRecord.materialerichiesto,
        true,
      ]);

      if (insertResult.rows.length > 0) {
        res.json({
          success: true,
          data: insertResult.rows[0],
          message: "Commessa created successfully",
        });
      } else {
        throw new Error("Failed to create commessa");
      }
    }
  } catch (error) {
    console.error("Error creating/updating commessa:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error creating/updating commessa",
    });
  }
});

app.delete("/removecommessa/:commessa", async (req, res) => {
  try {
    const { commessa } = req.params;

    // Delete the record from the database
    const query = `
      UPDATE public.loadedcommesse SET visible = false
      WHERE commessa = $1
    `;

    const result = await pgPool.query(query, [commessa]);

    if (result.rowCount > 0) {
      // Check rowCount instead of rows.length
      res.json({
        success: true,
        message: "Commessa deleted successfully",
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "Commessa not found",
      });
    }
  } catch (error) {
    console.error("Error deleting commessa:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error deleting commessa",
    });
  }
});

app.listen(port, () => {
  console.log(
    `Server version 0.0.14, is running on port ${port}, updated 2025-09-10`
  );
});
