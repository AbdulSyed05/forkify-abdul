// Importing modules
import * as model from './model.js';
import { MODAL_CLOSE_SEC } from './config.js';

import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';

// Polyfills for older browsers
import 'core-js/stable';
import 'regenerator-runtime/runtime';

///////////////////////////////////////

const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);
    if (!id) return;

    // Show loading spinner
    recipeView.renderSpinner();

    // Update search results and bookmarks views
    resultsView.update(model.getSearchResultsPage());
    bookmarksView.update(model.state.bookmarks);

    // Load recipe from API
    await model.loadRecipe(id);

    // Render the loaded recipe
    recipeView.render(model.state.recipe);
  } catch (err) {
    recipeView.renderError();
    console.error(err);
  }
};

const controlSearchResults = async function () {
  try {
    resultsView.renderSpinner();

    // Get query from search input
    const query = searchView.getQuery();
    if (!query) return;

    // Load and render search results
    await model.loadSearchResults(query);
    resultsView.render(model.getSearchResultsPage());

    // Setup pagination buttons
    paginationView.render(model.state.search);
  } catch (err) {
    console.error(err);
  }
};

const controlPagination = function (goToPage) {
  // Render new page of results and pagination
  resultsView.render(model.getSearchResultsPage(goToPage));
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  // Update state and re-render updated recipe
  model.updateServings(newServings);
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
  // Add or remove bookmark
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  // Update views
  recipeView.update(model.state.recipe);
  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    // Show loading spinner
    addRecipeView.renderSpinner();

    // Upload new recipe
    await model.uploadRecipe(newRecipe);

    // Render the new recipe
    recipeView.render(model.state.recipe);

    // Success message
    addRecipeView.renderMessage();

    // Update bookmarks
    bookmarksView.render(model.state.bookmarks);

    // Change the URL to the new recipe ID
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    // Close the form window after delay
    setTimeout(() => {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    console.error('💥', err);
    addRecipeView.renderError(err.message);
  }
};

// Init function to attach all event handlers
const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};
init();
