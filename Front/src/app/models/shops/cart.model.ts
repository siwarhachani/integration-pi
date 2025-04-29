// src/app/models/cart.model.ts
import { CartItem } from './Cart-Item.model'

export class Cart {
  cartId!: number;
  id!: number;              // 👈 ajoute ceci si l'ID existe côté backend
  totalPrice!: number;
  discount!: number;


  items: CartItem[] = [];

  addToCart(cartItem: CartItem): void {
    const existingItem = this.items.find(item => item.id === cartItem.id);
    if (existingItem) {
      existingItem.quantity += cartItem.quantity;
    } else {
      this.items.push(cartItem);
    }
  }

  removeFromCart(id: number): void {
    this.items = this.items.filter(item => item.id !== id);
  }

  getTotal(): number {
    return this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  getTotalItems(): number {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }
}
