import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminCrudJobOffersComponent } from './admin-crud-job-offers.component';

describe('AdminCrudJobOffersComponent', () => {
  let component: AdminCrudJobOffersComponent;
  let fixture: ComponentFixture<AdminCrudJobOffersComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AdminCrudJobOffersComponent]
    });
    fixture = TestBed.createComponent(AdminCrudJobOffersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
