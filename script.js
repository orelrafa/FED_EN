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

//Orel part
// Initial variables
let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();

// Function to display the calendar
function renderCalendar() {
  const monthYearElement = document.getElementById("monthYear");
  const calendarBody = document.querySelector(".calendar table");
  calendarBody.innerHTML = "";

  // Set the month and year in the header
  monthYearElement.textContent = new Date(
    currentYear,
    currentMonth
  ).toLocaleString("default", { month: "long", year: "numeric" });

  const lastDay = new Date(currentYear, currentMonth + 1, 0);

  // Loop through each day in the month
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const dayDate = new Date(currentYear, currentMonth, i);
    const dayOfWeek = dayDate.getDay();

    // Create a new row for each week.
    if (dayOfWeek === 0 || i === 1) {
      var row = calendarBody.insertRow();

      // Populate empty cells for the first week
      if (dayOfWeek !== 0 && i === 1) {
        for (let j = dayOfWeek; j > 0; j--) {
          const emptyCell = row.insertCell();
          emptyCell.innerHTML = `
            <div class="cell-content">
              <div class="day-of-month"></div>
              <p class="calorie-list"></p>
            </div>
          `;
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
    if (i === lastDay.getDate()) {
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
    if (dayDate.toDateString() === currentDate.toDateString()) {
      cell.classList.add("table-primary"); // Bootstrap class to highlight the current day
    }

    // Add a click event to each day cell
    cell.addEventListener("click", function () {
      const calendarContainer = document.querySelector(".calendar-container");
      const foodEditMenuContainer = document.querySelector(
        ".food-edit-menu-container"
      );
      const selectedDate = document.querySelector(".selected-date");

      // Toggle visibility using Bootstrap classes
      calendarContainer.classList.add("d-none");
      foodEditMenuContainer.classList.remove("d-none");

      // Additional logic or actions you may want to perform
      // Updating selected date
      selectedDate.textContent = `${i}/${currentMonth + 1}/${currentYear}`;
      console.log(`Clicked on ${i}/${currentMonth + 1}/${currentYear}`);
      console.log(cell.innerHTML);
    });
  }
}

// Function to go to the previous month
function prevMonth() {
  if (currentMonth > 0) {
    currentMonth--;
  } else {
    currentMonth = 11;
    currentYear--;
  }
  renderCalendar();
}

// Function to go to the next month
function nextMonth() {
  if (currentMonth < 11) {
    currentMonth++;
  } else {
    currentMonth = 0;
    currentYear++;
  }
  renderCalendar();
}
// Initial rendering
renderCalendar();

function closeFoodModal() {
  const calendarContainer = document.querySelector(".calendar-container");
  const foodEditMenuContainer = document.querySelector(
    ".food-edit-menu-container"
  );
  calendarContainer.classList.remove("d-none");
  foodEditMenuContainer.classList.add("d-none");
}
