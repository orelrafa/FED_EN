// Set the selected category in the Modal after pressing "+". Example: I clicked "+" on Dinner so the category is set to "dinner".
document.getElementById("foodModal").addEventListener("show.bs.modal",function(event){
  const button = event.relatedTarget;
  const category = button.getAttribute('data-category');
  document.getElementById("category").value=category;
});



//Function to save the entered food information
function saveFood(){
  const selectedCategory = document.getElementById("category").value;
  const foodName = document.getElementById("foodName").value;
  const calories = document.getElementById("calories").value;
  const errFood =document.getElementById("errorMessageFood");
  const errCal=document.getElementById("errorMessageCal");

  if(!foodName && !calories){
    errFood.textContent="Enter food name!";
    errCal.textContent="Enter calories!";
    return;
  }
  if(!foodName){
    errFood.textContent="Enter food name!";
    return;
  }
  if(!calories){
    errCal.textContent="Enter calories!";
    return;
  }

  //create new list item with entered information
  const listItem = document.createElement('button');
  listItem.type='button';
  listItem.classList.add('list-group-item','list-group-item-action');
  listItem.innerHTML=`<span>${foodName}</span><span class="badge">${calories} Calories</span>`;
  listItem.setAttribute("data-bs-toggle","modal");
  listItem.setAttribute("data-bs-target","#foodModalEdit");
  listItem.setAttribute("data-category",selectedCategory);
  listItem.setAttribute("onClick","editFood(this)");


  //add the new list item to the corresponding category in the food list
  const foodList =document.getElementById('foodList');
  foodList.querySelector(`[data-category="${selectedCategory}"]`).after(listItem);

  //close the Modal
  document.getElementById('foodModal').style.display = 'none';
  document.querySelector('.modal-backdrop').remove();


// Clear the form fields for the next entry
  errFood.textContent="";
  errCal.textContent="";
  document.getElementById('foodName').value = '';
  document.getElementById('calories').value = '';
}

function editFood(clickedButton){

  const foodName = clickedButton.querySelector('span').textContent;
  const calories = clickedButton.querySelector('.badge').textContent.split(' ')[0]; // Extract calories from the badge
  const category = clickedButton.getAttribute('data-category');
  const errFood =document.getElementById("errorMessageFoodEdit");
  const errCal=document.getElementById("errorMessageCalEdit");

  // Set the values in the modal for editing
  document.getElementById('foodNameEdit').value = foodName;
  document.getElementById('caloriesEdit').value = calories;
  document.getElementById('categoryEdit').value = category;

  // Show the modal
  const modal = new bootstrap.Modal(document.getElementById('foodModalEdit'));
  modal.show();

  // Save the edited information when the "Save Changes" button is clicked
  document.getElementById('saveEditedFood').onclick = function () {

    //check if food and calories fields are not empty
    if(!document.getElementById('foodNameEdit').value && !document.getElementById('caloriesEdit').value){
      errFood.textContent="Enter food name!";
      errCal.textContent="Enter calories!";
      return;
    }
    if(!document.getElementById('foodNameEdit').value){
      errFood.textContent="Enter food name!";
      return;
    }
    if(!document.getElementById('caloriesEdit').value){
      errCal.textContent="Enter calories!";
      return;
    }

    // Update the food item in the list
    clickedButton.querySelector('span').textContent = document.getElementById('foodNameEdit').value;
    clickedButton.querySelector('.badge').textContent = `${document.getElementById('caloriesEdit').value} Calories`;
    //if category changed then move the food item to the correct category
    if(category!==document.getElementById('categoryEdit').value){
      const foodList =document.getElementById('foodList');
      foodList.querySelector(`[data-category="${document.getElementById('categoryEdit').value}"]`).after(clickedButton);
    }
    clickedButton.setAttribute('data-category', document.getElementById('categoryEdit').value);
    console.log("new category: " + document.getElementById('categoryEdit').value);

    // Close the modal
    errFood.textContent="";
    errCal.textContent="";
    modal.hide();
    document.body.classList.remove('modal-open');
    deleteBackdrop();
  };

  // Delete the food item when the "Delete" button is clicked
  document.getElementById('deleteFood').onclick = function () {
    // Remove the food item from the list
    clickedButton.remove();

    // Close the modal
    errFood.textContent="";
    errCal.textContent="";
    modal.hide();
    document.body.classList.remove('modal-open');
    deleteBackdrop();

  };

  // Close the modal and remove the backdrop when the modal is hidden
  errFood.textContent="";
  errCal.textContent="";
  document.getElementById('foodModalEdit').addEventListener('hidden.bs.modal', function () {
    document.body.classList.remove('modal-open');
    deleteBackdrop();

  });

  function deleteBackdrop(){
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) {
      backdrop.remove();
    }
    document.body.classList.remove('modal-open');

  }
}
