import sql from "mssql";
const checkImpegni = async (params, configEsa) => {
  try {
    // Access the query parameter
    const codCommessa = params;
    if (!codCommessa) {
      return {
        status: 400,
        message: "Insufficient parameters provided",
      };
    }
    try {
      //console.log(codCommessa)
      const pool = await sql.connect(configEsa);
      const result = await pool
        .request()
        .input("codCommessa", sql.VarChar, codCommessa)
        .query(
          "SELECT * FROM XVW_QRY_IMPEGNI_PER_COMMESSA WHERE cod_commessa = @codCommessa"
        );
      return result.recordset;
    } catch (err) {
      console.error("SQL error", err);
      throw err; // Rethrow the error to handle it in the route
    }
  } catch (error) {
    return {
      status: 500,
      message: "Failed to execute select impegni query",
    };
  }
};
const checkMancanti = async (params, configEsa) => {
  try {
    // Access the query parameter
    const codCommessa = params;
    if (!codCommessa) {
      return {
        status: 400,
        message: "Insufficient parameters provided",
      };
    }
    try {
      //console.log(codCommessa)
      const pool = await sql.connect(configEsa);
      const result = await pool
        .request()
        .input("codCommessa", sql.VarChar, codCommessa)
        .query(
          "SELECT * FROM XVW_QRY_MANCANTI_PER_COMMESSA WHERE cod_commessa = @codCommessa"
        );
      return result.recordset;
    } catch (err) {
      console.error("SQL error", err);
      throw err; // Rethrow the error to handle it in the route
    }
  } catch (error) {
    return {
      status: 500,
      message: "Failed to execute select impegni query",
    };
  }
};
const checkInformation = async (params, configEsa) => {
  try {
    // Access the query parameter
    const codCommessa = params;
    if (!codCommessa) {
      return {
        status: 400,
        message: "Insufficient parameters provided",
      };
    }
    try {
      //console.log(codCommessa)
      const pool = await sql.connect(configEsa);
      const result = await pool
        .request()
        .input("codCommessa", sql.VarChar, codCommessa)
        .query("SELECT * FROM XCMS_COMMESSE WHERE cod_commessa = @codCommessa");
      //console.log(result.recordset);
      return result.recordset;
    } catch (err) {
      console.error("SQL error", err);
      throw err; // Rethrow the error to handle it in the route
    }
  } catch (error) {
    return {
      status: 500,
      message: "Failed to execute select information query",
    };
  }
};
export { checkImpegni, checkMancanti, checkInformation };
