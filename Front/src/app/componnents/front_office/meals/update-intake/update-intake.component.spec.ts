import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateIntakeComponent } from './update-intake.component';

describe('UpdateIntakeComponent', () => {
  let component: UpdateIntakeComponent;
  let fixture: ComponentFixture<UpdateIntakeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UpdateIntakeComponent]
    });
    fixture = TestBed.createComponent(UpdateIntakeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
