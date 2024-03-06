"use strict";
// To do list:
// ( ) Remove everything from the global scope
// ( ) Write the report modal
// ( ) Break script.js into 3 files:
//        -calendar.js
//        -foodModal.js
//        -report.js
// ( ) Write better error handling
async function saveFood() {
  //Function to save the entered food information

  //Declaring Variables
  const selectedDate = dateConvert(
    document.querySelector(".selected-date").textContent.split("/")
  );
  const enteredDescription = document.getElementById("description").value;
  const enteredCalories = document.getElementById("calories").value;
  const selectedCategory = document.getElementById("category").value;

  // Check if the entered values in the fields are valid
  if (!validateSaveFields(enteredDescription, enteredCalories)) {
    return;
  }

  // Push the new item to the database and save the indexedDB id to const id
  try {
    const db = await idb.openCalorisDB("caloriesdb", 1);
    const id = await db.addCalories({
      calorie: parseInt(enteredCalories),
      category: selectedCategory,
      description: enteredDescription,
      selectedDate,
    });

    // Render the new item with the id attached to the html
    renderFoodListItem(
      enteredCalories,
      selectedCategory,
      enteredDescription,
      id
    );
  } catch (error) {
    console.error("Failed to add food item: ", error);
  }
  // Close the Modal on successful data entry
  closeFoodModal();
  // Clear the form fields for the next entry
  clearSaveFoodFields();
}

function clearSaveFoodFields() {
  //Clears the form fields when closing the food addition modal
  //also clears any errors that appeared
  const errFood = document.getElementById("errorMessageFood");
  const errCal = document.getElementById("errorMessageCal");
  errFood.textContent = "";
  errCal.textContent = "";
  document.getElementById("description").value = "";
  document.getElementById("calories").value = "";
}

function setEditModalValues(description, calories, category) {
  // Function that sets the original values in the modal for editing
  document.getElementById("descriptionEdit").value = description;
  document.getElementById("caloriesEdit").value = calories;
  document.getElementById("categoryEdit").value = category;
}

// Unite these 3 somehow
function validateSaveFields() {
  //A form validation function for the food saving modal
  const errFood = document.getElementById("errorMessageFood");
  const errCal = document.getElementById("errorMessageCal");
  const foodElement = document.getElementById("description");
  const caloriesElement = document.getElementById("calories");

  return validateFields(foodElement, caloriesElement, errFood, errCal);
}

function validateEditFoodFields() {
  //A form validation function for the food saving modal
  const errFood = document.getElementById("errorMessageFoodEdit");
  const errCal = document.getElementById("errorMessageCalEdit");
  const foodElement = document.getElementById("descriptionEdit");
  const caloriesElement = document.getElementById("caloriesEdit");

  return validateFields(foodElement, caloriesElement, errFood, errCal);
}

