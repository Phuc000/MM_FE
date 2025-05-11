import React, { useEffect, useState } from "react";
import {
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

const generateStrongPassword = (length = 16) => {
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
  return Array.from({ length }, () =>
    charset.charAt(Math.floor(Math.random() * charset.length))
  ).join("");
};

export default function PasswordGenerator({ password, setPassword }) {
    useEffect(() => {
      const newPassword = generateStrongPassword();
      setPassword(newPassword);
    }, []);
  
    const handleGenerate = () => {
      const newPassword = generateStrongPassword();
      setPassword(newPassword);
    };
  
    const handleCopy = () => {
      navigator.clipboard.writeText(password);
    };
  
    return (
      <TextField
        margin="dense"
        label="Password"
        type="text"
        value={password}
        fullWidth
        InputProps={{
          readOnly: true,
          endAdornment: (
            <>
              <InputAdornment position="end">
                <Tooltip title="Generate Password">
                  <IconButton onClick={handleGenerate} edge="end">
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
              </InputAdornment>
              <InputAdornment position="end">
                <Tooltip title="Copy to Clipboard">
                  <IconButton onClick={handleCopy} edge="end" disabled={!password}>
                    <ContentCopyIcon />
                  </IconButton>
                </Tooltip>
              </InputAdornment>
            </>
          ),
        }}
      />
    );
  }