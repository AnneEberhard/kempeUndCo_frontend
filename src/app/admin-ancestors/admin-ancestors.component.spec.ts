import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminAncestorsComponent } from './admin-ancestors.component';

describe('AdminAncestorsComponent', () => {
  let component: AdminAncestorsComponent;
  let fixture: ComponentFixture<AdminAncestorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminAncestorsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminAncestorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
