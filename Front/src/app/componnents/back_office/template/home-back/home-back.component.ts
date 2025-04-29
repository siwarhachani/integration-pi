import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home-back',
   standalone:true,
     imports: [
        HttpClientModule,
        CommonModule,
        RouterModule,
        FormsModule,
       NgxSliderModule,
       
      ],
  templateUrl: './home-back.component.html',
  styleUrls: ['./home-back.component.css']
})
export class HomeBackComponent {

}
