import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgChartsModule } from 'ng2-charts';
import { ActivityType } from 'src/app/models/activities/activityType.model';
import { ActivityService } from 'src/app/services/activities/Activity.service';
import { ActivityTypeService } from 'src/app/services/activities/ActivityType.service';
import { FooterComponent } from '../../front_office/template/footer/footer.component';
import { HeaderComponent } from '../../front_office/template/header/header.component';

@Component({
  selector: 'app-admincrud',
   standalone: true,
    imports: [
      HttpClientModule,
      CommonModule,
      RouterModule,
      FormsModule,
      HeaderComponent,
      FooterComponent,
      NgChartsModule
    ],
  templateUrl: './admincrud.component.html',
  styleUrls: ['./admincrud.component.css']
})
export class AdmincrudComponent implements OnInit {
  Math = Math;


  activityTypes: ActivityType[] = [];
  filteredActivityTypes: ActivityType[] = [];

  // Search and Pagination
  searchQuery: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 5; // 5 items per page

  // Form
  formModel: ActivityType = this.getEmptyActivityType();
  isEditing: boolean = false;
  showForm: boolean = false;
pages: any;
totalPages: any;

  constructor(private activityTypeService: ActivityTypeService,private activity :ActivityService) {}

  ngOnInit(): void {
    this.loadActivityTypes();
  }

  loadActivityTypes(): void {
    this.activity.getAllActivityTypes().subscribe({
      next: (data) => {
        console.log('Received activity types:', data);
        this.activityTypes = data;
        this.applyFilter();
      },
      error: (err) => {
        console.error('Error loading activity types:', err);
      }
    });
  }

  applyFilter(): void {
    if (this.searchQuery.trim()) {
      this.filteredActivityTypes = this.activityTypes.filter(item =>
        item.title?.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        item.Type?.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        item.BodyPart?.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    } else {
      this.filteredActivityTypes = [...this.activityTypes];
    }
    this.currentPage = 1; // Reset to first page on search
  }

  get paginatedActivityTypes(): ActivityType[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredActivityTypes.slice(startIndex, startIndex + this.itemsPerPage);
  }

  changePage(page: number): void {
    this.currentPage = page;
  }

  openAddForm(): void {
    this.formModel = this.getEmptyActivityType();
    this.isEditing = false;
    this.showForm = true;
  }

  openEditForm(activityType: ActivityType): void {
    this.formModel = { ...activityType };
    this.isEditing = true;
    this.showForm = true;
  }

  saveActivityType(): void {
    if (this.isEditing && this.formModel.actTypeId) {
      this.activityTypeService.updateActivityType(this.formModel.actTypeId, this.formModel).subscribe({
        next: () => {
          console.log('Activity Type updated.');
          this.loadActivityTypes();
          this.closeForm();
        },
        error: (err) => {
          console.error('Error updating activity type:', err);
        }
      });
    } else {
      this.activityTypeService.createActivityType(this.formModel).subscribe({
        next: () => {
          console.log('Activity Type created.');
          this.loadActivityTypes();
          this.closeForm();
        },
        error: (err) => {
          console.error('Error creating activity type:', err);
        }
      });
    }
  }

  deleteActivityType(actTypeId: number): void {
    if (confirm('Are you sure you want to delete this activity type?')) {
      this.activityTypeService.deleteActivityType(actTypeId).subscribe({
        next: () => {
          console.log('Activity Type deleted.');
          this.loadActivityTypes();
        },
        error: (err) => {
          console.error('Error deleting activity type:', err);
        }
      });
    }
  }

  closeForm(): void {
    this.showForm = false;
    this.formModel = this.getEmptyActivityType();
  }

  private getEmptyActivityType(): ActivityType {
    return {
      actTypeId: 0,
      title: '',
      description: '',
      Type: '',
      BodyPart: '',
      Equipment: '',
      Level: '',
      Rating: 0,
      RatingDesc: '',
    };
  }
}
