//DONE REFACTORING
async function saveFood() {
  //Function to save the entered food information

  //Declaring Variables
  const selectedDate = dateConvert(
    document.querySelector(".selected-date").textContent.split("/")
  );
  const selectedCategory = document.getElementById("category").value;
  const foodName = document.getElementById("foodName").value;
  const calories = document.getElementById("calories").value;

  // Check if the entered values in the fields are valid
  if (!validateSaveFields(foodName, calories)) {
    return;
  }

  // Push the new item to the database
  try {
    const db = await idb.openCaloriesDB("caloriesdb", 1);
    const id = await idb.addCalories(db, {
      foodName,
      calories,
      selectedCategory,
      selectedDate,
    });

    // Render the new item with the id attached to the html
    renderFoodListItem(foodName, calories, selectedCategory, id);
  } catch (error) {
    console.error("Failed to add food item: ", error);
  }

  // Close the Modal on successful data entry
  closeFoodModal();

  // Clear the form fields for the next entry
  clearSaveFoodFields();
}

//Function to edit or delete food entries
function editFood(clickedButton) {
  const foodName = clickedButton.querySelector("span").textContent;
  const calories = clickedButton
    .querySelector(".badge")
    .textContent.split(" ")[0]; // extract the calorie number without the word "calories"
  const category = clickedButton.getAttribute("data-category");
  const errFood = document.getElementById("errorMessageFoodEdit");
  const errCal = document.getElementById("errorMessageCalEdit");

  // Set the values in the modal for editing
  document.getElementById("foodNameEdit").value = foodName;
  document.getElementById("caloriesEdit").value = calories;
  document.getElementById("categoryEdit").value = category;

  // Show the modal
  const modal = new bootstrap.Modal(document.getElementById("foodModalEdit"));
  modal.show();
  //console.log(modal);

  // Save the edited information when the "Save Changes" button is clicked
  document.getElementById("saveEditedFood").onclick = function () {
    //check if food and calories fields are not empty
    if (
      !document.getElementById("foodNameEdit").value &&
      !document.getElementById("caloriesEdit").value
    ) {
      errFood.textContent = "Enter food name!";
      errCal.textContent = "Enter calories!";
      return;
    }
    if (!document.getElementById("foodNameEdit").value) {
      errFood.textContent = "Enter food name!";
      return;
    }
    if (!document.getElementById("caloriesEdit").value) {
      errCal.textContent = "Enter calories!";
      return;
    }

    // Update the food item in the list
    clickedButton.querySelector("span").textContent =
      document.getElementById("foodNameEdit").value;
    clickedButton.querySelector(".badge").textContent = `${
      document.getElementById("caloriesEdit").value
    } Calories`;
    //if category changed then move the food item to the correct category
    if (category !== document.getElementById("categoryEdit").value) {
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
    //console.log(
    //  "new category: " + document.getElementById("categoryEdit").value
    //);

    // Close the modal
    errFood.textContent = "";
    errCal.textContent = "";
    modal.hide();
    document.body.classList.remove("modal-open");
    deleteBackdrop();
  };

  // Delete the food item when the "Delete" button is clicked
  document.getElementById("deleteFood").onclick = async function () {
    //Delete from indexedDB
    const id = clickedButton.getAttribute("data-id"); // get id of clicked food item
    try {
      const db = await idb.openCaloriesDB("caloriesdb", 1);
      await idb.deleteCalories(db, id);
    } catch (error) {
      console.error("Filed to delete food item: ", error);
    }

    // Remove the food item from the UI list
    clickedButton.remove();

    // Close the modal
    errFood.textContent = "";
    errCal.textContent = "";
    modal.hide();
    document.body.classList.remove("modal-open");
    deleteBackdrop();
  };

  // Close the modal and remove the backdrop when the modal is hidden
  errFood.textContent = "";
  errCal.textContent = "";
  document
    .getElementById("foodModalEdit")
    .addEventListener("hidden.bs.modal", function () {
      document.body.classList.remove("modal-open");
      deleteBackdrop();
    });

  //function to remove the backdrop when the modal closes.
  function deleteBackdrop() {
    const backdrop = document.querySelector(".modal-backdrop");
    if (backdrop) {
      backdrop.remove();
    }
    document.body.classList.remove("modal-open");
  }
}

//DONE REFACTORING - MIGHT NEED TO RENAME foodModal
function closeFoodModal() {
  document.getElementById("foodModal").style.display = "none";
  document.querySelector(".modal-backdrop").remove();
}

//DONE REFACTORING
function validateSaveFields(foodName, calories) {
  const errFood = document.getElementById("errorMessageFood");
  const errCal = document.getElementById("errorMessageCal");
  errFood.textContent = "";
  errCal.textContent = "";
  if (!foodName && !calories) {
    errFood.textContent = "Enter food name!";
    errCal.textContent = "Enter calories!";
    return false;
  }
  if (!foodName) {
    errFood.textContent = "Enter food name!";
    return false;
  }
  if (!calories) {
    errCal.textContent = "Enter calories!";
    return false;
  }
  return true;
}

//DONE REFACTORING
async function renderFoodList(formattedDate) {
  // Fetch array of food items for that specific day
  const db = await idb.openCaloriesDB("caloriesdb", 1);
  const foodArray = await idb.getCaloriesByDate(
    db,
    formattedDate,
    formattedDate
  );

  // Render each food item in it's respective category
  foodArray.forEach((food) => {
    const { foodName, calories, selectedCategory, id } = food; // added id
    renderFoodListItem(foodName, calories, selectedCategory, id); // added id
  });
}

//DONE REFACTORING
function renderFoodListItem(foodName, calories, selectedCategory, id) {
  //create new list item with entered information
  const listItem = document.createElement("button");
  listItem.type = "button";
  listItem.classList.add(
    "list-group-item",
    "list-group-item-action",
    "rendered-group-item"
  );
  listItem.innerHTML = `<span>${foodName}</span><span class="badge">${calories} Calories</span>`;
  listItem.setAttribute("data-category", selectedCategory);
  listItem.setAttribute("data-id", id);
  listItem.setAttribute("onClick", "editFood(this)");

  //render the new list item on the corresponding category in the food list
  const foodList = document.getElementById("foodList");
  foodList
    .querySelector(`[data-category="${selectedCategory}"]`)
    .after(listItem);
}

//DONE REFACTORING (MIGHT NEED TO COMBINE WITH EDIT)
function clearSaveFoodFields() {
  const errFood = document.getElementById("errorMessageFood");
  const errCal = document.getElementById("errorMessageCal");
  errFood.textContent = "";
  errCal.textContent = "";
  document.getElementById("foodName").value = "";
  document.getElementById("calories").value = "";
}

//DONE REFACTORING
function clearFoodList() {
  //get the items that are rendered
  renderedFoodItems = document.querySelectorAll(".rendered-group-item");
  //remove the items that are rendered
  renderedFoodItems.forEach((item) => {
    item.remove();
  });
}

//DONE REFACTORING
function dateConvert(selectedDate) {
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

//DONE REFACTORING
function toggleFoodCalendar() {
  const calendarContainer = document.querySelector(".calendar-container");
  const foodEditMenuContainer = document.querySelector(
    ".food-edit-menu-container"
  );
  //toggle between the calendar and the food list
  calendarContainer.classList.toggle("d-none");
  foodEditMenuContainer.classList.toggle("d-none");
  if (foodEditMenuContainer.classList.contains("d-none")) {
    //clean the previous food list so that a fresh one can be rendered
    clearFoodList();
  }
}

//DONE REFACTORING
function setSelectedCategoryInModal() {
  // Set the selected category in the Modal after pressing "+". Example: I clicked "+" on Dinner so the category is set to "dinner".
  document
    .getElementById("foodModal")
    .addEventListener("show.bs.modal", function (event) {
      const button = event.relatedTarget;
      const category = button.getAttribute("data-category");
      document.getElementById("category").value = category;
    });
}
//-------------------------------------------------------------------------------------------------------------------------------

//Calendar object

const calendar = {};
calendar.months = [
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
    calendar.months[calendar.currentMonth]
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
};

// Initial rendering
calendar.renderCalendar();

setSelectedCategoryInModal();
