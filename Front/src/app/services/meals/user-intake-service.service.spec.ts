import { TestBed } from '@angular/core/testing';

import { UserIntakeServiceService } from './user-intake-service.service';

describe('UserIntakeServiceService', () => {
  let service: UserIntakeServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserIntakeServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
