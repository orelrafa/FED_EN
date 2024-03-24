/*
Developers:
First name: Orel, Nikita
Last name: Rafailov, Borochov
ID:   318972957, 302238399
*/
"use strict";

// Namespace for Food Manager operations
const foodManager = {};

// Function that manages the food saving logic
foodManager.saveFood = async function () {
  // Getting the DOM elements
  const selectedDate = foodManager.dateConvert(
    document.querySelector(".selected-date").textContent.split("/")
  );
  const enteredDescription = document.getElementById("description").value;
  const enteredCalories = document.getElementById("calories").value;
  const selectedCategory = document.getElementById("category").value;

  // Check if the entered values in the fields are valid
  if (!foodManager.validateSaveFields(enteredDescription, enteredCalories)) {
    return;
  }

  // try pushing the new item to the database and save the indexedDB id to const id
  try {
    const db = await idb.openCaloriesDB("caloriesdb", 1);
    const id = await db.addCalories({
      calorie: parseInt(enteredCalories),
      category: selectedCategory,
      description: enteredDescription,
      selectedDate,
    });

    // Render the new item with the id attached to the html for easier access
    foodManager.renderFoodListItem(
      enteredCalories,
      selectedCategory,
      enteredDescription,
      id
    );
  } catch (error) {
    console.error("Failed to add food item: ", error);
  }
  // Close the Modal on successful data entry
  foodManager.closeFoodModal();
  // Clear the form fields for the next entry
  foodManager.clearSaveFoodFields();
};

// Function that clears the form fields when closing the saveFood modal
// In addition, clears any errors that might've appeared when the user filled the fields
foodManager.clearSaveFoodFields = function () {
  document.getElementById("errorMessageFood").textContent = "";
  document.getElementById("errorMessageCal").textContent = "";
  document.getElementById("description").value = "";
  document.getElementById("calories").value = "";
};

// Function that sets the original values of the food item
// to match in the modal for editing
foodManager.setEditModalValues = function (description, calories, category) {
  document.getElementById("descriptionEdit").value = description;
  document.getElementById("caloriesEdit").value = calories;
  document.getElementById("categoryEdit").value = category;
};

// A form validation function for the food saving modal
foodManager.validateSaveFields = function () {
  // Get the DOM elements
  const errFood = document.getElementById("errorMessageFood");
  const errCal = document.getElementById("errorMessageCal");
  const foodElement = document.getElementById("description");
  const caloriesElement = document.getElementById("calories");
  // Use the validateFields function to validate the fields
  // by passing the DOM elements
  return foodManager.validateFields(
    foodElement,
    caloriesElement,
    errFood,
    errCal
  );
};

// A form validation function for the food edit modal
foodManager.validateEditFoodFields = function () {
  // Get the DOM elements
  const errFood = document.getElementById("errorMessageFoodEdit");
  const errCal = document.getElementById("errorMessageCalEdit");
  const foodElement = document.getElementById("descriptionEdit");
  const caloriesElement = document.getElementById("caloriesEdit");
  // Use the validateFields general function to validate the fields
  // by passing the DOM elements
  return foodManager.validateFields(
    foodElement,
    caloriesElement,
    errFood,
    errCal
  );
};

// Function that validates form fields
foodManager.validateFields = function (
  foodElement,
  caloriesElement,
  errFood,
  errCal
) {
  // Clears the error fields if errors popped up
  errFood.textContent = "";
  errCal.textContent = "";

  // Gets the values of the fields that were filled depending on the
  // modal elements that were passed
  const foodValue = foodElement.value;
  const caloriesValue = caloriesElement.value;

  // Check if the passed data is valid, if not, display an error
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
  if (caloriesValue < 0) {
    errCal.textContent = "Calories can't be negative!";
    return false;
  }

  // If the check passed return true
  return true;
};

