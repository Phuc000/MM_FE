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

  useEffect(() => {
    const responseText = `How about a flavorful Pork Loin with Roasted Vegetables? It's a healthy and satisfying meal.

**Ingredients:**

* **Fresh Ingredients (Prioritized):**
    * Pork Loin (from our selection)
    * Carrots (fresh)
    * Broccoli (fresh)
    * Bell Peppers (fresh, any color you prefer)
    * Tomatoes (fresh)

* **Pantry Ingredients:**
    * Black Pepper (ground)
    * Paprika
    * Turmeric
    * Cumin
    * Soy Sauce
    * Olive Oil (if you have some, otherwise a neutral oil will do)


**Recipe:**

1. **Prep the Pork Loin:** Pat the pork loin dry with paper towels. Mix the black pepper, paprika, turmeric, cumin, and a splash of soy sauce in a small bowl to create a rub. Rub this mixture all over the pork loin.
2. **Prep the Vegetables:** Chop the carrots, broccoli, bell peppers, and tomatoes into bite-sized pieces. Toss them with a drizzle of olive oil, salt, and pepper.
3. **Roast:** Preheat your oven to 400°F (200°C). Place the pork loin in a roasting pan and arrange the vegetables around it.
4. **Cook:** Roast for approximately 45-60 minutes, or until the pork loin reaches an internal temperature of 145°F (63°C) and the vegetables are tender.
5. **Rest & Serve:** Remove the pork loin from the oven and let it rest for 10 minutes before slicing. This allows the juices to redistribute, making it more tender. Serve the sliced pork loin with the roasted vegetables.

You can find all the fresh ingredients and spices for this recipe on our website. Let me know if you have any questions or want to explore other dinner options!`;

  console.log('Response text:', responseText);

    // Extract ingredients from the response text
  const ingredients = extractIngredients(responseText);
    console.log('Ingredients:', ingredients);
    try {
      // Make the API request to get product details
      const apiResponse = axios.post(`${import.meta.env.VITE_REACT_APP_API_URL}/products/chatbot`, 
        ingredients
      );
      console.log('API response:', apiResponse.data);
      const products = apiResponse.data; // Assume API returns an array of products

      
    } catch (error) {
      console.error('Error fetching product data:', error);
      // Handle error appropriately
    }

  }, []);

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
              const linkText = `[${ingredient}](/BuyProduct/${productId})`;
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