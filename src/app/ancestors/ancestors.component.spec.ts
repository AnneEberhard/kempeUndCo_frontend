import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AncestorsComponent } from './ancestors.component';

describe('AncestorsComponent', () => {
  let component: AncestorsComponent;
  let fixture: ComponentFixture<AncestorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AncestorsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AncestorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
