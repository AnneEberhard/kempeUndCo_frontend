import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivationSuccessComponent } from './activation-success.component';

describe('ActivationSuccessComponent', () => {
  let component: ActivationSuccessComponent;
  let fixture: ComponentFixture<ActivationSuccessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActivationSuccessComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActivationSuccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
