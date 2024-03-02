"use strict";

const idb = {};

idb.openCaloriesDB = async (dbName, version) => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, version);

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
      store.createIndex("calories_category", "selectedCategory", {
        unique: false,
      });
      store.createIndex("calories_date", "selectedDate", {
        unique: false,
      });
    };

    request.onsuccess = function () {
      const db = request.result;
      resolve(db);
    };
  });
};

idb.addCalories = async (db, calorieData) => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("calories", "readwrite");
    const store = transaction.objectStore("calories");
    const request = store.add(calorieData);

    request.onerror = function (event) {
      console.error("Error adding calories:");
      console.error(event);
      reject(event);
    };

    request.onsuccess = function () {
      resolve(request.result); //Changed from true to request.result
    };

    transaction.oncomplete = function () {
      db.close();
    };
  });
};

idb.getCaloriesByDate = async (db, startRange, endRange) => {
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

//Delete food item from IndexedDB
idb.deleteCalories = async (db, id) => {
  return new Promise((resolve, reject) => {
    //console.log(db);
    const transaction = db.transaction("calories", "readwrite");
    const store = transaction.objectStore("calories");
    //console.log(store);
    //"+" is needed because without it the id is a string ant not int
    const request = store.delete(+id);
    //console.log("we in the delete from index function with id: ", id);

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

idb.updateFunction = function (existingCalories) {
  const newFoodName = document.getElementById("foodNameEdit").value;
  const newCalories = document.getElementById("caloriesEdit").value;
  const newCategory = document.getElementById("categoryEdit").value;
  existingCalories.foodName = newFoodName;
  existingCalories.calories = newCalories;
  existingCalories.selectedCategory = newCategory;
  return existingCalories;
};

idb.updateCalories = async (db, id) => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("calories", "readwrite");
    const store = transaction.objectStore("calories");
    // Fetch the existing calorie using the id
    const request = store.get(+id);

    request.onsuccess = function (event) {
      const existingCalories = event.target.result;
      console.log(`existingCalories: ${existingCalories}`);
      // Modify the calorie using the update function
      const updatedCalories = idb.updateFunction(existingCalories);
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

async function test_getCalories() {
  const db = await idb.openCaloriesDB("caloriesdb", 1);
  const foodArray = await idb.getCaloriesByDate(db, "20240204", "20240204");
  return foodArray;
}

//Q: Do the things it the test supposed to be shown in the UI?

// async function testHaim() {
//   try {
//     const db = await idb.openCalorisDB("caloriesdb", 1);
//     const result1 = await db.addCalories({
//       calorie: 200,
//       category: "LUNCH",
//       description: "glass of milk",
//     });
//     const result2 = await db.addCalories({
//       calorie: 300,
//       category: "LUNCH",
//       description: "pizza slice",
//     });
//     if (db) {
//       console.log("creating db succeeded");
//     }
//     if (result1) {
//       console.log("adding 1st cost succeeded");
//     }
//     if (result2) {
//       console.log("adding 2nd cost succeeded");
//     }
//   } catch (error) {
//     console.error("Test failed:", error);
//   }
// }

// testHaim();
