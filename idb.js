"use strict";

const idb = {};

idb.openCalorisDB = async (dbName, version) => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, version);
    //console.log("creating db");
    request.onerror = function (event) {
      console.error("An error happened with indexedDB:");
      console.error(event);
      reject(event);
    };

    request.onupgradeneeded = function () {
      const db = request.result;
      const store = db.createObjectStore("calories", {
        keyPath: "id",
        autoIncrement: true,
      });
      store.createIndex("calories_category", "category", {
        unique: false,
      });
      store.createIndex("calories_date", "selectedDate", {
        unique: false,
      });
    };

    request.onsuccess = function () {
      const db = request.result;
      //Below we are exposing the functions to the db object
      db.addCalories = async (calorieData) => {
        return new Promise((resolve, reject) => {

          //check all required fields
          if(!calorieData.calorie || !calorieData.description || !calorieData.category){
            console.error("One or more required fields are missing!");
            reject("Missing fields!");
            return;
          }

          //if an item is added not from the UI (for example the test) and has no date, the default date will be today's date.
          if(!calorieData.hasOwnProperty('selectedDate')){
            const date = new Date();
            let month = date.getMonth() +1;
            let day = date.getDate();
            month = month <10 ? '0' + month : month;
            day = day < 10? '0' + day:day;
            const currentDate = `${date.getFullYear()}${month}${day}`
            calorieData.selectedDate = currentDate;
          }

          const transaction = db.transaction("calories", "readwrite");
          const store = transaction.objectStore("calories");
          calorieData.category = calorieData.category.toString().toLowerCase();
          const request = store.add(calorieData);

          request.onerror = function (event) {
            console.error("Error adding calories:");
            console.error(event);
            reject(event);
          };

          request.onsuccess = function () {
            resolve(request.result);
          };

          transaction.oncomplete = function () {
            db.close();
          };
        });
      };
      db.getCaloriesByDate = async (startRange, endRange) => {
        //The date needs to be passed as a string
        return new Promise((resolve, reject) => {
          const transaction = db.transaction("calories", "readonly");
          const store = transaction.objectStore("calories");
          const index = store.index("calories_date");
          const range = IDBKeyRange.bound(startRange, endRange, false, false);
          let foodArrayRequest = index.getAll(range);

          foodArrayRequest.onerror = function (event) {
            console.error("Error getting calories:");
            console.error(event);
            reject(event);
          };
          foodArrayRequest.onsuccess = function () {
            resolve(foodArrayRequest.result);
          };
          transaction.oncomplete = function () {
            db.close();
          };
        });
      };
      db.deleteCalories = async (id) => {
        //Delete food item from IndexedDB
        return new Promise((resolve, reject) => {
          const transaction = db.transaction("calories", "readwrite");
          const store = transaction.objectStore("calories");
          //"+" is needed because without it the id is a string and not int. IndexedDB quirk.
          const request = store.delete(+id);
          request.onerror = function (event) {
            console.error(`Error deleting calories with id ${id}:`);
            console.error(event);
            reject(event);
          };
          request.onsuccess = function () {
            resolve(true);
          };
          transaction.oncomplete = function () {
            db.close();
          };
        });
      };
      db.updateFunction = function (existingCalories) {
        //Getting the new food object properties
        const newDescription = document.getElementById("descriptionEdit").value;
        const newCalories = document.getElementById("caloriesEdit").value;
        const newCategory = document.getElementById("categoryEdit").value;
        //Updating the food object properties to the new ones
        existingCalories.description = newDescription;
        existingCalories.calorie = parseInt(newCalories);
        existingCalories.category = newCategory;
        return existingCalories;
      };
      db.updateCalories = async (id) => {
        return new Promise((resolve, reject) => {
          const transaction = db.transaction("calories", "readwrite");
          const store = transaction.objectStore("calories");
          // Fetch the existing calorie object using the id.
          const request = store.get(+id);
          request.onsuccess = function (event) {
            const existingCalories = event.target.result;
            //console.log(`existingCalories: ${existingCalories}`);
            // Modify the calorie using the update function
            const updatedCalories = db.updateFunction(existingCalories);
            // Put the updated calories back into the object store
            const putRequest = store.put(updatedCalories);

            putRequest.onsuccess = function () {
              console.log("Calorie updated successfully");
              resolve(true);
            };
            putRequest.onerror = function () {
              console.error("Error updating calorie:", error);
              reject(error);
            };
          };
          request.onerror = function (error) {
            console.error("Error fetching calorie:", error);
            reject(error);
          };
          transaction.oncomplete = function () {
            db.close();
          };
        });
      };
      //console.log("db created");
      resolve(db);
    };
  });
};



//Q: Do the things it the test supposed to be shown in the UI?

// async function testHaim() {
//   try {
//     async function test() {
//       const db = await idb.openCalorisDB("caloriesdb", 1);
//       const result1 = await db.addCalories({
//         calorie: 200,
//         category: "LUNCH",
//         description: "glass of milk",
//       });
//       const result2 = await db.addCalories({
//         calorie: 300,
//         category: "LUNCH",
//         description: "pizza slice",
//       });
//       if (db) {
//         console.log("creating db succeeded");
//       }
//       if (result1) {
//         console.log("adding 1st cost succeeded");
//       }
//       if (result2) {
//         console.log("adding 2nd cost succeeded");
//       }
//     }
//     test();
//   } catch (error) {
//     console.error("Test failed:", error);
//   }
// }
//
// testHaim();

