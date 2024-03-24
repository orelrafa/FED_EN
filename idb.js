/*
Developers:
First name: Orel, Nikita
Last name: Rafailov, Borochov
*/
"use strict";
// Namespace for IndexedDB operations
const idb = {};

// Function to open IndexedDB
idb.openCaloriesDB = async (dbName, version) => {
  return new Promise((resolve, reject) => {
    // Open the IndexedDB database
    const request = indexedDB.open(dbName, version);
    // Handle errors during database opening
    request.onerror = function (event) {
      console.error("An error happened with indexedDB:");
      console.error(event);
      reject(event);
    };
    // Define database schema and create object stores if needed
    request.onupgradeneeded = function () {
      const db = request.result;
      // Create object store for storing calorie data
      const store = db.createObjectStore("calories", {
        keyPath: "id",
        autoIncrement: true,
      });
      // Create indexes for querying by category and date
      store.createIndex("calories_category", "category", {
        unique: false,
      });
      store.createIndex("calories_date", "selectedDate", {
        unique: false,
      });
    };
    // Handle successful database opening
    request.onsuccess = function () {
      const db = request.result;
      // IMPORTANT: Below we are exposing the functions to the db object
      //            Hence why all of the functions are nested inside here

      // Function to add new calorie data to the database
      db.addCalories = async (calorieData) => {
        return new Promise((resolve, reject) => {
          // Check if all required fields are present and valid
          if (
            calorieData.calorie < 0 ||
            !calorieData.description ||
            !calorieData.category ||
            !["breakfast", "lunch", "dinner", "other"].includes(
              calorieData.category.toString().toLowerCase()
            )
          ) {
            console.error(
              "One or more required fields are missing or invalid!"
            );
            // Reject the promise with an error message
            reject("Missing or invalid fields!");
            return;
          }

          // If an item is added not from the UI and has no date, set the default date to today's date
          if (!calorieData.hasOwnProperty("selectedDate")) {
            const date = new Date();
            let month = date.getMonth() + 1;
            let day = date.getDate();
            month = month < 10 ? "0" + month : month;
            day = day < 10 ? "0" + day : day;
            const currentDate = `${date.getFullYear()}${month}${day}`;
            calorieData.selectedDate = currentDate;
          }
          // Start a new transaction for adding data
          const transaction = db.transaction("calories", "readwrite");
          const store = transaction.objectStore("calories");
          // Convert category to lowercase for consistency
          calorieData.category = calorieData.category.toString().toLowerCase();
          // Add the calorie data to the object store
          const request = store.add(calorieData);
          // Handle errors during the add operation
          request.onerror = function (event) {
            console.error("Error adding calories:");
            console.error(event);
            // Reject the promise with the error event
            reject(event);
          };

          // Resolve the promise with the result when add operation is successful
          request.onsuccess = function () {
            resolve(request.result);
          };

          // Close the database connection after the transaction is complete
          transaction.oncomplete = function () {
            db.close();
          };
        });
      };

      // Function to retrieve calorie data within a specified date range
      db.getCaloriesByDate = async (startRange, endRange) => {
        return new Promise((resolve, reject) => {
          // Start a read-only transaction to fetch data
          const transaction = db.transaction("calories", "readonly");
          const store = transaction.objectStore("calories");
          // Get the index for querying by date
          const index = store.index("calories_date");
          // Define the range of dates to query
          const range = IDBKeyRange.bound(startRange, endRange, false, false);
          // Fetch all calorie data within the specified date range
          let foodArrayRequest = index.getAll(range);

          // Handle errors during the fetch operation
          foodArrayRequest.onerror = function (event) {
            console.error("Error getting calories:");
            console.error(event);
            // Reject the promise with the error event
            reject(event);
          };
          // Resolve the promise with the fetched calorie data when successful
          foodArrayRequest.onsuccess = function () {
            resolve(foodArrayRequest.result);
          };
          // Close the database connection after the transaction is complete
          transaction.oncomplete = function () {
            db.close();
          };
        });
      };

      // Function to delete calorie data by ID
      db.deleteCalories = async (id) => {
        //Delete food item from IndexedDB
        return new Promise((resolve, reject) => {
          // Start a read-write transaction for deleting data
          const transaction = db.transaction("calories", "readwrite");
          const store = transaction.objectStore("calories");
          // IndexedDB quirk: "+" is needed because without it the id is a string and not int.
          const request = store.delete(+id);

          // Handle errors during the delete operation
          request.onerror = function (event) {
            console.error(`Error deleting calories with id ${id}:`);
            console.error(event);
            // Reject the promise with the error event
            reject(event);
          };
          // Resolve the promise with true when delete operation is successful
          request.onsuccess = function () {
            resolve(true);
          };
          // Close the database connection after the transaction is complete
          transaction.oncomplete = function () {
            db.close();
          };
        });
      };

      // Function to update calorie data properties
      db.updateFunction = function (existingCalories) {
        // Get the new food object properties from the edit form fields
        const newDescription = document.getElementById("descriptionEdit").value;
        const newCalories = document.getElementById("caloriesEdit").value;
        const newCategory = document.getElementById("categoryEdit").value;
        //Updating the food object properties to the new ones
        existingCalories.description = newDescription;
        existingCalories.calorie = parseInt(newCalories);
        existingCalories.category = newCategory;
        // Return the updated food object
        return existingCalories;
      };

      // Function to update calorie data by ID
      db.updateCalories = async (id) => {
        return new Promise((resolve, reject) => {
          // Start a read-write transaction for updating data
          const transaction = db.transaction("calories", "readwrite");
          const store = transaction.objectStore("calories");
          // Fetch the existing calorie object using the id.
          const request = store.get(+id);
          // Update the calorie data when fetch operation is successful
          request.onsuccess = function (event) {
            const existingCalories = event.target.result;
            // Modify the calorie using the update function
            const updatedCalories = db.updateFunction(existingCalories);
            // Put the updated calories back into the object store
            const putRequest = store.put(updatedCalories);
            putRequest.onsuccess = function () {
              resolve(true);
            };
            // Handle errors during the update operation
            putRequest.onerror = function () {
              console.error("Error updating calorie:", error);
              // Reject the promise with the error event
              reject(error);
            };
          };
          // Handle errors during the fetch operation
          request.onerror = function (error) {
            console.error("Error fetching calorie:", error);
            // Reject the promise with the error event
            reject(error);
          };
          // Close the database connection after the transaction is complete
          transaction.oncomplete = function () {
            db.close();
          };
        });
      };
      // Resolve the promise with the opened database
      resolve(db);
    };
  });
};