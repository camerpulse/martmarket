import React from 'react';

const BitcoinPayment: React.FC<any> = ({ onPaymentComplete }) => (
  <div>
    <p>Bitcoin payment processing placeholder.</p>
    <button onClick={() => onPaymentComplete && onPaymentComplete()}>Mark Paid</button>
  </div>
);

export default BitcoinPayment;