// Function that manages the food edit logic
// When a user clicks on a food item, the bootstrap button is passed to the function
foodManager.editFood = function (clickedButton) {
  // Get the original values of the clicked item
  const originalDescription = clickedButton.querySelector("span").textContent;
  const originalCalories = clickedButton
    .querySelector(".badge")
    .textContent.split(" ")[0];
  const originalCategory = clickedButton.getAttribute("data-category");

  // Create a new bootstrap modal
  const foodEditModal = new bootstrap.Modal(
    document.getElementById("foodModalEdit")
  );

  // Set the values in the edit modal for editing
  foodManager.setEditModalValues(
    originalDescription,
    originalCalories,
    originalCategory
  );

  // Show the food edit modal
  foodEditModal.show();

  // adds mouse click event when a user clicks on the "Save Changes" button
  document.getElementById("saveEditedFood").onclick = async function () {
    // On save click check validate the entered fields
    if (!foodManager.validateEditFoodFields()) {
      return;
    }

    // if the validation passed, update the food item in the list to show the updated values
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
    const id = clickedButton.getAttribute("data-id");
    try {
      const db = await idb.openCaloriesDB("caloriesdb", 1);
      await db.updateCalories(id);
    } catch (error) {
      console.error("Failed to update food item: ", error);
    }

    // Clean any error messages that might've appeared when the user filled the fields
    foodManager.cleanEditErrorMessages();
    // Hide the edit modal
    foodEditModal.hide();
    document.body.classList.remove("modal-open");
    // Remove the backdrop of the bootstrap modal
    foodManager.deleteModalBackdrop();
    // Update the report to take into account the new edited item
    report.updateReport();
  };

  // Delete the food item when the "Delete" button is clicked
  document.getElementById("deleteFood").onclick = async function () {
    //Delete from indexedDB
    const id = clickedButton.getAttribute("data-id");
    try {
      const db = await idb.openCaloriesDB("caloriesdb", 1);
      await db.deleteCalories(id);
    } catch (error) {
      console.error("Failed to delete food item: ", error);
    }

    // Remove the food item from the UI list
    clickedButton.remove();

    // Close the modal
    foodManager.cleanEditErrorMessages();
    foodEditModal.hide();
    document.body.classList.remove("modal-open");
    foodManager.deleteModalBackdrop();
    report.updateReport();
  };
  report.updateReport();
  foodManager.cleanEditErrorMessages();
};

// Function that cleans any error messages that pop up while the user is editing food items
foodManager.cleanEditErrorMessages = function () {
  document.getElementById("errorMessageFoodEdit").textContent = "";
  document.getElementById("errorMessageCalEdit").textContent = "";
};

// Function that deletes the backdrop, the semi-transparent background, of bootstrap modals
foodManager.deleteModalBackdrop = function () {
  const backdrop = document.querySelector(".modal-backdrop");
  if (backdrop) {
    backdrop.remove();
  }
  document.body.classList.remove("modal-open");
};

// Function that closes the food saving modal
foodManager.closeFoodModal = function () {
  document.getElementById("foodModal").style.display = "none";
  document.querySelector(".modal-backdrop").remove();
  report.updateReport();
};

// Function that renders all of the food items of a day
foodManager.renderFoodList = async function (formattedDate) {
  // Fetch array of food items for the selected day from the caloriesdb
  const db = await idb.openCaloriesDB("caloriesdb", 1);
  const foodArray = await db.getCaloriesByDate(formattedDate, formattedDate);
  // Render each food item in it's respective category
  foodArray.forEach((food) => {
    const { calorie, category, description, id } = food;
    foodManager.renderFoodListItem(calorie, category, description, id);
  });
};

