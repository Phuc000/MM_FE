// src/Pages/ChatPage/ChatPage.jsx

import React, { useState } from 'react';
import { Header, Footer } from '../../Components';
import ReactMarkdown from 'react-markdown';
import runChat from '../../config/gemini';
import axios from 'axios';
import './ChatPage.css';

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
            placeholder="Type a message..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button onClick={handleSend}>Send</button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ChatUI;