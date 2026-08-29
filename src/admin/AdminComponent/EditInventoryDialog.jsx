// src/admin/EditInventoryDialog.jsx
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from "@mui/material";

const EditInventoryDialog = ({ open, handleClose, handleSave, record }) => {
  const [quantity, setQuantity] = useState(0);

  useEffect(() => {
    if (record) {
      setQuantity(record.numberAtStore);
    }
  }, [record]);

  const onSave = () => {
    const updatedRecord = {
      ...record,
      numberAtStore: parseInt(quantity, 10),
    };
    handleSave(updatedRecord);
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Edit Inventory</DialogTitle>
      <DialogContent>
        <TextField
          margin="dense"
          label="Product Name"
          value={record?.product?.name || ""}
          fullWidth
          disabled
        />
        <TextField
          margin="dense"
          label="Store Name"
          value={record?.storeName || ""}
          fullWidth
          disabled
        />
        <TextField
          margin="dense"
          label="Quantity"
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          fullWidth
          required
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={onSave} variant="contained" disabled={!quantity || quantity < 0}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditInventoryDialog;
