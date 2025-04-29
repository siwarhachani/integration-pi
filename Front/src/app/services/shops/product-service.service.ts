import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { HttpHeaders } from '@angular/common/http';
import { Product } from 'src/app/models/shops/product.model';


@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private apiUrl = 'http://localhost:9090/api/products';
 // private addProductUrl = 'http://localhost:9090/store_war_exploded/api/products/add_product';

  constructor(private http: HttpClient,private httpClient: HttpClient) {}

  addProduct(formData: FormData): Observable<any> {
    console.log('Sending data:', formData);  // Debug pour vérifier les données envoyées
    return this.http.post('http://localhost:9090/api/products/add_product', formData);
  }
  

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl);
  }
  checkSimilarity(product: Partial<Product>): Observable<Product | null> {
    return this.http.post<Product | null>(`${this.apiUrl}/checkSimilarity`, product);
  }
  getLowStockProducts(threshold: number): Observable<Product[]> {
    const url = `${this.apiUrl}/low-stock?threshold=${threshold}`;
    console.log('URL de la requête:', url);  // Log l'URL construite
    return this.httpClient.get<Product[]>(url);
  }
  

  getOutOfStockProducts(): Observable<string[]> {
    return this.http.get<string[]>('http://localhost:9090/api/products/out-of-stock');
  }
  
  

 // product-service.service.ts
deleteProduct(id: number): Observable<any> {
  const token = localStorage.getItem('jwtToken');

  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });

  return this.http.delete(`${this.apiUrl}/${id}`, { headers });
}

  
  

  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  updateProduct(id: number, formData: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, formData);
  }
  getUnsoldProductsPercentage() {
    return this.httpClient.get<number>('http://localhost:9090/api/products/unsold-percentage');
  }
 
  
  
}
