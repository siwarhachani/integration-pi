import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventMapComponent } from './event-map.component';

describe('EventMapComponent', () => {
  let component: EventMapComponent;
  let fixture: ComponentFixture<EventMapComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EventMapComponent]
    });
    fixture = TestBed.createComponent(EventMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
