"use strict";

//added function that populatesDB for testing purposes
async function populateDB() {
  //This function populates array with 31 food items
  const foodArray = [
    {
      description: "Savory Oatmeal Bowl",
      calorie: 300,
      category: "BREAKFAST",
      selectedDate: "20240301",
    },
    {
      description: "Pineapple Basil Smoothie",
      calorie: 200,
      category: "BREAKFAST",
      selectedDate: "20240302",
    },
    {
      description: "Mushroom Truffle Flatbread",
      calorie: 450,
      category: "DINNER",
      selectedDate: "20240303",
    },
    {
      description: "Lemon Herb Baked Cod",
      calorie: 280,
      category: "DINNER",
      selectedDate: "20240304",
    },
    {
      description: "Blueberry Pancake Stack",
      calorie: 350,
      category: "BREAKFAST",
      selectedDate: "20240305",
    },
    {
      description: "Chia Seed Pudding",
      calorie: 180,
      category: "BREAKFAST",
      selectedDate: "20240306",
    },
    {
      description: "Vegetarian Tacos",
      calorie: 320,
      category: "LUNCH",
      selectedDate: "20240307",
    },
    {
      description: "Herb Roasted Turkey Breast",
      calorie: 280,
      category: "DINNER",
      selectedDate: "20240308",
    },
    {
      description: "Spaghetti Aglio e Olio",
      calorie: 400,
      category: "DINNER",
      selectedDate: "20240309",
    },
    {
      description: "Stuffed Bell Peppers",
      calorie: 230,
      category: "DINNER",
      selectedDate: "20240310",
    },
    {
      description: "Greek Yogurt Parfait",
      calorie: 150,
      category: "BREAKFAST",
      selectedDate: "20240311",
    },
    {
      description: "Lime Cilantro Shrimp Skewers",
      calorie: 320,
      category: "DINNER",
      selectedDate: "20240312",
    },
    {
      description: "Mango Salsa Wrap",
      calorie: 260,
      category: "LUNCH",
      selectedDate: "20240313",
    },
    {
      description: "Chocolate Avocado Mousse",
      calorie: 180,
      category: "OTHER",
      selectedDate: "20240314",
    },
    {
      description: "Teriyaki Chicken Stir-Fry",
      calorie: 350,
      category: "DINNER",
      selectedDate: "20240315",
    },
    {
      description: "Corn and Jalapeño Cornbread",
      calorie: 200,
      category: "OTHER",
      selectedDate: "20240316",
    },
    {
      description: "Quinoa Salad with Cranberries",
      calorie: 280,
      category: "LUNCH",
      selectedDate: "20240317",
    },
    {
      description: "Tomato Basil Zoodles",
      calorie: 220,
      category: "DINNER",
      selectedDate: "20240318",
    },
    {
      description: "Fruit Salad",
      calorie: 120,
      category: "BREAKFAST",
      selectedDate: "20240319",
    },
    {
      description: "Sweet Potato and Black Bean Soup",
      calorie: 180,
      category: "LUNCH",
      selectedDate: "20240320",
    },
    {
      description: "Cucumber Mint Infused Water",
      calorie: 0,
      category: "OTHER",
      selectedDate: "20240321",
    },
    {
      description: "Peach Almond Energy Bars",
      calorie: 200,
      category: "OTHER",
      selectedDate: "20240322",
    },
    {
      description: "Caprese Salad Skewers",
      calorie: 160,
      category: "LUNCH",
      selectedDate: "20240323",
    },
    {
      description: "Balsamic Glazed Chicken Thighs",
      calorie: 300,
      category: "DINNER",
      selectedDate: "20240324",
    },
    {
      description: "Egg and Spinach Breakfast Wrap",
      calorie: 250,
      category: "BREAKFAST",
      selectedDate: "20240325",
    },
    {
      description: "Mixed Berry Smoothie Bowl",
      calorie: 230,
      category: "BREAKFAST",
      selectedDate: "20240326",
    },
    {
      description: "Vegetable Spring Rolls",
      calorie: 180,
      category: "LUNCH",
      selectedDate: "20240327",
    },
    {
      description: "Pesto Zucchini Noodles",
      calorie: 220,
      category: "DINNER",
      selectedDate: "20240328",
    },
    {
      description: "Watermelon Mint Salad",
      calorie: 100,
      category: "OTHER",
      selectedDate: "20240329",
    },
    {
      description: "Pumpkin Spice Energy Bites",
      calorie: 150,
      category: "OTHER",
      selectedDate: "20240330",
    },
    {
      description: "Salmon Avocado Salad",
      calorie: 320,
      category: "LUNCH",
      selectedDate: "20240331",
    },
    {
      description: "Quiche Lorraine",
      calorie: 300,
      category: "BREAKFAST",
      selectedDate: "20240301",
    },
    {
      description: "Pomegranate Berry Smoothie",
      calorie: 210,
      category: "BREAKFAST",
      selectedDate: "20240302",
    },
    {
      description: "Cajun Shrimp Pasta",
      calorie: 420,
      category: "DINNER",
      selectedDate: "20240303",
    },
    {
      description: "Grilled Lemon Garlic Chicken",
      calorie: 290,
      category: "DINNER",
      selectedDate: "20240304",
    },
    {
      description: "Banana Walnut Pancakes",
      calorie: 370,
      category: "BREAKFAST",
      selectedDate: "20240305",
    },
    {
      description: "Acai Bowl",
      calorie: 220,
      category: "BREAKFAST",
      selectedDate: "20240306",
    },
    {
      description: "Veggie Quesadillas",
      calorie: 300,
      category: "LUNCH",
      selectedDate: "20240307",
    },
    {
      description: "Honey Mustard Glazed Salmon",
      calorie: 320,
      category: "DINNER",
      selectedDate: "20240308",
    },
    {
      description: "Vegetable Lasagna",
      calorie: 380,
      category: "DINNER",
      selectedDate: "20240309",
    },
    {
      description: "Crispy Tofu Tacos",
      calorie: 240,
      category: "DINNER",
      selectedDate: "20240310",
    },
    {
      description: "Peanut Butter Banana Toast",
      calorie: 180,
      category: "BREAKFAST",
      selectedDate: "20240311",
    },
    {
      description: "Shrimp and Quinoa Salad",
      calorie: 340,
      category: "LUNCH",
      selectedDate: "20240312",
    },
    {
      description: "Turkey Club Wrap",
      calorie: 280,
      category: "LUNCH",
      selectedDate: "20240313",
    },
    {
      description: "Dark Chocolate Avocado Pudding",
      calorie: 200,
      category: "OTHER",
      selectedDate: "20240314",
    },
    {
      description: "Sesame Ginger Beef Stir-Fry",
      calorie: 370,
      category: "DINNER",
      selectedDate: "20240315",
    },
    {
      description: "Garlic Parmesan Breadsticks",
      calorie: 180,
      category: "OTHER",
      selectedDate: "20240316",
    },
    {
      description: "Mango Spinach Salad",
      calorie: 260,
      category: "LUNCH",
      selectedDate: "20240317",
    },
    {
      description: "Pesto Penne Pasta",
      calorie: 240,
      category: "DINNER",
      selectedDate: "20240318",
    },
    {
      description: "Mixed Fruit Smoothie",
      calorie: 130,
      category: "BREAKFAST",
      selectedDate: "20240319",
    },
    {
      description: "Lentil Soup",
      calorie: 220,
      category: "LUNCH",
      selectedDate: "20240320",
    },
    {
      description: "Cucumber Lemonade",
      calorie: 50,
      category: "OTHER",
      selectedDate: "20240321",
    },
    {
      description: "Almond Butter Energy Bites",
      calorie: 170,
      category: "OTHER",
      selectedDate: "20240322",
    },
    {
      description: "Caesar Salad",
      calorie: 190,
      category: "LUNCH",
      selectedDate: "20240323",
    },
    {
      description: "Honey Sriracha Glazed Salmon",
      calorie: 310,
      category: "DINNER",
      selectedDate: "20240324",
    },
    {
      description: "Avocado Egg Breakfast Burrito",
      calorie: 260,
      category: "BREAKFAST",
      selectedDate: "20240325",
    },
    {
      description: "Raspberry Chia Pudding",
      calorie: 200,
      category: "BREAKFAST",
      selectedDate: "20240326",
    },
    {
      description: "Mushroom and Spinach Quesadilla",
      calorie: 170,
      category: "LUNCH",
      selectedDate: "20240327",
    },
    {
      description: "Lemon Garlic Shrimp Pasta",
      calorie: 280,
      category: "DINNER",
      selectedDate: "20240328",
    },
    {
      description: "Kiwi Strawberry Smoothie",
      calorie: 110,
      category: "BREAKFAST",
      selectedDate: "20240329",
    },
    {
      description: "Vegan Chili",
      calorie: 160,
      category: "LUNCH",
      selectedDate: "20240330",
    },
    {
      description: "Cucumber Mint Detox Water",
      calorie: 0,
      category: "OTHER",
      selectedDate: "20240331",
    },
  ];
  try {
    const db = await idb.openCalorisDB("caloriesdb", 1);
    foodArray.forEach((food) => {
      db.addCalories(food);
    });
  } catch (error) {
    console.error("Failed populating DB", error);
  }
}
