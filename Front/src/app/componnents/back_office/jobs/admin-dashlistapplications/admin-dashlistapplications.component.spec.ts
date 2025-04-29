import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminDashlistapplicationsComponent } from './admin-dashlistapplications.component';

describe('AdminDashlistapplicationsComponent', () => {
  let component: AdminDashlistapplicationsComponent;
  let fixture: ComponentFixture<AdminDashlistapplicationsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AdminDashlistapplicationsComponent]
    });
    fixture = TestBed.createComponent(AdminDashlistapplicationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
