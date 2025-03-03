import React from 'react';
import './RecipeCard.scss';

const RecipeCard = ({ recipe, onClick }) => {
  return (
    <div className="recipe-card" onClick={() => onClick(recipe)}>
      <img src={recipe.image} alt={recipe.title} />
      <h2>{recipe.title}</h2>
      <div className="recipe-info">
        <span className="recipe-time">
          <i className="fa fa-clock-o"></i> {recipe.readyInMinutes || '30'} mins
        </span>
        <span className="recipe-servings">
          <i className="fa fa-users"></i> {recipe.servings || '4'} servings
        </span>
      </div>
    </div>
  );
};

export default RecipeCard;