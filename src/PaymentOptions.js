import React, { useState, useEffect } from "react";
import "./PaymentOptions.css";

const PaymentOptions = () => {
  const [paymentOptions, setPaymentOptions] = useState([]);
  const [error, setError] = useState(null);
  const [totalPrice, setTotalPrice] = useState(null);
  const [webshopId, setWebshopId] = useState(null);

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const webshopIdValue = queryParams.get("port");
    const totalPriceValue = queryParams.get("totalPrice");

    console.log("hejj");
    setWebshopId(webshopIdValue);
    setTotalPrice(totalPriceValue);

    if (webshopIdValue) {
      fetchPaymentOptions(webshopIdValue);
    }
  }, []);

  const fetchPaymentOptions = async (webshopId) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/psp/payment-options`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            webshopId,
            totalPrice,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch payment options");
      }

      const data = await response.json();
      console.log("Fetched payment methods:", data.paymentMethods);

      if (data.paymentMethods) {
        setPaymentOptions(data.paymentMethods);
      } else {
        setPaymentOptions([]);
      }
    } catch (error) {
      console.error("Error fetching payment options:", error);
      setError(error.message);
    }
  };

  const handlePaymentOptionClick = async (option) => {
    if (option.toLowerCase() === "card") {
      await handleCardSubmit();
    } else {
      setError("This payment option is not implemented yet.");
    }
  };

  const handleCardSubmit = async () => {
    if (!webshopId) {
      setError("Webshop ID is not available");
      return;
    }

    const MERCHANT_PASSWORD = "merPass";
    const randomNumber = Math.floor(Math.random() * 1000000);
    const currentTime = new Date().toISOString();

    const redirectUrls = {
      successUrl: "http://localhost:3001/success",
      failureUrl: "http://localhost:3001/failure",
      errorUrl: "http://localhost:3001/error",
    };

    const payload = {
      webshopId,
      MERCHANT_PASSWORD,
      totalPrice,
      currentTime,
      randomNumber,
      redirectUrls,
    };

    try {
      const response = await fetch("Lukin url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Payment processing failed");
      }

      const data = await response.json();
      console.log("Payment processed successfully:", data);

      // Redirect to URL ako je ok
      window.location.href = redirectUrls.successUrl;
    } catch (error) {
      console.error("Error processing payment:", error);

      window.location.href = redirectUrls.errorUrl;
      setError(error.message);
    }
  };

  return (
    <div>
      <h2>Payment Options</h2>
      <p>Total Price: ${totalPrice}</p>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <ul>
        {paymentOptions.length > 0 ? (
          paymentOptions.map((option, index) => (
            <li
              key={index}
              style={{
                cursor: "pointer",
                color: "white",
                fontSize: 25,
                padding: "10px",
                background: "#007bff",
                margin: "10px 0",
                borderRadius: "5px",
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
    </div>
  );
};

export default PaymentOptions;
