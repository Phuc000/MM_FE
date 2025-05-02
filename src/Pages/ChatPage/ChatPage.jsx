// src/Pages/ChatPage/ChatPage.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Header, Footer } from '../../Components';
import ReactMarkdown from 'react-markdown';
import runChat from '../../config/gemini';
import axios from 'axios';
import './ChatPage.css';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import StopIcon from '@mui/icons-material/Stop';
import MicIcon from '@mui/icons-material/Mic';
import ImageIcon from '@mui/icons-material/Image';
import { Alert, Snackbar } from '@mui/material';

import { useAuth } from '../../hooks/useAuth';
import { useWebSocket } from '../../hooks/useWebSocket';
import RecipeCard from '../../Components/Common/RecipeCard/RecipeCard';
import AddRecipe from '../../Components/Common/AddRecipe';
import ShopRecipeConfirmation from '../../Components/Common/ShowRecipeConfirmation';

import { useVoiceInput } from '../../hooks/useVoiceInput';
import { useLocationContext } from '../../Context/LocationContext';
import { 
  Box, 
  Tooltip, 
  Badge, 
  Typography, 
  Fade,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack
} from '@mui/material';
import CloudDoneIcon from '@mui/icons-material/CloudDone';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import LocalDiningIcon from '@mui/icons-material/LocalDining';


const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
const dietaryPreferences = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free'];

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/heic', 'image/heif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

// Add validation helpers
const validateImageFile = (file) => {
  if (!file) return { valid: false, error: 'No file selected' };
  
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { 
      valid: false, 
      error: 'Invalid file type. Please upload PNG, JPEG, WEBP, HEIC or HEIF images only.'
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: 'File size too large. Please upload images under 5MB.'
    };
  }

  return { valid: true };
};

