import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // await AsyncStorage.removeItem('@GoMarktplace/products');
      const productsStorage = await AsyncStorage.getItem(
        '@GoMarktplace/products',
      );

      if (productsStorage) setProducts(JSON.parse(productsStorage));
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const productExists = products.find(p => p.id === product.id);

      if (productExists) {
        const incrementQuantity = products.map(p => {
          if (p.id === productExists.id) p.quantity += 1;

          return p;
        });

        setProducts(incrementQuantity);
        await AsyncStorage.setItem(
          '@GoMarktplace/products',
          JSON.stringify(incrementQuantity),
        );
      } else {
        const addQuantity = {
          ...product,
          quantity: 1,
        };
        setProducts([...products, addQuantity]);

        await AsyncStorage.setItem(
          '@GoMarktplace/products',
          JSON.stringify([...products, addQuantity]),
        );
      }
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART
      const newCart = products.map(product => {
        if (product.id === id) product.quantity += 1;

        return product;
      });

      setProducts(newCart);

      await AsyncStorage.setItem(
        '@GoMarktplace/products',
        JSON.stringify(newCart),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
      const newCart = products.map(product => {
        if (product.id === id) {
          if (product.quantity > 0) product.quantity -= 1;
        }

        return product;
      });

      setProducts(newCart);

      await AsyncStorage.setItem(
        '@GoMarktplace/products',
        JSON.stringify(newCart),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
