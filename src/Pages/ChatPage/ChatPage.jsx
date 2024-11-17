// src/Pages/ChatPage/ChatPage.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Header, Footer } from '../../Components';
import ReactMarkdown from 'react-markdown';
import runChat from '../../config/gemini';
import axios from 'axios';
import './ChatPage.css';

const ChatUI = () => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');

  const handleSend = async () => {
    if (!userInput.trim()) return;

    const newMessage = { sender: 'user', text: userInput };
    setMessages([...messages, newMessage]);
    setUserInput('');

    try {
      const responseText = await runChat(userInput);

      // Extract ingredients from the response text
      const ingredients = extractIngredients(responseText);

      let processedText = responseText;

      console.log('Ingredients:', ingredients);

      if (ingredients.length > 0) {
        try {
          // Make the API request to get product details
          const apiResponse = await axios.post(`${import.meta.env.VITE_REACT_APP_API_URL}/products/chatbot`, 
            ingredients
          );
          console.log('API response:', apiResponse.data);
          const products = apiResponse.data; // Assume API returns an array of products

          // Create a map of product names to product IDs
          const productMap = {};
          products.forEach((product) => {
            productMap[product.pName] = product.productID;
          });

          // Replace ingredient names with links in the response text
          ingredients.forEach((ingredient) => {
            const productId = productMap[ingredient];
            if (productId) {
              const linkText = `[${ingredient}](/BuyProduct/${productId}/null)`;
              // Replace the ingredient in the text with the link
              const regex = new RegExp(`\\b${ingredient}\\b`, 'g');
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

  const extractIngredients = (text) => {
    const ingredients = [];

    // Match the "**Ingredients:**" section
    const ingredientsSectionRegex = /\*\*Ingredients:\*\*\s*([\s\S]*?)\n\n/;
    const ingredientsSectionMatch = text.match(ingredientsSectionRegex);

    if (ingredientsSectionMatch) {
      const ingredientsSection = ingredientsSectionMatch[1];

      // Match all list items in the ingredients section
      const ingredientRegex = /^\s*[*-]\s*(?:\*\*.*\*\*\s*)?(.*)$/gm;
      let match;
      while ((match = ingredientRegex.exec(ingredientsSection)) !== null) {
        const ingredientLine = match[1].trim();

        console.log('Ingredient line:', ingredientLine);

        // Skip subheadings
        if (ingredientLine.startsWith('**')) continue;

        // Remove any text in parentheses or after commas
        const ingredientName = ingredientLine.split('(')[0].split(',')[0].trim();
        console.log('Ingredient name:', ingredientName);
        if (ingredientName) {
          ingredients.push(ingredientName);
        }
      }
    }

    // Remove duplicates
    return [...new Set(ingredients)];
  };

  return (
    <div>
      <Header />
      <div className="chat-container">
        <h1>IUFC Chat Bot</h1>
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