// Function that creates a food item button in the food list and renders it
foodManager.renderFoodListItem = function (calorie, category, description, id) {
  // create new list item with entered information
  const listItem = document.createElement("button");
  listItem.type = "button";
  listItem.classList.add(
    "list-group-item",
    "list-group-item-action",
    "rendered-group-item"
  );
  listItem.innerHTML = `<span>${description}</span><span class="badge">${calorie} Calories</span>`;
  // sets the necessary attributes
  listItem.setAttribute("data-category", category);
  listItem.setAttribute("data-id", id);
  // adds ability to edit food on click on item
  listItem.setAttribute("onClick", "foodManager.editFood(this)");

  //render the new list item in the corresponding category in the food list
  const foodList = document.getElementById("foodList");
  foodList.querySelector(`[data-category="${category}"]`).after(listItem);
};

// Function that clears the rendered food items.
// Used when the food modal is closed so that new food items can be
// rendered on a freshly picked date.
foodManager.clearFoodList = function () {
  // get the food items that are rendered
  const renderedFoodItems = document.querySelectorAll(".rendered-group-item");
  // remove the items that are rendered
  renderedFoodItems.forEach((item) => {
    item.remove();
  });
};

// Function that processes an array that symbolizes a date to an index key for use
// for inedexedDB
foodManager.dateConvert = function (selectedDate) {
  // Receives [DD, MM, YYYY]], first cell day, second month, third year.
  // processes it to turn into an index key in the shape of YYYYMMDD.
  // for example [29,5,1998] turns into 19980529
  // One use of the index key is to render food items on a picked day.
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
};

// Function used to toggle between the food modal and the calendar
// For example: When picking a day on the calendar, the calendar vanishes and we are
// presented with a food modal.
// Similarly, when we click on the "X" on the food modal.
foodManager.toggleFoodCalendar = function () {
  const calendarContainer = document.querySelector(".calendar-container");
  const foodEditMenuContainer = document.querySelector(
    ".food-edit-menu-container"
  );
  //toggle between the calendar and the food list
  calendarContainer.classList.toggle("d-none");
  foodEditMenuContainer.classList.toggle("d-none");
  if (foodEditMenuContainer.classList.contains("d-none")) {
    //clean the previous food list when the modal closes so that a fresh one can be rendered later
    foodManager.clearFoodList();
  }
};

// Function that sets the selected category in the Modal after pressing "+".
// Example: I clicked "+" on Dinner so the category is set to "dinner".
foodManager.setSelectedCategoryInModal = function () {
  document
    .getElementById("foodModal")
    .addEventListener("show.bs.modal", function (event) {
      const button = event.relatedTarget;
      const category = button.getAttribute("data-category");
      document.getElementById("category").value = category;
    });
};

// Namespace for Calendar operations
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

  // By passing 0 as the day in the third parameter,
  // it sets the date to the last day of the month
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

    // Add a click event to each day cell, not efficient but considering it's a
    // small project we assume it's fine
    cell.addEventListener("click", function () {
      const selectedDate = document.querySelector(".selected-date");

      // Toggle to food list
      foodManager.toggleFoodCalendar();

      // will pass selected date on click to food list
      selectedDate.textContent = `${i}/${calendar.currentMonth + 1}/${
        calendar.currentYear
      }`;

      // process the date to later pass to the renderFoodList function
      const formatedSelectedDate = foodManager.dateConvert(
        selectedDate.textContent.split("/")
      );

      // renders the food list for that day
      foodManager.renderFoodList(formatedSelectedDate);
    });
  }
};

// Function to go to the previous month
calendar.prevMonth = function () {
  // if the previous month is still positive, just reduce the month by 1, otherwise
  // we've passed to the previous year, update the year to be the previous year and the month
  // to be the last month of that year
  if (calendar.currentMonth > 0) {
    calendar.currentMonth--;
  } else {
    calendar.currentMonth = 11;
    calendar.currentYear--;
  }
  // render the calendar for the corresponding month
  calendar.renderCalendar();
  // update the report to display for the correct month
  report.updateReport();
};

