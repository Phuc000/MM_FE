import { useTimer } from "../../Context/TimerContext";
const Timer = () => {
  const { timeLeft, isModalOpen, closeModal } = useTimer();

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  return (
    <div>
      <div
        style={{
          visibility: timeLeft ? 'visible' : 'hidden',
          position: 'absolute',
          top: '10px',
          right: '10px',
          backgroundColor: 'black',
          color: 'white',
          padding: '10px',
          borderRadius: '5px',
        }}
      >
        {formatTime(timeLeft)}
      </div>
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', textAlign: 'center' }}>
            <h2>Your checkout cart is expired.</h2>
            <button onClick={closeModal} style={{ marginTop: '10px', padding: '10px 20px', border: 'none', backgroundColor: 'blue', color: 'white', borderRadius: '5px', cursor: 'pointer' }}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Timer;