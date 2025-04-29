import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduleInterviewCandidateComponent } from './schedule-interview-candidate.component';

describe('ScheduleInterviewCandidateComponent', () => {
  let component: ScheduleInterviewCandidateComponent;
  let fixture: ComponentFixture<ScheduleInterviewCandidateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ScheduleInterviewCandidateComponent]
    });
    fixture = TestBed.createComponent(ScheduleInterviewCandidateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
