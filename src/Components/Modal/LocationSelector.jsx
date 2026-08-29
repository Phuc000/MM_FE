import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  FormControl,
  Select,
  MenuItem,
  Button,
} from "@mui/material";
import { useLocationContext } from "../../Context/LocationContext";

const LocationSelector = ({ open, onClose }) => {
  const [cities, setCities] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedWard, setSelectedWard] = useState("");
  const { setLocation } = useLocationContext();

  useEffect(() => {
    // Fetch Vietnam cities/provinces
    const fetchCities = async () => {
      if (open && cities.length === 0) {
        console.log("Fetching cities...");
        try {
          const response = await fetch("https://provinces.open-api.vn/api/p/");
          const data = await response.json();
          setCities(data);
        } catch (error) {
          console.error("Error fetching cities:", error);
        }
      }
    };
    fetchCities();
  }, [open, cities.length]);

  // Reset selections when dialog is closed
  useEffect(() => {
    if (!open) {
      setSelectedCity("");
      setSelectedWard("");
    }
  }, [open]);

  useEffect(() => {
    // Fetch wards for selected city
    const fetchWards = async () => {
      if (selectedCity) {
        const response = await fetch(`https://provinces.open-api.vn/api/p/${selectedCity}?depth=2`);
        const data = await response.json();
        setWards(data.districts);
      }
    };
    fetchWards();
  }, [selectedCity]);

  const handleSubmit = () => {
    setLocation({
      city: cities.find((c) => c.code === selectedCity),
      ward: wards.find((w) => w.code === selectedWard),
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Select Your Location</DialogTitle>
      <DialogContent>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <Select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            displayEmpty
          >
            <MenuItem value="" disabled>
              Select City
            </MenuItem>
            {cities.map((city) => (
              <MenuItem key={city.code} value={city.code}>
                {city.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth sx={{ mb: 2 }}>
          <Select
            value={selectedWard}
            onChange={(e) => setSelectedWard(e.target.value)}
            displayEmpty
            disabled={!selectedCity}
          >
            <MenuItem value="" disabled>
              Select Ward
            </MenuItem>
            {wards.map((ward) => (
              <MenuItem key={ward.code} value={ward.code}>
                {ward.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          fullWidth
          variant="contained"
          onClick={handleSubmit}
          disabled={!selectedCity || !selectedWard}
        >
          Confirm Location
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default LocationSelector;
