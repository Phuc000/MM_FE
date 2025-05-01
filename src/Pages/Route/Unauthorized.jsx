import { Link } from 'react-router-dom';

const Unauthorized = () => {
  return (
    <div
      style={{
        padding: '40px',
        textAlign: 'center',
        backgroundColor: '#f8f8f8',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <h2 style={{ color: '#d32f2f' }}>Access Denied</h2>
      <p style={{ fontSize: '1.2em', marginBottom: '20px' }}>
        You do not have the required permissions to view this page.
      </p>
      <Link
        to="/"
        style={{
          padding: '10px 20px',
          backgroundColor: '#1976d2',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '5px',
          display: 'inline-block',
        }}
      >
        Go to Home
      </Link>
    </div>
  );
};

export default Unauthorized;