function validateFields(foodElement, caloriesElement, errFood, errCal) {
  // a validation function for general use
  errFood.textContent = "";
  errCal.textContent = "";

  const foodValue = foodElement.value;
  const caloriesValue = caloriesElement.value;

  if (!foodValue && !caloriesValue) {
    errFood.textContent = "Enter food name!";
    errCal.textContent = "Enter calories!";
    return false;
  }

  if (!foodValue) {
    errFood.textContent = "Enter food name!";
    return false;
  }

  if (!caloriesValue) {
    errCal.textContent = "Enter calories!";
    return false;
  }

  return true;
}
//////////////////////
function editFood(clickedButton) {
  //Function to edit or delete food entries
  //Need to find a way to seperate into one for edit and one for delete
  const originalDescription = clickedButton.querySelector("span").textContent;
  const originalCalories = clickedButton
    .querySelector(".badge")
    .textContent.split(" ")[0];
  const originalCategory = clickedButton.getAttribute("data-category");
  const foodEditModal = new bootstrap.Modal(
    document.getElementById("foodModalEdit")
  );

  // Set the values in the modal for editing
  setEditModalValues(originalDescription, originalCalories, originalCategory);

  // Show the food edit modal
  foodEditModal.show();

  document.getElementById("saveEditedFood").onclick = async function () {
    // On save click check if food and calories fields are not empty
    if (!validateEditFoodFields()) {
      return;
    }

    // Update the food item in the list
    clickedButton.querySelector("span").textContent =
      document.getElementById("descriptionEdit").value;
    clickedButton.querySelector(".badge").textContent = `${
      document.getElementById("caloriesEdit").value
    } Calories`;

    // If category changed then move the food item to the correct category
    if (originalCategory !== document.getElementById("categoryEdit").value) {
      const foodList = document.getElementById("foodList");
      foodList
        .querySelector(
          `[data-category="${document.getElementById("categoryEdit").value}"]`
        )
        .after(clickedButton);
    }
    clickedButton.setAttribute(
      "data-category",
      document.getElementById("categoryEdit").value
    );

    // Update the Calorie in the db:
    console.log("updating calorie");
    const id = clickedButton.getAttribute("data-id");
    try {
      const db = await idb.openCalorisDB("caloriesdb", 1);
      await db.updateCalories(id);
    } catch (error) {
      console.error("Failed to update food item: ", error);
    }

    // Close the modal and clean up
    cleanEditErrorMessages();
    foodEditModal.hide();
    document.body.classList.remove("modal-open");
    deleteModalBackdrop();
    report.updateReport();
  };

  // Delete the food item when the "Delete" button is clicked
  document.getElementById("deleteFood").onclick = async function () {
    //Delete from indexedDB
    const id = clickedButton.getAttribute("data-id");
    try {
      const db = await idb.openCalorisDB("caloriesdb", 1);
      await db.deleteCalories(id);
    } catch (error) {
      console.error("Failed to delete food item: ", error);
    }

    // Remove the food item from the UI list
    clickedButton.remove();

    // Close the modal
    cleanEditErrorMessages();
    foodEditModal.hide();
    document.body.classList.remove("modal-open");
    deleteModalBackdrop();
    report.updateReport();
  };
  report.updateReport();
  cleanEditErrorMessages();
}

function cleanEditErrorMessages() {
  //Cleans any error messages that pop up while in the edit modal
  const errFood = document.getElementById("errorMessageFoodEdit");
  const errCal = document.getElementById("errorMessageCalEdit");
  errFood.textContent = "";
  errCal.textContent = "";
}
function deleteModalBackdrop() {
  //A general function that deletes the semi-transparent background of bootstrap modals
  const backdrop = document.querySelector(".modal-backdrop");
  if (backdrop) {
    backdrop.remove();
  }
  document.body.classList.remove("modal-open");
}
function closeFoodModal() {
  // function that closes the food addition modal
  document.getElementById("foodModal").style.display = "none";
  document.querySelector(".modal-backdrop").remove();
  report.updateReport();
}

async function renderFoodList(formattedDate) {
  // Fetch array of food items for the selected day
  const db = await idb.openCalorisDB("caloriesdb", 1);
  const foodArray = await db.getCaloriesByDate(formattedDate, formattedDate);
  // Render each food item in it's respective category
  foodArray.forEach((food) => {
    const { calorie, category, description, id } = food;
    renderFoodListItem(calorie, category, description, id);
  });
}

function renderFoodListItem(calorie, category, description, id) {
  //create new list item with entered information
  const listItem = document.createElement("button");
  listItem.type = "button";
  listItem.classList.add(
    "list-group-item",
    "list-group-item-action",
    "rendered-group-item"
  );
  listItem.innerHTML = `<span>${description}</span><span class="badge">${calorie} Calories</span>`;
  listItem.setAttribute("data-category", category);
  listItem.setAttribute("data-id", id);
  //adds ability to edit food on click on item
  listItem.setAttribute("onClick", "editFood(this)");

  //render the new list item in the corresponding category in the food list
  const foodList = document.getElementById("foodList");
  foodList.querySelector(`[data-category="${category}"]`).after(listItem);
}

function clearFoodList() {
  //This function clears the rendered food items. Usually used when the food modal is closed
  //so that new food items can be rendered on a freshly picked date
  //get the items that are rendered
  const renderedFoodItems = document.querySelectorAll(".rendered-group-item");
  //remove the items that are rendered
  renderedFoodItems.forEach((item) => {
    item.remove();
  });
}

function dateConvert(selectedDate) {
  //receives [DD, MM, YYYY]], first cell day, second month, third year.
  //This function converts the date that appears at the top when clicking on a day in the
  //calendar to an index key. We use the index key to render food items on a picked day.
  //The function turns the [DD,MM,YYYY] into YYYYMMDD
  //for example 29/5/1998 turns into 19980529
  const convertedDate = `${selectedDate[2]}${
    selectedDate[1] < 10
      ? selectedDate[1].toString().padStart(2, "0")
      : selectedDate[1].toString()
  }${
    selectedDate[0] < 10
      ? selectedDate[0].toString().padStart(2, "0")
      : selectedDate[0].toString()
  }`;
  return convertedDate;
}

