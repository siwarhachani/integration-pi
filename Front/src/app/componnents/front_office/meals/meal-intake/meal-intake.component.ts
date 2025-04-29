import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Component, OnInit } from '@angular/core';


@Component({
  selector: 'app-meal-intake',
  standalone: true,
  imports: [HttpClientModule, CommonModule, RouterModule],
  templateUrl: './meal-intake.component.html',
  styleUrls: ['./meal-intake.component.css']
})
export class MealIntakeComponent  {

}
