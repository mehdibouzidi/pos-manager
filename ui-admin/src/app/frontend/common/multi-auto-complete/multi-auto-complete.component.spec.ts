import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiAutoCompleteComponent } from './multi-auto-complete.component';

describe('MultiAutoCompleteComponent', () => {
  let component: MultiAutoCompleteComponent;
  let fixture: ComponentFixture<MultiAutoCompleteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MultiAutoCompleteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MultiAutoCompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
