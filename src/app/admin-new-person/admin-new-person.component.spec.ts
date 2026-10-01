import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminNewPersonComponent } from './admin-new-person.component';

describe('AdminNewPersonComponent', () => {
  let component: AdminNewPersonComponent;
  let fixture: ComponentFixture<AdminNewPersonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminNewPersonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminNewPersonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
