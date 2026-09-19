// GOOGLE AUTH — Free OAuth 2.0 for users, keeps anonymous flow working
// Uses Google Identity Services (GIS) — free at any volume, no billing required

export interface GoogleUser {
  id: string;
  email: string;
  name: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
}

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

export function isGoogleAuthConfigured(): boolean {
  return !!GOOGLE_CLIENT_ID && GOOGLE_CLIENT_ID.length > 10;
}

export function loadGoogleScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') { resolve(false); return; }
    if ((window as any).google?.accounts?.id) { resolve(true); return; }
    
    const existing = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (existing) {
      const check = setInterval(() => {
        if ((window as any).google?.accounts?.id) { clearInterval(check); resolve(true); }
      }, 200);
      setTimeout(() => { clearInterval(check); resolve(false); }, 5000);
      return;
    }
    
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });
}

export function initializeGoogleAuth(callback: (user: GoogleUser) => void): boolean {
  if (typeof window === 'undefined') return false;
  if (!isGoogleAuthConfigured()) return false;
  
  const google = (window as any).google;
  if (!google?.accounts?.id) return false;
  
  try {
    google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (response: any) => {
        try {
          // Decode JWT
          const payload = JSON.parse(atob(response.credential.split('.')[1]));
          const user: GoogleUser = {
            id: payload.sub,
            email: payload.email,
            name: payload.name,
            picture: payload.picture,
            given_name: payload.given_name,
            family_name: payload.family_name
          };
          callback(user);
        } catch (e) {
          console.error('Failed to decode Google credential', e);
        }
      },
      auto_select: false,
      cancel_on_tap_outside: true
    });
    return true;
  } catch (e) {
    console.error('Failed to initialize Google Auth', e);
    return false;
  }
}

export function renderGoogleButton(elementId: string) {
  if (typeof window === 'undefined') return;
  const google = (window as any).google;
  if (!google?.accounts?.id) return;
  
  const element = document.getElementById(elementId);
  if (!element) return;
  
  try {
    google.accounts.id.renderButton(element, {
      theme: 'outline',
      size: 'large',
      width: element.offsetWidth || 300,
      text: 'signin_with',
      shape: 'pill'
    });
  } catch (e) {
    console.error('Failed to render Google button', e);
  }
}

export function promptGoogleOneTap() {
  if (typeof window === 'undefined') return;
  const google = (window as any).google;
  if (!google?.accounts?.id) return;
  try {
    google.accounts.id.prompt();
  } catch {}
}

// Link anonymous data to Google user
export function linkAnonymousToGoogle(googleUser: GoogleUser, anonymousUserId: string) {
  try {
    // Get anonymous user data keys
    const anonKeys = {
      notes: `spi_notes_${anonymousUserId}`,
      tasks: `spi_tasks_${anonymousUserId}`,
      stats: `spi_stats_${anonymousUserId}`,
      assistant: `spi_assistant_${anonymousUserId}`
    };
    
    const googleKeys = {
      notes: `spi_notes_google_${googleUser.id}`,
      tasks: `spi_tasks_google_${googleUser.id}`,
      stats: `spi_stats_google_${googleUser.id}`,
      assistant: `spi_assistant_google_${googleUser.id}`
    };
    
    // If Google user has no data, copy anonymous data to Google
    // If Google user has data, merge (keep both, deduplicate by id)
    for (const key of Object.keys(anonKeys) as (keyof typeof anonKeys)[]) {
      const anonData = localStorage.getItem(anonKeys[key]);
      const googleData = localStorage.getItem(googleKeys[key]);
      
      if (!anonData) continue;
      
      if (!googleData) {
        // No Google data — copy anonymous
        localStorage.setItem(googleKeys[key], anonData);
      } else {
        // Both exist — merge arrays by id
        try {
          const anonArr = JSON.parse(anonData);
          const googleArr = JSON.parse(googleData);
          if (Array.isArray(anonArr) && Array.isArray(googleArr)) {
            const merged = [...googleArr];
            const existingIds = new Set(googleArr.map((item: any) => item.id));
            for (const item of anonArr) {
              if (!existingIds.has(item.id)) {
                merged.push(item);
              }
            }
            localStorage.setItem(googleKeys[key], JSON.stringify(merged));
          }
        } catch {
          // If not arrays, keep Google data
        }
      }
    }
    
    // Save Google user as current
    localStorage.setItem('spi_google_user', JSON.stringify(googleUser));
    localStorage.setItem('spi_current_user_google_id', googleUser.id);
    
    return true;
  } catch (e) {
    console.error('Failed to link anonymous to Google', e);
    return false;
  }
}

export function getGoogleUser(): GoogleUser | null {
  try {
    const saved = localStorage.getItem('spi_google_user');
    if (!saved) return null;
    return JSON.parse(saved);
  } catch {
    return null;
  }
}

export function signOutGoogle() {
  try {
    localStorage.removeItem('spi_google_user');
    localStorage.removeItem('spi_current_user_google_id');
    // Don't delete Google data — keep it for next login
    const google = (window as any).google;
    if (google?.accounts?.id) {
      try { google.accounts.id.disableAutoSelect(); } catch {}
    }
  } catch {}
}
