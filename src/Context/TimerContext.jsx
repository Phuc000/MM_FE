import React, { createContext, useState, useContext } from 'react';

const TimerContext = createContext();

export const TimerProvider = ({ children }) => {
  const [refreshKey, setRefreshKey] = useState(0);

  const refreshTimer = () => {
    setRefreshKey((prevKey) => prevKey + 1);
  };

  return (
    <TimerContext.Provider value={{ refreshKey, refreshTimer }}>
      {children}
    </TimerContext.Provider>
  );
};

export const useTimer = () => useContext(TimerContext);
