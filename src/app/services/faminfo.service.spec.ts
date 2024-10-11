import { TestBed } from '@angular/core/testing';

import { FaminfoService } from './faminfo.service';

describe('FaminfoService', () => {
  let service: FaminfoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FaminfoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
