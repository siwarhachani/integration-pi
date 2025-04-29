import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduleinterviewadminComponent } from './scheduleinterviewadmin.component';

describe('ScheduleinterviewadminComponent', () => {
  let component: ScheduleinterviewadminComponent;
  let fixture: ComponentFixture<ScheduleinterviewadminComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ScheduleinterviewadminComponent]
    });
    fixture = TestBed.createComponent(ScheduleinterviewadminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
