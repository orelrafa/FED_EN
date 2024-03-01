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
    console.log(db);
    const transaction = db.transaction("calories", "readwrite");
    const store = transaction.objectStore("calories");
    console.log(store);
    const request = store.delete(+id); //"+" is needed because without it the id is a string ant not int!!!!!
    console.log("we in the delete from index function with id: ", id);

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

async function test_getCalories() {
  const db = await idb.openCaloriesDB("caloriesdb", 1);
  const foodArray = await idb.getCaloriesByDate(db, "20240204", "20240204");
  return foodArray;
}

//Q: Do the things it the test supposed to be shown in the UI?

/*
async function testHaim() {
  try {
    const db = await idb.openCaloriesDB("caloriesdb", 1);
    const result1 = await idb.addCalories(db, {
      calorie: 200,
      category: "LUNCH",
      Name: "glass of milk",
    });

    const result2 = await idb.addCalories(db, {
      calorie: 300,
      category: "LUNCH",
      Description: "pizza slice",
    });

    if (db) {
      console.log("Creating db succeeded");
    }

    if (result1) {
      console.log("Adding 1st entry succeeded");
    }

    if (result2) {
      console.log("Adding 2nd entry succeeded");
    }
  } catch (error) {
    console.error("Test failed:", error);
  }
}

testHaim();
*/
