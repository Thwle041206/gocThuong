import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import {
  type User,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onIdTokenChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

export type UserRole = 'admin' | 'user';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  /** Derived from the verified Firebase ID token; never persisted to Firestore. */
  role: UserRole;
  createdAt?: string;
  photoURL?: string;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  isAdmin: boolean;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, name: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Kept only to remove insecure sessions created by earlier versions of the app.
const LEGACY_LOCAL_STORAGE_KEY = 'gocthuong_auth_user_session';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const syncAuthenticatedUser = async (firebaseUser: User) => {
    // Custom claims are signed by Firebase. Never infer administrator status from
    // an email address, Firestore document, or browser storage.
    const tokenResult = await firebaseUser.getIdTokenResult();
    const hasAdminClaim = tokenResult.claims.admin === true;
    const profile: UserProfile = {
      uid: firebaseUser.uid,
      email: firebaseUser.email || '',
      displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Thành viên',
      role: hasAdminClaim ? 'admin' : 'user',
      photoURL: firebaseUser.photoURL || '',
    };

    setUser(firebaseUser);
    setUserProfile(profile);
    setIsAdmin(hasAdminClaim);

    // The Firestore document is a non-authoritative display profile. It must not
    // contain a role; authorization is exclusively enforced by the ID token claim.
    try {
      await setDoc(
        doc(db, 'users', firebaseUser.uid),
        {
          uid: profile.uid,
          email: profile.email,
          displayName: profile.displayName,
          photoURL: profile.photoURL,
          createdAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (error) {
      // Authentication remains valid even if an optional display-profile sync fails.
      console.warn('Could not sync user display profile:', error);
    }
  };

  useEffect(() => {
    // Do not hydrate an identity or permissions from writable browser storage.
    localStorage.removeItem(LEGACY_LOCAL_STORAGE_KEY);

    // onIdTokenChanged re-evaluates access after a custom claim changes and the
    // user receives a refreshed Firebase token.
    const unsubscribe = onIdTokenChanged(auth, async (currentUser) => {
      setIsLoading(true);
      try {
        if (currentUser) {
          await syncAuthenticatedUser(currentUser);
        } else {
          setUser(null);
          setUserProfile(null);
          setIsAdmin(false);
        }
      } catch (error) {
        console.warn('Could not validate the Firebase authentication token:', error);
        setUser(null);
        setUserProfile(null);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, pass: string) => {
    const credential = await signInWithEmailAndPassword(auth, email.trim(), pass);
    await syncAuthenticatedUser(credential.user);
    setIsAuthModalOpen(false);
  };

  const register = async (email: string, pass: string, name: string) => {
    const credential = await createUserWithEmailAndPassword(auth, email.trim(), pass);
    const displayName = name.trim();
    if (displayName) {
      await updateProfile(credential.user, { displayName });
    }
    await syncAuthenticatedUser(auth.currentUser || credential.user);
    setIsAuthModalOpen(false);
  };

  const loginWithGoogle = async () => {
    const credential = await signInWithPopup(auth, new GoogleAuthProvider());
    await syncAuthenticatedUser(credential.user);
    setIsAuthModalOpen(false);
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setUserProfile(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        isAdmin,
        isLoading,
        isAuthModalOpen,
        setIsAuthModalOpen,
        login,
        register,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}