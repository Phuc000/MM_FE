import React, { useState, useEffect } from "react";
import "./AddRecipe.scss";
import Modal from "@mui/material/Modal";
import { Button, Chip, IconButton, Typography, Rating, Box, Tooltip } from "@mui/material";
import AddToMealPlanDialog from "../AddMealPlanDialog";
import AddToCartConfirmation from "./AddToCartConfirmation";
import ShopRecipeConfirmation from "../ShowRecipeConfirmation";
import CloseIcon from "@mui/icons-material/Close";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../../../hooks/useAuth";
import { useWebSocket } from "../../../hooks/useWebSocket";
import { useLocationContext } from "../../../Context/LocationContext";

const ModalRecipe = ({ open, handleClose, recipe }) => {
  const [mealPlannerOpen, setMealPlannerOpen] = useState(false);
  const [cartConfirmOpen, setCartConfirmOpen] = useState(false);
  const [foundIngredients, setFoundIngredients] = useState(null);
  const { user } = useAuth();
  const locationContext = useLocationContext();

  // Using the WebSocket hook for AI cart assistant
  const {
    wsStatus,
    messages, // Access messages from useWebSocket
    wsRef,
    error,
    setError,
    cartActionInProgress,
    handleShopRecipeConfirm,
  } = useWebSocket(user?.id, locationContext);
  const [userRating, setUserRating] = useState(null); // State for user rating

  const maxTagsToShow = 5;
  const extraTagsCount = recipe.tags.length - maxTagsToShow;
  const maxIngredientsToShow = 20;
  const extraIngredientsCount = recipe.ingredients.length - maxIngredientsToShow;

  // Split ingredients into two columns
  const midPoint = Math.ceil(recipe.ingredients.length / 2);
  const firstColumnIngredients = recipe.ingredients.slice(0, midPoint);
  const secondColumnIngredients = recipe.ingredients.slice(midPoint, maxIngredientsToShow);

  // Handle opening the cart confirmation dialog
  const handleCartClick = () => {
    setCartConfirmOpen(true);
  };

  useEffect(() => {
    // Skip if no messages
    if (!messages?.length) return;

    // Look at the last message
    const latestMessage = messages[messages.length - 1];

    // Check if it has shopRecipe data
    if (latestMessage?.shopRecipe) {
      console.log("Found recipe ingredients in messages:", latestMessage.shopRecipe);

      // Set foundIngredients state with the data from the message
      setFoundIngredients(latestMessage.shopRecipe);

      // Close the confirmation dialog
      setCartConfirmOpen(false);
    }
  }, [messages]);

  // Handle confirming AI cart assistant
  const handleCartConfirm = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      // Reset any previously found ingredients
      setFoundIngredients(null);

      // Send a message to the AI chatbot to process the recipe
      const message = {
        message: `SYSTEM INSTRUCTION: This is an automated recipe ingredients request. 
          Do not ask follow-up questions or request additional information.
          Find and add all matching ingredients for recipe "${recipe.title}" to user's cart immediately.`,
        action: "addRecipeToCart",
      };

      const safeJSON = JSON.stringify(message).replace(/[\u0080-\uFFFF]/g, (char) => {
        return "\\u" + ("0000" + char.charCodeAt(0).toString(16)).slice(-4);
      });

      wsRef.current.send(safeJSON);

      // Show a processing toast
      toast.info("AI is processing recipe ingredients...", {
        position: "bottom-left",
        autoClose: 5000,
        theme: "colored",
      });
    } else {
      setError("WebSocket connection not available. Please try again later.");
    }
  };

  // Handle the final confirmation when user selects ingredients
  const handleIngredientConfirm = async (selectedItems) => {
    try {
      // Use the handler from the useWebSocket hook
      await handleShopRecipeConfirm(selectedItems);

      // Reset state and show success message
      setFoundIngredients(null);
      toast.success(`Added selected ingredients to your cart!`, {
        position: "bottom-left",
        autoClose: 3000,
      });
    } catch (err) {
      console.error("Error adding ingredients to cart:", err);
      toast.error("Failed to add some ingredients to cart", {
        position: "bottom-left",
      });
    }
  };

  // Handle rating change
  const handleRatingChange = (event, newValue) => {
    setUserRating(newValue);
    toast.success(`Rated ${newValue} stars!`, {
      position: "bottom-left",
      autoClose: 3000,
      theme: "colored",
    });
  };

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
            <IconButton onClick={handleClose} className="close-button" aria-label="Close">
              <CloseIcon />
            </IconButton>
          </div>

          {/* Recipe Title, Rating, and Meta */}
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
            <Typography variant="h4" id="recipe-modal-title" className="recipe-title">
              {recipe.title}
            </Typography>
            <Tooltip title="Rate this recipe">
              <Rating
                name="recipe-rating"
                value={userRating}
                onChange={handleRatingChange}
                precision={0.5} // Allow half-star ratings
                size="medium"
                sx={{ color: "#f5c518" }} // Gold color for stars
              />
            </Tooltip>
          </Box>
          <div className="recipe-meta">
            <Typography variant="body2" className="meta-info">
              <span>🕒 {recipe.readyInMinutes} min</span> •{" "}
              <span>🍽️ {recipe.servings} servings</span> •{" "}
              <span>❤️ Health Score: {recipe.healthScore}</span>
            </Typography>
          </div>

          {/* Tags */}
          <div className="recipe-tags">
            {recipe.tags.slice(0, maxTagsToShow).map((tag, index) => (
              <Chip key={index} label={tag} className="tag-chip" size="small" />
            ))}
            {extraTagsCount > 0 && (
              <Chip label={`+${extraTagsCount}`} className="tag-chip more-chip" size="small" />
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
                    </span>{" "}
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
                    </span>{" "}
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
          <div className="instructions" dangerouslySetInnerHTML={{ __html: recipe.instructions }} />

          {/* Show found ingredients if available */}
          {foundIngredients && (
            <div className="found-ingredients-section">
              <Typography variant="h6" className="section-title">
                Found Ingredients
              </Typography>
              <ShopRecipeConfirmation
                recipeData={foundIngredients}
                onConfirm={handleIngredientConfirm}
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="modal-buttons">
            <Button
              variant="contained"
              className="modal-button"
              startIcon={<ShoppingCartIcon />}
              onClick={handleCartClick}
              disabled={!!foundIngredients || cartActionInProgress}
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

      {/* Meal planner dialog */}
      <AddToMealPlanDialog
        open={mealPlannerOpen}
        handleClose={() => setMealPlannerOpen(false)}
        recipe={recipe}
      />

      {/* Cart confirmation dialog - only show if no ingredients found yet */}
      {!foundIngredients && (
        <AddToCartConfirmation
          open={cartConfirmOpen}
          handleClose={() => setCartConfirmOpen(false)}
          handleConfirm={handleCartConfirm}
          recipe={recipe}
          loading={cartActionInProgress}
          error={error}
        />
      )}
    </>
  );
};

export default ModalRecipe;
