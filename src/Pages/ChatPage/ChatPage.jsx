// src/Pages/ChatPage/ChatPage.jsx

import React, { useState, useRef } from 'react';
import { Header, Footer } from '../../Components';
import ReactMarkdown from 'react-markdown';
import runChat from '../../config/gemini';
import axios from 'axios';
import './ChatPage.css';
import StopIcon from '@mui/icons-material/Stop';
import MicIcon from '@mui/icons-material/Mic';

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

const ChatUI = () => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [selectedMealType, setSelectedMealType] = useState('');
  const [selectedDietaryPreference, setSelectedDietaryPreference] = useState('');

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

  const handleSend = async () => {
    if (!userInput.trim()) return;

    // Build the final message to send, including selected options
    let finalUserInput = userInput;
    if (selectedMealType) {
      finalUserInput = `Meal Type: ${selectedMealType}\n${finalUserInput}`;
    }
    if (selectedDietaryPreference) {
      finalUserInput = `Dietary Preference: ${selectedDietaryPreference}\n${finalUserInput}`;
    }

    const newMessage = { sender: 'user', text: userInput };
    setMessages([...messages, newMessage]);
    setUserInput('');

    try {
      const responseText = await runChat(finalUserInput);

      let processedText = responseText;

      // Find ingredients mentioned in the response
      const ingredients = products.filter((product) =>
        processedText.toLowerCase().includes(product.toLowerCase())
      );

      if (ingredients.length > 0) {
        try {
          // Fetch product details using the ingredients
          const apiResponse = await axios.post(
            `${import.meta.env.VITE_REACT_APP_API_URL}/products/chatbot`,
            ingredients,
            {
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );

          const productsData = apiResponse.data; // Array of product details

          // Map product names to product IDs
          const productMap = {};
          productsData.forEach((product) => {
            productMap[product.pName.toLowerCase()] = product.productID;
          });

          // Replace ingredient names with links in the response text
          ingredients.forEach((ingredient) => {
            const productId = productMap[ingredient.toLowerCase()];
            if (productId) {
              const linkText = `[${ingredient}](/buy-product/${productId}/null)`;

              // Escape special regex characters
              const escapedIngredient = escapeRegExp(ingredient);

              // Replace all occurrences of the ingredient (case-insensitive)
              const regex = new RegExp(`\\b${escapedIngredient}\\b`, 'gi');
              processedText = processedText.replace(regex, linkText);
            }
          });
        } catch (error) {
          console.error('Error fetching product data:', error);
          // Handle error appropriately
        }
      }

      const responseMessage = { sender: 'bot', text: processedText };
      setMessages((prevMessages) => [...prevMessages, responseMessage]);
    } catch (error) {
      console.error('Error:', error);
      // Handle error appropriately
    }
  };

  // Function to escape special characters in a string for regex
  const escapeRegExp = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  return (
    <div>
      <Header />
      <div className="chat-container">
        <h1>IUFC Chat Bot</h1>
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
          {messages.map((message, index) => (
            <div
              key={index}
              className={`message ${
                message.sender === 'user' ? 'message-user' : 'message-bot'
              }`}
            >
              {message.sender === 'bot' ? (
                <ReactMarkdown>{message.text}</ReactMarkdown>
              ) : (
                message.text
              )}
            </div>
          ))}
        </div>
        <div className="input-container">
          <input
            type="text"
            placeholder="Type a message or use voice input..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button onClick={handleSend}>Send</button>
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
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ChatUI;