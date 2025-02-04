import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

export const useWebSocket = (userId) => {
  const [wsStatus, setWsStatus] = useState('disconnected');
  const [messages, setMessages] = useState([]);
  const wsRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    let isSubscribed = true;

    const connectWebSocket = () => {
      // Only connect on Chat page
      if (location.pathname !== '/Chat' || !userId) return;
      
      if (wsRef.current?.readyState === WebSocket.OPEN) return;
      
      const ws = new WebSocket(`ws://localhost:6969/ws/chat/${userId}`);
      
      ws.onopen = () => {
        if (!isSubscribed) return;
        console.log('WebSocket Connected');
        setWsStatus('connected');
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.error) {
          console.error('WebSocket error:', data.error);
          return;
        }
        setMessages(prev => [...prev, { sender: 'bot', text: data.message }]);
      };

      ws.onclose = () => {
        if (location.pathname === '/Chat') {
          console.log('WebSocket Disconnected');
          setWsStatus('disconnected');
          setTimeout(connectWebSocket, 3000);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket Error:', error);
        setWsStatus('error');
      };

      wsRef.current = ws;
    };

    connectWebSocket();

    return () => {
      isSubscribed = false;
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [userId, location.pathname]);

  return { wsStatus, messages, wsRef, setMessages };
};