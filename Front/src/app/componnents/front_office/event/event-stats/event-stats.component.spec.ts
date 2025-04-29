import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventStatsComponent } from './event-stats.component';

describe('EventStatsComponent', () => {
  let component: EventStatsComponent;
  let fixture: ComponentFixture<EventStatsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [EventStatsComponent]
    });
    fixture = TestBed.createComponent(EventStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
