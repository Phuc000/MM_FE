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
        
        // Set botTyping to false when response is received
        setBotTyping(false);
        
        if (data.error) {
          console.error('WebSocket error:', data.error);
          setError(data.error);
          return;
        }

        console.log('WebSocket Message:', data);

        // Add bot's message
        setMessages(prev => [...prev, { 
          sender: 'bot', 
          text: data.message,
          // Add recipe if it exists in the action
          recipe: data.actions?.find(action => action.action === 'view_recipe')?.recipe_id ? null : null // Will be populated below
        }]);

        // Process any actions
        if (data.actions && data.actions.length > 0) {
          for (const action of data.actions) {
            console.log('Processing action:', action);
            if (action.action === 'add_to_cart') {
              await handleCartAction(action);
            }
            else if (action.action === 'view_recipe') {
              // Handle view recipe action
              const recipeData = await handleViewRecipe(action.recipe_id);
              if (recipeData) {
                // Add recipe to the last message
                setMessages(prev => {
                  const newMessages = [...prev];
                  const lastMessage = newMessages[newMessages.length - 1];
                  newMessages[newMessages.length - 1] = {
                    ...lastMessage,
                    recipe: recipeData
                  };
                  return newMessages;
                });
              }
            }
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