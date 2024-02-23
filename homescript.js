
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

  //add the new list item oם the corresponding category in the food list
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


