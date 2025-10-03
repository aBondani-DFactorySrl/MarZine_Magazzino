const modify = async (params, pgPool) => {
  //console.log(params);
  try {
    const { commessa, iterationModified, idToDelete } = params;
    // Validate required fields
    if (!commessa || !iterationModified || !iterationModified.id) {
      return {
        success: false,
        status: 400,
        message:
          "Missing required fields: commessa and iterationModified with id",
      };
    }
    // Get the current commessa data
    const getQuery = "SELECT * FROM records WHERE commessa = $1";
    const result = await pgPool.query(getQuery, [commessa]);
    //console.log("Commessa:", result.rows);
    if (result.rows.length === 0) {
      return {
        success: false,
        status: 404,
        message: "Commessa not found",
      };
    }

    // Change const to let to allow reassignment
    let iterations = result.rows[0].iterazioni || [];
    let operationMessage = "Iteration updated successfully";
    let operationData = {};

    // Find the iteration to modify
    const iterationIndex = iterations.findIndex(
      (iter) => iter.id === iterationModified.id
    );
    if (iterationIndex === -1) {
      return {
        success: false,
        status: 404,
        message: "Iteration not found",
      };
    }
    // Update the iteration - merge with existing data to preserve fields not being updated
    const existingIteration = iterations[iterationIndex];
    const updatedIteration = {
      ...existingIteration,
      ...iterationModified,
      // Ensure id is preserved
      id: existingIteration.id,
      // Handle special cases for arrays if needed
      arrivoOfficina: iterationModified.arrivoOfficina || null,
      note: iterationModified.note || existingIteration.note,
      shelf: iterationModified.shelf || existingIteration.shelf,
      components_path:
        iterationModified.components_path || existingIteration.components_path,
    };
    // Replace the iteration in the array
    iterations[iterationIndex] = updatedIteration;
    operationData.updatedIteration = updatedIteration;

    // Handle deletion if idToDelete is provided
    if (idToDelete) {
      const deleteIndex = iterations.findIndex(
        (iter) => iter.id === idToDelete
      );
      if (deleteIndex === -1) {
        return {
          success: false,
          status: 404,
          message: "Iteration to delete not found",
        };
      }
      const deletedIteration = iterations[deleteIndex];
      iterations = iterations.filter((iter) => iter.id !== idToDelete);
      operationMessage = "Iteration updated and deleted successfully";
      operationData.deletedIteration = deletedIteration;
    }

    // Update the document in the database
    const updateQuery =
      "UPDATE records SET iterazioni = $1 WHERE commessa = $2";
    try {
      await pgPool.query(updateQuery, [JSON.stringify(iterations), commessa]);
    } catch (error) {
      console.error("Error updating iterations:", error);
      return {
        success: false,
        status: 500,
        message: "Internal server error updating iterations",
      };
    }

    return {
      success: true,
      status: 200,
      message: operationMessage,
      data: {
        commessa: commessa,
        ...operationData,
      },
    };
  } catch (error) {
    console.error("Error modifying iteration:", error);
    return {
      success: false,
      status: 500,
      message: "Internal server error",
      error: error.message,
    };
  }
};
const updateById = async (params, pgPool) => {
  //console.log(params);
  try {
    const { commessa, iterationId, updateData } = params;

    // Validate required fields
    if (!commessa || !iterationId || !updateData) {
      return {
        success: false,
        status: 400,
        message:
          "Missing required fields: commessa, iterationId, and updateData",
      };
    }

    // Get the current commessa data
    const getQuery = "SELECT * FROM records WHERE commessa = $1";
    const result = await pgPool.query(getQuery, [commessa]);
    //console.log("Commessa:", result.rows);

    if (result.rows.length === 0) {
      return {
        success: false,
        status: 404,
        message: "Commessa not found",
      };
    }

    let iterations = result.rows[0].iterazioni || [];

    // Find the iteration to update
    const iterationIndex = iterations.findIndex(
      (iter) => iter.id === iterationId
    );

    if (iterationIndex === -1) {
      return {
        success: false,
        status: 404,
        message: "Iteration not found",
      };
    }

    // Update the iteration - merge with existing data
    const existingIteration = iterations[iterationIndex];
    const updatedIteration = {
      ...existingIteration,
      ...updateData,
      // Ensure id is preserved
      id: existingIteration.id,
    };

    // Replace the iteration in the array
    iterations[iterationIndex] = updatedIteration;

    // Update the document in the database
    const updateQuery =
      "UPDATE records SET iterazioni = $1 WHERE commessa = $2";

    try {
      await pgPool.query(updateQuery, [JSON.stringify(iterations), commessa]);
    } catch (error) {
      console.error("Error updating iteration:", error);
      return {
        success: false,
        status: 500,
        message: "Internal server error updating iteration",
      };
    }

    return {
      success: true,
      status: 200,
      message: "Iteration updated successfully",
      data: {
        commessa: commessa,
        updatedIteration: updatedIteration,
      },
    };
  } catch (error) {
    console.error("Error updating iteration:", error);
    return {
      success: false,
      status: 500,
      message: "Internal server error",
      error: error.message,
    };
  }
};
const updateShelf = async (params, pgPool) => {
  //console.log(params);
  try {
    const { commessa, iterationId, shelf, remove, author } = params;
    // Validate required fields
    if (!commessa || !iterationId || !shelf) {
      return {
        success: false,
        status: 400,
        message: "Missing required fields: commessa, iterationId, and shelf",
      };
    }
    // Get the current commessa data
    const getQuery = "SELECT * FROM records WHERE commessa = $1";
    const result = await pgPool.query(getQuery, [commessa]);
    //console.log("Commessa:", result.rows);
    if (result.rows.length === 0) {
      return {
        success: false,
        status: 404,
        message: "Commessa not found",
      };
    }
    let iterations = result.rows[0].iterazioni || [];

    // Find the iteration to update
    const iterationIndex = iterations.findIndex(
      (iter) => iter.id === iterationId
    );

    if (iterationIndex === -1) {
      return {
        success: false,
        status: 404,
        message: "Iteration not found",
      };
    }

    // Update the iteration - merge with existing data
    const existingIteration = iterations[iterationIndex];
    console.log(existingIteration);
    console.log(commessa);

    let updatedIteration;

    if (remove) {
      // Check if shelf is already in the shelfHistory array
      const isShelfInHistory = existingIteration.shelfHistory.includes(shelf);

      // Remove the shelf from the array
      updatedIteration = {
        ...existingIteration,
        shelf: existingIteration.shelf.filter((s) => s !== shelf),
        // Only add to shelfHistory if it's not already there
        shelfHistory: isShelfInHistory
          ? existingIteration.shelfHistory
          : [
              ...existingIteration.shelfHistory,
              {
                shelf: shelf,
                timestamp: new Date().toISOString(),
                author: author,
              },
            ],
        // Ensure id is preserved
        id: existingIteration.id,
      };
    } else {
      // Check if shelf is already in the array
      const isShelfAlreadyInArray = existingIteration.shelf.includes(shelf);

      // Add the shelf to the array only if it's not already there
      updatedIteration = {
        ...existingIteration,
        shelf: isShelfAlreadyInArray
          ? existingIteration.shelf
          : [...existingIteration.shelf, shelf],
        // Only add to shelfHistory if it's not already in the shelf array
        shelfHistory: isShelfAlreadyInArray
          ? existingIteration.shelfHistory
          : [
              ...existingIteration.shelfHistory,
              {
                shelf: shelf,
                timestamp: new Date().toISOString(),
                author: author,
              },
            ],
        // Ensure id is preserved
        id: existingIteration.id,
      };
    }

    // Replace the iteration in the array
    iterations[iterationIndex] = updatedIteration;

    // Update the document in the database
    const updateQuery =
      "UPDATE records SET iterazioni = $1 WHERE commessa = $2";

    try {
      await pgPool.query(updateQuery, [JSON.stringify(iterations), commessa]);
    } catch (error) {
      console.error("Error updating iteration:", error);
      return {
        success: false,
        status: 500,
        message: "Internal server error updating iteration",
      };
    }

    return {
      success: true,
      status: 200,
      message: remove
        ? "Shelf removed successfully"
        : "Shelf updated successfully",
      data: {
        commessa: commessa,
        updatedIteration: updatedIteration,
      },
    };
  } catch (error) {
    console.error("Error updating shelf:", error);
    return {
      success: false,
      status: 500,
      message: "Internal server error",
      error: error.message,
    };
  }
};
const add = async (params, pgPool) => {
  console.log("=== ADD RECORD START ===");

  try {
    const {
      commessa,
      desCommessa,
      comCliente,
      componentsPath,
      desCliente,
      codCliente,
      status,
      urgent,
      external,
      shelf,
      shelfStatus,
      uniqueDocs,
      note,
    } = params;

    // Validate required fields
    if (!commessa || !desCommessa || !comCliente) {
      return {
        success: false,
        message: "Missing required fields: commessa or desCommessa",
      };
    }

    // Check if commessa already exists
    const checkQuery = "SELECT * FROM records WHERE commessa = $1";
    const checkResult = await pgPool.query(checkQuery, [commessa]);

    if (checkResult.rows.length > 0) {
      // Commessa already exists, add a new iteration
      const existingRecord = checkResult.rows[0];
      const existingIterations = existingRecord.iterazioni || [];

      // Find the highest ID to assign the next one
      const highestId = existingIterations.reduce(
        (max, iteration) => (iteration.id > max ? iteration.id : max),
        0
      );

      // Create the new iteration object
      const newIteration = {
        id: highestId + 1,
        note: note,
        shelf: shelf || [],
        stato: status || 0,
        urgent: urgent || false,
        external: external || false,
        unique_docs: uniqueDocs || [],
        shelfHistory: [],
        arrivoOfficina: null,
        components_path: [...componentsPath] || [],
        data_inserimento: new Date().toISOString(),
      };

      // Add the new iteration to the existing ones
      const updatedIterations = [...existingIterations, newIteration];

      // Update the record with the new iterations array
      const updateQuery =
        "UPDATE records SET iterazioni = $1 WHERE commessa = $2 RETURNING *";
      const updateResult = await pgPool.query(updateQuery, [
        JSON.stringify(updatedIterations),
        commessa,
      ]);

      console.log("Iteration added to existing record:", updateResult.rows[0]);

      console.log("=== ADD ITERATION SUCCESS ===");
      return {
        success: true,
        message: "New iteration added to existing record successfully",
      };
    } else {
      // Create a new record with the first iteration
      const iterazioni = [
        {
          id: 1,
          note: note,
          shelf: shelf || [],
          stato: status || 0,
          urgent: urgent || false,
          external: external || false,
          unique_docs: uniqueDocs || [],
          shelfHistory: [],
          arrivoOfficina: null,
          components_path: [...componentsPath] || [],
          data_inserimento: new Date().toISOString(),
        },
      ];

      // Insert new record with iterazioni as JSON
      const insertQuery = `
        INSERT INTO public.records (
          commessa, com_cliente, des_commessa, iterazioni
        ) VALUES (
          $1, $2, $3, $4
        ) RETURNING *
      `;

      const values = [
        commessa,
        comCliente,
        desCommessa,
        JSON.stringify(iterazioni),
      ];

      const result = await pgPool.query(insertQuery, values);

      console.log("New record inserted successfully:", result.rows[0]);

      console.log("=== ADD RECORD SUCCESS ===");
      return {
        success: true,
        message: "New record added successfully",
      };
    }
  } catch (error) {
    console.error("Add record error:", error);
    return {
      success: false,
      status: 500,
      message: error.message || "Internal server error adding record",
    };
  }
};
const updateOfficinaPos = async (params, pgPool) => {
  console.log("=== UPDATE OFFICINA POSITION START ===");
  try {
    const { todo, shelf, author } = params;
    // Update the record with the new iterations array
    // console.log(todo);
    // console.log(shelf);
    const selectQuery = "SELECT iterazioni FROM records WHERE commessa = $1";
    const selectResult = await pgPool.query(selectQuery, [todo.commessa]);
    const existingIterations = selectResult.rows[0].iterazioni || [];
    const updatedIterations = existingIterations.map((iteration) => {
      if (iteration.id === todo.id) {
        return {
          ...iteration,
          shelf: ["Officina." + shelf],
          shelfHistory: [
            ...iteration.shelfHistory,
            {
              shelf: "Officina." + shelf,
              author: author || "anonymous",
              timestamp: new Date().toISOString(),
            },
          ],
        };
      }
      return iteration;
    });
    const updateQuery =
      "UPDATE records SET iterazioni = $1 WHERE commessa = $2 RETURNING *";
    const updateResult = await pgPool.query(updateQuery, [
      JSON.stringify(updatedIterations),
      todo.commessa,
    ]);
    //console.log("Iteration updated:", updateResult.rows[0]);
    console.log("=== UPDATE OFFICINA POSITION SUCCESS ===");
    return {
      success: true,
      message: "Officina position updated successfully",
    };
  } catch (error) {
    console.error("Update officina position error:", error);
    return {
      success: false,
      status: 500,
      message:
        error.message || "Internal server error updating officina position",
    };
  }
};

export { modify, updateById, updateShelf, add, updateOfficinaPos };
