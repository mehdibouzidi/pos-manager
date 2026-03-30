import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllProfilsComponent } from './all-profils.component';

describe('AllProfilsComponent', () => {
  let component: AllProfilsComponent;
  let fixture: ComponentFixture<AllProfilsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllProfilsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllProfilsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
