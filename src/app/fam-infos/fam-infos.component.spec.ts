import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FamInfosComponent } from './fam-infos.component';

describe('FamInfosComponent', () => {
  let component: FamInfosComponent;
  let fixture: ComponentFixture<FamInfosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FamInfosComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FamInfosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