function toggleFoodCalendar() {
  //The function is used to toggle between the food modal and the calendar
  //When on a calendar and picking a day, the calendar vanishes and we are
  //presented with a food modal. When clicking on the ("X") button to close the food modal,
  //the food modal vanishes and the calendar appears
  const calendarContainer = document.querySelector(".calendar-container");
  const foodEditMenuContainer = document.querySelector(
    ".food-edit-menu-container"
  );
  //toggle between the calendar and the food list
  calendarContainer.classList.toggle("d-none");
  foodEditMenuContainer.classList.toggle("d-none");
  if (foodEditMenuContainer.classList.contains("d-none")) {
    //clean the previous food list when the modal closes so that a fresh one can be rendered later
    clearFoodList();
  }
}

function setSelectedCategoryInModal() {
  // Set the selected category in the Modal after pressing "+". Example: I clicked "+" on Dinner so the category is set to "dinner". Runs only once in the project.
  document
    .getElementById("foodModal")
    .addEventListener("show.bs.modal", function (event) {
      const button = event.relatedTarget;
      const category = button.getAttribute("data-category");
      document.getElementById("category").value = category;
    });
}

//Calendar namespace

const calendar = {};
calendar.MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
calendar.currentDate = new Date();
calendar.currentMonth = calendar.currentDate.getMonth();
calendar.currentYear = calendar.currentDate.getFullYear();

// Function to display the calendar
calendar.renderCalendar = function () {
  const calendarHeaderMonthYear = document.getElementById("monthYear");
  const calendarBody = document.querySelector(".calendar table");
  const emptyCellHtml = `
  <div class="cell-content">
    <div class="day-of-month"></div>
    <p class="calorie-list"></p>
  </div>
`;

  /*By passing 0 as the day in the third parameter,
  it sets the date to the last day of the previous month*/
  const lastDay = new Date(
    calendar.currentYear,
    calendar.currentMonth + 1,
    0
  ).getDate();

  //Update header month year
  calendarHeaderMonthYear.textContent = `${
    calendar.MONTHS[calendar.currentMonth]
  } ${calendar.currentYear}`;

  //Clean body to allow dynamic population
  calendarBody.innerHTML = "";

  // Loop through each day in the month, populating the calendar with cells
  for (let i = 1; i <= lastDay; i++) {
    const dayDate = new Date(calendar.currentYear, calendar.currentMonth, i);
    const dayOfWeek = dayDate.getDay();

    // Create a new row if Sunday or first day of the month
    if (dayOfWeek === 0 || i === 1) {
      var row = calendarBody.insertRow();
      // Populate empty cells for the first week of the month
      if (dayOfWeek !== 0 && i === 1) {
        for (let j = 0; j < dayOfWeek; j++) {
          const emptyCell = row.insertCell();
          emptyCell.innerHTML = emptyCellHtml;
        }
      }
    }

    // Create a cell for each day
    const cell = row.insertCell();
    cell.innerHTML = `
      <div class="cell-content">
        <div class="day-of-month">${i}</div>
        <ul class="calorie-list"></ul>
      </div>
    `;

    // Populate empty cells for the last week
    if (i === lastDay) {
      for (let j = dayOfWeek; j < 6; j++) {
        const emptyCell = row.insertCell();
        emptyCell.innerHTML = emptyCellHtml;
      }
    }

    // Highlight the current day
    if (dayDate.toDateString() === calendar.currentDate.toDateString()) {
      cell.classList.add("current-day"); // Bootstrap class to highlight the current day
    }

    // Add a click event to each day cell
    cell.addEventListener("click", function () {
      const selectedDate = document.querySelector(".selected-date");

      // Toggle to food list
      toggleFoodCalendar();

      // will pass selected date on click to food list
      selectedDate.textContent = `${i}/${calendar.currentMonth + 1}/${
        calendar.currentYear
      }`;
      //console.log(
      //  `Clicked on ${i}/${calendar.currentMonth + 1}/${calendar.currentYear}`
      //);

      const formatedSelectedDate = dateConvert(
        selectedDate.textContent.split("/")
      );

      renderFoodList(formatedSelectedDate);

      //render the foodList
      //_renderFoodList()
    });
  }
};

