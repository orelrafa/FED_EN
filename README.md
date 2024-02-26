# FED_EN - Calorie Management Client Application

## Overview

This project serves as the final assignment for the Front-End Development course. It focuses on creating a Calorie Management Client Application to be tested on the Google Chrome web browser.

## IndexedDB Library

- Data on the client side is stored in IndexedDB.
- A separate library, `idb.js`, is developed for utilizing IndexedDB functionalities.
- The library includes essential functions (see code at the end).
- Asynchronous operations are emphasized, requiring proper Promise object instantiation and return.

## Application Features

### 1. Add Calorie Consumption Items

- Users can add new entries, specifying:
  - Number of calories
  - Category (BREAKFAST, LUNCH, DINNER, OTHER)
  - Description (minimum requirement)

### 2. Generate Detailed Monthly Reports

- Users can retrieve detailed reports for a specific month and year.

## User Interface

- Developed using either Bootstrap or ReactJS.
- Server-side functionalities are excluded from the project scope.

---

## IndexedDB Library Functions

```javascript
// Include the following functions in idb.js

// Example function
async function fetchDataFromDB() {
  return new Promise((resolve, reject) => {
    // Implementation logic here
    // Resolve with data or reject with an error
  });
}

// Add other required functions as per project specifications
```

---

**Note:** Ensure that the project adheres to the specified requirements and maintains a clear separation of concerns between the client application and the IndexedDB library.
