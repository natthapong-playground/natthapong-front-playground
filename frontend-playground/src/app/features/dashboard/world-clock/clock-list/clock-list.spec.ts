import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClockList } from './clock-list';

describe('ClockList', () => {
  let component: ClockList;
  let fixture: ComponentFixture<ClockList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClockList],
    }).compileComponents();

    fixture = TestBed.createComponent(ClockList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
