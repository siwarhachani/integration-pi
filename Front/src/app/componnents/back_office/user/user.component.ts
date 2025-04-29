import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { UserProfile } from "../../../models/user/user-profile.model";
import { Chart, registerables } from 'chart.js';
import { AuthService } from 'src/app/services/user/auth.service';
import { UserService } from 'src/app/services/user/user.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgChartsModule } from 'ng2-charts';
import { FooterComponent } from '../../front_office/template/footer/footer.component';
import { HeaderComponent } from '../../front_office/template/header/header.component';


@Component({
  selector: 'app-user',
  standalone: true,
  imports: [
    HttpClientModule,
    CommonModule,
    RouterModule,
    FormsModule,
   
  ],
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {
  @ViewChild('roleChartCanvas') roleChartCanvas!: ElementRef;
  @ViewChild('ageChartCanvas') ageChartCanvas!: ElementRef;

  roleChart: any;
  ageChart: any;

  roleCounts: { [key: string]: number } = {};
  ageGroupsCounts: { [key: string]: number } = {};

  users: UserProfile[] = [];
  searchUsername: string = '';

  constructor(private userService: UserService, private authService: AuthService) {
    Chart.register(...registerables);
  }

  ngOnInit() {
    this.loadAllUsers();
  }

  deleteUser(email: string) {
    this.userService.deleteUser(email).subscribe(() => {
      this.users = this.users.filter(user => user.email !== email);
    });
  }

  loadAllUsers() {
    this.userService.getAllUsers().subscribe(users => {
      this.users = users;
      this.calculateRoleCounts();
      this.calculateAgeGroups();
      this.loadRoleChart();
      this.loadAgeChart();
    });
  }

  searchUser() {
    if (this.searchUsername.trim() === '') {
      this.loadAllUsers();
      return;
    }

    this.userService.searchUserByUsername(this.searchUsername.trim()).subscribe(
      user => {
        this.users = [user];
      },
      error => {
        console.error(error);
        this.users = [];
      }
    );
  }

  sortUsers(sortBy: string) {
    this.userService.getAllUsers(sortBy).subscribe(users => {
      this.users = users;
    });
  }

  calculateRoleCounts() {
    this.roleCounts = {};
    for (let user of this.users) {
      if (this.roleCounts[user.role]) {
        this.roleCounts[user.role]++;
      } else {
        this.roleCounts[user.role] = 1;
      }
    }
  }

  calculateAgeGroups() {
    this.ageGroupsCounts = {
      '<18': 0,
      '18-40': 0,
      '40-60': 0,
      '>60': 0
    };

    const today = new Date();

    for (let user of this.users) {
      const birthdate = new Date(user.birthdate);
      let age = today.getFullYear() - birthdate.getFullYear();
      const m = today.getMonth() - birthdate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthdate.getDate())) {
        // birthday not yet passed
        age--;
      }

      if (age < 18) {
        this.ageGroupsCounts['<18']++;
      } else if (age <= 40) {
        this.ageGroupsCounts['18-40']++;
      } else if (age <= 60) {
        this.ageGroupsCounts['40-60']++;
      } else {
        this.ageGroupsCounts['>60']++;
      }
    }
  }

  loadRoleChart() {
    if (this.roleChart) {
      this.roleChart.destroy();
    }

    const roles = Object.keys(this.roleCounts);
    const counts = Object.values(this.roleCounts);

    this.roleChart = new Chart(this.roleChartCanvas.nativeElement, {
      type: 'doughnut',
      data: {
        labels: roles,
        datasets: [{
          label: 'Users by Role',
          data: counts,
          backgroundColor: ['orangered', '#000000', '#f6f6f6', '#f6c23e', '#e74a3b'],
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  }

  loadAgeChart() {
    if (this.ageChart) {
      this.ageChart.destroy();
    }

    const groups = Object.keys(this.ageGroupsCounts);
    const counts = Object.values(this.ageGroupsCounts);

    this.ageChart = new Chart(this.ageChartCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: groups,
        datasets: [{
          label: 'Users by Age Group',
          data: counts,
          backgroundColor: ['orangered', '#000000', '#f6f6f6', '#f6c23e', '#e74a3b'],
          borderColor: '#4e73df',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          }
        }
      }
    });
  }

  banUser(username: string) {
    this.userService.banUser(username).subscribe(
      () => {
        const user = this.users.find(u => u.username === username);
        if (user) user.banned = true;
      },
      error => {
        console.error('Failed to ban user', error);
      }
    );
  }

  unbanUser(username: string) {
    this.userService.unbanUser(username).subscribe(
      () => {
        const user = this.users.find(u => u.username === username);
        if (user) user.banned = false;
      },
      error => {
        console.error('Failed to unban user', error);
      }
    );
  }
}
