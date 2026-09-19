'use client';
import { useEffect, useState } from 'react';
import { LogOut } from 'lucide-react';
import { isGoogleAuthConfigured, loadGoogleScript, initializeGoogleAuth, renderGoogleButton, getGoogleUser, signOutGoogle, linkAnonymousToGoogle, GoogleUser } from '@/lib/googleAuth';
import { userStorage } from '@/lib/user';

export function GoogleLoginButton({ onLogin, onLogout, currentUserId }: { onLogin?: (user: GoogleUser) => void; onLogout?: () => void; currentUserId?: string }) {
  const [googleUser, setGoogleUser] = useState<GoogleUser | null>(null);
  const [configured, setConfigured] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setConfigured(isGoogleAuthConfigured());
    const saved = getGoogleUser();
    setGoogleUser(saved);
    
    if (isGoogleAuthConfigured()) {
      loadGoogleScript().then(loaded => {
        if (loaded) {
          const initialized = initializeGoogleAuth((user) => {
            if (currentUserId) {
              linkAnonymousToGoogle(user, currentUserId);
            }
            setGoogleUser(user);
            onLogin?.(user);
            try {
              const googleUserData = {
                id: `google_${user.id}`,
                name: user.name || user.email,
                email: user.email,
                picture: user.picture,
                createdAt: new Date().toISOString(),
                lastActive: new Date().toISOString(),
                googleId: user.id
              };
              const existingUsers = userStorage.getUsers();
              const existingGoogle = existingUsers.find(u => (u as any).googleId === user.id);
              if (!existingGoogle) {
                userStorage.saveUsers([...existingUsers, googleUserData as any]);
              }
              userStorage.setCurrentUser(googleUserData as any);
            } catch {}
          });
          
          if (initialized) {
            setTimeout(() => renderGoogleButton('google-signin-button'), 200);
          }
        }
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [currentUserId, onLogin]);

  const handleSignOut = () => {
    signOutGoogle();
    setGoogleUser(null);
    onLogout?.();
  };

  if (googleUser) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-white border border-zinc-200">
          {googleUser.picture ? (
            <img src={googleUser.picture} alt={googleUser.name} className="w-6 h-6 rounded-full" />
          ) : (
            <div className="w-6 h-6 rounded-full bg-zinc-900 flex items-center justify-center text-white text-[11px] font-[700]">{googleUser.name.charAt(0).toUpperCase()}</div>
          )}
          <div className="hidden lg:block text-left min-w-0">
            <div className="text-[12px] font-[600] leading-none truncate max-w-[120px] text-zinc-900">{googleUser.name}</div>
            <div className="text-[10px] text-zinc-500 leading-none mt-0.5 truncate max-w-[120px]">{googleUser.email}</div>
          </div>
        </div>
        <button onClick={handleSignOut} className="w-8 h-8 rounded-full bg-white border border-zinc-200 flex items-center justify-center hover:border-zinc-900 transition-colors" title="Sign out">
          <LogOut className="w-4 h-4 text-zinc-600" />
        </button>
      </div>
    );
  }

  if (loading) {
    return null;
  }

  if (!configured) {
    return null;
  }

  return <div id="google-signin-button" className="min-w-[200px] h-9"></div>;
}