// Function to go to the previous month
calendar.prevMonth = function () {
  if (calendar.currentMonth > 0) {
    calendar.currentMonth--;
  } else {
    calendar.currentMonth = 11;
    calendar.currentYear--;
  }
  calendar.renderCalendar();
  report.updateReport();
};

// Function to go to the next month
calendar.nextMonth = function () {
  if (calendar.currentMonth < 11) {
    calendar.currentMonth++;
  } else {
    calendar.currentMonth = 0;
    calendar.currentYear++;
  }
  calendar.renderCalendar();
  report.updateReport();
};

// Report namespace

const report = {};

report.updateReport = async function () {
  report.totalCalories();
  report.averageDailyCalories();
  report.averageWeeklyCalories();
  report.mostCaloriesConsumedInADay();
  report.leastCaloriesConsumedInADay();
  report.highestCalorieItem();
  report.lowestCalorieItem();
  report.numberOfItemsPerDay();
};

report.totalCalories = async function () {
  const db = await idb.openCalorisDB("caloriesdb", 1);
  //hardcoded 1 because every month starts with 1
  const firstDay = dateConvert([
    1,
    calendar.currentMonth + 1,
    calendar.currentYear,
  ]);
  //hardcoded 31 because every month ends at most at 31, +1 added
  //because Date class starts months from 0
  const lastDay = dateConvert([
    31,
    calendar.currentMonth + 1,
    calendar.currentYear,
  ]);
  const foodThisMonth = await db.getCaloriesByDate(`${firstDay}`, `${lastDay}`);
  let totalCalories = 0;

  // Using forEach loop to sum up the calories,
  // Calories are saved as string we use the Number constructor.
  foodThisMonth.forEach((food) => {
    totalCalories += Number(food.calorie);
  });
  document.getElementById("totalCalories").textContent = totalCalories;
  return totalCalories;
};

report.averageDailyCalories = async function () {
  const totalDays = new Date(
    calendar.currentYear,
    calendar.currentMonth + 1,
    0
  ).getDate();
  const totalCalories = await report.totalCalories();
  const averageDailyCalories = Math.ceil(totalCalories / totalDays);
  document.getElementById("averageDailyCalories").textContent =
    averageDailyCalories;
  return averageDailyCalories;
};

report.averageWeeklyCalories = async function () {
  const totalCalories = await report.totalCalories();
  const totalDays = new Date(
    calendar.currentYear,
    calendar.currentMonth + 1,
    0
  ).getDate();
  const totalWeeks = totalDays / 7;
  const averageWeeklyCalories = Math.ceil(totalCalories / totalWeeks);
  //console.log(totalCalories, totalDays, totalWeeks, averageWeeklyCalories);
  //console.log(averageWeeklyCalories);
  document.getElementById("averageWeeklyCalories").textContent =
    averageWeeklyCalories;
  return averageWeeklyCalories;
};

// Calculates the day with the most calories consumed in a given month.
// Retrieves data from an IndexedDB database, processes the information, and updates the report.
report.mostCaloriesConsumedInADay = async function () {
  // Initialize variables to track daily calorie consumption
  let sumOfTheDay = 0;
  let mostCaloriesConsumedInADay = 0;

  // Open the IndexedDB database
  const db = await idb.openCalorisDB("caloriesdb", 1);

  // Calculate the first and last dates of the current month
  const firstDate = dateConvert([
    1,
    calendar.currentMonth + 1,
    calendar.currentYear,
  ]);
  const lastDate = dateConvert([
    31,
    calendar.currentMonth + 1,
    calendar.currentYear,
  ]);

  // Retrieve food data for the current month from the database
  const foodThisMonth = await db.getCaloriesByDate(
    `${firstDate}`,
    `${lastDate}`
  );

  // Check if there is any food data for the current month
  if (foodThisMonth.length > 0) {
    // Initialize the current day with the first food data date
    let currentDay = foodThisMonth[0].selectedDate;

    // Uncomment this for testing
    // Array to store the total calories consumed for each day
    // const totalCaloriesPerDay = [];

    // Iterate through the food data for the current month
    foodThisMonth.forEach((food) => {
      // Check if the current food entry belongs to the same day
      if (currentDay === food.selectedDate) {
        // Add the calories of the current food to the sum for the day
        sumOfTheDay += Number(food.calorie);
      } else {
        // Update the most calories consumed in a day if the current day's sum is higher
        mostCaloriesConsumedInADay = Math.max(
          mostCaloriesConsumedInADay,
          sumOfTheDay
        );

        // Uncomment this for testing
        // Save the sum of calories for the previous day in the array
        //totalCaloriesPerDay.push(sumOfTheDay);

        // Update the current day and start calculating the sum for the new day
        currentDay = food.selectedDate;
        sumOfTheDay = Number(food.calorie);
      }
    });

    // Update most calories consumed for the last day in case it's the highest
    mostCaloriesConsumedInADay = Math.max(
      mostCaloriesConsumedInADay,
      sumOfTheDay
    );

    // Uncomment this for testing
    // Save the sum of calories for the last day in the array
    //totalCaloriesPerDay.push(sumOfTheDay);

    // Uncomment this for testing
    // Log the highest calories consumed in a day and the total calories for each day
    //console.log("Most calories consumed in a day:", mostCaloriesConsumedInADay);
    //console.log("Total calories consumed per day:", totalCaloriesPerDay);
  }

  // Update the DOM with the most calories consumed in a day
  document.getElementById("mostCaloriesConsumedInADay").textContent =
    mostCaloriesConsumedInADay;

  // Return the highest number of calories consumed in a day during the specified month
  return mostCaloriesConsumedInADay;
};

