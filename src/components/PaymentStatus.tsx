import React from 'react';

export const PaymentStatus: React.FC<{ status?: string } > = ({ status = 'pending' }) => (
  <div aria-live="polite" role="status">Payment status: {status}</div>
);

export default PaymentStatus;
