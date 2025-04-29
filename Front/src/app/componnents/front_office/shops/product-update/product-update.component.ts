import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NgChartsModule } from 'ng2-charts';
import { ProductService } from 'src/app/services/shops/product-service.service';
import { FooterComponent } from '../../template/footer/footer.component';
import { HeaderComponent } from '../../template/header/header.component';
//import { Product } from '../models/product.model';

@Component({
  selector: 'app-product-update',
  standalone: true,
  imports: [
    HttpClientModule,
    CommonModule,
    RouterModule,
    FormsModule,
  ReactiveFormsModule,
    NgChartsModule
  ],
  templateUrl: './product-update.component.html',
  styleUrls: ['./product-update.component.css']
})
export class ProductUpdateComponent implements OnInit {
  productForm: FormGroup;
  selectedFile: File | null = null;
  productId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
      quantity: ['', [Validators.required, Validators.min(0)]],
      image: [''] // optional, for the file upload
    });
  }

  ngOnInit(): void {
    // Safely retrieve the product ID from the URL
    this.productId = +this.route.snapshot.paramMap.get('id')!;
    if (this.productId) {
      this.getProductById();
    } else {
      console.error('Product ID is missing');
      this.router.navigate(['/product-list']); // Redirect to products list if no ID found
    }
  }

  // Fetch product details from backend to pre-fill the form
  getProductById(): void {
    this.productService.getProductById(this.productId!).subscribe(
      (product) => {
        // Pre-fill the form with the product data
        this.productForm.patchValue(product);
      },
      (error) => {
        console.error('Error fetching product data:', error);
      }
    );
  }

  // Handle file selection for image upload
  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
  }

  // Submit the form to update the product
  onSubmit(): void {
    if (this.productForm.valid && this.productId !== null) {
      const formData = new FormData();
      formData.append('name', this.productForm.get('name')?.value);
      formData.append('description', this.productForm.get('description')?.value);
      formData.append('price', this.productForm.get('price')?.value);
      formData.append('quantity', this.productForm.get('quantity')?.value);

      if (this.selectedFile) {
        formData.append('image', this.selectedFile, this.selectedFile.name);
      }

      this.productService.updateProduct(this.productId, formData).subscribe(
        (response) => {
          this.router.navigate(['/product-list']); // Redirect after successful update
        },
        (error) => {
          console.error('Error updating product:', error);
        }
      );
    } else {
      console.log('Form is invalid');
    }
  }
}
