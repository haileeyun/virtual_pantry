function deleteNote(noteId) {
    fetch("/delete-note", {
        method: "POST",
        body: JSON.stringify({ noteId: noteId})
    }).then((_res) => {
        window.location.href="/"
    });
}

function deleteFood(foodId) {
    fetch("/delete-food", {
        method: "POST",
        body: JSON.stringify({ foodId: foodId.toString() })
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.message === 'Food deleted successfully') {
                window.location.href = "/pantry";
            } else {
                console.log('Failed to delete food');
            }
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}

const carousel = document.querySelector('.carousel');

// Duplicate the icons to ensure continuous looping
const icons = carousel.querySelectorAll('.icon');
for (let i = 0; i < icons.length; i++) {
  const clone = icons[i].cloneNode(true);
  carousel.appendChild(clone);
}

// Start the carousel animation
carousel.style.width = `${carousel.scrollWidth}px`;

// Adjust the scroll position when the animation ends
carousel.addEventListener('animationend', () => {
  carousel.scrollLeft = 0;
});


//function deleteRecipe(recipeId) {
//  fetch("/delete-recipe", {
//    method: "POST",
//    headers: {
//      "Content-Type": "application/json"
//    },
//    body: JSON.stringify({ recipeId: recipeId })
//  })
//    .then(response => response.json())
//    .then(data => {
//      if (data.message === 'Recipe deleted successfully') {
//        window.location.reload(); // Refresh the page after deletion
//      } else {
//        console.log('Failed to delete recipe');
//      }
//    })
//    .catch(error => {
//      console.error('Error:', error);
//    });
//}


// script.js


//function deleteRecipe(recipeId) {
//    fetch("/delete-recipe", {
//        method: "POST",
//        headers: {
//            "Content-Type": "application/json"
//        },
//        body: JSON.stringify({ recipeId: recipeId })
//    })
//        .then(response => response.json())
//        .then(data => {
//            console.log(data.message);
//            window.location.reload(); // Reload the page after successful deletion
//        })
//        .catch(error => {
//            console.error("Error:", error);
//        });
//}

document.addEventListener("DOMContentLoaded", () => {
  // Delete Recipe Event Listener
  const deleteRecipeButtons = document.querySelectorAll(".deleteRecipeBtn");
  deleteRecipeButtons.forEach((button) => {
    button.addEventListener("click", deleteRecipe);
  });
});

// Function to handle deleting a recipe
function deleteRecipe() {
  const recipeId = this.getAttribute("data-recipe-id");

  // Send a DELETE request to the server
  fetch(`/recipes/${recipeId}`, {
    method: "DELETE",
  })
    .then((response) => response.json())
    .then((response) => {
      if (response.message === "Recipe deleted successfully") {
        // Remove the recipe from the DOM
        const recipeItem = this.parentNode;
        recipeItem.remove();
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

// Function to handle the form submission for adding a recipe
function submitRecipe() {
  const recipeForm = document.getElementById("recipeForm");
  const recipeNameInput = document.getElementById("recipeName");
  const ingredientTable = document.getElementById("ingredientTable");
  const addIngredientBtn = document.getElementById("addIngredientBtn");

  // Disable the form elements and buttons while submitting
  recipeNameInput.disabled = true;
  ingredientTable.disabled = true;
  addIngredientBtn.disabled = true;

  const recipeName = recipeNameInput.value.trim();
  const ingredients = [];

  // Retrieve the ingredient rows from the table
  const rows = Array.from(ingredientTable.tBodies[0].querySelectorAll("tr"));

  // Iterate over each row and extract the ingredient data
  for (const row of rows) {
    const nameInput = row.querySelector("input[name='ingredientName[]']");
    const amountInput = row.querySelector("input[name='ingredientAmount[]']");
    const unitSelect = row.querySelector("select[name='ingredientUnit[]']");

    const name = nameInput.value.trim();
    const amount = parseFloat(amountInput.value.trim());
    const unit = unitSelect.value.trim();

    if (name && !isNaN(amount) && unit) {
      const ingredient = {
        name: name,
        amount: amount,
        unit: unit,
      };
      ingredients.push(ingredient);
    }
  }

  if (recipeName && ingredients.length > 0) {
    // Prepare the data to be sent to the server
    const data = {
      recipeName: recipeName,
      ingredients: ingredients,
    };

    // Send a POST request to the server
    fetch("/recipes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((response) => {
        // Handle the response data
        const recipeName = response.recipeName;
        const ingredients = response.ingredients;

        // Display the submitted recipe below
        const recipeList = document.getElementById("recipeList");

        const recipeItem = document.createElement("li");
        recipeItem.innerHTML = `
          <h3>${recipeName}</h3>
          <ul>
            ${ingredients
              .map(
                (ingredient) =>
                  `<li>${ingredient.amount} ${ingredient.unit} of ${ingredient.name}</li>`
              )
              .join("")}
          </ul>
        `;

        recipeList.appendChild(recipeItem);

        // Reset the form
        recipeForm.reset();

        // Re-enable the form elements and buttons
        recipeNameInput.disabled = false;
        ingredientTable.disabled = false;
        addIngredientBtn.disabled = false;
      })
      .catch((error) => {
        console.error("Error:", error);
        // Re-enable the form elements and buttons in case of an error
        recipeNameInput.disabled = false;
        ingredientTable.disabled = false;
        addIngredientBtn.disabled = false;
      });
  }
}

// Function to handle adding a new ingredient row to the table
function addIngredientRow() {
  const ingredientTable = document.getElementById("ingredientTable");

  // Create a new row
  const newRow = document.createElement("tr");
  newRow.innerHTML = `
    <td>
      <input type="text" class="form-control" name="ingredientName[]" required>
    </td>
    <td>
      <input type="number" class="form-control" name="ingredientAmount[]" required>
    </td>
    <td>
      <select class="form-control" name="ingredientUnit[]" required>
        <option value="cups">cups</option>
        <option value="tbs">tbs</option>
        <option value="tsp">tsp</option>
        <option value="pcs">pcs</option>
      </select>
    </td>
  `;

  // Append the new row to the table
  ingredientTable.tBodies[0].appendChild(newRow);
}

// Event listener for the form submission
const recipeForm = document.getElementById("recipeForm");
recipeForm.addEventListener("submit", (e) => {
  e.preventDefault(); // Prevent the default form submission behavior
  submitRecipe(); // Call the submitRecipe function
});

// Event listener for the "Add Ingredient" button
const addIngredientBtn = document.getElementById("addIngredientBtn");
addIngredientBtn.addEventListener("click", addIngredientRow);

