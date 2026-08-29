import React, { useState } from "react";
import { Header, Footer, FeatureAd } from "../../Components";
import { useMealPlanner } from "../../Context/MealPlannerContext";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Typography,
  Box,
  Chip,
  Tooltip,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import BreakfastDiningIcon from "@mui/icons-material/BreakfastDining";
import LunchDiningIcon from "@mui/icons-material/LunchDining";
import DinnerDiningIcon from "@mui/icons-material/DinnerDining";
import IcecreamIcon from "@mui/icons-material/Icecream";
import DeleteIcon from "@mui/icons-material/Delete";
import ModalRecipe from "../../Components/Common/AddRecipe";
import "./MealPlanner.scss";

const mealTypes = [
  { name: "Breakfast", icon: <BreakfastDiningIcon /> },
  { name: "Lunch", icon: <LunchDiningIcon /> },
  { name: "Dinner", icon: <DinnerDiningIcon /> },
  { name: "Snack", icon: <IcecreamIcon /> },
];

const MealPlanner = () => {
  const { mealPlan, removeRecipeFromMealPlan } = useMealPlanner();
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false); // New state for edit mode
  const navigate = useNavigate();

  const formatDate = (date) => date.toISOString().split("T")[0];

  const handlePreviousWeek = () => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(newWeek.getDate() - 7);
    setCurrentWeek(newWeek);
  };

  const handleNextWeek = () => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(newWeek.getDate() + 7);
    setCurrentWeek(newWeek);
  };

  const handleRecipeClick = (recipe) => {
    if (!editMode) {
      setSelectedRecipe(recipe);
      setModalOpen(true);
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedRecipe(null);
  };

  const toggleEditMode = () => {
    setEditMode(!editMode);
  };

  const handleDeleteRecipe = (dateKey, mealType, recipeIndex, e) => {
    e.stopPropagation(); // Prevent triggering the parent onClick
    removeRecipeFromMealPlan(dateKey, mealType.toLowerCase(), recipeIndex);
  };

  const weekDates = useMemo(() => {
    const week = [];
    const start = new Date(currentWeek);
    start.setDate(start.getDate() - start.getDay());
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      week.push(day);
    }
    return week;
  }, [currentWeek]);

  return (
    <div>
      <Header />
      <Box className="meal-planner-container">
        <Box className="planner-header">
          <Typography variant="h3" className="title">
            Your Weekly Feast
          </Typography>
          <Box className="week-navigation">
            <IconButton onClick={handlePreviousWeek} aria-label="previous week">
              <ArrowBackIosIcon />
            </IconButton>
            <Typography variant="subtitle1" className="week-range">
              {weekDates[0].toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              {" - "}
              {weekDates[6].toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </Typography>
            <IconButton onClick={handleNextWeek} aria-label="next week">
              <ArrowForwardIosIcon />
            </IconButton>
          </Box>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Chip
              icon={<RestaurantMenuIcon />}
              label={editMode ? "Exit Edit Mode" : "Plan Your Meals"}
              color="primary"
              variant={editMode ? "filled" : "outlined"}
              className="plan-chip"
              onClick={toggleEditMode}
              sx={{ cursor: "pointer" }}
            />

            {/* Edit Mode Toggle Button */}
            {/* <Chip
              icon={<EditIcon />}
              className="plan-chip"
              label={editMode ? "Exit Edit Mode" : "Edit Plan"}
              color={editMode ? "primary" : "primary"}
              variant={editMode ? "filled" : "outlined"}
              onClick={toggleEditMode}
              sx={{ cursor: 'pointer' }}
            /> */}
          </Box>
        </Box>
        <TableContainer component={Paper} elevation={3} className="table-container">
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell className="meal-type-cell">Meal</TableCell>
                {weekDates.map((date) => (
                  <TableCell key={date} className="date-cell">
                    <Box className="date-box">
                      <Typography variant="subtitle2">
                        {date.toLocaleDateString("en-US", { weekday: "short" })}
                      </Typography>
                      <Typography variant="h6">{date.getDate()}</Typography>
                    </Box>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {mealTypes.map((mealType) => (
                <TableRow key={mealType.name} className="meal-row">
                  <TableCell className="meal-type-cell">
                    <Box className="meal-type-content">
                      {mealType.icon}
                      <Typography variant="subtitle1">{mealType.name}</Typography>
                    </Box>
                  </TableCell>
                  {weekDates.map((date) => {
                    const dateKey = formatDate(date);
                    const recipes = mealPlan[dateKey]?.[mealType.name.toLowerCase()] || [];

                    return (
                      <TableCell key={dateKey} className="recipe-cell">
                        {recipes.length > 0 ? (
                          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                            {recipes.map((recipe, index) => (
                              <Box
                                key={index}
                                className={`recipe-card ${editMode ? "edit-mode" : ""}`}
                                onClick={() => handleRecipeClick(recipe)}
                                sx={{
                                  cursor: editMode ? "default" : "pointer",
                                  position: "relative",
                                  "&:hover .delete-icon": {
                                    opacity: 1,
                                  },
                                }}
                              >
                                <img
                                  src={recipe.image || "https://via.placeholder.com/80"}
                                  alt={recipe.title}
                                  className="recipe-image"
                                  style={{ opacity: editMode ? 0.7 : 1 }}
                                  loading="lazy"
                                />
                                <Typography
                                  className="recipe-name"
                                  variant="body2"
                                  sx={{ textAlign: "center" }}
                                >
                                  {recipe.title}
                                </Typography>

                                {/* Delete button that shows in edit mode */}
                                {editMode && (
                                  <Tooltip title="Remove recipe">
                                    <IconButton
                                      size="small"
                                      color="error"
                                      className="delete-icon"
                                      onClick={(e) =>
                                        handleDeleteRecipe(dateKey, mealType.name, index, e)
                                      }
                                      sx={{
                                        position: "absolute",
                                        top: "50%",
                                        left: "50%",
                                        transform: "translate(-50%, -50%)",
                                        backgroundColor: "rgba(255,255,255,0.8)",
                                        "&:hover": {
                                          backgroundColor: "rgba(255,255,255,0.9)",
                                        },
                                      }}
                                    >
                                      <DeleteIcon />
                                    </IconButton>
                                  </Tooltip>
                                )}
                              </Box>
                            ))}
                          </Box>
                        ) : (
                          <Typography variant="body2" className="empty-slot">
                            -
                          </Typography>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      {selectedRecipe && (
        <ModalRecipe open={modalOpen} handleClose={handleModalClose} recipe={selectedRecipe} />
      )}
      <FeatureAd />
      <Footer />
    </div>
  );
};

export default MealPlanner;
