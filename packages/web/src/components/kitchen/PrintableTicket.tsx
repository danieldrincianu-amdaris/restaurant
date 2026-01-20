import { Order, Category } from '@restaurant/shared';
import { QRCodeSVG } from 'qrcode.react';

interface PrintableTicketProps {
  order: Order;
  restaurantName?: string;
}

/**
 * PrintableTicket - Thermal receipt-style ticket for kitchen orders
 * 
 * Optimized for 80mm thermal printers with print-specific CSS.
 * Hidden from screen display, only visible when printing.
 * Includes QR code linking to order detail page.
 */
export default function PrintableTicket({ order, restaurantName = 'RestaurantFlow' }: PrintableTicketProps) {
  // Group items by category
  const itemsByCategory = order.items.reduce((acc, item) => {
    if (!item.menuItem) return acc;
    
    const category = item.menuItem.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<Category, typeof order.items>);

  // Category order for display
  const categoryOrder: Category[] = [
    Category.APPETIZER,
    Category.MAIN,
    Category.DRINK,
    Category.DESSERT,
  ];

  // Calculate order total
  const orderTotal = order.items.reduce((sum, item) => {
    if (!item.menuItem) return sum;
    return sum + (item.menuItem.price * item.quantity);
  }, 0);

  // Format currency
  const formatPrice = (price: number) => `$${price.toFixed(2)}`;

  // Format order ID (last 6 characters)
  const shortOrderId = order.id.slice(-6).toUpperCase();

  // Format time
  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Current timestamp for print time
  const printTime = formatTime(new Date().toISOString());

  // QR code URL
  const qrCodeUrl = `${window.location.origin}/staff/orders/${order.id}`;

  // Category labels
  const categoryLabels: Record<Category, string> = {
    [Category.APPETIZER]: 'APPETIZERS',
    [Category.MAIN]: 'MAINS',
    [Category.DRINK]: 'DRINKS',
    [Category.DESSERT]: 'DESSERTS',
  };

  return (
    <div className="print-ticket hidden">
      <div className="print-content">
        {/* Header */}
        <div className="ticket-header">
          <h1 className="restaurant-name">{restaurantName}</h1>
          <div className="divider">─────────────────────────────</div>
        </div>

        {/* Order Info */}
        <div className="ticket-order-info">
          <div className="order-line">Order #{shortOrderId}</div>
          <div className="order-line">Table: {order.tableNumber}</div>
          <div className="order-line">Server: {order.serverName}</div>
          <div className="order-line">Time: {formatTime(order.createdAt)}</div>
          <div className="divider">─────────────────────────────</div>
        </div>

        {/* Items by Category */}
        <div className="ticket-items">
          {categoryOrder.map((category) => {
            const items = itemsByCategory[category];
            if (!items || items.length === 0) return null;

            return (
              <div key={category} className="category-section">
                <div className="category-label">{categoryLabels[category]}</div>
                {items.map((item) => {
                  if (!item.menuItem) return null;
                  const itemTotal = item.menuItem.price * item.quantity;

                  return (
                    <div key={item.id} className="item-block">
                      <div className="item-line">
                        <span className="item-qty-name">
                          {item.quantity}x {item.menuItem.name}
                        </span>
                        <span className="item-price">{formatPrice(itemTotal)}</span>
                      </div>
                      {item.specialInstructions && (
                        <div className="item-instructions">
                          → {item.specialInstructions}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
          <div className="divider">─────────────────────────────</div>
        </div>

        {/* Total */}
        <div className="ticket-total">
          <div className="total-line">
            <span className="total-label">TOTAL:</span>
            <span className="total-amount">{formatPrice(orderTotal)}</span>
          </div>
          <div className="divider">─────────────────────────────</div>
        </div>

        {/* QR Code */}
        <div className="ticket-qr">
          <QRCodeSVG 
            value={qrCodeUrl}
            size={80}
            level="M"
            includeMargin={false}
          />
        </div>

        {/* Footer */}
        <div className="ticket-footer">
          <div className="print-time">Printed: {printTime}</div>
        </div>
      </div>

      {/* Print-specific CSS */}
      <style>{`
        @media screen {
          .print-ticket {
            display: none !important;
          }
        }

        @media print {
          /* Hide all screen elements */
          body * {
            visibility: hidden;
          }

          /* Show only print ticket */
          .print-ticket,
          .print-ticket * {
            visibility: visible;
          }

          /* Position ticket at top-left */
          .print-ticket {
            position: absolute;
            left: 0;
            top: 0;
            width: 80mm;
            display: block !important;
          }

          .print-content {
            font-family: 'Courier New', Courier, monospace;
            font-size: 12px;
            line-height: 1.4;
            color: #000;
            background: #fff;
            padding: 4mm;
          }

          .ticket-header {
            text-align: center;
            margin-bottom: 4mm;
          }

          .restaurant-name {
            font-size: 16px;
            font-weight: bold;
            margin: 0 0 2mm 0;
            text-transform: uppercase;
          }

          .divider {
            margin: 2mm 0;
            font-size: 10px;
          }

          .ticket-order-info {
            margin-bottom: 4mm;
          }

          .order-line {
            margin: 1mm 0;
          }

          .ticket-items {
            margin-bottom: 4mm;
          }

          .category-section {
            margin-bottom: 3mm;
          }

          .category-label {
            font-weight: bold;
            margin-bottom: 1mm;
            text-transform: uppercase;
          }

          .item-block {
            margin-bottom: 2mm;
          }

          .item-line {
            display: flex;
            justify-content: space-between;
            margin-bottom: 0.5mm;
          }

          .item-qty-name {
            flex: 1;
          }

          .item-price {
            text-align: right;
            margin-left: 4mm;
          }

          .item-instructions {
            margin-left: 4mm;
            font-style: italic;
            padding: 1mm 0;
            border-left: 2px solid #000;
            padding-left: 2mm;
          }

          .ticket-total {
            margin-bottom: 4mm;
          }

          .total-line {
            display: flex;
            justify-content: space-between;
            font-weight: bold;
            font-size: 14px;
          }

          .ticket-qr {
            text-align: center;
            margin-bottom: 2mm;
          }

          .ticket-qr svg {
            width: 80px;
            height: 80px;
          }

          .ticket-footer {
            text-align: center;
            font-size: 10px;
            margin-top: 2mm;
          }

          /* Remove any default page margins */
          @page {
            margin: 0;
            size: 80mm auto;
          }
        }
      `}</style>
    </div>
  );
}
