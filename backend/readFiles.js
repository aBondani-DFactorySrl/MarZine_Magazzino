import { dirname } from "path";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import XLSX from "xlsx"; // Add this import

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const readExcel = async (filePath) => {
  try {
    if (!filePath) {
      return {
        status: 400,
        success: false,
        message: "File path is required",
      };
    }

    // Update the path handling to work with the new folder structure
    const uploadsDir = path.join(__dirname, "uploads");
    
    // Handle both old format (/filename.xlsx) and new format (/commessa/type/filename.xlsx)
    let fullPath;
    if (filePath.startsWith('/uploads/')) {
      // New format: /uploads/commessa/type/filename.xlsx
      const relativePath = filePath.replace('/uploads/', '');
      fullPath = path.join(uploadsDir, relativePath);
    } else {
      // Old format: /filename.xlsx or filename.xlsx
      const fileName = path.basename(filePath);
      fullPath = path.join(uploadsDir, fileName);
    }

    console.log("Reading Excel file from:", fullPath);

    // Check if file exists
    if (!fs.existsSync(fullPath)) {
      console.error("File not found:", fullPath);
      return {
        status: 404,
        success: false,
        message: "File not found",
      };
    }

    const workbook = XLSX.readFile(fullPath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    const filteredWorksheet = {};
    const range = XLSX.utils.decode_range(worksheet["!ref"]); // Get the range of the original worksheet

    for (let R = range.s.r; R <= range.e.r; ++R) {
      const cellAddress = { c: 0, r: R }; // Column D, row R
      const cellRef = XLSX.utils.encode_cell(cellAddress);
      const cell = worksheet[cellRef];
      if (cell /*&& !isNaN(parseFloat(cell.v)) && isFinite(cell.v)*/) {
        //console.log(cell.v);
        // Copy the entire row to the new worksheet if the cell in column D is a number
        for (let C = range.s.c; C <= range.e.c; ++C) {
          const srcAddress = { c: C, r: R };
          const srcRef = XLSX.utils.encode_cell(srcAddress);
          const srcCell = worksheet[srcRef];
          if (srcCell) {
            filteredWorksheet[srcRef] = srcCell;
          }
        }
      }
    }
    filteredWorksheet["!ref"] = XLSX.utils.encode_range(range);

    // Convert the filtered worksheet to JSON
    const filteredData = XLSX.utils.sheet_to_json(filteredWorksheet);

    //console.log(filteredData);

    const keyMapping = {
      Articolo: "Articolo",
      "U. di M.": "Descrizione",
      Quantità: "UdM",
      "Ubicazione Art. ": "Qta",
      Commessa: "spare",
      "Commessa Ubicaz.": "Ubicazione",
      __EMPTY: "Commessa",
      __EMPTY_2: "CommessaUbicazione",
    };

    // Remap keys for each object in data
    const remappedData = filteredData.map((row) => {
      const newRow = {};
      // Use the keyMapping to remap each key
      Object.entries(keyMapping).forEach(([oldKey, newKey]) => {
        newRow[newKey] = row[oldKey] || ""; // Assign value or null if missing
      });

      return newRow;
    });

    console.log("Excel file read successfully, rows:", remappedData.length);

    return remappedData; // Return the data directly, not wrapped in an object
  } catch (error) {
    console.error("Excel read error:", error);
    return {
      status: 500,
      success: false,
      message: "Error reading Excel file: " + error.message,
    };
  }
};
const popPdf = async (params) => {
  //console.log(params);
  if (params.includes("..")) {
    throw new Error("Invalid file path");
  }
  // Remove the __dirname join since params already contains the full path
  // or construct the path properly if params is just a filename
  const pdfPath = path.isAbsolute(params)
    ? params
    : path.join(__dirname, params);

  // Check if file exists
  const fs = await import("fs");
  if (!fs.existsSync(pdfPath)) {
    throw new Error(`PDF file not found: ${pdfPath}`);
  }

  return pdfPath;
};

export { readExcel, popPdf };
