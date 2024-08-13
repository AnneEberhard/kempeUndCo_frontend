import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivationFailureComponent } from './activation-failure.component';

describe('ActivationFailureComponent', () => {
  let component: ActivationFailureComponent;
  let fixture: ComponentFixture<ActivationFailureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActivationFailureComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActivationFailureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
