import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmotionDashboardComponent } from './emotion-dashboard.component';

describe('EmotionDashboardComponent', () => {
  let component: EmotionDashboardComponent;
  let fixture: ComponentFixture<EmotionDashboardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EmotionDashboardComponent]
    });
    fixture = TestBed.createComponent(EmotionDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
