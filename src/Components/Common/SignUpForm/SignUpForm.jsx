import React from "react";
import axios from "axios";
import { useState } from "react";
import { toast } from 'react-toastify';
import "./SignUpForm.css";

function SignUpForm({ toggleSignState }) {
  const [state, setState] = useState({
    fName: "",
    lName: "",
    cPhone: "",
    cEmail: "",
    password: "",
  });

  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (evt) => {
    const value = evt.target.value;
    setState({
      ...state,
      [evt.target.name]: value,
    });
  };

  const handleOnSubmit = (evt) => {
    evt.preventDefault();

    const { fName, lName, cPhone, cEmail, password } = state;
    alert(
      `You are signing up with First Name: ${fName}, Last Name: ${lName}, Phone Number: ${cPhone}, Email: ${cEmail}`
    );

    setState({
      fName: "",
      lName: "",
      cPhone: "",
      cEmail: "",
      password: "",
    });
  };

  const HandleSignUp = (evt) => {
    evt.preventDefault();
    submitsignupForm();
  };

  const submitsignupForm = async () => {
    try {
      // Making a POST request using axios
      const response = await axios.post(
        `${import.meta.env.VITE_REACT_APP_API_URL}/register/customer`,
        state,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Updating the state with the response data
      setResponse(response.data);
      setError(null);
      toast.success('Account created successfully!', {
        position: "bottom-left",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
      toggleSignState("signIn");
      setState({
        fName: "",
        lName: "",
        cPhone: "",
        cEmail: "",
        password: "",
      });
    } catch (error) {
      // Handling errors
      setResponse(null);
      setError("Error posting data");
      toast.error('Error creating account. Please try again.', {
        position: "bottom-left",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
      console.error("Error posting data:", error);
    }
  };

  return (
    <div className="form-container sign-up-container">
      <form onSubmit={HandleSignUp}>
        <h1>Create Account</h1>
        <div className="social-container">
          <a href="#" className="social">
            <i className="fa fa-facebook-f" />
          </a>
          <a href="#" className="social">
            <i className="fa fa-google" />
          </a>
          <a href="#" className="social">
            <i className="fa fa-envelope-o" />
          </a>
        </div>
        <span>or use your email for registration</span>
        <div className="name-row">
          <input
            className="login_input"
            type="text"
            name="fName"
            value={state.fName}
            onChange={handleChange}
            placeholder="First Name"
            required
          />
          <input
            className="login_input"
            type="text"
            name="lName"
            value={state.lName}
            onChange={handleChange}
            placeholder="Last Name"
            required
          />
        </div>
        <input
          className="login_input"
          type="text"
          name="cPhone"
          value={state.cPhone}
          onChange={handleChange}
          placeholder="Phone Number"
          required
        />
        <input
          className="login_input"
          type="email"
          name="cEmail"
          value={state.cEmail}
          onChange={handleChange}
          placeholder="Email"
          required
        />
        <input
          className="login_input"
          type="password"
          name="password"
          value={state.password}
          onChange={handleChange}
          placeholder="Password"
          required
        />
        <p className="mobile_toggle">
          Already have an account?
          <a href="#" onClick={() => toggleSignState("signIn")}>
            Sign In
          </a>
        </p>
        <button className="button-77">Sign Up</button>
      </form>
    </div>
  );
}

export default SignUpForm;