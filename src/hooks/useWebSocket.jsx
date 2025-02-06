import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

export const useWebSocket = (userId) => {
  const [wsStatus, setWsStatus] = useState('disconnected');
  const [messages, setMessages] = useState([]);
  const wsRef = useRef(null);
  const location = useLocation();
  const isOnChatPage = location.pathname === '/Chat';

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

      ws.onmessage = (event) => {
        if (!isSubscribed || !isOnChatPage) return;
        const data = JSON.parse(event.data);
        if (data.error) {
          console.error('WebSocket error:', data.error);
          return;
        }
        setMessages(prev => [...prev, { sender: 'bot', text: data.message }]);
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

  return { wsStatus, messages, wsRef, setMessages };
};