export interface Guitar {
  id: number;
  name: string;
  image: string;
  description: string;
  shortDescription: string;
  price: number;
}

export interface InventoryItem {
  guitarId: number;
  quantity: number;
}

export interface Order {
  id: number;
  customerName: string;
  items: Array<{
    guitarId: number;
    quantity: number;
  }>;
  totalAmount: number;
  orderDate: string;
}

export const fetchGuitars = async () => {
  console.log("fetchGuitars: called");
  const response = await fetch("http://localhost:8082/products");
  console.log("fetchGuitars: response received", response.status);
  if (!response.ok) {
    console.error("fetchGuitars: network error", response.statusText);
    throw new Error("Network response was not ok");
  }
  const data = await response.json();
  console.log("fetchGuitars: data", data);
  return data as unknown as Guitar[];
};

export const fetchInventory = async () => {
  const response = await fetch("http://localhost:8080/inventory");
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json() as unknown as InventoryItem[];
};

export const fetchOrders = async () => {
  const response = await fetch("http://localhost:8080/orders");
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json() as unknown as Order[];
};
