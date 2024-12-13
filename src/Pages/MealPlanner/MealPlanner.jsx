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
  Typography
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import './MealPlanner.scss';

const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

const MealPlanner = () => {
  const { mealPlan, setMealPlan } = useMealPlanner();
  const [currentWeek] = useState(new Date());

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

  return (
    <div>
      <Header />
      <div className="meal-planner-container">
        <h1>Weekly Meal Planner</h1>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Meal Type</TableCell>
                {weekDates.map(date => (
                  <TableCell key={date}>
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
                  <TableCell>{mealType}</TableCell>
                  {weekDates.map(date => {
                    const dateKey = formatDate(date);
                    const recipes = mealPlan[dateKey]?.[mealType.toLowerCase()] || [];

                    return (
                      <TableCell key={dateKey}>
                        {recipes.map((recipe, index) => (
                          <Card key={index} className="recipe-card">
                            <CardContent>
                              <Typography variant="subtitle2">
                                {recipe.title}
                              </Typography>
                              <IconButton 
                                size="small"
                                onClick={() => handleDelete(date, mealType.toLowerCase(), index)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </CardContent>
                          </Card>
                        ))}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
      <FeatureAd />
      <Footer />
    </div>
  );
};

export default MealPlanner;