// Function to go to the next month
calendar.nextMonth = function () {
  // if the next month is still within the range of valid months,
  // just increase the month by 1, otherwise
  // we've passed to the next year, update the year to be the next year and the month
  // to be the first month of that year
  if (calendar.currentMonth < 11) {
    calendar.currentMonth++;
  } else {
    calendar.currentMonth = 0;
    calendar.currentYear++;
  }
  // render the calendar for the corresponding month
  calendar.renderCalendar();
  // update the report to display for the correct month
  report.updateReport();
};

// Namespace for Report operations
const report = {};

// Function that updates the values of the report
report.updateReport = async function () {
  // Each row is handled by a function to calculate the needed information.
  // We're calling asynchronous functions to update each row in the report.
  report.totalCalories();
  report.averageDailyCalories();
  report.averageWeeklyCalories();
  report.mostCaloriesConsumedInADay();
  report.leastCaloriesConsumedInADay();
  report.highestCalorieItem();
  report.lowestCalorieItem();
  report.numberOfItemsPerDay();
};

// Asynchronous function that counts the total calories in a month
report.totalCalories = async function () {
  // Open the IndexedDB database named "caloriesdb" with version 1
  const db = await idb.openCaloriesDB("caloriesdb", 1);

  // Get the date key for the first day of the current month of the current year.
  // -We use harcoded 1 because every day of the month starts with 1,
  // -We use currentMonth+1 because Date class counts months starting from 0,
  // -No changes to current year
  const firstDay = foodManager.dateConvert([
    1,
    calendar.currentMonth + 1,
    calendar.currentYear,
  ]);

  // Get the date key for the last day of current month,
  // -Hardcoded 31 because every month ends at most at 31,
  // -CurrentMonth+1 added because Date class starts counts months starting from 0,
  // -No changes to current year
  const lastDay = foodManager.dateConvert([
    31,
    calendar.currentMonth + 1,
    calendar.currentYear,
  ]);
  // Retrieve food entries for the current month from the IndexedDB database using the keys
  const foodThisMonth = await db.getCaloriesByDate(`${firstDay}`, `${lastDay}`);

  // Initializing totalCalories variable to count the total calories
  let totalCalories = 0;

  // Iterate through each food entry to calculate the total calories
  foodThisMonth.forEach((food) => {
    // Convert the calorie value from string to number and add it to the total
    totalCalories += Number(food.calorie);
  });
  // Set the total calories content in the HTML element with id "totalCalories"
  document.getElementById("totalCalories").textContent = totalCalories;
  // Return the total calories for that month
  return totalCalories;
};

// Asynchronous function that calculates the average daily calories in a month
report.averageDailyCalories = async function () {
  // Get the total number of days in the current month
  const totalDays = new Date(
    calendar.currentYear,
    calendar.currentMonth + 1, // Adding 1 because Date class starts months from 0
    0 // Passing 0 as the day to get the last day of the current month
  ).getDate();

  // Retrieve the total calories consumed for the current month
  const totalCalories = await report.totalCalories();
  // Calculate the average daily calories by dividing the total calories
  // by the total number of days, and rounding up to the nearest integer using Math.ceil
  const averageDailyCalories = Math.ceil(totalCalories / totalDays);
  // Set the average daily calories content in the HTML element with id "averageDailyCalories"
  document.getElementById("averageDailyCalories").textContent =
    averageDailyCalories;
  // Return the average daily calories calculated
  return averageDailyCalories;
};

// Asynchronous function that calculates the average weekly calories in a month
report.averageWeeklyCalories = async function () {
  // Calculate the total calories consumed.
  const totalCalories = await report.totalCalories();
  // Determine the total number of days in the current month
  const totalDays = new Date(
    calendar.currentYear,
    calendar.currentMonth + 1,
    0
  ).getDate();
  // Calculate the total number of weeks in the current month
  const totalWeeks = totalDays / 7;
  // Calculate the average weekly calories consumed by
  // dividing total calories by total weeks and rounding up
  const averageWeeklyCalories = Math.ceil(totalCalories / totalWeeks);
  // Display the average weekly calories on the webpage
  document.getElementById("averageWeeklyCalories").textContent =
    averageWeeklyCalories;
  // Return the calculated average weekly calories.
  return averageWeeklyCalories;
};

