import { TestBed } from '@angular/core/testing';

import { WeightEstimateService } from './weight-estimate.service';

describe('WeightEstimateService', () => {
  let service: WeightEstimateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WeightEstimateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
