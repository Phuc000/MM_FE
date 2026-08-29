// src/components/PromotionTicket.jsx
import React from "react";
import { Card, Typography, Button, Box } from "@mui/material";

const PromotionTicket = ({ promotion, onSelect, disabled, selected }) => {
  return (
    <Card
      variant="outlined"
      sx={{
        position: "relative",
        display: "flex",
        width: 400,
        height: 120,
        margin: "16px auto",
        overflow: "visible",
        borderRadius: 0,
        borderColor: selected ? "#fe3bd4" : "#bbb",
        borderWidth: 2,
        borderStyle: "solid",
        cursor: disabled ? "default" : "pointer",
        "&:hover": {
          borderColor: disabled ? null : "#fe3bd4",
        },
      }}
      onClick={() => !disabled && onSelect(promotion)}
    >
      {/* Left Section */}
      <Box
        sx={{
          flex: 1,
          padding: 2,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <Typography variant="h6" sx={{ color: "#fe3bd4", fontWeight: "bold" }}>
          {promotion.name}
        </Typography>
        <Typography variant="body2" sx={{ color: "#444", marginBottom: 1 }}>
          {promotion.description}
        </Typography>
        <Button
          variant={selected ? "contained" : "outlined"}
          color="primary"
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(promotion);
          }}
          disabled={disabled}
        >
          {selected ? "Selected" : "Apply"}
        </Button>
      </Box>
      {/* Dashed Divider with Cutouts */}
      <Box
        sx={{
          position: "relative",
          width: 0,
          borderLeft: "2px dashed #ccc",
          marginY: 1,
        }}
      >
        {/* Top Cutout */}
        <Box
          sx={{
            position: "absolute",
            top: -25,
            left: "50%",
            transform: "translateX(-50%)",
            width: 30,
            height: 30,
            backgroundColor: "#fff",
            borderRadius: "50%",
            // border: '2px solid #ccc',
            borderBottom: "none",
          }}
        />
        {/* Bottom Cutout */}
        <Box
          sx={{
            position: "absolute",
            bottom: -25,
            left: "50%",
            transform: "translateX(-50%)",
            width: 30,
            height: 30,
            backgroundColor: "#fff",
            borderRadius: "50%",
            // border: '2px solid #ccc',
            borderTop: "none",
          }}
        />
      </Box>
      {/* Right Section */}
      <Box
        sx={{
          width: 100,
          backgroundColor: "#fe3bd4",
          color: "#fff",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
          {(promotion.discount * 100).toFixed(0)}%
        </Typography>
        <Typography variant="subtitle2">OFF</Typography>
      </Box>
    </Card>
  );
};

export default PromotionTicket;
