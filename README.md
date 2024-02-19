# FED_EN

Calorie Management Client Application - Final Project in Front-End Development
The project will be tested on Google Chrome web browser.

- The data on the client side should be stored in IndexedDB.
- The use of IndexedDB should be using a separate library you will develop.
- This library should be saved in a separate file, and its name should be idb.js.
- It should include (at the minimum) the functions shown in the code at the end of this document.
- Most of the functions this library should include must be asynchronous (should return Promise object).
- Adding the async keyword is not sufficient.
- Your implementation of these methods should include the instantiation of a Promise object and the return of that object.

Application:
The requirements include:

1.  The user can add new calorie consumption items,
    specifying the number of calories,
    category
    (the categories are: BREAKFAST, LUNCH, DINNER, OTHER),
    and a description (at the minimum).

    Implmentation: FORM

    Class food(?):
    Name:
    Category:
    Calories:
    Description:
    Photo(?)

    - getters and setters

getSumOfCalories(month/year){
if given month & year then get the month of that year
if given year then get sum of the year
}

2.  The user can get a detailed report per specific month and year.
    User Interface
    • The user interface should be developed either using Bootstrap or using ReactJS.
    The project cannot include a server-side.
