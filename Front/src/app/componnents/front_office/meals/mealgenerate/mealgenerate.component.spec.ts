import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MealgenerateComponent } from './mealgenerate.component';

describe('MealgenerateComponent', () => {
  let component: MealgenerateComponent;
  let fixture: ComponentFixture<MealgenerateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MealgenerateComponent]
    });
    fixture = TestBed.createComponent(MealgenerateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
