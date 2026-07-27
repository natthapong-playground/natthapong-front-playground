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
    fixture.componentRef.setInput('country', {
      code: 'TH',
      name: 'Thailand',
      timezone: 'Asia/Bangkok',
      utcOffsetMinutes: 420,
      utcOffsetLabel: 'UTC+07:00',
      localTime: '12:00:00',
    });
    fixture.componentRef.setInput('now', new Date('2026-07-24T12:00:00Z'));
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
