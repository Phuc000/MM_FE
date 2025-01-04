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
  InputLabel,
  styled
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { useMealPlanner } from '../../../Context/MealPlannerContext';
import { toast } from 'react-toastify';
import './AddMealPlanDialog.scss';

const StyledButton = styled(Button)({
  backgroundColor: '#fe3bd4',
  '&:hover': {
    backgroundColor: '#e134bf',
  },
});

const StyledDatePicker = styled(DatePicker)({
  '& .MuiOutlinedInput-root': {
    '&.Mui-focused fieldset': {
      borderColor: '#fe3bd4',
    },
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: '#fe3bd4',
  }
});

const StyledSelect = styled(Select)({
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: '#fe3bd4',
  }
});

const StyledInputLabel = styled(InputLabel)({
  '&.Mui-focused': {
    color: '#fe3bd4',
  }
});

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
    <Dialog open={open} onClose={handleClose} className="meal-plan-dialog">
      <DialogTitle className="dialog-title">Add to Meal Plan</DialogTitle>
      <DialogContent>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '10px' }}>
          <StyledDatePicker
            label="Select Date"
            value={selectedDate}
            onChange={setSelectedDate}
          />
          <FormControl fullWidth>
            <StyledInputLabel>Meal Type</StyledInputLabel>
            <StyledSelect
              value={mealType}
              onChange={(e) => setMealType(e.target.value)}
              label="Meal Type"
            >
              {mealTypes.map(type => (
                <MenuItem key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </MenuItem>
              ))}
            </StyledSelect>
          </FormControl>
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} sx={{
            color: '#fe3bd4',
        }}>
            Cancel
        </Button>
        <StyledButton onClick={handleAdd} variant="contained">
          Add to Plan
        </StyledButton>
      </DialogActions>
    </Dialog>
  );
};

export default AddToMealPlanDialog;