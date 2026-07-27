import { TestBed } from '@angular/core/testing';

import { UiThemeService } from './ui-theme.service';

describe('UiThemeService', () => {
  beforeEach(() => {
    localStorage.removeItem('ui.theme.v1');
    TestBed.configureTestingModule({});
  });

  afterEach(() => localStorage.removeItem('ui.theme.v1'));

  it('uses ocean by default and persists the light selection', () => {
    const service = TestBed.inject(UiThemeService);

    expect(service.theme()).toBe('ocean');
    service.toggle();

    expect(service.theme()).toBe('light');
    expect(localStorage.getItem('ui.theme.v1')).toBe('light');
  });
});
