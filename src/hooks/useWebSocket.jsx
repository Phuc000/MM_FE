import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { addToCart } from '../Components/utils/cartUtils';


export const useWebSocket = (userId, locationContext) => {
  const [wsStatus, setWsStatus] = useState('disconnected');
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState(null);
  const [cartActionInProgress, setCartActionInProgress] = useState(false);
  const [botTyping, setBotTyping] = useState(false);
  const wsRef = useRef(null);
  const location = useLocation();
  const isOnChatPage = location.pathname === '/Chat';

  const [recipe, setRecipe] = useState(null);

  const handleViewRecipe = async (recipeId) => {
    try {
      const response = await fetch('/assets/processed_recipes.json');
      const data = await response.json();
      const selectedRecipe = data.find((recipe) => recipe.id == recipeId);
      console.log('Selected Recipe:', selectedRecipe);
      setRecipe(selectedRecipe);
      return selectedRecipe;
    } catch (error) {
      console.error('Error fetching recipes:', error);
      return null;
    }
  };


  const handleCartAction = async (action) => {
    // if (!user || user.role !== 'Customer') {
    //   setError('Please log in as a customer to add items to cart');
    //   return;
    // }

    try {
      setCartActionInProgress(true);
      console.log('Processing cart action:', action);
      const success = await addToCart(userId, action.product.id, action.product.quantity, locationContext);
      
      if (success) {
        setMessages(prev => [...prev, {
          sender: 'bot',
          text: `✅ Successfully added product to your cart!`
        }]);
      }
    } catch (err) {
      console.error('Error processing cart action:', err);
      setError('Failed to add item to cart');
    } finally {
      setCartActionInProgress(false);
    }
  };

  useEffect(() => {
    let isSubscribed = true;
    let reconnectTimeout;

    const connectWebSocket = () => {
      // Only connect on Chat page
      if (!isOnChatPage || !userId) {
        console.log('Not connecting WebSocket - not on chat page or no user');
        return;
      }
      
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        console.log('WebSocket already connected');
        return;
      }
      
      console.log('Connecting WebSocket...');
      const ws = new WebSocket(`ws://localhost:6969/ws/chat/${userId}`);
      
      ws.onopen = () => {
        if (!isSubscribed) return;
        console.log('WebSocket Connected');
        setWsStatus('connected');
      };

      ws.onmessage = async (event) => {
        if (!isSubscribed || !isOnChatPage) return;
        const data = JSON.parse(event.data);
        console.log('WebSocket Message:', data);
        
        // Set botTyping to false when response is received
        setBotTyping(false);
        
        if (data.error) {
          console.error('WebSocket error:', data.error);
          setError(data.error);
          return;
        }

        // Count recipe actions to determine how to display them
        const recipeActions = data.actions?.filter(action => action.action === 'view_recipe') || [];
        const hasRecipes = recipeActions.length > 0;

        // First, add the text message without recipes
        setMessages(prev => [...prev, { 
          sender: 'bot', 
          text: data.message,
          // Don't set any recipes yet
        }]);

        // Process any actions
        if (data.actions && data.actions.length > 0) {
          const cartActions = data.actions.filter(action => action.action === 'add_to_cart');
          for (const action of cartActions) {
            await handleCartAction(action);
          }
          
          // Then handle recipe actions - fetch all recipe data first
          const recipePromises = recipeActions.map(action => 
            handleViewRecipe(action.recipe_id)
          );
          
          const recipes = await Promise.all(recipePromises);
          const validRecipes = recipes.filter(Boolean); // Remove any null results
          
          if (validRecipes.length > 0) {
            // Add each recipe as a separate message after the text
            validRecipes.forEach(recipeData => {
              setMessages(prev => [...prev, {
                sender: 'bot',
                recipeOnly: true, // Flag to indicate this is just a recipe with no text
                recipe: recipeData
              }]);
            });
          }
        }
      };

      ws.onclose = () => {
        console.log('WebSocket Closed');
        setWsStatus('disconnected');
        if (isOnChatPage && isSubscribed) {
          console.log('Scheduling reconnect...');
          reconnectTimeout = setTimeout(connectWebSocket, 3000);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket Error:', error);
        setWsStatus('error');
      };

      wsRef.current = ws;
    };

    if (isOnChatPage) {
      connectWebSocket();
    }

    return () => {
      console.log('Cleanup - Disconnecting WebSocket');
      isSubscribed = false;
      clearTimeout(reconnectTimeout);
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      setWsStatus('disconnected');
    };
  }, [userId, isOnChatPage]);

  return { 
    wsStatus, 
    messages, 
    wsRef, 
    setMessages, 
    error,
    setError,
    cartActionInProgress,
    botTyping,
    setBotTyping
  };
};