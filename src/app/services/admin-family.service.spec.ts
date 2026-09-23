import { TestBed } from '@angular/core/testing';

import { AdminFamilyService } from './admin-family.service';

describe('AdminFamilyService', () => {
  let service: AdminFamilyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminFamilyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
