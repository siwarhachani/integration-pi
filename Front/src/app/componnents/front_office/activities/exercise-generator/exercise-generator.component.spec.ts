import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExerciseGeneratorComponent } from './exercise-generator.component';

describe('ExerciseGeneratorComponent', () => {
  let component: ExerciseGeneratorComponent;
  let fixture: ComponentFixture<ExerciseGeneratorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ExerciseGeneratorComponent]
    });
    fixture = TestBed.createComponent(ExerciseGeneratorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
