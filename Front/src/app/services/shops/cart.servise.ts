// src/app/service/cart.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
 // Adapte le chemin si nécessaire
import { HttpClient, HttpParams } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { CartItem } from 'src/app/models/shops/Cart-Item.model';
import { Cart } from 'src/app/models/shops/cart.model';




@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = 'http://localhost:9090/api/cart';  // <-- adapte à ton backend

  constructor(private http: HttpClient) {}

  // Ajouter un produit au panier
 /* addProductToCart(cartId: number, product: Product, quantity: number): Observable<any> {
    //const url = `${this.apiUrl}/${cartId}/add`;
    const url = `${this.apiUrl}/add`;

  
    // Création du corps de la requête contenant le produit entier et la quantité
    const body = {
      id: product.id,  // Nous enverrons l'ID du produit pour identifier le produit dans le backend
      name: product.name,
      description: product.description,
      price: product.price,
      imageUrl: product.imageUrl
    };
  
    // Appel de l'API avec le corps complet du produit
    return this.http.post(url, body, { params: new HttpParams().set('quantity', quantity.toString()) });
  }*/

    addProductToCart(productId: number, quantity: number) {
      const token = localStorage.getItem('jwtToken'); // ou sessionStorage, selon ton implémentation
    
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      });
    
      const body = { productId, quantity };
    
      return this.http.post(`${this.apiUrl}/add`, body, { headers });
    }
    
    

  
  
  
  
  

  // Obtenir tous les produits du panier
 // cart.service.ts
 getCart(): Observable<Cart> {
  const token = localStorage.getItem('jwtToken');

  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });

  return this.http.get<Cart>(`${this.apiUrl}/my-cart`, { headers });
}


  

  // Supprimer un produit du panier
  removeItemFromCart(cartId: number, itemId: number) {
    const token = localStorage.getItem('jwtToken');
  
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  
    return this.http.delete(`http://localhost:9090/project_war_exploded/api/cart/${cartId}/items/${itemId}`, { headers });
  }
  
  
  
  
  

  // Vider le panier
  clearCart(): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/clear`);
  }

  // Calculer le total côté frontend
  calculateTotal(cart: CartItem[]): number {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  validerPanier(cartId: number): Observable<any> {
    const token = localStorage.getItem('jwtToken');
  
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  
    return this.http.post(`${this.apiUrl}/${cartId}/valider`, {}, { headers,    responseType: 'text'
    });
  }

  getDiscountPercentage(): Observable<number> {
    return this.http.get<number>(`http://localhost:9090/project_war_exploded/api/statistics/discounted-carts-percentage`);
  }
  
  
 
  
  
}