const ChatUI = () => {
  const locationContext = useLocationContext();
  const { user } = useAuth();
  const [userInput, setUserInput] = useState('');
  const { 
    wsStatus, 
    messages, 
    wsRef, 
    setMessages, 
    error,
    setError,
    cartActionInProgress,
    botTyping,
    setBotTyping,
    handleShopRecipeConfirm
  } = useWebSocket(user?.id, locationContext);

  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);
  const [selectedViewRecipe, setSelectedViewRecipe] = useState(null);

  const [selectedMealType, setSelectedMealType] = useState('');
  const [selectedDietaryPreference, setSelectedDietaryPreference] = useState('');

  // Add state for image
  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef(null);
  // const [error, setError] = useState('');

  // voice chat function
  const { listening, handleVoiceInput, barsRef } = useVoiceInput((voiceInput) => {
    setUserInput(voiceInput);
  });

  const handleChatRecipeClick = (recipe) => {
    setSelectedViewRecipe(recipe);
    setIsRecipeModalOpen(true);
  };


  // Add function to handle image selection
  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    
    if (file) {
      const validation = validateImageFile(file);
      
      if (!validation.valid) {
        setError(validation.error);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        // Get base64 string without metadata
        const base64String = reader.result.split(',')[1];
        setSelectedImage({
          preview: reader.result,
          base64: base64String
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // // Connect WebSocket on mount
  // useEffect(() => {
  //   console.log('User:', user);
  //   if (!user?.id) return;

  //   // Add a cleanup flag
  //   let isSubscribed = true;

  //   const connectWebSocket = () => {
  //     // Only create new connection if not already connected
  //     if (wsRef.current?.readyState === WebSocket.OPEN) return;
  //     const ws = new WebSocket(`ws://localhost:6969/ws/chat/${user.id}`);
      
  //     ws.onopen = () => {
  //       if (!isSubscribed) return;
  //       console.log('WebSocket Connected');
  //       setWsStatus('connected');
  //     };

  //     ws.onmessage = (event) => {
  //       const data = JSON.parse(event.data);
  //       if (data.error) {
  //         console.error('WebSocket error:', data.error);
  //         return;
  //       }
  //       setMessages(prev => [...prev, { sender: 'bot', text: data.message }]);
  //     };

  //     ws.onclose = () => {
  //       console.log('WebSocket Disconnected');
  //       setWsStatus('disconnected');
  //       // Attempt to reconnect after 3 seconds
  //       setTimeout(connectWebSocket, 3000);
  //     };

  //     ws.onerror = (error) => {
  //       console.error('WebSocket Error:', error);
  //       setWsStatus('error');
  //     };

  //     wsRef.current = ws;
  //   };

  //   connectWebSocket();

  //   // Cleanup on unmount
  //   return () => {
  //     isSubscribed = false;
  //     if (wsRef.current) {
  //       wsRef.current.close();
  //       wsRef.current = null;
  //     }
  //   };
  // }, [user?.id]);

  // Update handleSend function
  const handleSend = async () => {
    if ((!userInput.trim() && !selectedImage) || !wsRef.current) return;

    let finalUserInput = userInput;
    if (selectedMealType) {
      finalUserInput = `Meal Type: ${selectedMealType}\n${finalUserInput}`;
    }
    if (selectedDietaryPreference) {
      finalUserInput = `Dietary Preference: ${selectedDietaryPreference}\n${finalUserInput}`;
    }

    const message = {
      message: finalUserInput,
      ...(selectedImage && { image: selectedImage.base64 })
    };

    // Add user message and image to chat
    setMessages(prev => [...prev, { 
      sender: 'user', 
      text: userInput,
      image: selectedImage?.preview
    }]);

    // Reset input and image
    setUserInput('');
    setSelectedImage(null);

    // Set bot typing indicator
    setBotTyping(true);

    // Send via WebSocket
    wsRef.current.send(JSON.stringify(message));
  };


  const [showRecipeModal, setShowRecipeModal] = useState(false);

  return (
    <div>
      <Header />
      <div className="chat-container">
        <div className="chat-header">
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            width: '100%',
            mt: 1,
            mb: 1,
            gap: 2,
          }}>
            <Typography 
              variant="h4" 
              component="h1"
              sx={{ 
                fontWeight: 900,
                fontFamily: 'Quicksand, sans-serif',
              }}
            >
              IUFC Chat
            </Typography>
            
            <Tooltip
              title={
                <Typography variant="body2">
                  {wsStatus === 'connected' 
                    ? 'Connected to chat server' 
                    : 'Disconnected from chat server. Please refresh the page.'}
                </Typography>
              }
              placement="bottom"
              TransitionComponent={Fade}
              TransitionProps={{ timeout: 600 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Badge
                  variant="dot"
                  overlap="circular"
                  sx={{
                    '& .MuiBadge-badge': {
                      backgroundColor: wsStatus === 'connected' ? '#4caf50' : '#f44336',
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      boxShadow: wsStatus === 'connected' 
                        ? '0 0 8px rgba(76, 175, 80, 0.8)' 
                        : '0 0 8px rgba(244, 67, 54, 0.8)',
                      animation: wsStatus === 'connected' 
                        ? 'pulse 2s infinite' 
                        : 'none',
                    }
                  }}
                >
                  <Box sx={{ display: 'flex' }}>
                    {wsStatus === 'connected' ? 
                      <CloudDoneIcon sx={{ color: '#4caf50' }} /> : 
                      <CloudOffIcon sx={{ color: '#f44336' }} />
                    }
                  </Box>
                </Badge>
              </Box>
            </Tooltip>
          </Box>
        </div>
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 4,
            alignItems: 'center',
            justifyContent: 'center',
            px: 2,
            py: 1,
            borderRadius: 2,
            backgroundColor: 'rgba(254, 59, 212, 0.03)',
            border: '1px solid rgba(254, 59, 212, 0.1)',
          }}
        >
          <FormControl 
            variant="outlined" 
            size="small"
            fullWidth
            sx={{ 
              minWidth: 150,
              '& .MuiOutlinedInput-root': {
                '&.Mui-focused fieldset': {
                  borderColor: '#fe3bd4',
                },
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: '#fe3bd4',
              }
            }}
          >
            <InputLabel id="meal-type-label">Meal Type</InputLabel>
            <Select
              labelId="meal-type-label"
              id="meal-type"
              value={selectedMealType}
              onChange={(e) => setSelectedMealType(e.target.value)}
              label="Meal Type"
              startAdornment={
                <RestaurantIcon sx={{ mr: 1, color: selectedMealType ? '#fe3bd4' : 'inherit' }} />
              }
            >
              <MenuItem value="">
                <em>Any</em>
              </MenuItem>
              {mealTypes.map((meal) => (
                <MenuItem key={meal} value={meal}>
                  {meal}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
            
          <FormControl 
            variant="outlined" 
            size="small"
            fullWidth
            sx={{ 
              minWidth: 180,
              '& .MuiOutlinedInput-root': {
                '&.Mui-focused fieldset': {
                  borderColor: '#fe3bd4',
                },
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: '#fe3bd4',
              }
            }}
          >
            <InputLabel id="dietary-preference-label">Dietary Preference</InputLabel>
            <Select
              labelId="dietary-preference-label"
              id="dietary-preference"
              value={selectedDietaryPreference}
              onChange={(e) => setSelectedDietaryPreference(e.target.value)}
              label="Dietary Preference"
              startAdornment={
                <LocalDiningIcon sx={{ mr: 1, color: selectedDietaryPreference ? '#fe3bd4' : 'inherit' }} />
              }
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {dietaryPreferences.map((preference) => (
                <MenuItem key={preference} value={preference}>
                  {preference}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <div className="chat-box">
          {messages.length === 0 ? (
            <Box 
              display="flex" 
              justifyContent="center" 
              alignItems="center" 
              height="100%"
            >
              <Typography
                variant="h4"
                sx={{
                  color: '#666',
                  fontWeight: 900,
                  opacity: 0.8,
                  fontFamily: 'Quicksand, sans-serif',
                }}
              >
                How can I help you today?
              </Typography>
            </Box>
          ) : (
            <>
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`message-group ${
                    message.sender === 'user' ? 'message-group-user' : 'message-group-bot'
                  }`}
                >
                  {/* Image message */}
                  {message.image && (
                    <div className="message message-image-container">
                      <img 
                        src={message.image} 
                        alt="User uploaded"
                        className="message-image" 
                      />
                    </div>
                  )}

                  {/* Only show text div if there's text or it's not a recipe-only message */}
                  {(message.text && !message.recipeOnly) && (
                    <div className="message">
                      {message.sender === 'bot' ? (
                        <ReactMarkdown>{message.text}</ReactMarkdown>
                      ) : (
                        message.text
                      )}
                    </div>
                  )}
                  
                  {/* Recipe card within chat */}
                  {message.recipe && (
                    <div className={`message-recipe-container ${message.recipeOnly ? 'recipe-only' : ''}`}>
                      <div className="chat-recipe-card">
                        <RecipeCard 
                          recipe={message.recipe} 
                          onClick={handleChatRecipeClick} 
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* Add this new block for shop recipe confirmation */}
                  {message.shopRecipe && (
                    <div className="message-shop-recipe">
                      <ShopRecipeConfirmation
                        recipeData={message.shopRecipe}
                        onConfirm={handleShopRecipeConfirm}
                      />
                    </div>
                  )}
                </div>
              ))}
              {botTyping && (
                <div className="message-group message-group-bot">
                  <div className="message typing-indicator">
                  <div class="loading"> 
                    <svg width="16px" height="12px">
                      <polyline id="back" points="1 6 4 6 6 11 10 1 12 6 15 6"></polyline>
                      <polyline id="front" points="1 6 4 6 6 11 10 1 12 6 15 6"></polyline>
                    </svg>
                  </div>
                  </div>
                </div>
              )}
              {cartActionInProgress && (
                <div className="message-group message-group-bot">
                  <div className="message">
                    <Typography sx={{ fontStyle: 'italic' }}>
                      Adding item to cart...
                    </Typography>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        {selectedImage && (
          <div className="preview-container">
            <div className="image-preview">
              <img src={selectedImage.preview} alt="Preview" />
              <button 
                onClick={() => setSelectedImage(null)}
                className="remove-image"
              >
                ×
              </button>
            </div>
          </div>
        )}

        <div className="input-container">
          <input
            type="text"
            placeholder="Type a message or use voice input..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={wsStatus !== 'connected'}
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            ref={fileInputRef}
            style={{ display: 'none' }}
          />
          <button 
            onClick={() => fileInputRef.current.click()}
            className="upload-button"
            disabled={wsStatus !== 'connected'}
          >
            <ImageIcon />
          </button>
          <button onClick={handleVoiceInput} className="voice-button">
            {listening ? (
              <div className="listening-indicator">
                <StopIcon />
                <div className="bars">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="bar"
                      ref={(el) => (barsRef.current[i] = el)}
                    ></div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="listening-indicator">
                <MicIcon />
              </div>
            )}
          </button>
          <button 
            onClick={handleSend}
            disabled={wsStatus !== 'connected'}
          >
            <ArrowUpwardIcon />
          </button>
        </div>
      </div>
      {/* {showRecipeModal && (
        <AddRecipe
          open={showRecipeModal}
          handleClose={() => setShowRecipeModal(false)}
          recipe={gumboRecipe}
        />
      )} */}
      {isRecipeModalOpen && selectedViewRecipe && (
        <AddRecipe
          open={isRecipeModalOpen}
          handleClose={() => setIsRecipeModalOpen(false)}
          recipe={selectedViewRecipe}
        />
      )}
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setError(null)} severity="error">
          {error}
        </Alert>
      </Snackbar>
      <Footer />
    </div>
  );
};

export default ChatUI;