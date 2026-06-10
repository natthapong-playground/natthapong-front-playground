import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClockListItem } from './clock-list-item';

describe('ClockListItem', () => {
  let component: ClockListItem;
  let fixture: ComponentFixture<ClockListItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClockListItem],
    }).compileComponents();

    fixture = TestBed.createComponent(ClockListItem);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
