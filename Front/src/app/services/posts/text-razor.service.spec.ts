import { TestBed } from '@angular/core/testing';
import { TextRazorService } from './text-razor.service';


describe('TextRazorService', () => {
  let service: TextRazorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TextRazorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
