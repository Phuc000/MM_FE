import React, { useState, useEffect } from 'react';
import './InfoForm.scss';

const InfoForm = ({ title = "Billing Details", userData, setUserData }) => {
  const [formValues, setFormValues] = useState({
    fName: '',
    lName: '',
    address: '',
    phoneNumber: '',
    email: '',
    // Add other fields as needed
  });

  useEffect(() => {
    if (userData) {
      setFormValues({
        fName: userData.fName || '',
        lName: userData.lName || '',
        address: userData.address || '',
        phoneNumber: userData.phoneNumber || '',
        email: userData.email || '',
        // Add other fields as needed
      });
    }
  }, [userData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value,
    });

    // Update parent component's state if necessary
    if (setUserData) {
      setUserData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  return (
    <div className="billing-details">
      <h2>{title}</h2>
      <form className="billing-form">
        <div className="form-row">
          <div className="form-group">
            <input
              type="text"
              name="fName"
              placeholder="First name *"
              value={formValues.fName}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="text"
              name="lName"
              placeholder="Last name *"
              value={formValues.lName}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <input
              type="text"
              name="address"
              placeholder="Address *"
              value={formValues.address}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>
        {/* Continue for other fields */}
        <div className="form-row">
          <div className="form-group">
          <select name="country" value={formValues.country || 'vietnam'} onChange={handleInputChange} required>
            <option value="">Country *</option>
            <option value="vietnam">Vietnam</option>
          </select>
          </div>
          <div className="form-group">
            <input type="text" placeholder="City / Town *" defaultValue={''} required />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <input type="text" placeholder="Postcode / ZIP" defaultValue={''} required />
          </div>
          <div className="form-group">
            <input
              type="text"
              name="phoneNumber"
              placeholder="Phone *"
              value={formValues.phoneNumber}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>
        <div className='form-row'>
          <div className="form-group">
            <input
              type="email"
              name="email"
              placeholder="Email address *"
              value={formValues.email}
              onChange={handleInputChange}
              required
              disabled // Disable email field if you don't want it to be editable
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <textarea placeholder="Additional information"></textarea>
          </div>
        </div>
      </form>
    </div>
  );
};

export default InfoForm;