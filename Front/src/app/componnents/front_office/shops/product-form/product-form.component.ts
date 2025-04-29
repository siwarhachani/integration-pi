import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgChartsModule } from 'ng2-charts';
import { Product } from 'src/app/models/shops/product.model';
import { ProductService } from 'src/app/services/shops/product-service.service';
import { FooterComponent } from '../../template/footer/footer.component';
import { HeaderComponent } from '../../template/header/header.component';


@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [
    HttpClientModule,
    CommonModule,
    RouterModule,
    FormsModule,
  ReactiveFormsModule,
    NgChartsModule
  ],
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.css']
})
export class ProductFormComponent implements OnInit {
  productForm!: FormGroup;
  selectedFile: File | null = null;
  alertMessage: string | null = null;  // Ajoute cette variable pour stocker le message d'alerte



  constructor(private fb: FormBuilder, private productService: ProductService) {}

  ngOnInit(): void {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', [Validators.required, Validators.minLength(10)]],
      quantity: [1, [Validators.required, Validators.min(1)]],
      price: [0, [Validators.required, Validators.min(0.01)]],
      category: ['AUTRE', Validators.required] // ✅ Ajout ici

    });
  }

  

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      console.log('Fichier sélectionné :', this.selectedFile.name);
    } else {
      this.selectedFile = null;
    }
  }
  

  onSubmit(): void {
    console.log('Tentative de soumission du formulaire');
  
    if (this.productForm.valid && this.selectedFile) {
      const productForSimilarityCheck: Partial<Product> = {
        name: this.productForm.get('name')?.value,
        description: this.productForm.get('description')?.value,
      };
  
      this.productService.checkSimilarity(productForSimilarityCheck).subscribe({
        next: (similarProduct) => {
          if (similarProduct) {
            const confirmed = window.confirm(
              `⚠️ Un produit similaire existe déjà : "${similarProduct.name}".\n\nVoulez-vous l’ajouter quand même ?`
            );
            if (confirmed) {
              this.addProduct();
            } else {
              console.log("❌ Ajout annulé par l'utilisateur.");
            }
          } else {
            this.addProduct();
          }
        },
        error: (err) => {
          console.error('Erreur lors de la vérification de similarité', err);
          alert("Erreur lors de la vérification de similarité. ce produit existe déja");
          this.addProduct();
        }
    });
      
      
    } else {
      if (!this.selectedFile) {
        console.log('⚠️ Veuillez sélectionner une image.');
      } else {
        console.log('⚠️ Le formulaire est invalide.');
      }
    }
  }
  
  

  addProduct(): void {
    const formData = new FormData();
    formData.append('name', this.productForm.get('name')?.value);
    formData.append('description', this.productForm.get('description')?.value);
    formData.append('quantity', this.productForm.get('quantity')?.value);
    formData.append('price', this.productForm.get('price')?.value);
    formData.append('image', this.selectedFile!, this.selectedFile!.name);
    formData.append('category', this.productForm.get('category')?.value);


  
    this.productService.addProduct(formData).subscribe(
      res => {
        console.log('✅ Produit ajouté avec succès', res);
        this.productForm.reset();
        this.selectedFile = null;
      },
      err => {
        console.error('❌ Erreur lors de l\'ajout :', err);
      }
    );
  }

  
  
  
  

  
}
