export class CartItem {
  id?: number;
  name!: string;
  price!: number;
  quantity!: number;
  imageUrl!: string;
  product: any;

  constructor(productId: number, name: string, price: number, quantity: number, imageUrl: string) {
    this.id = productId;
    this.name = name;
    this.price = price;
    this.quantity = quantity;
    this.imageUrl = imageUrl;
  }
}
