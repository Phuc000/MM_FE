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

  return (
    <MealPlannerContext.Provider value={{ mealPlan, setMealPlan, addRecipeToMealPlan }}>
      {children}
    </MealPlannerContext.Provider>
  );
};

export const useMealPlanner = () => useContext(MealPlannerContext);