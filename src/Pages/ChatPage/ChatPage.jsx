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

import { Typography, Box } from '@mui/material';

import { useAuth } from '../../hooks/useAuth';
import { useWebSocket } from '../../hooks/useWebSocket';
import AddRecipe from '../../Components/Common/AddRecipe';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

// Hardcoded product list (same as in Header.jsx)
const products = [
  'Tomato Pasta Sauce', 'Crab Legs', 'Pork Belly', 'Pork Loin', 'Pork Chops',
  'Pork Ribs', 'Ground Pork', 'Ground Beef', 'Beef Brisket', 'Beef Ribeye',
  'Beef Tenderloin', 'Beef Stew Meat', 'Salmon Fillet', 'Shrimp', 'Scallops',
  'Cod', 'Whole Milk', 'Skim Milk', 'Almond Milk', 'Oranges', 'Soy Milk',
  'Coconut Milk', 'Black Pepper', 'Cinnamon', 'Paprika', 'Turmeric', 'Cumin',
  'Spinach', 'Carrots', 'Broccoli', 'Bell Peppers', 'Tomatoes', 'Tomato Sauce',
  'Soy Sauce', 'Hot Sauce', 'BBQ Sauce', 'Fish Sauce', 'Bananas', 'Grapes',
  'Strawberries', 'Quinoa', 'Barley', 'Oats', 'Wheat Flour', 'Apples', 'Rice',
];

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
  const { user } = useAuth();
  const [userInput, setUserInput] = useState('');
  const { wsStatus, messages, wsRef, setMessages } = useWebSocket(user?.id);

  const [selectedMealType, setSelectedMealType] = useState('');
  const [selectedDietaryPreference, setSelectedDietaryPreference] = useState('');

  // Add state for image
  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef(null);
  const [error, setError] = useState('');

  // voice chat function
  const [listening, setListening] = useState(false);

  // Refs for audio processing
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const sourceRef = useRef(null);
  const rafIdRef = useRef(null);
  const barsRef = useRef([]);

  const handleVoiceInput = async () => {
    if (listening) {
      recognition.stop();
      setListening(false);

      // Stop audio processing
      cancelAnimationFrame(rafIdRef.current);
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    } else {
      recognition.start();
      setListening(true);

      // Set up audio context for visualization
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        analyserRef.current = audioContextRef.current.createAnalyser();
        sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
        sourceRef.current.connect(analyserRef.current);
        analyserRef.current.fftSize = 2048;
        const bufferLength = analyserRef.current.fftSize;
        dataArrayRef.current = new Uint8Array(bufferLength);

        visualizeAudio();
      } catch (err) {
        console.error('Microphone access error:', err);
      }
    }

    recognition.onresult = (event) => {
      const voiceInput = event.results[0][0].transcript;
      setUserInput(voiceInput);
    };

    recognition.onerror = (event) => {
      console.error('Voice recognition error:', event.error);
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);

      // Stop audio processing
      cancelAnimationFrame(rafIdRef.current);
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  };

  const visualizeAudio = () => {
    rafIdRef.current = requestAnimationFrame(visualizeAudio);

    analyserRef.current.getByteTimeDomainData(dataArrayRef.current);

    // Update the bars based on time-domain data
    if (barsRef.current.length > 0) {
      const step = Math.floor(dataArrayRef.current.length / barsRef.current.length);
      for (let i = 0; i < barsRef.current.length; i++) {
        let sum = 0;
        for (let j = 0; j < step; j++) {
          const value = dataArrayRef.current[i * step + j] - 128; // Center wave around zero
          sum += Math.abs(value);
        }
        const average = sum / step;
        let barHeight = (average / 128) * 160 + 2; // Scale to desired height
        if (barHeight > 24) {
          barHeight = 24;
        }
        if (barsRef.current[i]) {
          barsRef.current[i].style.height = `${barHeight}px`;
        }
      }
    }
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

    // Send via WebSocket
    wsRef.current.send(JSON.stringify(message));
  };

  // const handleSend = async () => {
  //   if (!userInput.trim()) return;

  //   // Build the final message to send, including selected options
  //   let finalUserInput = userInput;
  //   if (selectedMealType) {
  //     finalUserInput = `Meal Type: ${selectedMealType}\n${finalUserInput}`;
  //   }
  //   if (selectedDietaryPreference) {
  //     finalUserInput = `Dietary Preference: ${selectedDietaryPreference}\n${finalUserInput}`;
  //   }

  //   const newMessage = { sender: 'user', text: userInput };
  //   setMessages([...messages, newMessage]);
  //   setUserInput('');

  //   try {
  //     const responseText = await runChat(finalUserInput);

  //     let processedText = responseText;

  //     // Find ingredients mentioned in the response
  //     const ingredients = products.filter((product) =>
  //       processedText.toLowerCase().includes(product.toLowerCase())
  //     );

  //     if (ingredients.length > 0) {
  //       try {
  //         // Fetch product details using the ingredients
  //         const apiResponse = await axios.post(
  //           `${import.meta.env.VITE_REACT_APP_API_URL}/products/chatbot`,
  //           ingredients,
  //           {
  //             headers: {
  //               'Content-Type': 'application/json',
  //             },
  //           }
  //         );

  //         const productsData = apiResponse.data; // Array of product details

  //         // Map product names to product IDs
  //         const productMap = {};
  //         productsData.forEach((product) => {
  //           productMap[product.pName.toLowerCase()] = product.productID;
  //         });

  //         // Replace ingredient names with links in the response text
  //         ingredients.forEach((ingredient) => {
  //           const productId = productMap[ingredient.toLowerCase()];
  //           if (productId) {
  //             const linkText = `[${ingredient}](/buy-product/${productId}/null)`;

  //             // Escape special regex characters
  //             const escapedIngredient = escapeRegExp(ingredient);

  //             // Replace all occurrences of the ingredient (case-insensitive)
  //             const regex = new RegExp(`\\b${escapedIngredient}\\b`, 'gi');
  //             processedText = processedText.replace(regex, linkText);
  //           }
  //         });
  //       } catch (error) {
  //         console.error('Error fetching product data:', error);
  //         // Handle error appropriately
  //       }
  //     }

  //     const responseMessage = { sender: 'bot', text: processedText };
  //     setMessages((prevMessages) => [...prevMessages, responseMessage]);
  //   } catch (error) {
  //     console.error('Error:', error);
  //     // Handle error appropriately
  //   }
  // };

  // Function to escape special characters in a string for regex
  const escapeRegExp = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  const [showRecipeModal, setShowRecipeModal] = useState(false);

  return (
    <div>
      <Header />
      <div className="chat-container">
        <h1>IUFC Chat</h1>
        <div className="connection-status" style={{
          color: wsStatus === 'connected' ? 'green' : 'red'
        }}>
          {wsStatus === 'connected' ? 'Connected' : 'Disconnected'}
        </div>
        <div className="options-container">
          <div className="meal-type-selector">
            <label htmlFor="meal-type">Meal Type:</label>
            <select
              id="meal-type"
              value={selectedMealType}
              onChange={(e) => setSelectedMealType(e.target.value)}
            >
              <option value="">Any</option>
              {mealTypes.map((meal) => (
                <option key={meal} value={meal}>
                  {meal}
                </option>
              ))}
            </select>
          </div>
          <div className="dietary-preference-selector">
            <label htmlFor="dietary-preference">Dietary Preference:</label>
            <select
              id="dietary-preference"
              value={selectedDietaryPreference}
              onChange={(e) => setSelectedDietaryPreference(e.target.value)}
            >
              <option value="">None</option>
              {dietaryPreferences.map((preference) => (
                <option key={preference} value={preference}>
                  {preference}
                </option>
              ))}
            </select>
          </div>
        </div>
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
          messages.map((message, index) => (
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
              
              {/* Text message */}
              {message.text && (
                <div className="message">
                  {message.sender === 'bot' ? (
                    <ReactMarkdown>{message.text}</ReactMarkdown>
                  ) : (
                    message.text
                  )}
                </div>
              )}
            </div>
          ))
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
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setError('')} severity="error">
          {error}
        </Alert>
      </Snackbar>
      <Footer />
    </div>
  );
};

export default ChatUI;