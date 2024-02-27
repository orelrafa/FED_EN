// Set the selected category in the Modal after pressing "+". Example: I clicked "+" on Dinner so the category is set to "dinner".
document
  .getElementById("foodModal")
  .addEventListener("show.bs.modal", function (event) {
    const button = event.relatedTarget;
    const category = button.getAttribute("data-category");
    document.getElementById("category").value = category;
  });

//Function to save the entered food information
function saveFood() {
  const selectedCategory = document.getElementById("category").value;
  const foodName = document.getElementById("foodName").value;
  const calories = document.getElementById("calories").value;
  const errFood = document.getElementById("errorMessageFood");
  const errCal = document.getElementById("errorMessageCal");

  if (!foodName && !calories) {
    errFood.textContent = "Enter food name!";
    errCal.textContent = "Enter calories!";
    return;
  }
  if (!foodName) {
    errFood.textContent = "Enter food name!";
    return;
  }
  if (!calories) {
    errCal.textContent = "Enter calories!";
    return;
  }

  //create new list item with entered information
  const listItem = document.createElement("button");
  listItem.type = "button";
  listItem.classList.add("list-group-item", "list-group-item-action");
  listItem.innerHTML = `<span>${foodName}</span><span class="badge">${calories} Calories</span>`;
  listItem.setAttribute("data-bs-toggle", "modal");
  listItem.setAttribute("data-bs-target", "#foodModalEdit");
  listItem.setAttribute("data-category", selectedCategory);
  listItem.setAttribute("onClick", "editFood(this)");

  //add the new list item oם the corresponding category in the food list
  const foodList = document.getElementById("foodList");
  foodList
    .querySelector(`[data-category="${selectedCategory}"]`)
    .after(listItem);

  //close the Modal
  document.getElementById("foodModal").style.display = "none";
  document.querySelector(".modal-backdrop").remove();

  // Clear the form fields for the next entry
  errFood.textContent = "";
  errCal.textContent = "";
  document.getElementById("foodName").value = "";
  document.getElementById("calories").value = "";
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
    console.log(
      "new category: " + document.getElementById("categoryEdit").value
    );

    // Close the modal
    errFood.textContent = "";
    errCal.textContent = "";
    modal.hide();
    document.body.classList.remove("modal-open");
    deleteBackdrop();
  };

  // Delete the food item when the "Delete" button is clicked
  document.getElementById("deleteFood").onclick = function () {
    // Remove the food item from the list
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

//-------------------------------------------------------------------------------------------------------------------------------

//Orel part
// Initial variables

function closeFoodModal() {
  const calendarContainer = document.querySelector(".calendar-container");
  const foodEditMenuContainer = document.querySelector(
    ".food-edit-menu-container"
  );
  calendarContainer.classList.remove("d-none");
  foodEditMenuContainer.classList.add("d-none");
}

const calendar = {};
calendar.currentDate = new Date();
calendar.currentMonth = calendar.currentDate.getMonth();
calendar.currentYear = calendar.currentDate.getFullYear();
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
        emptyCell.innerHTML = `
          <div class="cell-content">
            <div class="day-of-month"></div>
            <ul class="calorie-list"></ul>
          </div>
        `;
      }
    }

    // Highlight the current day
    if (dayDate.toDateString() === calendar.currentDate.toDateString()) {
      cell.classList.add("current-day"); // Bootstrap class to highlight the current day
    }

    // Add a click event to each day cell
    cell.addEventListener("click", function () {
      const selectedDate = document.querySelector(".selected-date");
      const calendarContainer = document.querySelector(".calendar-container");
      const foodEditMenuContainer = document.querySelector(
        ".food-edit-menu-container"
      );

      // Toggle visibility using Bootstrap classes
      calendarContainer.classList.add("d-none");
      foodEditMenuContainer.classList.remove("d-none");

      // Additional logic or actions you may want to perform
      // Updating selected date
      selectedDate.textContent = `${i}/${calendar.currentMonth + 1}/${
        calendar.currentYear
      }`;
      console.log(
        `Clicked on ${i}/${calendar.currentMonth + 1}/${calendar.currentYear}`
      );
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
