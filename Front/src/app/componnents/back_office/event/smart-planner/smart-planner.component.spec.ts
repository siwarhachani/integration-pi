import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmartPlannerComponent } from './smart-planner.component';

describe('SmartPlannerComponent', () => {
  let component: SmartPlannerComponent;
  let fixture: ComponentFixture<SmartPlannerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SmartPlannerComponent]
    });
    fixture = TestBed.createComponent(SmartPlannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
