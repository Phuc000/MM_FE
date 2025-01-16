import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const TimerContext = createContext();

export const TimerProvider = ({ children }) => {
  const [timeLeft, setTimeLeft] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchTimeLeft = async (customerId) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_REACT_APP_API_URL}/cart/cart-timer/${customerId}`
      );
      if (response.data) setTimeLeft(response.data);
    } catch (error) {
      console.error('Error fetching cart timer:', error);
      setTimeLeft(0);
    }
  };

  useEffect(() => {
    if (timeLeft === null) return;

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime > 0) {
          return prevTime - 1;
        } else {
          clearInterval(timer);
          setIsModalOpen(true);
          return 0;
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeLeft(null);
  };

  return (
    <TimerContext.Provider value={{ timeLeft, setTimeLeft, isModalOpen, closeModal, fetchTimeLeft }}>
      {children}
    </TimerContext.Provider>
  );
};

export const useTimer = () => useContext(TimerContext);
