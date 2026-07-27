import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/services/auth.service';
import { GoogleAuthButton } from './google-auth-button';

const CONFIGURED_CLIENT_ID = environment.googleClientId;

describe('GoogleAuthButton', () => {
  let fixture: ComponentFixture<GoogleAuthButton>;
  let googleCallback: ((response: { credential: string }) => void) | undefined;
  let auth: { loginWithGoogle: ReturnType<typeof vi.fn> };
  let router: { navigate: ReturnType<typeof vi.fn> };
  let renderButton: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    auth = { loginWithGoogle: vi.fn(() => of({})) };
    router = { navigate: vi.fn() };
    renderButton = vi.fn();
  });

  afterEach(() => {
    environment.googleClientId = CONFIGURED_CLIENT_ID;
    delete window.google;
  });

  async function createComponent(clientId = ''): Promise<void> {
    environment.googleClientId = clientId;
    await TestBed.configureTestingModule({
      imports: [GoogleAuthButton],
      providers: [
        { provide: AuthService, useValue: auth },
        { provide: Router, useValue: router },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GoogleAuthButton);
    fixture.detectChanges();
    await fixture.whenStable();
  }

  function installGoogleMock(): void {
    window.google = {
      accounts: {
        id: {
          initialize: vi.fn((config: { callback: (response: { credential: string }) => void }) => {
            googleCallback = config.callback;
          }),
          renderButton,
        },
      },
    } as typeof window.google;
  }

  it('hides the Google option when no client ID is configured', async () => {
    await createComponent();

    expect(fixture.nativeElement.querySelector('.auth-divider')).toBeNull();
  });

  it('renders Google and exchanges the returned credential', async () => {
    installGoogleMock();
    await createComponent('test-client-id');

    expect(renderButton).toHaveBeenCalledOnce();
    googleCallback?.({ credential: 'google-id-token' });

    expect(auth.loginWithGoogle).toHaveBeenCalledWith('google-id-token');
    expect(router.navigate).toHaveBeenCalledWith(['/profile']);
  });

  it('ignores a Google callback after the component is destroyed', async () => {
    installGoogleMock();
    await createComponent('test-client-id');
    fixture.destroy();

    googleCallback?.({ credential: 'late-google-id-token' });

    expect(auth.loginWithGoogle).not.toHaveBeenCalled();
  });
});
