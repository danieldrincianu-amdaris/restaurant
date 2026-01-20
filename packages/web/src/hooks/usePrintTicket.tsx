import { useCallback, useState } from 'react';
import { Order } from '@restaurant/shared';
import { createRoot } from 'react-dom/client';
import React from 'react';
import PrintableTicket from '../components/kitchen/PrintableTicket';

/**
 * usePrintTicket - Hook for printing kitchen tickets
 * 
 * Creates a hidden print container, renders the PrintableTicket component,
 * triggers the browser print dialog, and cleans up afterwards.
 * 
 * @returns Object with printTicket function and isPrinting state
 */
export function usePrintTicket() {
  const [isPrinting, setIsPrinting] = useState(false);

  const printTicket = useCallback(async (order: Order) => {
    setIsPrinting(true);

    try {
      // Get restaurant name from environment variable
      const restaurantName = import.meta.env.VITE_RESTAURANT_NAME || 'RestaurantFlow';

      // Create hidden print container
      const printContainer = document.createElement('div');
      printContainer.id = 'print-ticket-container';
      printContainer.className = 'print-only-container';
      document.body.appendChild(printContainer);

      // Render PrintableTicket to container
      const root = createRoot(printContainer);
      root.render(
        <PrintableTicket order={order} restaurantName={restaurantName} />
      );

      // Wait for rendering to complete
      await new Promise(resolve => setTimeout(resolve, 100));

      // Trigger print dialog
      window.print();

      // Clean up after print dialog closes
      // Note: There's no reliable way to detect print completion/cancellation
      // so we clean up after a delay
      setTimeout(() => {
        root.unmount();
        document.body.removeChild(printContainer);
        setIsPrinting(false);
      }, 500);

    } catch (error) {
      console.error('Error printing ticket:', error);
      setIsPrinting(false);
    }
  }, []);

  return {
    printTicket,
    isPrinting,
  };
}
