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
  Card,
  CardContent,
  Typography,
  Checkbox,
  Fab,
  Avatar,
  Tooltip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import './MealPlanner.scss';

const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

const MealPlanner = () => {
    const { mealPlan, setMealPlan } = useMealPlanner();
    const [currentWeek] = useState(new Date());
    const [selectedRecipes, setSelectedRecipes] = useState([]); // Format: [{date, mealType, index}]
  
  // Get dates for current week
  const getWeekDates = (date) => {
    const week = [];
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay()); // Start from Sunday

    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      week.push(day);
    }
    return week;
  };

  // Format date as YYYY-MM-DD
  const formatDate = (date) => date.toISOString().split('T')[0];

  // Delete recipe from meal plan
  const handleDelete = (date, mealType, recipeIndex) => {
    const dateKey = formatDate(date);
    setMealPlan(prev => {
      const newPlan = { ...prev };
      newPlan[dateKey][mealType] = newPlan[dateKey][mealType].filter((_, i) => i !== recipeIndex);
      return newPlan;
    });
  };

  const weekDates = getWeekDates(currentWeek);

  const handleSelect = (date, mealType, index) => {
    const recipeKey = `${formatDate(date)}-${mealType}-${index}`;
    setSelectedRecipes(prev => {
      if (prev.includes(recipeKey)) {
        return prev.filter(key => key !== recipeKey);
      }
      return [...prev, recipeKey];
    });
  };

  const handleBulkDelete = () => {
    const newPlan = { ...mealPlan };
    selectedRecipes.forEach(key => {
      const [date, mealType, index] = key.split('-');
      if (newPlan[date]?.[mealType]) {
        const recipes = [...newPlan[date][mealType]];
        recipes.splice(parseInt(index), 1);
        newPlan[date][mealType] = recipes;
      }
    });
    setMealPlan(newPlan);
    setSelectedRecipes([]);
  };

  return (
    <div>
      <Header />
      <div className="meal-planner-container">
        <h1>Weekly Meal Planner</h1>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell className="meal-type-cell">Meal Type</TableCell>
                {weekDates.map(date => (
                  <TableCell key={date} className="date-cell">
                    {date.toLocaleDateString('en-US', { 
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {mealTypes.map(mealType => (
                <TableRow key={mealType}>
                  <TableCell className="meal-type-cell">{mealType}</TableCell>
                  {weekDates.map(date => {
                    const dateKey = formatDate(date);
                    const recipes = mealPlan[dateKey]?.[mealType.toLowerCase()] || [];

                    return (
                      <TableCell key={dateKey} className="recipe-cell">
                        {recipes.map((recipe, index) => {
                          const recipeKey = `${dateKey}-${mealType.toLowerCase()}-${index}`;
                          return (
                            <Card key={index} className="recipe-card-mini">
                              <CardContent className="recipe-content">
                                <div className="recipe-info">
                                  <Checkbox
                                    size="small"
                                    checked={selectedRecipes.includes(recipeKey)}
                                    onChange={() => handleSelect(date, mealType.toLowerCase(), index)}
                                  />
                                  <img 
                                    src={recipe.image} 
                                    alt={recipe.title}
                                    className="recipe-image"
                                  />
                                  <Tooltip title={recipe.title}>
                                    <Typography className="recipe-title" noWrap>
                                      {recipe.title}
                                    </Typography>
                                  </Tooltip>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {selectedRecipes.length > 0 && (
          <Fab
            color="error"
            className="delete-fab"
            onClick={handleBulkDelete}
            aria-label="delete selected"
          >
            <DeleteIcon />
          </Fab>
        )}
      </div>
      <FeatureAd />
      <Footer />
    </div>
  );
};

export default MealPlanner;