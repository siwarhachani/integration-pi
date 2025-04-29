import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EatthismuchComponent } from './eatthismuch.component';

describe('EatthismuchComponent', () => {
  let component: EatthismuchComponent;
  let fixture: ComponentFixture<EatthismuchComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EatthismuchComponent]
    });
    fixture = TestBed.createComponent(EatthismuchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
