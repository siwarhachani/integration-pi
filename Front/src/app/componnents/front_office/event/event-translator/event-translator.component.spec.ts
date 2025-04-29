import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventTranslatorComponent } from './event-translator.component';

describe('EventTranslatorComponent', () => {
  let component: EventTranslatorComponent;
  let fixture: ComponentFixture<EventTranslatorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EventTranslatorComponent]
    });
    fixture = TestBed.createComponent(EventTranslatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
