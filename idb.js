//Start of Haim Test
async function test() {
  const db = await idb.openCalorisDB("caloriesdb", 1);
  const result1 = await db.addCalories({
    calorie: 200,
    category: "LUNCH",
    Name: "glass of milk",
  });
  const result2 = await db.addCalories({
    calorie: 300,
    category: "LUNCH",
    Description: "pizza slice",
  });
  if (db) {
    console.log("creating db succeeded");
  }
  if (result1) {
    console.log("adding 1st cost succeeded");
  }
  if (result2) {
    console.log("adding 2nd cost succeeded");
  }
}
test();

//end of haim test beginning of car demo
var demo = {};
//different web browsers might have different implementations
window.indexedDB =
  window.indexedDB ||
  window.mozIndexedDB ||
  window.webkitIndexedDB ||
  window.msIndexedDB;
//checking whether the web browser supports the IndexedDB database
//if it doesn't then showing a message saying so
if (!window.indexedDB) {
  console.log("The web browser doesn't support IndexedDB");
} else {
  console.log("The web browser supports IndexedDB");
}

demo.data = [
  { id: "1232523", brand: "Toyota", year: 2012, model: "Corola" },
  { id: "2343434", brand: "Mazda", year: 2008, model: "6" },
  { id: "2234345", brand: "Fiat", year: 2014, model: "500 Large" },
  { id: "2234333", brand: "Fiat", year: 2011, model: "Bravo" },
];

demo.db;
demo.request = window.indexedDB.open("carsdb", 1);

demo.request.onerror = function (event) {
  console.log("error: ");
};
demo.request.onsuccess = function (event) {
  demo.db = demo.request.result;
  console.log("success: " + demo.db);
};

//fires when we create a new database or when we increase the version number
demo.request.onupgradeneeded = function (event) {
  demo.db = event.target.result;
  var objectStore = demo.db.createObjectStore("cars", { keyPath: "id" });
  objectStore.createIndex("foodCategory", ["category"], { unique: false });
  /* adds all of the cars in the data array
  for (let i in demo.data) {
    objectStore.add(demo.data[i]);
  }
  */
};

function readItem() {
  var transaction = demo.db.transaction(["cars"]);
  var objectStore = transaction.objectStore("cars");
  var request = objectStore.get("12121212");
  request.onerror = function (event) {
    console.log("readItem(): cannot find the data item");
  };
  request.onsuccess = function (event) {
    if (request.result) {
      console.log(
        "readItem(): " +
          request.result.brand +
          ", " +
          request.result.id +
          ", " +
          request.result.model
      );
    } else {
      console.log("readItem(): cannot find the item");
    }
  };
}

function readAllItems() {
  var objectStore = demo.db.transaction("cars").objectStore("cars");
  let request = objectStore.openCursor();
  request.onerror = function (event) {};
  request.onsuccess = function (event) {
    var cursor = event.target.result;
    if (cursor) {
      console.log(
        "readAllItems(): key=" +
          cursor.key +
          " brand=" +
          cursor.value.brand +
          " model=" +
          cursor.value.model +
          " id=" +
          cursor.value.id
      );
      cursor.continue();
    } else {
      console.log("readAllItems(): no more entries!");
    }
  };
}

function addItem() {
  var request = demo.db
    .transaction(["cars"], "readwrite")
    .objectStore("cars")
    .add({ id: "12121212", brand: "BMW", year: 2009, model: "318" });
  request.onsuccess = function (event) {
    console.log("addItem(): the new data item was added to your database.");
  };
  request.onerror = function (event) {
    console.log(
      "addItem(): problem with adding the new data item to the database "
    );
  };
}

function removeItem() {
  var request = demo.db
    .transaction(["cars"], "readwrite")
    .objectStore("cars")
    .delete("12121212");
  request.onsuccess = function (event) {
    console.log("removeItem(): the data item was removed from the database");
  };
  request.onerror = function (event) {
    console.log(
      "removeItem(): problem with removing a data item from the database"
    );
  };
}
