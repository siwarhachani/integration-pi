import { Component, OnInit } from '@angular/core';
import { CartService } from 'src/app/services/shops/cart.servise';
import { ProductService } from 'src/app/services/shops/product-service.service';
import { Chart } from 'chart.js/auto';


@Component({
  selector: 'app-product-stats',
  templateUrl: './product-stats.component.html',
  styleUrls: ['./product-stats.component.css']
})
export class ProductStatsComponent implements OnInit {

  outOfStockProducts: string[] = [];
  discountPercentage: number = 0;

  constructor(
    private productService: ProductService,
    private cartService: CartService // 👈
  ) {}

  ngOnInit() {
    this.loadOutOfStockProducts();
    this.loadDiscountPercentage(); // 👈 move here
  }

  loadOutOfStockProducts(): void {
    this.productService.getOutOfStockProducts().subscribe(data => {
      this.outOfStockProducts = data;
    });
  }

  loadDiscountPercentage(): void {
    this.cartService.getDiscountPercentage().subscribe((percentage) => {
      this.discountPercentage = percentage;
      this.renderChart();
    });
  }

  renderChart(): void {
    const ctx = document.getElementById('discountChart') as HTMLCanvasElement;
    if (ctx) {
      new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Paniers avec remise', 'Paniers sans remise'],
          datasets: [{
            data: [this.discountPercentage, 100 - this.discountPercentage],
            backgroundColor: ['#4CAF50', '#FFC107'],
          }]
        },
        options: {
          plugins: {
            title: {
              display: true,
              text: 'Pourcentage des paniers avec remise'
            }
          }
        }
      });
    }
  }
}
