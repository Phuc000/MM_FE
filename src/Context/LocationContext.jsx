import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const LocationContext = createContext();

// Cache for coordinates to avoid repeated API calls
const coordinatesCache = new Map();

const getCoordinates = async (address) => {
  if (coordinatesCache.has(address)) {
    return coordinatesCache.get(address);
  }

  // some static address to avoid api call (for now)
  if (address === '102 Dương Bá Trạc, Phường 2, Quận 8, Thành phố Hồ Chí Minh') {
    const coords = {
      lat: 10.7442071,
      lon: 106.6889035
    };
    coordinatesCache.set(address, coords);
    return coords;
  }
  if (address === '23 Pasteur, Phường Nguyễn Thái Bình, Quận 1, Hồ Chí Minh, Việt Nam') {
    const coords = {
      lat: 10.780088517948807,
      lon: 106.69634554631084
    };
    coordinatesCache.set(address, coords);
    return coords;
  }
  if (address === '88 Đ. Tô Hiến Thành, Phường 15, Quận 10, Hồ Chí Minh, Việt Nam') {
    const coords = {
      lat: 10.778066018083416,
      lon: 106.66580020202629
    };
    coordinatesCache.set(address, coords);
    return coords;
  }
  if (address === '98 Võ Văn Tần, Phường 6, Quận 3, Thành phố Hồ Chí Minh') {
    const coords = {
      lat: 10.7758044,
      lon: 106.6893163
    };
    coordinatesCache.set(address, coords);
    return coords;
  }
  if (address === '45 Điện Biên Phủ, Phường 15, Quận Bình Thạnh, Thành phố Hồ Chí Minh') {
    const coords = {
      lat: 10.7950647,
      lon: 106.7012004
    };
    coordinatesCache.set(address, coords);
    return coords;
  }

  try {
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/search`,
      {
        params: {
          q: `${address}, Vietnam`,
          format: 'json',
          limit: 1
        }
      }
    );
    console.log('Geocoding response:', response.data);
    if (response.data && response.data[0]) {
      const coords = {
        lat: parseFloat(response.data[0].lat),
        lon: parseFloat(response.data[0].lon)
      };
      coordinatesCache.set(address, coords);
      return coords;
    }
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};

const calculateDistance = (coord1, coord2) => {
  const R = 6371;
  const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
  const dLon = (coord2.lon - coord1.lon) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(coord1.lat * Math.PI / 180) * Math.cos(coord2.lat * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

export const LocationProvider = ({ children }) => {
  const [location, setLocation] = useState(() => {
    const saved = localStorage.getItem('userLocation');
    return saved ? JSON.parse(saved) : null;
  });

  const [storeRankings, setStoreRankings] = useState(() => {
    const saved = localStorage.getItem('storeRankings');
    return saved ? JSON.parse(saved) : [];
  });

  // Save location to localStorage when it changes
  useEffect(() => {
    if (location) {
      localStorage.setItem('userLocation', JSON.stringify(location));
    } else {
      localStorage.removeItem('userLocation');
    }
  }, [location]);

  // Fetch and rank all stores when location changes
  useEffect(() => {
    const rankAllStores = async () => {
      if (!location) return;

      try {
        // Get user coordinates
        const userAddress = `${location.ward.name}, ${location.city.name}`;
        const userCoords = await getCoordinates(userAddress);
        if (!userCoords) return;

        // Fetch all stores
        const response = await axios.get(
          `${import.meta.env.VITE_REACT_APP_API_URL}/stores`,
          {
            headers: { 'Content-Type': 'application/json' },
            withCredentials: true,
          }
        );

        // Calculate distances for all stores
        const storesWithDistance = await Promise.all(
          response.data.map(async (store) => {
            const storeAddress = `${store.location}`;
            const storeCoords = await getCoordinates(storeAddress);
            // console.log('Store:', store.storeID, 'Coords:', storeCoords);
            // console.log('Store:', store.storeID, 'Store Adress:', storeAddress, 'Coords:', storeCoords);
            
            if (!storeCoords) return { ...store, distance: Infinity };
            
            const distance = calculateDistance(userCoords, storeCoords);
            return { 
              storeId: store.storeID,
              distance,
              data: store 
            };
          })
        );

        // Sort and cache rankings
        const rankings = storesWithDistance.sort((a, b) => a.distance - b.distance);
        setStoreRankings(rankings);
        localStorage.setItem('storeRankings', JSON.stringify(rankings));
      } catch (error) {
        console.error('Error ranking stores:', error);
      }
    };

    rankAllStores();
  }, [location]);

  // Get ranked stores by store IDs
  const getRankedStoresForProduct = (storeIds) => {
    if (!storeRankings.length) return [];
    
    return storeIds
      .map(id => storeRankings.find(store => store.storeId === id))
      .filter(Boolean)
      .sort((a, b) => a.distance - b.distance)
      .map(store => store.data);
  };

  return (
    <LocationContext.Provider 
      value={{ 
        location,
        setLocation,
        storeRankings,
        getRankedStoresForProduct
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocationContext = () => useContext(LocationContext);