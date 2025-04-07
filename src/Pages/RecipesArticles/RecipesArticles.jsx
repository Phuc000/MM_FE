import React, { useState, useEffect } from 'react';
import { Header, Footer } from '../../Components';
import FeatureAd from '../../Components/Common/Feature_Ad/FeatureAd';
import RecipeCard from '../../Components/Common/RecipeCard/RecipeCard';
import AddRecipe from '../../Components/Common/AddRecipe';
import './RecipesArticles.scss';
import { TextField, Button } from '@mui/material';
import Pagination from '@mui/material/Pagination'; // Import Material-UI Pagination

const RecipesArticles = () => {
  const [recipes, setRecipes] = useState([]);
  const [includeFilter, setIncludeFilter] = useState('');
  const [excludeFilter, setExcludeFilter] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Adjust this number as needed

  useEffect(() => {
    fetch('https://localhost:7288/recipes')
      .then((response) => response.json())
      .then((data) => {
        setRecipes(data);
      })
      .catch((error) => console.error('Error fetching recipes:', error));
  }, []);

  // Filter recipes based on include/exclude filters
  const filteredRecipes = recipes.filter((recipe) => {
    const includeMatch = includeFilter
      ? (recipe.tags &&
          recipe.tags.some((tag) =>
            tag.toLowerCase().includes(includeFilter.toLowerCase())
          )) ||
        (recipe.ingredients &&
          recipe.ingredients.some((ing) =>
            ing.name.toLowerCase().includes(includeFilter.toLowerCase())
          ))
      : true;

    const excludeMatch = excludeFilter
      ? !(recipe.tags &&
          recipe.tags.some((tag) =>
            tag.toLowerCase().includes(excludeFilter.toLowerCase())
          )) &&
        !(recipe.ingredients &&
          recipe.ingredients.some((ing) =>
            ing.name.toLowerCase().includes(excludeFilter.toLowerCase())
          ))
      : true;

    return includeMatch && excludeMatch;
  });

  // Pagination calculations
  const indexOfLastRecipe = currentPage * itemsPerPage;
  const indexOfFirstRecipe = indexOfLastRecipe - itemsPerPage;
  const currentRecipes = filteredRecipes.slice(indexOfFirstRecipe, indexOfLastRecipe);
  const totalPages = Math.ceil(filteredRecipes.length / itemsPerPage);

  const handleRecipeClick = (recipe) => {
    setSelectedRecipe(recipe);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRecipe(null);
  };

  const handleResetFilters = () => {
    setIncludeFilter('');
    setExcludeFilter('');
    setCurrentPage(1); // Reset to first page when filters are cleared
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    window.scrollTo(0, 0); // Scroll to top when changing pages
  };

  return (
    <div>
      <Header />
      <div className="recipes-articles-container">
        {/* Hero Section */}
        <section className="hero-section">
          <img
            className="hero-icon"
            src="/Images/ad/recipe.png"
            alt="Recipe book icon"
          />
          <h1>Kitchen Articles</h1>
          <p className="hero-subtitle">
            Discover delicious recipes for every taste and occasion!
          </p>
        </section>

        {/* Main Content with Filter and Recipes */}
        <div className="main-content">
          {/* Recipes List */}
          <section className="recipes-list">
            <h2>List recipes ({filteredRecipes.length})</h2>
            {currentRecipes.length > 0 ? (
              currentRecipes.map((recipe) => (
                <div key={recipe.id} className="recipe-item">
                  <img
                    src={recipe.image || '/Images/placeholder.png'}
                    alt={recipe.title}
                    className="recipe-image"
                  />
                  <div className="recipe-details">
                    <h3 onClick={() => handleRecipeClick(recipe)}>{recipe.title}</h3>
                    <p className="recipe-ingredients">
                      {recipe.ingredients && recipe.ingredients.length > 0
                        ? recipe.ingredients
                            .slice(0, 5)
                            .map((ing) => ing.name)
                            .join(' • ')
                        : recipe.tags.slice(0, 5).join(' • ')}
                    </p>
                    <p className="recipe-meta">
                      ⏰ {recipe.readyInMinutes} min • 🍽️ {recipe.servings} person
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-recipes">
                {includeFilter || excludeFilter
                  ? 'No recipes match the selected filters'
                  : 'Loading recipes...'}
              </p>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
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
            )}
          </section>

          {/* Filter Section */}
          <aside className="filter-container">
            <div className="filter-section">
              <h2>Filters</h2>
              <div className="filter-group">
                <label>Show me recipes with:</label>
                <TextField
                  value={includeFilter}
                  onChange={(e) => setIncludeFilter(e.target.value)}
                  placeholder="Type tags or ingredients..."
                  variant="outlined"
                  fullWidth
                  className="filter-input"
                />
              </div>
              <div className="filter-group">
                <label>Show me recipes without:</label>
                <TextField
                  value={excludeFilter}
                  onChange={(e) => setExcludeFilter(e.target.value)}
                  placeholder="Type tags or ingredients..."
                  variant="outlined"
                  fullWidth
                  className="filter-input"
                />
              </div>
              <Button
                onClick={handleResetFilters}
                className="reset-button"
                variant="outlined"
              >
                Reset
              </Button>
            </div>
          </aside>
        </div>

        {/* Modal */}
        {selectedRecipe && (
          <AddRecipe
            open={isModalOpen}
            handleClose={handleCloseModal}
            recipe={selectedRecipe}
          />
        )}

        <FeatureAd />
        <Footer />
      </div>
    </div>
  );
};

export default RecipesArticles;