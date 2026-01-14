import { createContext, useContext, useState, ReactNode } from 'react';
import { MenuItem } from '@restaurant/shared';

interface OrderItem {
  menuItemId: string;
  menuItem: MenuItem;
  quantity: number;
  specialInstructions: string | null;
}

interface OrderContextState {
  items: OrderItem[];
  tableNumber: number | null;
  serverName: string;
}

interface OrderContextActions {
  addItem: (item: MenuItem) => void;
  removeItem: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  updateInstructions: (menuItemId: string, instructions: string) => void;
  setTableNumber: (tableNumber: number | null) => void;
  setServerName: (serverName: string) => void;
  clearOrder: () => void;
}

type OrderContextValue = OrderContextState & OrderContextActions;

const OrderContext = createContext<OrderContextValue | undefined>(undefined);

interface OrderProviderProps {
  children: ReactNode;
}

export function OrderProvider({ children }: OrderProviderProps) {
  const [items, setItems] = useState<OrderItem[]>([]);
  const [tableNumber, setTableNumber] = useState<number | null>(null);
  const [serverName, setServerName] = useState<string>('');

  const addItem = (item: MenuItem) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((i) => i.menuItemId === item.id);
      
      if (existingItem) {
        // Increment quantity if item already exists
        return prevItems.map((i) =>
          i.menuItemId === item.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      
      // Add new item with quantity 1
      return [
        ...prevItems,
        {
          menuItemId: item.id,
          menuItem: item,
          quantity: 1,
          specialInstructions: null,
        },
      ];
    });
  };

  const removeItem = (menuItemId: string) => {
    setItems((prevItems) => prevItems.filter((i) => i.menuItemId !== menuItemId));
  };

  const updateQuantity = (menuItemId: string, quantity: number) => {
    if (quantity < 1) {
      removeItem(menuItemId);
      return;
    }
    
    setItems((prevItems) =>
      prevItems.map((i) =>
        i.menuItemId === menuItemId ? { ...i, quantity } : i
      )
    );
  };

  const updateInstructions = (menuItemId: string, instructions: string) => {
    setItems((prevItems) =>
      prevItems.map((i) =>
        i.menuItemId === menuItemId
          ? { ...i, specialInstructions: instructions || null }
          : i
      )
    );
  };

  const clearOrder = () => {
    setItems([]);
    setTableNumber(null);
    setServerName('');
  };

  const value: OrderContextValue = {
    items,
    tableNumber,
    serverName,
    addItem,
    removeItem,
    updateQuantity,
    updateInstructions,
    setTableNumber,
    setServerName,
    clearOrder,
  };

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrder() {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
}
