// src/Pages/CheckOut/CheckOut.jsx
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom'; // Ensure this import is present
import { Header, Footer, Title, CartSummary, InfoForm } from '../../Components';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Paper, Stack, Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import '../Cart/Cart.css';
import './CheckOut.scss';
import { fetchTimeLeft } from '../../Components/Timer/Timer';
import { useTimer } from '../../Context/TimerContext';

const PromotionTicket = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  margin: theme.spacing(2, 0),
  position: 'relative',
  background: '#fff',
  '&::before, &::after': {
    content: '""',
    position: 'absolute',
    height: '20px',
    width: '20px',
    borderRadius: '50%',
    background: theme.palette.background.default,
    top: '50%',
    transform: 'translateY(-50%)',
  },
  '&::before': {
    left: '-10px',
  },
  '&::after': { right: '-10px' },
}));

const StyledTypography = styled(Typography)({
  fontFamily: "'Quicksand', sans-serif",
  fontWeight: 900,
});

const ContentBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
  borderRight: `2px dashed ${theme.palette.divider}`,
  paddingRight: theme.spacing(2),
  flex: 2,
}));

const DiscountBox = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  flex: 1,
}));

const CheckOut = () => {
  const [cart, setCart] = useState([]);
  const [selectedCustomerPromotion, setSelectedCustomerPromotion] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0); // Tracks current step

  const [totals, setTotals] = useState({ subtotal: 0, discountAmount: 0, temptotal: 0 });
  const amountDiscount = [];
  // const { fetchTimeLeft } = useTimer();

  const [formData, setFormData] = useState({
    fName: user?.fName || '',
    lName: user?.lName || '',
    address: user?.address || '',
    phoneNumber: user?.phoneNumber || '',
    email: user?.email || ''
  });

  const calculateTotals = (cartItems, promotion) => {
    let subtotal = 0;
    let discountAmount = 0;

    cartItems.forEach((item) => {
      const itemTotal = item.discountedPrice * item.quantity;
      subtotal += itemTotal;

      if (promotion.length !== 0) {
        promotion.forEach((promo, index) => {
          if (promo.product.productId === item.productID) {
            discountAmount += itemTotal * promo.discount;
            amountDiscount[index] = itemTotal * promo.discount;
          }
        });
      }
    });

    const temptotal = subtotal - discountAmount;
    setTotals({ subtotal, discountAmount, temptotal });
  };

  useEffect(() => {
    if (step === 0) {
      // First step: Check cart and fetch data
      const checkCart = async () => {
        try {
          const response = await axios.get(
            `${import.meta.env.VITE_REACT_APP_API_URL}/cart/checkout/${user.id}`
          );
          if (response.data === "false") {
            console.log('Cart is empty. Redirecting...');
            navigate('/Cart');
          } else {
            console.log('Fetching cart data...');
            const cartResponse = await axios.get(
              `${import.meta.env.VITE_REACT_APP_API_URL}/cart/checkout-cart/${user.id}`
            );
            setCart(cartResponse.data.cart.cartItems);
            setSelectedCustomerPromotion(cartResponse.data.promotions);
            calculateTotals(cartResponse.data.cart.cartItems, cartResponse.data.promotions);
            setStep(1); // Move to the next step
          }
        } catch (error) {
          console.error('Error checking cart:', error);
          navigate('/Cart');
        }
      };
      checkCart();
    }
  }, [step]);

  // useEffect(() => {
  //   if (user && user.role === 'Customer' && user.id) {
  //     fetchTimeLeft(user.id);
  //   }
  // }, [user.id]);

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('Cash');
  const [isProcessing, setIsProcessing] = useState(false);
  const [billPromotion, setBillPromotion] = useState(null);

  const location = useLocation();
  const hasProcessedCallbackRef = useRef(false);


  const handlePaymentMethodChange = (event) => {
    console.log('Selected payment method:', event.target.value);
    setSelectedPaymentMethod(event.target.value);
  };

  const { subtotal, temptotal } = totals;
  const shipping = subtotal > 50 ? 0 : 0; // Example: Free shipping over $50
  const estimate = "Ho Chi Minh city"; // Example: Estimate based on the shipping address

  const totalBeforeBillPromotion = temptotal + shipping;
  const [total, setTotal] = useState(totalBeforeBillPromotion);
  const [billDiscountAmount, setBillDiscountAmount] = useState(0);

  useEffect(() => {
    if (step === 1) {
      const fetchBillPromotion = async () => {
        try {
          const response = await axios.get(
            `${import.meta.env.VITE_REACT_APP_API_URL}/promotions/bill/price/${totalBeforeBillPromotion}`,
            {
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );
          setBillPromotion(response.data);
          const discount = totalBeforeBillPromotion * response.data.discount;
          setBillDiscountAmount(discount);
          setTotal(totalBeforeBillPromotion - discount);
        } catch (error) {
          if (error.response && error.response.status === 404) {
            setBillPromotion(null);
            setBillDiscountAmount(0);
            setTotal(totalBeforeBillPromotion);
          } else {
            console.error('Error fetching BillPromotion:', error);
          }
        }
      };

      if (totalBeforeBillPromotion > 0) {
        fetchBillPromotion();
        setStep(2);
      }
    }
  }, [totalBeforeBillPromotion, step]);

  const { refreshTimer } = useTimer();

  const handleBuyButtonClick = async () => {
    if (isProcessing) return;

    // Validate required address
    if (!formData.address) {
      toast.error('Please provide a shipping address.', {
        position: 'bottom-left',
        autoClose: 5000,
        hideProgressBar: false,
        theme: 'colored',
      });
      return;
    }

    setIsProcessing(true);
  
    try {
      if (!user || user.role !== 'Customer') {
        toast.error('You must be logged in to make a purchase.', {
          position: 'bottom-left',
          autoClose: 5000,
          hideProgressBar: false,
          theme: 'colored',
        });
        setIsProcessing(false);
        return;
      }
  
      // switch (selectedPaymentMethod) {
      //   case 'Momo':
      //     await handleMomoPayment();
      //     break;
      //   case 'VNPay':
      //     await handleVNPayPayment();
      //     await handleCreateBill();
      //     break;
      //   default:
      //     await handleCreateBill();
      // }

      if (selectedPaymentMethod === 'Momo') {
        const orderId = uuidv4();
        const fullName = `${user.fName} ${user.lName}`;
        const orderInformation = `Payment for order ${orderId}`;
        const amount = total.toFixed(2);
      
        const paymentData = {
          fullName,
          orderId,
          orderInformation,
          amount: parseFloat(amount),
        };
      
        try {
          const response = await axios.post(
            `${import.meta.env.VITE_REACT_APP_API_URL}/payment/momo/createpayment`,
            paymentData,
            {
              headers: { 'Content-Type': 'application/json' },
              withCredentials: true,
            }
          );
      
          if (response.data && response.data.payUrl) {
            window.location.href = response.data.payUrl;
          } else {
            throw new Error('Invalid response from payment gateway.');
          }
        } catch (error) {
          console.error('Error initiating Momo payment:', error);
          toast.error('There was an error initiating Momo payment. Please try again.', {
            position: 'bottom-left',
            autoClose: 5000,
            hideProgressBar: false,
            theme: 'colored',
          });
          setIsProcessing(false);
        }
        return;
      }

      else if (selectedPaymentMethod === 'VNPay') {
        const orderType = 'other';
        const fullName = `${user.fName} ${user.lName}`;
        const amountInUSD = parseFloat(total.toFixed(2));
        const exchangeRate = 25000;
        const amountInVND = Math.round(amountInUSD * exchangeRate);
      
        const paymentData = {
          orderType,
          amount: amountInVND,
          fullName,
          orderDescription: 'New bill',
          name: fullName,
        };
      
        try { 
          const response = await axios.post(
            `${import.meta.env.VITE_REACT_APP_API_URL}/payment/vnpay`,
            paymentData,
            {
              headers: { 'Content-Type': 'application/json' },
              withCredentials: true,
            }
          );
      
          if (response.data) {
            window.location.href = response.data;
          } else {
            throw new Error('Invalid response from payment gateway.');
          }
        } catch (error) {
          console.error('Error initiating VNPay payment:', error);
          toast.error('There was an error initiating VNPay payment. Please try again.', {
            position: 'bottom-left',
            autoClose: 5000,
            hideProgressBar: false,
            theme: 'colored',
          });
          setIsProcessing(false);
        }
        return;
      }

      await handleCreateBill('Cash');
    } catch (error) {
      console.error('Error while processing the purchase:', error);
      toast.error('There was an error processing your purchase. Please try again.', {
        position: 'bottom-left',
        autoClose: 5000,
        hideProgressBar: false,
        theme: 'colored',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMomoPayment = async () => {
    const orderId = uuidv4();
    const fullName = `${user.fName} ${user.lName}`;
    const orderInformation = `Payment for order ${orderId}`;
    const amount = total.toFixed(2);
  
    const paymentData = {
      fullName,
      orderId,
      orderInformation,
      amount: parseFloat(amount),
    };
  
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_REACT_APP_API_URL}/payment/momo/createpayment`,
        paymentData,
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true,
        }
      );
  
      if (response.data && response.data.payUrl) {
        window.location.href = response.data.payUrl;
      } else {
        throw new Error('Invalid response from payment gateway.');
      }
    } catch (error) {
      console.error('Error initiating Momo payment:', error);
      toast.error('There was an error initiating Momo payment. Please try again.', {
        position: 'bottom-left',
        autoClose: 5000,
        hideProgressBar: false,
        theme: 'colored',
      });
    }
  };
  
  const handleVNPayPayment = async () => {
    const orderType = 'other';
    const fullName = `${user.fName} ${user.lName}`;
    const amountInUSD = parseFloat(total.toFixed(2));
    const exchangeRate = 25000;
    const amountInVND = Math.round(amountInUSD * exchangeRate);
  
    const paymentData = {
      orderType,
      amount: amountInVND,
      fullName,
      orderDescription: 'New bill',
      name: fullName,
    };
  
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_REACT_APP_API_URL}/payment/vnpay`,
        paymentData,
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true,
        }
      );
  
      if (response.data) {
        window.location.href = response.data;
      } else {
        throw new Error('Invalid response from payment gateway.');
      }
    } catch (error) {
      console.error('Error initiating VNPay payment:', error);
      toast.error('There was an error initiating VNPay payment. Please try again.', {
        position: 'bottom-left',
        autoClose: 5000,
        hideProgressBar: false,
        theme: 'colored',
      });
    }
  };

  const handleCreateBill = async (currentPaymentMethod) => {
    console.log('Creating bill...');
    console.log("Cart: ", cart);
    try {
      const itemsByStore = cart.reduce((result, item) => {
        const storeID = item.storeID;
        if (!result[storeID]) {
          result[storeID] = [];
        }
        result[storeID].push(item);
        return result;
      }, {});
  
      const purchaseTime = new Date().toISOString();
  
      const transactionPromises = Object.entries(itemsByStore).map(async ([storeID, items]) => {
        let totalPrice = 0;
        // let discountAmount = 0;
  
        const includes = items.map((item) => {
          let itemTotal = item.discountedPrice * item.quantity;
          const applicablePromotions = selectedCustomerPromotion.filter(
            (promotion) => promotion.product.productId === item.productID
          );
        
          if (applicablePromotions.length > 0) {
            const totalPromotionDiscount = applicablePromotions.reduce((discountAcc, promotion) => {
              return discountAcc + itemTotal * promotion.discount;
            }, 0);
        
            itemTotal -= totalPromotionDiscount;
            // discountAmount += totalPromotionDiscount; // Uncomment if you want to track the discount separately
          }
        
          totalPrice += itemTotal;
        
          return {
            productID: item.productID,
            numberOfProductInBill: item.quantity,
            subTotal: itemTotal,
          };
        });
        
  
        let billPromotionDiscount = 0;
        if (billPromotion) {
          billPromotionDiscount = totalPrice * billPromotion.discount;
          totalPrice = parseFloat((totalPrice - billPromotionDiscount).toFixed(2));
        }
  
        const transactionData = {
          paymentMethod: currentPaymentMethod ,
          dateAndTime: purchaseTime,
          customerID: user.id,
          storeID,
          includes,
          totalPrice,
          shippingAddress: formData.address // Add shipping address
        };

        console.log('Transaction data:', transactionData);
  
        // if (discountAmount > 0) {
        //   transactionData.discount = parseFloat(discountAmount.toFixed(2));
        //   transactionData.promotionId = state.selectedCustomerPromotion.promotionId;
        // }
  
        // if (billPromotionDiscount > 0) {
        //   transactionData.billPromotionDiscount = parseFloat(billPromotionDiscount.toFixed(2));
        //   transactionData.billPromotionId = billPromotion.promotionId;
        // }
  
        const response = await axios.post(
          `${import.meta.env.VITE_REACT_APP_API_URL}/transactions`,
          transactionData,
          {
            headers: { 'Content-Type': 'application/json' },
            withCredentials: true,
          }
        );
  
        if (billPromotion && billPromotion.promotionId && response.data.new_bill && response.data.new_bill.transactionId) {
          try {
            await axios.post(
              `${import.meta.env.VITE_REACT_APP_API_URL}/promotions/bill/${billPromotion.promotionId}/${response.data.new_bill.transactionId}`,
              {},
              {
                headers: { 'Content-Type': 'application/json' },
                withCredentials: true,
              }
            );
          } catch (promoError) {
            console.error('Error applying Bill Promotion:', promoError);
            toast.warn('Transaction completed, but failed to apply the bill promotion.', {
              position: 'bottom-left',
              autoClose: 5000,
              hideProgressBar: false,
              theme: 'colored',
            });
          }
        }
  
        return response.data;
      });
  
      await Promise.all(transactionPromises);
  
      if (selectedCustomerPromotion.length > 0) {
        try {
          const customerId = user.id;
      
          // Iterate over the array of promotions
          await Promise.all(
            selectedCustomerPromotion.map(async (promotion) => {
              const promotionId = promotion.promotionId;
      
              // Make the delete request for each promotion
              await axios.delete(
                `${import.meta.env.VITE_REACT_APP_API_URL}/promotions/customer/${promotionId}/${customerId}`,
                {
                  headers: { 'Content-Type': 'application/json' },
                  withCredentials: true,
                }
              );
            })
          );
        } catch (deleteError) {
          console.error('Error deleting used promotions:', deleteError);
          toast.warn('Purchase was successful, but we failed to remove some used promotions.', {
            position: 'bottom-left',
            autoClose: 5000,
            hideProgressBar: false,
            theme: 'colored',
          });
        }
      }
  
      try {
        await axios.delete(`${import.meta.env.VITE_REACT_APP_API_URL}/cart/clear/${user.id}`);
        console.log('Cart cleared successfully.');
      } catch (error) {
        console.error('Error clearing cart:', error);
        toast.warn('Purchase was successful, but we failed to clear your cart.', {
          position: 'bottom-left',
          autoClose: 5000,
          hideProgressBar: false,
          theme: 'colored',
        });
      }
  
      toast.success('Purchase successful! Thank you for your order.', {
        position: 'bottom-left',
        autoClose: 5000,
        hideProgressBar: false,
        theme: 'colored',
      });

      await fetchTimeLeft(user.id);
      refreshTimer();
  
      navigate('/');
    } catch (error) {
      console.error('Error while processing the purchase:', error);
      toast.error('There was an error processing your purchase. Please try again.', {
        position: 'bottom-left',
        autoClose: 5000,
        hideProgressBar: false,
        theme: 'colored',
      });
    } finally {
      setIsProcessing(false);
    }
  };


  // const handleBuyButtonClick = async () => {
  //   if (isProcessing) return;
  //   setIsProcessing(true);

  //   try {
  //     if (!user || user.role !== 'Customer') {
  //       toast.error('You must be logged in to make a purchase.', {
  //         position: 'bottom-left',
  //         autoClose: 5000,
  //         hideProgressBar: false,
  //         theme: 'colored',
  //       });
  //       setIsProcessing(false);
  //       return;
  //     }

  //     if (selectedPaymentMethod === 'Momo') {
  //       // Generate random 32-character orderId
  //       const orderId = uuidv4();
  //       const fullName = `${user.fName} ${user.lName}`;
  //       const orderInformation = `Payment for order ${orderId}`;
  //       const amount = total.toFixed(2);

  //       const paymentData = {
  //         fullName: fullName,
  //         orderId: orderId,
  //         orderInformation: orderInformation,
  //         amount: parseFloat(amount),
  //       };
  //       console.log('Momo payment data:', paymentData);

  //       try {
  //         const response = await axios.post(
  //           `${import.meta.env.VITE_REACT_APP_API_URL}/payment/momo/createpayment`,
  //           paymentData,
  //           {
  //             headers: {
  //               'Content-Type': 'application/json',
  //             },
  //             withCredentials: true,
  //           }
  //         );
  //         // console.log('Momo payment response:', response.data);
  //         // Redirect to the payment URL provided by the API
  //         if (response.data && response.data.payUrl) {
  //           window.location.href = response.data.payUrl;
  //         } else {
  //           throw new Error('Invalid response from payment gateway.');
  //         }
  //       } catch (error) {
  //         console.error('Error initiating Momo payment:', error);
  //         toast.error('There was an error initiating Momo payment. Please try again.', {
  //           position: 'bottom-left',
  //           autoClose: 5000,
  //           hideProgressBar: false,
  //           theme: 'colored',
  //         });
  //         setIsProcessing(false);
  //       }
  //       return;
  //     }

  //     else if (selectedPaymentMethod === 'VNPay') {
  //       // Generate random 32-character orderId
  //       const orderType = 'other';
  //       const fullName = `${user.fName} ${user.lName}`;

  //       // Fix total to 2 decimal places
  //       let amountInUSD = parseFloat(total.toFixed(2)); // Convert to 2 decimal places

  //       // Define exchange rate
  //       const exchangeRate = 25000; // 1 USD = 25,000 VND

  //       // Convert to VND
  //       let amountInVND = Math.round(amountInUSD * exchangeRate); // Convert and round to nearest integer

  //       const paymentData = {
  //         orderType: orderType,
  //         amount: amountInVND,
  //         fullName: fullName,
  //         orderDescription: "New bill",
  //         name: fullName
  //       };

  //       // console.log('VNPay payment data:', paymentData);

  //       try {
  //         const response = await axios.post(
  //           `${import.meta.env.VITE_REACT_APP_API_URL}/payment/vnpay`,
  //           paymentData,
  //           {
  //             headers: {
  //               'Content-Type': 'application/json',
  //             },
  //             withCredentials: true,
  //           }
  //         );
  //         console.log('VNPay payment response:', response.data);
  //         // Redirect to the payment URL provided by the API
  //         if (response.data) {
  //           window.location.href = response.data;
  //         } else {
  //           throw new Error('Invalid response from payment gateway.');
  //         }
  //       } catch (error) {
  //         console.error('Error initiating VNPay payment:', error);
  //         toast.error('There was an error initiating VNPay payment. Please try again.', {
  //           position: 'bottom-left',
  //           autoClose: 5000,
  //           hideProgressBar: false,
  //           theme: 'colored',
  //         });
  //         setIsProcessing(false);
  //       }
  //       return;
  //     }

  //     const itemsByStore = cart.reduce((result, item) => {
  //       const storeID = item.storeID;
  //       if (!result[storeID]) {
  //         result[storeID] = [];
  //       }
  //       result[storeID].push(item);
  //       return result;
  //     }, {});

  //     const purchaseTime = new Date().toISOString();

  //     const transactionPromises = Object.entries(itemsByStore).map(async ([storeID, items]) => {
  //       let totalPrice = 0;
  //       let totalWeight = 0;
  //       let discountAmount = 0;

  //       const includes = items.map((item) => {
  //         let itemTotal = item.discountedPrice * item.quantity;
  //         totalWeight += item.weight * item.quantity;
        
  //         // Check if there's a promotion applicable to this item
  //         const applicablePromotion = selectedCustomerPromotion.find(
  //           (promotion) => promotion.product.productId === item.productID
  //         );
        
  //         if (applicablePromotion) {
  //           const promotionDiscount = itemTotal * applicablePromotion.discount;
  //           itemTotal -= promotionDiscount;
  //           discountAmount += promotionDiscount;
  //         }
        
  //         totalPrice += itemTotal;
        
  //         return {
  //           productID: item.productID,
  //           numberOfProductInBill: item.quantity,
  //           subTotal: itemTotal,
  //         };
  //       });

  //       let billPromotionDiscount = 0;
  //       if (billPromotion) {
  //         billPromotionDiscount = totalPrice * billPromotion.discount;
  //         totalPrice = parseFloat((totalPrice - billPromotionDiscount).toFixed(2));
  //       }

  //       const transactionData = {
  //         paymentMethod: selectedPaymentMethod,
  //         dateAndTime: purchaseTime,
  //         customerID: user.id,
  //         storeID: storeID,
  //         includes: includes,
  //         totalPrice: totalPrice,
  //         totalWeight: totalWeight,
  //       };

  //       if (discountAmount > 0) {
  //         transactionData.discount = parseFloat(discountAmount.toFixed(2));
  //         transactionData.promotionId = state.selectedCustomerPromotion.promotionId;
  //       }

  //       if (billPromotionDiscount > 0) {
  //         transactionData.billPromotionDiscount = parseFloat(billPromotionDiscount.toFixed(2));
  //         transactionData.billPromotionId = billPromotion.promotionId;
  //       }

  //       const response = await axios.post(
  //         `${import.meta.env.VITE_REACT_APP_API_URL}/transactions`,
  //         transactionData,
  //         {
  //           headers: {
  //             'Content-Type': 'application/json',
  //           },
  //           withCredentials: true,
  //         }
  //       );
  //       // console.log('Transaction response:', response.data);

  //       const hasTransaction = response.data.new_bill && response.data.new_bill.transactionId;
  //       // console.log('Transaction ID:', response.data.new_bill.transactionId);

  //       // Apply Bill Promotion if applicable
  //       if (billPromotion && billPromotion.promotionId && hasTransaction) {
  //         try {
  //           await axios.post(
  //             `${import.meta.env.VITE_REACT_APP_API_URL}/promotions/bill/${billPromotion.promotionId}/${response.data.new_bill.transactionId}`,
  //             {},
  //             {
  //               headers: {
  //                 'Content-Type': 'application/json',
  //               },
  //               withCredentials: true,
  //             }
  //           );
  //           console.log('Bill Promotion applied successfully.');
  //         } catch (promoError) {
  //           console.error('Error applying Bill Promotion:', promoError);
  //           toast.warn('Transaction completed, but failed to apply the bill promotion.', {
  //             position: 'bottom-left',
  //             autoClose: 5000,
  //             hideProgressBar: false,
  //             theme: 'colored',
  //           });
  //         }
  //       }

  //       return response.data;
  //     });

  //     await Promise.all(transactionPromises);

  //     // If a customer promotion was used, delete it
  //     if (state.selectedCustomerPromotion) {
  //       try {
  //         const promotionId = state.selectedCustomerPromotion.promotionId;
  //         const customerId = user.id;

  //         await axios.delete(
  //           `${import.meta.env.VITE_REACT_APP_API_URL}/promotions/customer/${promotionId}/${customerId}`,
  //           {
  //             headers: {
  //               'Content-Type': 'application/json',
  //             },
  //             withCredentials: true,
  //           }
  //         );

  //         console.log(`Promotion ${promotionId} for customer ${customerId} has been deleted.`);
  //       } catch (deleteError) {
  //         console.error('Error deleting used promotion:', deleteError);
  //         // Optionally, notify the user about the failure to delete the promotion
  //         toast.warn('Purchase was successful, but we failed to remove the used promotion.', {
  //           position: 'bottom-left',
  //           autoClose: 5000,
  //           hideProgressBar: false,
  //           theme: 'colored',
  //         });
  //       }
  //     }

  //     dispatch({ type: 'CLEAR_CART' });

  //     toast.success('Purchase successful! Thank you for your order.', {
  //       position: 'bottom-left',
  //       autoClose: 5000,
  //       hideProgressBar: false,
  //       theme: 'colored',
  //     });

  //     navigate('/');
  //   } catch (error) {
  //     console.error('Error while processing the purchase:', error);
  //     toast.error('There was an error processing your purchase. Please try again.', {
  //       position: 'bottom-left',
  //       autoClose: 5000,
  //       hideProgressBar: false,
  //       theme: 'colored',
  //     });
  //   } finally {
  //     setIsProcessing(false);
  //   }
  // };



  useEffect(() => {
    if (step === 2) {
      const handleMomoPaymentSuccess = async () => {
        setSelectedPaymentMethod('Momo');
        setIsProcessing(true);
        await handleCreateBill('Momo');
      };
    
      const handleVNPayPaymentSuccess = async () => {
        setSelectedPaymentMethod('VNPay');
        setIsProcessing(true);
        await handleCreateBill('VNPay');
      };  
  
      // Parse query parameters using URLSearchParams
      const params = new URLSearchParams(location.search);
      // check if there is PaymentCallBack in the Url
      if (!location.pathname.includes('PaymentCallBack')) {
        console.log('This is not the PaymentCallBack URL');
        return;
      }
  
      if (params.has('vnp_Amount')) {
        const vnpResponseCode = params.get('vnp_ResponseCode');
        console.log('VNPay callback detected:');
        if (vnpResponseCode !== '00') {
          console.error('VNPay payment failed:', vnpResponseCode);
          toast.error('There was an error processing your purchase. Please try again.', {
            position: 'bottom-left',
            autoClose: 5000,
            hideProgressBar: false,
            theme: 'colored',
          });
          return;
        }
        else {
          // Perform any action here, such as setting state or calling a function
          console.log("CP1");
          console.log("HAs Processed Callback Ref: ", hasProcessedCallbackRef.current);
          if (!hasProcessedCallbackRef.current) {
            console.log("CP2")
            handleVNPayPaymentSuccess();
            hasProcessedCallbackRef.current = true;  // Prevent duplicate processing
          }
        }
        // Perform any action here, such as setting state or calling a function
      }
  
      else if (params.has('partnerCode') || params.has('orderInfo')) {
        // Check for essential Momo callback parameters
        const orderId = params.get('orderId');
        const transId = params.get('transId');
        // const errorCode = params.get('errorCode');
        const orderInfo = params.get('orderInfo');
        const orderType = params.get('orderType');
        const accessKey = params.get('accessKey');
  
        const CustomerRequest = orderInfo.split('\n')[0];
        // check if the orderType is "momo_wallet" and accessKey is "F8BBA842ECF85" and CustomerRequest is `user.fName user.lName`
        if (orderType !== 'momo_wallet' || accessKey !== 'F8BBA842ECF85' || CustomerRequest !== `Customer: ${user.fName} ${user.lName}`) {
          console.error('Invalid Momo callback request.');
          return;
        }
  
        // Proceed only if orderId and transId are present and there's no error
        if (orderId && transId && !hasProcessedCallbackRef.current) {
          console.log('Momo callback detected:', { orderId, transId });
          handleMomoPaymentSuccess();
          hasProcessedCallbackRef.current = true;  // Prevent duplicate processing
        }
      }
  
      else {
        return;
      }
    }
  }, [location.search, user.fName, user.lName, step]);

  // const handleCreateBill = async () => {
  //   try {
  //     if (!user || user.role !== 'Customer') {
  //       toast.error('You must be logged in to make a purchase.', {
  //         position: 'bottom-left',
  //         autoClose: 5000,
  //         hideProgressBar: false,
  //         theme: 'colored',
  //       });
  //       setIsProcessing(false);
  //       return;
  //     }

  //     // Proceed to process the transaction similar to handleBuyButtonClick
  //     // Split items by store, create transactions, etc.

  //     const itemsByStore = state.cart.reduce((result, item) => {
  //       const storeID = item.storeID;
  //       if (!result[storeID]) {
  //         result[storeID] = [];
  //       }
  //       result[storeID].push(item);
  //       return result;
  //     }, {});

  //     const purchaseTime = new Date().toISOString();

  //     const transactionPromises = Object.entries(itemsByStore).map(async ([storeID, items]) => {
  //       let totalPrice = 0;
  //       let totalWeight = 0;
  //       let discountAmount = 0;

  //       const includes = items.map((item) => {
  //         let itemTotal = item.discountedPrice * item.quantity;
  //         totalWeight += item.weight * item.quantity;

  //         if (
  //           state.selectedCustomerPromotion &&
  //           state.selectedCustomerPromotion.product.productId === item.productID
  //         ) {
  //           const promotionDiscount = itemTotal * state.selectedCustomerPromotion.discount;
  //           itemTotal -= promotionDiscount;
  //           discountAmount += promotionDiscount;
  //         }

  //         totalPrice += itemTotal;

  //         return {
  //           productID: item.productID,
  //           numberOfProductInBill: item.quantity,
  //           subTotal: itemTotal,
  //         };
  //       });

  //       let billPromotionDiscount = 0;
  //       if (billPromotion) {
  //         billPromotionDiscount = totalPrice * billPromotion.discount;
  //         totalPrice = parseFloat((totalPrice - billPromotionDiscount).toFixed(2));
  //       }

  //       const transactionData = {
  //         paymentMethod: selectedPaymentMethod,
  //         dateAndTime: purchaseTime,
  //         customerID: user.id,
  //         storeID: storeID,
  //         includes: includes,
  //         totalPrice: totalPrice,
  //         totalWeight: totalWeight,
  //         // orderId: orderId, // Include orderId from Momo callback
  //         // transId: transId, // Include transId from Momo callback
  //       };

  //       if (discountAmount > 0) {
  //         transactionData.discount = parseFloat(discountAmount.toFixed(2));
  //         transactionData.promotionId = state.selectedCustomerPromotion.promotionId;
  //       }

  //       if (billPromotionDiscount > 0) {
  //         transactionData.billPromotionDiscount = parseFloat(billPromotionDiscount.toFixed(2));
  //         transactionData.billPromotionId = billPromotion.promotionId;
  //       }

  //       const response = await axios.post(
  //         `${import.meta.env.VITE_REACT_APP_API_URL}/transactions`,
  //         transactionData,
  //         {
  //           headers: {
  //             'Content-Type': 'application/json',
  //           },
  //           withCredentials: true,
  //         }
  //       );
  //       console.log('Transaction response:', response.data);

  //       const hasTransaction = response.data.new_bill && response.data.new_bill.transactionId;
  //       console.log('Transaction ID:', response.data.new_bill.transactionId);

  //       // Apply Bill Promotion if applicable
  //       if (billPromotion && billPromotion.promotionId && hasTransaction) {
  //         try {
  //           await axios.post(
  //             `${import.meta.env.VITE_REACT_APP_API_URL}/promotions/bill/${billPromotion.promotionId}/${response.data.new_bill.transactionId}`,
  //             {},
  //             {
  //               headers: {
  //                 'Content-Type': 'application/json',
  //               },
  //               withCredentials: true,
  //             }
  //           );
  //           console.log('Bill Promotion applied successfully.');
  //         } catch (promoError) {
  //           console.error('Error applying Bill Promotion:', promoError);
  //           toast.warn('Transaction completed, but failed to apply the bill promotion.', {
  //             position: 'bottom-left',
  //             autoClose: 5000,
  //             hideProgressBar: false,
  //             theme: 'colored',
  //           });
  //         }
  //       }

  //       return response.data;
  //     });

  //     await Promise.all(transactionPromises);

  //     // If a customer promotion was used, delete it
  //     if (state.selectedCustomerPromotion) {
  //       try {
  //         const promotionId = state.selectedCustomerPromotion.promotionId;
  //         const customerId = user.id;

  //         await axios.delete(
  //           `${import.meta.env.VITE_REACT_APP_API_URL}/promotions/customer/${promotionId}/${customerId}`,
  //           {
  //             headers: {
  //               'Content-Type': 'application/json',
  //             },
  //             withCredentials: true,
  //           }
  //         );

  //         console.log(`Promotion ${promotionId} for customer ${customerId} has been deleted.`);
  //       } catch (deleteError) {
  //         console.error('Error deleting used promotion:', deleteError);
  //         // Optionally, notify the user about the failure to delete the promotion
  //         toast.warn('Purchase was successful, but we failed to remove the used promotion.', {
  //           position: 'bottom-left',
  //           autoClose: 5000,
  //           hideProgressBar: false,
  //           theme: 'colored',
  //         });
  //       }
  //     }

  //     dispatch({ type: 'CLEAR_CART' });

  //     toast.success('Purchase successful! Thank you for your order.', {
  //       position: 'bottom-left',
  //       autoClose: 5000,
  //       hideProgressBar: false,
  //       theme: 'colored',
  //     });

  //     navigate('/');
  //   } catch (error) {
  //     console.error('Error while processing the purchase:', error);
  //     toast.error('There was an error processing your purchase. Please try again.', {
  //       position: 'bottom-left',
  //       autoClose: 5000,
  //       hideProgressBar: false,
  //       theme: 'colored',
  //     });
  //   } finally {
  //     setIsProcessing(false);
  //   }
  // };
  
  // const handleMomoPaymentSuccess = async ({ orderId, transId }) => {
  //   setIsProcessing(true);

  //   handleCreateBill();
  // };

  return (
    <div className="cart">
        <Header />
        <div className="cart-content">
          <Title titleText="Checkout" size={24} margin_b={12} />
          {cart.length === 0 ? (
            <div className="empty-cart">
              <img src="/Images/Frame.png" alt="empty cart" className="empty-card-img" />
              <p className="empty-cart-message">Your cart is empty.</p>
            </div>
          ) : (
            <div>
              <p className="cart-item-count">
                You have
                <span className="item-count-number"> {cart.length} </span>
                item(s) in your cart.
              </p>
              <div className="cart-items-wrapper">
                <div className="shipping-info-check">
                  <InfoForm 
                    userData={formData}
                    setUserData={setFormData}
                  />
                  <div className="payment-method">
                    <h2>Choose Payment Method</h2>
                    <div>
                      <label>
                        <input
                          type="radio"
                          value="VNPay"
                          checked={selectedPaymentMethod === 'VNPay'}
                          onChange={handlePaymentMethodChange}
                        />
                        VNPay
                      </label>
                    </div>
                    <div>
                      <label>
                        <input
                          type="radio"
                          value="Momo"
                          checked={selectedPaymentMethod === 'Momo'}
                          onChange={handlePaymentMethodChange}
                        />
                        Momo
                      </label>
                    </div>
                    <div>
                      <label>
                        <input
                          type="radio"
                          value="Cash"
                          checked={selectedPaymentMethod === 'Cash'}
                          onChange={handlePaymentMethodChange}
                        />
                        Cash on delivery
                      </label>
                    </div>
                  </div>

                  <div className="cart-summary">
                    <CartSummary
                      subtotal={subtotal}
                      shipping={shipping}
                      estimate={estimate}
                      discountAmountList={amountDiscount}
                      total={total}
                      cart={cart}
                      checkout={true} 
                      selectedCustomerPromotion={selectedCustomerPromotion}
                      billPromotion={billDiscountAmount}
                    />
                  </div>
                </div>
                <div className="cart-items">
                  <h2>Your Order</h2>
                  {cart.map((item, index) => (
                    <div key={index} className="cart-item">
                      <div className="cart-img-wrapper">
                        {item.imageURL ? (
                          <img src={item.imageURL} alt={item.pName} className="cart__img" />
                        ) : (
                          <img src="/Images/no-image.jpg" alt={item.pName} className="cart__img" />
                        )}
                      </div>
                      <div className="item-details">
                        <Link
                          to={`/buy-product/${item.productID}/${item.storeID}`}
                          className="product-link"
                        >
                          <p className="item-name">{item.pName}</p>
                        </Link>
                        <p className="item-quantity_2">x {item.quantity}</p>
                        <p className="item-storeid">Store: {item.storeName}</p>
                        {item.discount > 0 ? (
                          <>
                            <p className="promo-product-price">${item.price.toFixed(2)}</p>
                            <div className='flex-box'>
                              <p className="promo-product-discount">Price: ${item.discountedPrice.toFixed(2)}</p>
                              <p className="cart_product__disscount_num">{(item.discount * 100).toFixed(0)}% off</p>
                            </div>
                          </>
                        ) : (
                          <>
                            <p className="item-price">Price: ${item.price.toFixed(2)}</p>
                          </>
                        )}
                      </div>
                    </div>
                  ))}

                  {selectedCustomerPromotion && selectedCustomerPromotion.length > 0 && (
                    selectedCustomerPromotion.map((promotion, index) => (
                      <PromotionTicket key={index} elevation={3}>
                        <Stack direction="row" spacing={2}>
                          <ContentBox>
                            <StyledTypography variant="h6" sx={{ color: '#fe3bd4' }}>
                              {promotion.name}
                            </StyledTypography>
                            <StyledTypography variant="body2">
                              {promotion.description}
                            </StyledTypography>
                          </ContentBox>
                          <DiscountBox>
                            <StyledTypography variant="h4" sx={{ color: '#fe3bd4' }}>
                              {(promotion.discount * 100).toFixed(0)}%
                            </StyledTypography>
                            <StyledTypography variant="subtitle2">OFF</StyledTypography>
                          </DiscountBox>
                        </Stack>
                      </PromotionTicket>
                    ))
                  )}

                  {billPromotion && (
                    <PromotionTicket elevation={3}>
                      <Stack direction="row" spacing={2}>
                        <ContentBox>
                          <StyledTypography variant="h6" sx={{ color: '#fe3bd4' }}>
                            {billPromotion.name}
                          </StyledTypography>
                          <StyledTypography variant="body2">
                            {billPromotion.description}
                          </StyledTypography>
                        </ContentBox>
                        <DiscountBox>
                          <StyledTypography variant="h4" sx={{ color: '#fe3bd4' }}>
                            {(billPromotion.discount * 100).toFixed(0)}%
                          </StyledTypography>
                          <StyledTypography variant="subtitle2">OFF</StyledTypography>
                        </DiscountBox>
                      </Stack>
                    </PromotionTicket>
                  )}

                  <button
                    className="buy-button"
                    onClick={handleBuyButtonClick}
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Processing...' : 'Place an Order ➔'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        <Footer />
      </div>
    
  );
};

export default CheckOut;