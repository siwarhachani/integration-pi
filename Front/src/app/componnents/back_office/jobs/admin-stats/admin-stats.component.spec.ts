import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminStatsComponent } from './admin-stats.component';

describe('AdminStatsComponent', () => {
  let component: AdminStatsComponent;
  let fixture: ComponentFixture<AdminStatsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AdminStatsComponent]
    });
    fixture = TestBed.createComponent(AdminStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
