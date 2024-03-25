/*
Developers:
First name: Orel, Nikita
Last name: Rafailov, Borochov
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
    clickedButton.querySelector(".badge").textContent = `${document.getElementById("caloriesEdit").value
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
    report.monthlyReport();
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
    report.monthlyReport();
  };
  report.monthlyReport();
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
  report.monthlyReport();
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
  const convertedDate = `${selectedDate[2]}${selectedDate[1] < 10
      ? selectedDate[1].toString().padStart(2, "0")
      : selectedDate[1].toString()
    }${selectedDate[0] < 10
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
  calendarHeaderMonthYear.textContent = `${calendar.MONTHS[calendar.currentMonth]
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
      selectedDate.textContent = `${i}/${calendar.currentMonth + 1}/${calendar.currentYear
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


//Function to display specific month and year
calendar.specificDate = function(){
  const enteredMonth = document.getElementById("inputMonth").value
  const enteredYear = document.getElementById("inputYear").value

  //if invalid month entered show red border around the input field
  //if entered valid month, remove the red border
  if(enteredMonth<1 || enteredMonth>12){
    document.getElementById("inputMonth").classList.add('redBorder');
    return;
  }else if(enteredMonth>0 && enteredMonth<13 && document.getElementById("inputMonth").classList.contains('redBorder')){
    document.getElementById("inputMonth").classList.remove('redBorder');
  }

  //if invalid year entered show red border around the input field
  //if entered valid year, remove the red border
  if(!enteredYear || enteredYear<1){
    document.getElementById("inputYear").classList.add('redBorder');
    return;
  }else if(enteredYear>0 && document.getElementById("inputYear").classList.contains('redBorder')){
    document.getElementById("inputYear").classList.remove('redBorder');
  }

  //set the current displayed date to the input date
  calendar.currentMonth = enteredMonth;
  --calendar.currentMonth;
  calendar.currentYear=enteredYear;

  //if the food list is visible and we entered a specific date we want to close it and show the calendar
  const foodListVisibale = document.querySelector(".food-edit-menu-container");
  if(!foodListVisibale.classList.contains('d-none')){
    foodManager.toggleFoodCalendar();
  }

  //render the correct month in the calender and update the report accordingly
  calendar.renderCalendar();
  report.monthlyReport();
};


//Function to reset and display current month and year
calendar.defaultDate = function() {
  //set the calendar parameters to current date
  const date = new Date()
  calendar.currentMonth = date.getMonth();
  calendar.currentYear=date.getFullYear();

  //if the food list is visible and we clicked on reset, we want to close it and show the calendar
  const foodListVisibale = document.querySelector(".food-edit-menu-container");
  if(!foodListVisibale.classList.contains('d-none')){
    foodManager.toggleFoodCalendar();
  }

  //render the correct month in the calender and update the report accordingly
  calendar.renderCalendar();
  report.monthlyReport();
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
  report.monthlyReport();
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
  report.monthlyReport();
};

// Namespace for Report operations
const report = {};

// Function that updates the values of the report

// Asynchronous function that displays the items in the report
report.monthlyReport = async function () {
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

  let count=1;
  let totalCalories = 0;
  document.getElementById("tableBody").innerHTML = ``;

  //Display each food item that was added in a specific month
  foodThisMonth.forEach((food)=>{
    totalCalories += Number(food.calorie);
  
    document.getElementById("tableBody").innerHTML += `
    <tr>
    <th scope="row">${count++}</th>
    <td>${food.description}</td>
    <td>${food.calorie}</td>
    <td>${food.category}</td>
    <td>${food.selectedDate%100}</td>
    </tr>
    `;
  })

  //Display total calories for the month
  document.getElementById("totalCalories").textContent = totalCalories;
};


// Initial setup
calendar.renderCalendar();

foodManager.setSelectedCategoryInModal();

report.monthlyReport();
