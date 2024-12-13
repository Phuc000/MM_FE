import React, { useState, useEffect } from 'react';
import { Header, Footer } from '../../Components';
import FeatureAd from '../../Components/Common/Feature_Ad/FeatureAd';
import AddRecipe from '../../Components/Common/AddRecipe';
import './RecipesArticles.scss';
import Pagination from '@mui/material/Pagination'; // Import Material-UI Pagination

const RecipesArticles = () => {
  const [recipes, setRecipes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const recipesPerPage = 20; // Number of recipes per page

  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Fetch the recipe data from the JSON file
    fetch('/assets/processed_recipes.json')
      .then((response) => response.json())
      .then((data) => setRecipes(data))
      .catch((error) => console.error('Error fetching recipes:', error));
  }, []);

  // Get current recipes
  const indexOfLastRecipe = currentPage * recipesPerPage;
  const indexOfFirstRecipe = indexOfLastRecipe - recipesPerPage;
  const currentRecipes = recipes.slice(indexOfFirstRecipe, indexOfLastRecipe);

  // Change page
  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  // Calculate total pages
  const totalPages = Math.ceil(recipes.length / recipesPerPage);

  const handleRecipeClick = (recipe) => {
    setSelectedRecipe(recipe);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRecipe(null);
  };

  return (
    <div>
      <Header />
      <div className="recipes-articles-container">
        <h1>
          <img className="big-icon" src="/Images/ad/recipe.png" alt="Recipe book icon" />
          Kitchen Articles
        </h1>
        <div className="recipes-grid">
          {currentRecipes.map((recipe) => (
            <div
              key={recipe.id}
              className="recipe-card"
              onClick={() => handleRecipeClick(recipe)}
            >
              <img src={recipe.image} alt={recipe.title} />
              <h2>{recipe.title}</h2>
              {/* Other recipe details */}
            </div>
          ))}
        </div>
        <div className="pagination-container">
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
            siblingCount={1}
            boundaryCount={1}
          />
        </div>
        {selectedRecipe && (
          <AddRecipe
            open={isModalOpen}
            handleClose={handleCloseModal}
            recipe={selectedRecipe}
          />
        )}
      </div>
      <FeatureAd />
      <Footer />
    </div>
  );
};

export default RecipesArticles;