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

  // Get the first day and last day of the month
  const lastDay = new Date(currentYear, currentMonth + 1, 0);

  // Loop through each day in the month
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const dayDate = new Date(currentYear, currentMonth, i);
    const dayOfWeek = dayDate.getDay();

    //console.log(dayOfWeek, reverseIndex);
    // Create a new row for each week.
    // if first week of the month, position the days according to proper index by populating empty cells.
    if (dayOfWeek === 0 || i === 1) {
      var row = calendarBody.insertRow();
      if (dayOfWeek != 0 && i === 1) {
        for (let j = dayOfWeek; j > 0; j--) {
          const emptyCell = row.insertCell();
          emptyCell.textContent = " ";
        }
      }
    }

    // Create a cell for each day
    // Will generate dynamically items from the db
    const cell = row.insertCell();
    cell.innerHTML = `
            <div class="cell-content">
                <div class="day-of-month">${i}</div>
                <ul class="calorie-list">
                </ul>
            </div>
        `;

    if (i === lastDay.getDate()) {
      for (let j = dayOfWeek; j < 6; j++) {
        const emptyCell = row.insertCell();
        emptyCell.textContent = " ";
      }
    }
    // Highlight the current day
    if (dayDate.toDateString() === currentDate.toDateString()) {
      cell.classList.add("current-day");
    }

    // Add a click event to each day cell
    cell.addEventListener("click", function () {
      alert(`Clicked on ${i}/${currentMonth + 1}/${currentYear}`);
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
