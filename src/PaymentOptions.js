import React, { useState, useEffect } from "react";
import "./PaymentOptions.css";

const PaymentOptions = () => {
  const [paymentOptions, setPaymentOptions] = useState([]);
  const [error, setError] = useState(null);
  const [port, setPort] = useState(null);
  const [totalPrice, setTotalPrice] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const portValue = queryParams.get("port");
    const totalPriceValue = queryParams.get("totalPrice");

    setPort(portValue);
    setTotalPrice(totalPriceValue);

    if (portValue && totalPriceValue) {
      fetchPaymentOptions(portValue, totalPriceValue);
    }
  }, []);

  const fetchPaymentOptions = async (port, totalPrice) => {
    try {
      const response = await fetch(
        "http://localhost:8080/api/psp/payment-options",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ totalPrice, port }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch payment options");
      }

      const data = await response.json();
      if (data.paymentOptions) {
        setPaymentOptions(data.paymentOptions);
      } else {
        setPaymentOptions([]);
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const handlePaymentOptionClick = (option) => {
    setSelectedPayment(option);
  };

  const handleCardSubmit = (e) => {
    e.preventDefault();

    console.log("Card details submitted");
  };

  return (
    <div>
      <h2>Payment Options</h2>
      {/* <p>Port: {port}</p> */}
      <p>Total Price: ${totalPrice}</p>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {selectedPayment ? (
        <>
          {selectedPayment === "card" ? (
            <div>
              <h3>Enter Card Details</h3>
              <form onSubmit={handleCardSubmit}>
                <div>
                  <label>Card Number:</label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    required
                  />
                </div>
                <div>
                  <label>Expiry Date:</label>
                  <input type="text" placeholder="MM/YY" required />
                </div>
                <div>
                  <label>CVV:</label>
                  <input type="text" placeholder="123" required />
                </div>
                <button type="submit">Pay</button>
              </form>
            </div>
          ) : (
            <p>
              You selected {selectedPayment}. This option is not yet
              implemented.
            </p>
          )}
          <button onClick={() => setSelectedPayment(null)}>
            Back to Payment Options
          </button>
        </>
      ) : (
        <ul>
          {paymentOptions.length > 0 ? (
            paymentOptions.map((option, index) => (
              <li
                key={index}
                style={{
                  cursor: "pointer",
                  color: "white",
                  fontSize: 25,
                }}
                onClick={() => handlePaymentOptionClick(option)}
              >
                {option}
              </li>
            ))
          ) : (
            <p>No payment options available</p>
          )}
        </ul>
      )}
    </div>
  );
};

export default PaymentOptions;
