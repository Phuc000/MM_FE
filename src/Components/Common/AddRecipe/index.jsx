import React, { useState } from 'react';
import './AddRecipe.scss';
import Modal from '@mui/material/Modal';
import { Button, Chip, IconButton, Typography } from '@mui/material';
import AddToMealPlanDialog from '../AddMealPlanDialog';
import CloseIcon from '@mui/icons-material/Close';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ModalRecipe = ({ open, handleClose, recipe }) => {
  const [mealPlannerOpen, setMealPlannerOpen] = useState(false);

  const maxTagsToShow = 5;
  const extraTagsCount = recipe.tags.length - maxTagsToShow;
  const maxIngredientsToShow = 20;
  const extraIngredientsCount = recipe.ingredients.length - maxIngredientsToShow;

  // Split ingredients into two columns
  const midPoint = Math.ceil(recipe.ingredients.length / 2);
  const firstColumnIngredients = recipe.ingredients.slice(0, midPoint);
  const secondColumnIngredients = recipe.ingredients.slice(midPoint, maxIngredientsToShow);

  return (
    <>
      <Modal
        open={open}
        onClose={handleClose}
        className="add-recipe-modal"
        aria-labelledby="recipe-modal-title"
        aria-describedby="recipe-modal-description"
      >
        <div className="modal-content">
          {/* Header with Image and Close Button */}
          <div className="modal-header">
            <img src={recipe.image} alt={recipe.title} className="recipe-image" />
            <IconButton
              onClick={handleClose}
              className="close-button"
              aria-label="Close"
            >
              <CloseIcon />
            </IconButton>
          </div>

          {/* Recipe Title and Meta */}
          <Typography variant="h4" id="recipe-modal-title" className="recipe-title">
            {recipe.title}
          </Typography>
          <div className="recipe-meta">
            <Typography variant="body2" className="meta-info">
              <span>🕒 {recipe.readyInMinutes} min</span> •{' '}
              <span>🍽️ {recipe.servings} servings</span> •{' '}
              <span>❤️ Health Score: {recipe.healthScore}</span>
            </Typography>
          </div>

          {/* Tags */}
          <div className="recipe-tags">
            {recipe.tags.slice(0, maxTagsToShow).map((tag, index) => (
              <Chip key={index} label={tag} className="tag-chip" size="small" />
            ))}
            {extraTagsCount > 0 && (
              <Chip
                label={`+${extraTagsCount}`}
                className="tag-chip more-chip"
                size="small"
              />
            )}
          </div>

          {/* Ingredients */}
          <Typography variant="h6" className="section-title">
            Ingredients
          </Typography>
          <div className="ingredients-container">
            <div className="ingredients-columns">
              {/* First Column */}
              <ul className="ingredients-list">
                {firstColumnIngredients.map((ingredient, index) => (
                  <li key={index} className="ingredient-item">
                    <span className="ingredient-amount">
                      {ingredient.amount} {ingredient.unit}
                    </span>{' '}
                    {ingredient.nameClean}
                  </li>
                ))}
              </ul>
              {/* Second Column */}
              <ul className="ingredients-list">
                {secondColumnIngredients.map((ingredient, index) => (
                  <li key={index} className="ingredient-item">
                    <span className="ingredient-amount">
                      {ingredient.amount} {ingredient.unit}
                    </span>{' '}
                    {ingredient.nameClean}
                  </li>
                ))}
                {extraIngredientsCount > 0 && (
                  <li className="ingredient-item extra-count">
                    +{extraIngredientsCount} more ingredients
                  </li>
                )}
              </ul>
            </div>
          </div>

          {/* Instructions */}
          <Typography variant="h6" className="section-title">
            Instructions
          </Typography>
          <div
            className="instructions"
            dangerouslySetInnerHTML={{ __html: recipe.instructions }}
          />

          {/* Action Buttons */}
          <div className="modal-buttons">
            <Button
              variant="contained"
              className="modal-button"
              startIcon={<ShoppingCartIcon />}
              onClick={() =>
                toast.success('Ingredients added to cart', {
                  position: 'bottom-left',
                  autoClose: 3000,
                  theme: 'colored',
                })
              }
            >
              Add to Cart
            </Button>
            <Button
              variant="contained"
              className="modal-button add-to-planner"
              startIcon={<CalendarTodayIcon />}
              onClick={() => setMealPlannerOpen(true)}
            >
              Add to Planner
            </Button>
          </div>
        </div>
      </Modal>
      <AddToMealPlanDialog
        open={mealPlannerOpen}
        handleClose={() => setMealPlannerOpen(false)}
        recipe={recipe}
      />
    </>
  );
};

export default ModalRecipe;