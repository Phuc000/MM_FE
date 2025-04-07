import React, { useState } from 'react';
import { Header, Footer, FeatureAd } from '../../Components';
import { useMealPlanner } from '../../Context/MealPlannerContext';
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
} from '@mui/material';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import BreakfastDiningIcon from '@mui/icons-material/BreakfastDining';
import LunchDiningIcon from '@mui/icons-material/LunchDining';
import DinnerDiningIcon from '@mui/icons-material/DinnerDining';
import IcecreamIcon from '@mui/icons-material/Icecream';
import ModalRecipe from '../../Components/Common/AddRecipe';
import './MealPlanner.scss';

const mealTypes = [
  { name: 'Breakfast', icon: <BreakfastDiningIcon /> },
  { name: 'Lunch', icon: <LunchDiningIcon /> },
  { name: 'Dinner', icon: <DinnerDiningIcon /> },
  { name: 'Snack', icon: <IcecreamIcon /> },
];

const MealPlanner = () => {
  const { mealPlan } = useMealPlanner();
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const getWeekDates = (date) => {
    const week = [];
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay());
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      week.push(day);
    }
    return week;
  };

  const formatDate = (date) => date.toISOString().split('T')[0];

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
    setSelectedRecipe(recipe);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedRecipe(null);
  };

  const weekDates = getWeekDates(currentWeek);

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
              {weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - 
              {weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </Typography>
            <IconButton onClick={handleNextWeek} aria-label="next week">
              <ArrowForwardIosIcon />
            </IconButton>
          </Box>
          <Chip 
            icon={<RestaurantMenuIcon />}
            label="Plan Your Meals"
            color="primary"
            variant="outlined"
            className="plan-chip"
          />
        </Box>
        <TableContainer component={Paper} elevation={3} className="table-container">
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell className="meal-type-cell">Meal</TableCell>
                {weekDates.map(date => (
                  <TableCell key={date} className="date-cell">
                    <Box className="date-box">
                      <Typography variant="subtitle2">
                        {date.toLocaleDateString('en-US', { weekday: 'short' })}
                      </Typography>
                      <Typography variant="h6">
                        {date.getDate()}
                      </Typography>
                    </Box>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {mealTypes.map(mealType => (
                <TableRow key={mealType.name} className="meal-row">
                  <TableCell className="meal-type-cell">
                    <Box className="meal-type-content">
                      {mealType.icon}
                      <Typography variant="subtitle1">{mealType.name}</Typography>
                    </Box>
                  </TableCell>
                  {weekDates.map(date => {
                    const dateKey = formatDate(date);
                    const recipes = mealPlan[dateKey]?.[mealType.name.toLowerCase()] || [];

                    return (
                      <TableCell key={dateKey} className="recipe-cell">
                        {recipes.length > 0 ? (
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            {recipes.map((recipe, index) => (
                              <Typography
                                key={index}
                                className="recipe-name"
                                variant="body2"
                                onClick={() => handleRecipeClick(recipe)}
                                sx={{ cursor: 'pointer' }}
                              >
                                {recipe.title}
                              </Typography>
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
        <ModalRecipe
          open={modalOpen}
          handleClose={handleModalClose}
          recipe={selectedRecipe}
        />
      )}
      <FeatureAd />
      <Footer />
    </div>
  );
};

export default MealPlanner;