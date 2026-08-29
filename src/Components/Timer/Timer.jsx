import { useEffect, useState } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import { useTimer } from "../../Context/TimerContext";

export const fetchTimeLeft = async (customerId) => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_REACT_APP_API_URL}/cart/cart-timer/${customerId}`,
    );
    console.log("Time left", response.data);
    return response.data; // Return the remaining time in seconds
  } catch (error) {
    console.error("Error fetching cart timer:", error);
    return null; // Default to 0 if an error occurs
  }
};

const Timer = ({ customerId }) => {
  const [timeLeft, setTimeLeft] = useState(null);
  const { refreshKey } = useTimer();
  const [isModalOpen, setIsModalOpen] = useState(false); // State to control the modal visibility

  useEffect(() => {
    const getTimeLeft = async () => {
      const time = await fetchTimeLeft(customerId);
      if (time === "") {
        setTimeLeft(null);
        return;
      } // Handle the error case
      setTimeLeft(time);
    };
    getTimeLeft();
  }, [customerId, refreshKey]);

  useEffect(() => {
    if (timeLeft === null) return; // Wait until timeLeft is initialized

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime > 0) {
          return prevTime - 1;
        } else {
          clearInterval(timer); // Stop the timer when it reaches 0
          setIsModalOpen(true); // Open the modal
          return 0;
        }
      });
    }, 1000);

    return () => clearInterval(timer); // Cleanup the interval on component unmount
  }, [timeLeft]);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeLeft(null);
    // Perform additional actions when the modal is closed, like redirecting
  };

  return (
    <div>
      <div
        style={{
          ...styles.timerContainer, // Spread the existing styles
          visibility: timeLeft ? "visible" : "hidden", // Conditional visibility
        }}
      >
        {formatTime(timeLeft)}
      </div>
      {isModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h2>Your checkout cart is expired.</h2>
            <button onClick={closeModal} style={styles.closeButton}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

Timer.propTypes = {
  customerId: PropTypes.string,
};

const isSmallScreen = window.innerWidth <= 480;

// Example styles for the modal and timer
const styles = {
  timerContainer: {
    position: "fixed",
    top: isSmallScreen ? "140px" : "30px",
    right: "10px",
    backgroundColor: "black",
    color: "white",
    padding: "10px",
    borderRadius: "5px",
    zIndex: 1000,
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "10px",
    textAlign: "center",
  },
  closeButton: {
    marginTop: "10px",
    padding: "10px 20px",
    border: "none",
    backgroundColor: "blue",
    color: "white",
    borderRadius: "5px",
    cursor: "pointer",
  },
};
export default Timer;