// Asynchronous function that calculates the day with the most
// calories consumed in a given month.
report.mostCaloriesConsumedInADay = async function () {
  // Initialize variables to track daily calorie consumption
  let sumOfTheDay = 0;
  let mostCaloriesConsumedInADay = 0;

  // Open the IndexedDB database
  const db = await idb.openCaloriesDB("caloriesdb", 1);

  // Calculate the first and last day keys of the current month to pass as a range
  // for the getCaloriesByDate
  const firstDate = foodManager.dateConvert([
    1, //passing hardcoded 1 because every month starts with 1
    calendar.currentMonth + 1, //currentMonth+1 because Date class counts from 0
    calendar.currentYear,
  ]);
  const lastDate = foodManager.dateConvert([
    31, //passing hardcoded 31 because at most a month has 31 days
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
        // Update the current day and start calculating the sum for the new day
        currentDay = food.selectedDate;
        sumOfTheDay = Number(food.calorie);
      }
    });

    // Update most calories consumed for the last day in the edge case it's the highest
    mostCaloriesConsumedInADay = Math.max(
      mostCaloriesConsumedInADay,
      sumOfTheDay
    );
  }

  // Update the DOM with the most calories consumed in a day
  document.getElementById("mostCaloriesConsumedInADay").textContent =
    mostCaloriesConsumedInADay;

  // Return the highest number of calories consumed in a day during the specified month
  return mostCaloriesConsumedInADay;
};

