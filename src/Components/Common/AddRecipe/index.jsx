import React, { useState } from 'react';
import './AddRecipe.scss';
import Modal from '@mui/material/Modal';
import { Button, Chip } from '@mui/material';
import AddToMealPlanDialog from '../AddMealPlanDialog';
import CloseIcon from '@mui/icons-material/Close';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AddRecipe = ({ open, handleClose, recipe }) => {

    const [mealPlannerOpen, setMealPlannerOpen] = useState(false);

    return (
        <>
            <Modal open={open} onClose={handleClose} className="add-recipe-modal">
              <div className="modal-content">
                <Button onClick={handleClose} className="close-button">
                  <CloseIcon />
                </Button>
                <img src={recipe.image} alt={recipe.title} className="recipe-image" />
                <h2 className="recipe-title">{recipe.title}</h2>
                <div className="recipe-tags">
                  {recipe.tags.map((tag, index) => (
                    <Chip key={index} label={tag} className="tag-chip" />
                  ))}
                </div>
                <h3>Ingredients</h3>
                <ul className="ingredients-list">
                  {recipe.ingredients.map((ingredient, index) => (
                    <li key={index} className="ingredient-item">
                      {ingredient.amount} {ingredient.unit} {ingredient.nameClean}
                    </li>
                  ))}
                </ul>
                <h3>Instructions</h3>
                <p className="instructions">{recipe.instructions}</p>
                <p className='serving'>Serving: {recipe.servings}</p>
                <div className="modal-buttons">
                  <Button variant="contained" className="modal-button" onClick={() => 
                    toast.success('Ingredients added to cart', { 
                      position: "bottom-left", 
                      autoClose: 5000, 
                      theme: "colored" 
                    })}>
                    Add ingredients to cart
                  </Button>
                  <Button 
                    variant="contained" 
                    className="modal-button"
                    onClick={() => setMealPlannerOpen(true)}
                  >
                    Add recipe to meal planner
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

export default AddRecipe;