// Calculates the day with the least calories consumed
// (excluding 0) in a given month.
// Retrieves data from an IndexedDB database, processes the information, and updates the report.

report.leastCaloriesConsumedInADay = async function () {
  // Initialize variables to track daily calorie consumption
  let sumOfTheDay = 0;
  let leastCaloriesConsumedInADay = Infinity; // Start with a high initial value

  // Open the IndexedDB database
  const db = await idb.openCalorisDB("caloriesdb", 1);

  // Calculate the first and last dates of the current month
  const firstDate = dateConvert([
    1,
    calendar.currentMonth + 1,
    calendar.currentYear,
  ]);
  const lastDate = dateConvert([
    31,
    calendar.currentMonth + 1,
    calendar.currentYear,
  ]);

  // Retrieve food data for the current month from the database
  const foodThisMonth = await db.getCaloriesByDate(
    `${firstDate}`,
    `${lastDate}`
  );

  // Check if there is any food data for the current month
  if (foodThisMonth.length > 0) {
    // Initialize the current day with the first day's date
    let currentDay = foodThisMonth[0].selectedDate;

    // Uncomment this for testing
    // Array to store the total calories consumed for each day
    //const totalCaloriesPerDay = [];

    // Iterate through the food data for the current month
    foodThisMonth.forEach((food) => {
      // Check if the current food entry belongs to the same day
      if (currentDay === food.selectedDate) {
        // Add the calories of the current food to the sum for the day
        sumOfTheDay += Number(food.calorie);
      } else {
        // Update the least calories consumed in a day if the current day's sum is lower
        if (sumOfTheDay > 0) {
          leastCaloriesConsumedInADay = Math.min(
            leastCaloriesConsumedInADay,
            sumOfTheDay
          );
        }
        // Uncomment this for testing
        // Save the sum of calories for the previous day in the array
        //totalCaloriesPerDay.push(sumOfTheDay);

        // Update the current day and start calculating the sum for the new day
        currentDay = food.selectedDate;
        sumOfTheDay = Number(food.calorie);
      }
    });

    // Update least calories consumed for the last day in case it's the lowest
    if (sumOfTheDay > 0) {
      leastCaloriesConsumedInADay = Math.min(
        leastCaloriesConsumedInADay,
        sumOfTheDay
      );
    }
    // Uncomment this for testing
    // Save the sum of calories for the last day in the array
    //totalCaloriesPerDay.push(sumOfTheDay);

    // Uncomment this for testing
    // Log the least calories consumed in a day and the total calories for each day
    //console.log(
    //  "Least calories consumed in a day:",
    //  leastCaloriesConsumedInADay
    //);
    //console.log("Total calories consumed per day:", totalCaloriesPerDay);
  }
  if (leastCaloriesConsumedInADay === Infinity) {
    leastCaloriesConsumedInADay = 0;
  }
  // Update the DOM with the least calories consumed in a day
  document.getElementById("leastCaloriesConsumedInADay").textContent =
    leastCaloriesConsumedInADay;

  // Return the least number of calories consumed in a day during the specified month
  return leastCaloriesConsumedInADay;
};

