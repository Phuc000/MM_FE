// src/Login.jsx
import { useEffect, useState } from "react";
import { Header, Footer, SignInForm, SignUpForm } from "../../Components";
import "./Login.css";

const Login = () => {
  const [type, setType] = useState("signIn");

  const containerClass = "cred-box-container " + (type === "signUp" ? "right-panel-active" : "");

  useEffect(() => {
    console.log("Type changed to:", type);
  }, [type]);

  const toggleSignState = (text) => {
    if (text !== type) {
      setType(text);
    }
  };

  return (
    <div className="login">
      <Header />
      {/* <div>
        <br />
      </div> */}
      <div className="login-content">
        <div className={containerClass} id="container">
          <SignUpForm toggleSignState={toggleSignState} />
          <SignInForm toggleSignState={toggleSignState} />
          <div className="overlay-container">
            <div className="overlay">
              <div className="overlay-panel overlay-left">
                <h1>Welcome Back!</h1>
                <p>To keep connected with us please login with your personal info</p>
                <button
                  className="ghost-button"
                  id="signIn"
                  onClick={() => toggleSignState("signIn")}
                >
                  Sign In
                </button>
              </div>
              <div className="overlay-panel overlay-right">
                <h1>Hello, Friend!</h1>
                <p>Enter your personal details and start your journey with us</p>
                <button
                  className="ghost-button"
                  id="signUp"
                  onClick={() => toggleSignState("signUp")}
                >
                  Sign Up
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* <div>
        <br />
        <br />
      </div> */}
      <Footer />
    </div>
  );
};

export default Login;
