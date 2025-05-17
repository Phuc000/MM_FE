import React, { createContext, useContext, useState, useEffect } from 'react';

const MealPlannerContext = createContext();

export const MealPlannerProvider = ({ children }) => {
  const [mealPlan, setMealPlan] = useState(() => {
    const saved = localStorage.getItem('mealPlan');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem('mealPlan', JSON.stringify(mealPlan));
  }, [mealPlan]);

  const addRecipeToMealPlan = (date, mealType, recipe) => {
    const dateKey = date.toISOString().split('T')[0];
    setMealPlan(prev => ({
      ...prev,
      [dateKey]: {
        ...prev[dateKey],
        [mealType]: [...(prev[dateKey]?.[mealType] || []), recipe]
      }
    }));
  };

  // Add this new function to remove recipes
  const removeRecipeFromMealPlan = (date, mealType, recipeIndex) => {
    const dateKey = typeof date === 'string' ? date : date.toISOString().split('T')[0];
    
    setMealPlan(prev => {
      // If this date or meal type doesn't exist, nothing to remove
      if (!prev[dateKey] || !prev[dateKey][mealType]) return prev;
      
      // Create a copy of the meals for this date/meal
      const updatedMeals = [...prev[dateKey][mealType]];
      // Remove the recipe at the specified index
      updatedMeals.splice(recipeIndex, 1);
      
      // Create the new state with the updated meals
      const newState = { ...prev };
      
      if (updatedMeals.length === 0) {
        // If there are no more recipes for this meal type, remove the meal type
        delete newState[dateKey][mealType];
        
        // If there are no more meal types for this date, remove the date
        if (Object.keys(newState[dateKey]).length === 0) {
          delete newState[dateKey];
        }
      } else {
        // Otherwise update with the new meals array
        newState[dateKey] = {
          ...newState[dateKey],
          [mealType]: updatedMeals
        };
      }
      
      return newState;
    });
  };

  return (
    <MealPlannerContext.Provider value={{ 
      mealPlan, 
      setMealPlan, 
      addRecipeToMealPlan,
      removeRecipeFromMealPlan 
    }}>
      {children}
    </MealPlannerContext.Provider>
  );
};

export const useMealPlanner = () => useContext(MealPlannerContext);