report.highestCalorieItem = async function () {
  const db = await idb.openCalorisDB("caloriesdb", 1);
  const firstDay = dateConvert([
    1,
    calendar.currentMonth + 1,
    calendar.currentYear,
  ]);
  const lastDay = dateConvert([
    31,
    calendar.currentMonth + 1,
    calendar.currentYear,
  ]);
  const foodThisMonth = await db.getCaloriesByDate(`${firstDay}`, `${lastDay}`);
  const highestCalorieItem = { calorie: 0, description: "" };
  if (foodThisMonth[0]) {
    foodThisMonth.forEach((food) => {
      //console.log(food);
      if (highestCalorieItem.calorie < Number(food.calorie)) {
        highestCalorieItem.calorie = Number(food.calorie);
        highestCalorieItem.description = food.description;
      }
    });
  } else highestCalorieItem.description = "no food";
  document.getElementById("highestCalorieItem").textContent =
    highestCalorieItem.description;
  return highestCalorieItem;
};
report.lowestCalorieItem = async function () {
  const db = await idb.openCalorisDB("caloriesdb", 1);
  const firstDay = dateConvert([
    1,
    calendar.currentMonth + 1,
    calendar.currentYear,
  ]);
  const lastDay = dateConvert([
    31,
    calendar.currentMonth + 1,
    calendar.currentYear,
  ]);
  const foodThisMonth = await db.getCaloriesByDate(`${firstDay}`, `${lastDay}`);
  const lowestCalorieItem = { calorie: 0, description: "" };
  if (foodThisMonth[0]) {
    //initialize the lowestCalorieItem to be the first food item in the array of foods
    lowestCalorieItem.calorie = Number(foodThisMonth[0].calorie);
    lowestCalorieItem.description = foodThisMonth[0].description;
    foodThisMonth.forEach((food) => {
      if (lowestCalorieItem.calorie > Number(food.calorie)) {
        lowestCalorieItem.calorie = Number(food.calorie);
        lowestCalorieItem.description = food.description;
      }
    });
  } else lowestCalorieItem.description = "no food";
  document.getElementById("lowestCalorieItem").textContent =
    lowestCalorieItem.description;
  return lowestCalorieItem.description;
};

//returns an array with the number of items per day where there's food and updates the report
//items for "Highest food item count in a day", "Lowest food item count in a day" and "Number of Fasting Days"
report.numberOfItemsPerDay = async function () {
  let numberOfItems = 0;
  let numberOfFastingDays = new Date(
    calendar.currentYear,
    calendar.currentMonth + 1,
    0
  ).getDate();
  const db = await idb.openCalorisDB("caloriesdb", 1);
  const firstDate = dateConvert([
    1,
    calendar.currentMonth + 1,
    calendar.currentYear,
  ]);
  const lastDate = dateConvert([
    31,
    calendar.currentMonth + 1,
    calendar.currentYear,
  ]);
  const foodThisMonth = await db.getCaloriesByDate(
    `${firstDate}`,
    `${lastDate}`
  );
  const totalItemsPerDay = [];

  if (foodThisMonth.length > 0) {
    let currentDay = foodThisMonth[0].selectedDate;
    foodThisMonth.forEach((food) => {
      // Check if the current food entry belongs to the same day
      if (currentDay === food.selectedDate) {
        // updates the number of items by 1 per entry on the same day
        numberOfItems++;
      } else {
        // Save the sum of items for the previous day in the array
        totalItemsPerDay.push(numberOfItems);

        // Update the current day and start calculating the sum for the new day
        currentDay = food.selectedDate;
        numberOfItems = 1;
      }
    });

    // Update the food items in the last day
    totalItemsPerDay.push(numberOfItems);
    numberOfFastingDays = numberOfFastingDays - totalItemsPerDay.length;
  }

  // Update the DOM with the most calories consumed in a day

  //console.log(numberOfDaysInMonth);
  //console.log(totalItemsPerDay);
  //console.log(Math.min(...totalItemsPerDay));
  document.getElementById("numberOfFastingDays").textContent =
    numberOfFastingDays;
  document.getElementById("highestFoodItemCountInADay").textContent =
    foodThisMonth.length > 0 ? Math.max(...totalItemsPerDay) : 0;
  document.getElementById("lowestFoodItemCountInADay").textContent =
    foodThisMonth.length > 0 ? Math.min(...totalItemsPerDay) : 0;
  return totalItemsPerDay;
};

// Initial setup
calendar.renderCalendar();

setSelectedCategoryInModal();

report.updateReport();
