import React from "react";
import { CardActionArea, CardMedia, Typography, Box, Rating } from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import "./RecipeCard.scss";

const RecipeCard = ({ recipe, onClick }) => {
  return (
    <div className="recipe-card" onClick={() => onClick(recipe)}>
      <img src={recipe.image} alt={recipe.title} />
      <h2 className="recipe-tittle">{recipe.title}</h2>
      <div className="recipe-info">
        <Box>
          <Rating value={recipe.averageRating || 0} readOnly precision={0.5} size="small" />
        </Box>

        <Box display="flex" justifyContent="space-between">
          <Box display="flex" alignItems="center">
            <AccessTimeIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
            <Typography variant="body2" color="text.secondary">
              {recipe.readyInMinutes || "30"} mins
            </Typography>
          </Box>

          <Box display="flex" alignItems="center">
            <PeopleAltIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
            <Typography variant="body2" color="text.secondary">
              {recipe.servings || "4"}
            </Typography>
          </Box>
        </Box>
      </div>
    </div>
  );
};

export default RecipeCard;
