import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminPersonComponent } from './admin-person.component';

describe('AdminPersonComponent', () => {
  let component: AdminPersonComponent;
  let fixture: ComponentFixture<AdminPersonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminPersonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminPersonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
