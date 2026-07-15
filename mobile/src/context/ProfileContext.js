import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { loadProfile, saveProfile as persistProfile } from '../utils/storage';
import { EMPTY_PROFILE } from '../utils/vcard';

const ProfileContext = createContext(null);

export function ProfileProvider({ children }) {
  const [profile, setProfile] = useState(EMPTY_PROFILE);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    loadProfile().then((saved) => {
      setProfile(saved);
      setReady(true);
    });
  }, []);

  const value = useMemo(
    () => ({
      profile,
      ready,
      updateProfile: setProfile,
      saveProfile: async (nextProfile) => {
        setProfile(nextProfile);
        await persistProfile(nextProfile);
      },
    }),
    [profile, ready],
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within ProfileProvider');
  }
  return context;
}
