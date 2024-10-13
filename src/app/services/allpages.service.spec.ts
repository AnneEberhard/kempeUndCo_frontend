import { TestBed } from '@angular/core/testing';

import { AllpagesService } from './allpages.service';

describe('AllpagesService', () => {
  let service: AllpagesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AllpagesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
