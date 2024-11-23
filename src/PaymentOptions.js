import React, { useState, useEffect } from "react";
import "./PaymentOptions.css";

const PaymentOptions = () => {
  const [paymentOptions, setPaymentOptions] = useState([]);
  const [error, setError] = useState(null);
  const [port, setPort] = useState(null);
  const [totalPrice, setTotalPrice] = useState(null);
  const [webshopId, setWebshopId] = useState(null);

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const portValue = queryParams.get("port");
    const totalPriceValue = queryParams.get("totalPrice");

    setPort(portValue);
    setTotalPrice(totalPriceValue);

    if (portValue && totalPriceValue) {
      fetchWebshopId(portValue);
      fetchPaymentOptions(portValue, totalPriceValue);
    }
  }, []);

  const fetchWebshopId = async (port) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/webshop?port=${port}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch webshop ID");
      }
      const data = await response.json();
      setWebshopId(data.webshopId);
    } catch (error) {
      console.error("Error fetching webshop ID:", error);
      setError(error.message);
    }
  };

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

  const handleCardSubmit = async () => {
    if (!webshopId) {
      setError("Webshop ID not available");
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
      // Ovde ubaci svoj url gde ti treba da se posalju ove vrednosti LukaUslj
      const response = await fetch("https://example.com/api/process-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to process payment on example.com");
      }

      const data = await response.json();
      console.log("Payment processed successfully:", data);

      window.location.href = redirectUrls.successUrl;
    } catch (error) {
      console.error("Error processing payment:", error);

      window.location.href = redirectUrls.errorUrl;
      setError(error.message);
    }
  };

  const handlePaymentOptionClick = async (option) => {
    if (option.toLowerCase() === "card") {
      await handleCardSubmit();
    } else {
      setError("This payment option is not implemented");
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