// Asynchronous function that calculates the day with the least (non-zero)
// calories consumed in a given month.
report.leastCaloriesConsumedInADay = async function () {
  // Initialize variables to track daily calorie consumption
  let sumOfTheDay = 0;
  let leastCaloriesConsumedInADay = Infinity; // Start with a high initial value

  // Open the IndexedDB database
  const db = await idb.openCaloriesDB("caloriesdb", 1);

  // Calculate the first and last dates of the current month
  const firstDate = foodManager.dateConvert([
    1, //passing hardcoded 1 because every month starts with 1
    calendar.currentMonth + 1, //currentMonth+1 because Date class counts from 0
    calendar.currentYear,
  ]);
  const lastDate = foodManager.dateConvert([
    31, //passing hardcoded 31 because at most a month has 31 days
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

// Asynchronous function that finds the highest calorie item in a given month
report.highestCalorieItem = async function () {
  // Open the IndexedDB database
  const db = await idb.openCaloriesDB("caloriesdb", 1);
  const firstDay = foodManager.dateConvert([
    1, //passing hardcoded 1 because every month starts with 1
    calendar.currentMonth + 1, //currentMonth+1 because Date class counts from 0
    calendar.currentYear,
  ]);
  const lastDay = foodManager.dateConvert([
    31, //passing hardcoded 31 because at most a month has 31 days
    calendar.currentMonth + 1,
    calendar.currentYear,
  ]);
  // Retrieve food data for the current month from the database
  const foodThisMonth = await db.getCaloriesByDate(`${firstDay}`, `${lastDay}`);

  // Initialize the current highest calorie item
  const highestCalorieItem = { calorie: 0, description: "" };
  // Check if there is any food data for the current month
  if (foodThisMonth[0]) {
    //Find the highest calorie item in this month
    foodThisMonth.forEach((food) => {
      if (highestCalorieItem.calorie < Number(food.calorie)) {
        highestCalorieItem.calorie = Number(food.calorie);
        highestCalorieItem.description = food.description;
      }
    });
  } else highestCalorieItem.description = "no food";
  // update the DOM element
  document.getElementById("highestCalorieItem").textContent =
    highestCalorieItem.description;
  // return the highest calorie item
  return highestCalorieItem;
};
// Asynchronous function that finds the lowest calorie item in a given month
report.lowestCalorieItem = async function () {
  // Open the IndexedDB database
  const db = await idb.openCaloriesDB("caloriesdb", 1);
  const firstDay = foodManager.dateConvert([
    1, //passing hardcoded 1 because every month starts with 1
    calendar.currentMonth + 1, //currentMonth+1 because Date class counts from 0
    calendar.currentYear,
  ]);
  const lastDay = foodManager.dateConvert([
    31, //passing hardcoded 31 because at most a month has 31 days
    calendar.currentMonth + 1,
    calendar.currentYear,
  ]);
  // Retrieve food data for the current month from the database
  const foodThisMonth = await db.getCaloriesByDate(`${firstDay}`, `${lastDay}`);
  const lowestCalorieItem = { calorie: 0, description: "" };
  // Check if there is any food data for the current month
  if (foodThisMonth[0]) {
    //initialize the lowestCalorieItem to be the first food item in the array of foods
    lowestCalorieItem.calorie = Number(foodThisMonth[0].calorie);
    lowestCalorieItem.description = foodThisMonth[0].description;
    //Find the lowest calorie item in this month
    foodThisMonth.forEach((food) => {
      if (lowestCalorieItem.calorie > Number(food.calorie)) {
        lowestCalorieItem.calorie = Number(food.calorie);
        lowestCalorieItem.description = food.description;
      }
    });
  } else lowestCalorieItem.description = "no food";
  // update the DOM element
  document.getElementById("lowestCalorieItem").textContent =
    lowestCalorieItem.description;
  // return the highest calorie item
  return lowestCalorieItem;
};

// Asynchronous function that returns an array, each cell  in the array holds a number,
// the number is the number of food items in a day, if a day has no food items it will not be present in the array
// (meaning we will never see cells with 0 in them).
// This function handles the following report entries :
//      "Highest food item count in a day",
//      "Lowest food item count in a day",
//      "Days with no food"
report.numberOfItemsPerDay = async function () {
  // Initialize numberOfItems to hold the number of food items in a given day
  let numberOfItems = 0;

  // Initialize the daysWithNoFood to hold the number of days with no food, starting value
  // is the last day of the month.
  let daysWithNoFood = new Date(
    calendar.currentYear,
    calendar.currentMonth + 1,
    0
  ).getDate();
  // Open the IndexedDB database
  const db = await idb.openCaloriesDB("caloriesdb", 1);
  // get the keys for the first day of the month and the last day of the month for us to then pass as a range
  // to getCaloriesByDate
  const firstDate = foodManager.dateConvert([
    1,
    calendar.currentMonth + 1,
    calendar.currentYear,
  ]);
  const lastDate = foodManager.dateConvert([
    31,
    calendar.currentMonth + 1,
    calendar.currentYear,
  ]);
  // Get all the food items of this month
  const foodThisMonth = await db.getCaloriesByDate(
    `${firstDate}`,
    `${lastDate}`
  );
  // Initialize an array that will hold the count of items per day. If a day has no food items it will
  // not appear in this array
  const totalItemsPerDay = [];

  // if there are food items this month
  if (foodThisMonth.length > 0) {
    // initialize the currentDay to be the first day of the first food item that appears in a month
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
    daysWithNoFood = daysWithNoFood - totalItemsPerDay.length;
  }

  // Update the DOM elements with:
  //      "Days with no food"
  //      "Highest food item count in a day",
  //      "Lowest food item count in a day",
  document.getElementById("daysWithNoFood").textContent = daysWithNoFood;
  document.getElementById("highestFoodItemCountInADay").textContent =
    foodThisMonth.length > 0 ? Math.max(...totalItemsPerDay) : 0;
  document.getElementById("lowestFoodItemCountInADay").textContent =
    foodThisMonth.length > 0 ? Math.min(...totalItemsPerDay) : 0;
  // return the array that holds the sum of items per day excluding empty days
  return totalItemsPerDay;
};

// Initial setup
calendar.renderCalendar();

foodManager.setSelectedCategoryInModal();

report.updateReport();
