import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { addToCart } from '../Components/utils/cartUtils';


export const useWebSocket = (userId, locationContext) => {
  const [wsStatus, setWsStatus] = useState('disconnected');
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState(null);
  const [cartActionInProgress, setCartActionInProgress] = useState(false);
  const wsRef = useRef(null);
  const location = useLocation();
  const isOnChatPage = location.pathname === '/Chat';

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
        
        if (data.error) {
          console.error('WebSocket error:', data.error);
          setError(data.error);
          return;
        }

        console.log('WebSocket Message:', data);

        // Add bot's message
        setMessages(prev => [...prev, { 
          sender: 'bot', 
          text: data.message 
        }]);

        // Process any actions
        if (data.actions && data.actions.length > 0) {
          for (const action of data.actions) {
            if (action.action === 'add_to_cart') {
              await handleCartAction(action);
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
    cartActionInProgress 
  };
};