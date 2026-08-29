import React, { useState, useEffect } from "react";
import InfoForm from "../InfoForm/InfoForm";
import axios from "axios";
import { useAuth } from "../../../hooks/useAuth";
import { toast } from "react-toastify";
import "./AccountDetail.scss";

const AccountDetails = () => {
  const { user, login } = useAuth();
  const [userData, setUserData] = useState(null);
  const [buttonClass, setButtonClass] = useState("");

  useEffect(() => {
    if (user) {
      setUserData({
        fName: user.fName || "",
        lName: user.lName || "",
        address: user.address || "",
        phoneNumber: user.phoneNumber || "",
        email: user.email || "",
        // Add other fields as needed
      });
    }
  }, [user]);

  const saveUserDetails = async () => {
    console.log("Saving user details...");
    setButtonClass("onclic");
    try {
      const response = await axios.patch(
        `${import.meta.env.VITE_REACT_APP_API_URL}/customers/${user.id}`,
        {
          fName: userData.fName,
          lName: userData.lName,
          address: userData.address,
          cPhone: userData.phoneNumber,
          // Include other fields if necessary
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        },
      );

      // Update the user data in context if needed
      if (response.status === 200) {
        // Update user in context
        login({
          ...user,
          fName: userData.fName,
          lName: userData.lName,
          address: userData.address,
          phoneNumber: userData.phoneNumber,
          // Update other fields as needed
        });
        setTimeout(() => {
          setButtonClass("validate");
          setTimeout(() => {
            setButtonClass("");
            toast.success("Account details saved successfully!", {
              position: "bottom-left",
              autoClose: 3000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
            });
          }, 1250);
        }, 2250);
      }
    } catch (error) {
      console.error("Error saving user details:", error);
      // Handle error, display message to user, etc.
      setButtonClass("");
    }
  };

  return (
    <div className="account_details_wrapper">
      <InfoForm title="Account Details" userData={userData} setUserData={setUserData} />
      {/* Save button */}
      <button
        id="save-info-button"
        className={`save-info ${buttonClass}`}
        onClick={saveUserDetails}
      ></button>
    </div>
  );
};

export default AccountDetails;
