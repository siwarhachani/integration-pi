import { Component, OnInit } from '@angular/core';
import { Product } from 'src/app/models/shops/product.model';
import { CartService } from 'src/app/services/shops/cart.servise';
import { ProductService } from 'src/app/services/shops/product-service.service';
import { AuthService } from 'src/app/services/user/auth.service';
import { FooterComponent } from '../../template/footer/footer.component';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgChartsModule } from 'ng2-charts';
import { HeaderComponent } from '../../template/header/header.component';


@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    HttpClientModule,
    CommonModule,
    RouterModule,
    FormsModule,
    HeaderComponent,
    FooterComponent,
   
  ],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  cartId: number = 1; // Définir le cartId ici (par exemple 1)
  searchTerm: string = '';
  sortOrder: string = '';
  selectedCategory: string = ''; // Catégorie sélectionnée
  filteredProducts: Product[] = []; // Liste filtrée des produits

  paginatedProducts: Product[] = []; // Products shown on the current page

  currentPage: number = 1;
  pageSize: number = 6;
  userRole : string | null=null;








  constructor(
    private productService: ProductService,
    private cartService: CartService,private authService : AuthService
   // private translateService: TranslateService
  ) {
    this.userRole=  this.authService.getRole();
  }
  canDelete():boolean{
return this.userRole==='ADMIN';

  }

  ngOnInit(): void {
    // Charger les produits depuis le service
    this.productService.getProducts().subscribe(products => {
      this.products = products;
      this.updatePaginatedProducts();

      this.filteredProducts = products; // Initialement tous les produits sont affichés
    });

     // Charger les produits à faible stock (ex. seuil de 5)
    
    

    
      // Charger les produits à faible stock (ex. seuil de 5)
      
  }

  updatePaginatedProducts() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedProducts = this.products.slice(startIndex, endIndex);
  }
  get totalPages(): number {
    return Math.ceil(this.products.length / this.pageSize);
  }
  
  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePaginatedProducts();
    }
  }
  
  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedProducts();
    }
  }
  
  
  

  getProducts(): void {
    this.productService.getProducts().subscribe({
      next: (data: Product[]) => {
        this.products = data;
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des produits:', err);
      }
    });
  }

  

  addToCart(product: Product): void {
    const quantity = Number(prompt(`Combien d'unités de "${product.name}" voulez-vous acheter ?`));
  
    if (!quantity || quantity <= 0) {
      alert("Quantité invalide !");
      return;
    }
  
    if (quantity > product.quantity) {
      alert(`Stock insuffisant ! Il reste ${product.quantity} unités.`);
      return;
    }
  
    this.cartService.addProductToCart(product.id!, quantity).subscribe(
      (response) => {
        console.log('Produit ajouté au panier', response);
        alert(`${quantity} x ${product.name} ajoutés au panier.`);
      },
      (error) => {
        console.error('Erreur lors de l\'ajout du produit au panier', error);
        alert("Erreur lors de l'ajout au panier !");
      }
    );
  }
    

 
  
  

  deleteProduct(id: number): void {
    this.productService.deleteProduct(id).subscribe({
      next: () => {
        this.getProducts();  // Rafraîchir la liste
      },
      error: (err) => {
        console.error('Erreur lors de la suppression:', err);
      }
    });
  }
  getFileName(path: string): string {
    return path.split('\\').pop()?.split('/').pop() || '';
  }
  
  getFilteredAndSortedProducts() {
    let filtered = this.products.filter(product =>
      product.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
     // Filtrer par catégorie
     if (this.selectedCategory) {
      filtered = filtered.filter(product => product.category === this.selectedCategory);
    }
  
    if (this.sortOrder === 'asc') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (this.sortOrder === 'desc') {
      filtered.sort((a, b) => b.price - a.price);
    }
  
    return filtered;
  }
  onCategoryChange(event: Event): void {
    const selectedCategory = (event.target as HTMLSelectElement).value;
    this.selectedCategory = selectedCategory;

    if (selectedCategory) {
      this.filteredProducts = this.products.filter(product => product.category === selectedCategory);
    } else {
      this.filteredProducts = this.products; // Afficher tous les produits si aucune catégorie n'est sélectionnée
    }
  }
  
  
}
