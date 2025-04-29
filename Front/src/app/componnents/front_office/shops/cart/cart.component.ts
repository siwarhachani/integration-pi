import { Component, OnInit } from '@angular/core';
import { CartItem } from 'src/app/models/shops/Cart-Item.model';
import { Cart } from 'src/app/models/shops/cart.model';
import { Product } from 'src/app/models/shops/product.model';
import { CartService } from 'src/app/services/shops/cart.servise';
import { CurrencyConversionService } from 'src/app/services/shops/currency-conversion.service';// Import du service de conversion
import { ProductService } from 'src/app/services/shops/product-service.service';// Pour rechercher les produits similaires
import { TextRazorService } from 'src/app/services/posts/text-razor.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgChartsModule } from 'ng2-charts';
import { FooterComponent } from '../../template/footer/footer.component';
import { HeaderComponent } from '../../template/header/header.component';

//import { Chart } from 'chart.js/auto';



@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    HttpClientModule,
    CommonModule,
    RouterModule,
    FormsModule,
 ReactiveFormsModule,
    NgChartsModule
  ],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {

  cart: Cart = new Cart();
  total: number = 0;
  //cartId: number = 1;
  cartItems: CartItem[] = [];
  similarProducts: Product[] = []; // Produits recommandés
  totalInUSD: number = 0;  // Ajout pour le total en USD
  discountPercentage: number = 0;



  constructor(
    private cartService: CartService,
    private textRazorService: TextRazorService,
    private productService: ProductService ,// Service pour chercher des produits dans ta base
    private currencyConversionService: CurrencyConversionService
  ) {}

  ngOnInit(): void {
    this.loadCart();
    

  }

  
  

  loadCart(): void {
    this.cartService.getCart().subscribe((cart) => {
      console.log("📦 Panier chargé :", cart); // 👈 Ajoute ceci
      console.log("🆔 ID du panier :", cart.id); // 👈


      this.cart = cart;
      this.cartItems = cart.items;
      this.total = this.cartItems.reduce(
        (sum: number, item: any) => sum + item.product.price * item.quantity, 0
      );
      this.convertTotalToUSD(this.total);
    });
  }
  
  convertTotalToUSD(amount: number): void {
    this.currencyConversionService.convertCurrency(amount).subscribe(data => {
      this.totalInUSD = data.conversion_result;  // Récupérer le résultat de la conversion
      console.log(`Total en USD: ${this.totalInUSD}`);
    }, error => {
      console.error('Erreur lors de la conversion de devise', error);
    });
  }

 /* getSimilarProducts(description: string): void {
    this.textRazorService.extractEntities(description).subscribe({
      next: (data) => {
        const entities = data.response.entities.map((e: any) => e.entityId);
        console.log('🧠 Entités trouvées :', entities);

        this.productService.getProducts().subscribe((products: Product[]) => {
          this.similarProducts = products.filter(product =>
            entities.some((entity: string) =>
              product.description.toLowerCase().includes(entity.toLowerCase())
            )
          );
        });
        
      },
      error: (err) => {
        console.error('❌ Erreur lors de l’analyse TextRazor :', err);
      }
    });
  }*/
  getFileName(path: string): string {
    return path.split('\\').pop()?.split('/').pop() || '';
  }

  valider(): void {
      if (this.cart && this.cart.id) {
        this.cartService.validerPanier(this.cart.id).subscribe({
          next: (message: string) => {
      alert('✅ ' + message);

            alert('✅ Panier validé avec succès !');
          },
          error: (err) => {
            console.error('Erreur lors de la validation du panier', err);
            alert('❌ Erreur : ' + err.error);
          }
        });
      } else {
        alert('❌ Aucun panier chargé');
      }
    }
    
  

  removeItem(itemId: number): void {
    const cartId = this.cart?.id; // récupère le cartId du panier chargé
  
    if (!cartId) return;
  
    this.cartService.removeItemFromCart(cartId, itemId).subscribe(() => {
      this.loadCart(); // recharge le panier après suppression
    });
  }
  
  

}
