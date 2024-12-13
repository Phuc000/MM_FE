import React, { useState } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent,
  DialogActions,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { useMealPlanner } from '../../../Context/MealPlannerContext';
import { toast } from 'react-toastify';

const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];

const AddToMealPlanDialog = ({ open, handleClose, recipe }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [mealType, setMealType] = useState('');
  const { addRecipeToMealPlan } = useMealPlanner();

  const handleAdd = () => {
    if (!mealType) {
      toast.error('Please select a meal type');
      return;
    }

    addRecipeToMealPlan(selectedDate, mealType, recipe);
    toast.success('Recipe added to meal plan');
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Add to Meal Plan</DialogTitle>
      <DialogContent>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '10px' }}>
          <DatePicker
            label="Select Date"
            value={selectedDate}
            onChange={setSelectedDate}
          />
          <FormControl fullWidth>
            <InputLabel>Meal Type</InputLabel>
            <Select
              value={mealType}
              onChange={(e) => setMealType(e.target.value)}
            >
              {mealTypes.map(type => (
                <MenuItem key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleAdd} variant="contained" color="primary">
          Add to Plan
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddToMealPlanDialog;