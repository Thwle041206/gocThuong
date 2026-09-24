import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

export type UserRole = 'admin' | 'user';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
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
  updateRole: (targetUid: string, newRole: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Primary bootstrap admin account credentials
export const PRIMARY_ADMIN_EMAIL = 'thwlez041206@gmail.com';
export const PRIMARY_ADMIN_PASS = 'thuongle061204';
const LOCAL_STORAGE_KEY = 'gocthuong_auth_user_session';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Sync profile from Firestore or create default profile
  const syncUserProfile = async (firebaseUser: User | null) => {
    if (!firebaseUser) {
      setUserProfile(null);
      return;
    }

    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      const userSnap = await getDoc(userRef);

      const isBootstrapAdmin =
        firebaseUser.email?.toLowerCase() === PRIMARY_ADMIN_EMAIL.toLowerCase();

      if (userSnap.exists()) {
        const data = userSnap.data() as UserProfile;
        // If email matches bootstrap admin, ensure role is admin
        if (isBootstrapAdmin && data.role !== 'admin') {
          await setDoc(userRef, { role: 'admin' }, { merge: true });
          data.role = 'admin';
        }
        setUserProfile(data);
      } else {
        // Create initial profile in database
        const newProfile: UserProfile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName:
            firebaseUser.displayName ||
            (isBootstrapAdmin ? 'Lê Thương (Quản trị viên)' : firebaseUser.email?.split('@')[0]) ||
            'Thành viên',
          role: isBootstrapAdmin ? 'admin' : 'user',
          createdAt: new Date().toISOString(),
          photoURL: firebaseUser.photoURL || '',
        };
        await setDoc(userRef, newProfile);
        if (newProfile.role === 'admin') {
          await setDoc(doc(db, 'admins', firebaseUser.uid), {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            createdAt: new Date().toISOString(),
          });
        }
        setUserProfile(newProfile);
      }
    } catch (err) {
      console.warn('Error syncing user profile from Firestore:', err);
      // Fallback local profile
      const isBootstrapAdmin =
        firebaseUser.email?.toLowerCase() === PRIMARY_ADMIN_EMAIL.toLowerCase();
      setUserProfile({
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName:
          firebaseUser.displayName ||
          (isBootstrapAdmin ? 'Lê Thương (Quản trị viên)' : 'Thành viên'),
        role: isBootstrapAdmin ? 'admin' : 'user',
      });
    }
  };

  // Restore session from localStorage or Firebase Auth
  useEffect(() => {
    // 1. Check local session cache for fast hydration
    try {
      const savedSession = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedSession) {
        const parsed = JSON.parse(savedSession) as UserProfile;
        if (parsed && parsed.email) {
          setUserProfile(parsed);
          setUser({
            uid: parsed.uid,
            email: parsed.email,
            displayName: parsed.displayName,
          } as unknown as User);
        }
      }
    } catch (e) {
      console.warn('Could not parse local session:', e);
    }

    // 2. Listen to Firebase Auth state
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await syncUserProfile(currentUser);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = pass.trim();

    // Check if matching primary admin credentials
    if (cleanEmail === PRIMARY_ADMIN_EMAIL.toLowerCase() && cleanPass === PRIMARY_ADMIN_PASS) {
      const adminProfile: UserProfile = {
        uid: 'thwlez041206',
        email: PRIMARY_ADMIN_EMAIL,
        displayName: 'Lê Thương (Quản trị viên)',
        role: 'admin',
        createdAt: new Date().toISOString(),
      };

      try {
        await setDoc(doc(db, 'users', adminProfile.uid), adminProfile, { merge: true });
        await setDoc(doc(db, 'admins', adminProfile.uid), {
          uid: adminProfile.uid,
          email: adminProfile.email,
          createdAt: new Date().toISOString(),
        }, { merge: true });
      } catch (err) {
        console.warn('Firestore admin update notice:', err);
      }

      setUserProfile(adminProfile);
      setUser({
        uid: adminProfile.uid,
        email: adminProfile.email,
        displayName: adminProfile.displayName,
      } as unknown as User);

      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(adminProfile));
      setIsAuthModalOpen(false);
      return;
    }

    // Try standard Firebase Auth sign in
    try {
      const cred = await signInWithEmailAndPassword(auth, cleanEmail, cleanPass);
      await syncUserProfile(cred.user);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({
        uid: cred.user.uid,
        email: cred.user.email,
        displayName: cred.user.displayName,
        role: cleanEmail === PRIMARY_ADMIN_EMAIL.toLowerCase() ? 'admin' : 'user',
      }));
      setIsAuthModalOpen(false);
    } catch (err: unknown) {
      const errCode = (err as { code?: string })?.code;
      // If Firebase Auth password login is disabled on cloud project, authenticate user via Firestore database
      if (
        errCode === 'auth/operation-not-allowed' ||
        errCode === 'auth/configuration-not-found'
      ) {
        // Query /users doc
        const userDocId = cleanEmail.replace(/[^a-zA-Z0-9]/g, '_');
        const userRef = doc(db, 'users', userDocId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const profile = userSnap.data() as UserProfile;
          setUserProfile(profile);
          setUser({
            uid: profile.uid,
            email: profile.email,
            displayName: profile.displayName,
          } as unknown as User);
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(profile));
          setIsAuthModalOpen(false);
          return;
        } else {
          throw new Error('Tài khoản chưa được đăng ký. Vui lòng chọn tab Đăng Ký.');
        }
      }
      throw err;
    }
  };

  const register = async (email: string, pass: string, name: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = pass.trim();
    const cleanName = name.trim();

    const isBootstrapAdmin = cleanEmail === PRIMARY_ADMIN_EMAIL.toLowerCase();

    try {
      const cred = await createUserWithEmailAndPassword(auth, cleanEmail, cleanPass);
      if (cleanName) {
        await updateProfile(cred.user, { displayName: cleanName });
      }

      const newProfile: UserProfile = {
        uid: cred.user.uid,
        email: cred.user.email || cleanEmail,
        displayName: cleanName || cleanEmail.split('@')[0] || 'Thành viên',
        role: isBootstrapAdmin ? 'admin' : 'user',
        createdAt: new Date().toISOString(),
      };

      try {
        await setDoc(doc(db, 'users', cred.user.uid), newProfile);
        if (newProfile.role === 'admin') {
          await setDoc(doc(db, 'admins', cred.user.uid), {
            uid: cred.user.uid,
            email: cleanEmail,
            createdAt: new Date().toISOString(),
          });
        }
      } catch (err) {
        console.warn('Could not save user profile doc:', err);
      }

      setUserProfile(newProfile);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newProfile));
      setIsAuthModalOpen(false);
    } catch (err: unknown) {
      const errCode = (err as { code?: string })?.code;
      // If Firebase Auth password login is disabled on cloud project, register into Firestore database
      if (
        errCode === 'auth/operation-not-allowed' ||
        errCode === 'auth/configuration-not-found'
      ) {
        const userDocId = cleanEmail.replace(/[^a-zA-Z0-9]/g, '_');
        const newProfile: UserProfile = {
          uid: userDocId,
          email: cleanEmail,
          displayName: cleanName || cleanEmail.split('@')[0] || 'Thành viên',
          role: isBootstrapAdmin ? 'admin' : 'user',
          createdAt: new Date().toISOString(),
        };

        await setDoc(doc(db, 'users', userDocId), newProfile);
        if (newProfile.role === 'admin') {
          await setDoc(doc(db, 'admins', userDocId), {
            uid: userDocId,
            email: cleanEmail,
            createdAt: new Date().toISOString(),
          });
        }

        setUserProfile(newProfile);
        setUser({
          uid: newProfile.uid,
          email: newProfile.email,
          displayName: newProfile.displayName,
        } as unknown as User);

        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newProfile));
        setIsAuthModalOpen(false);
        return;
      }
      throw err;
    }
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(auth, provider);
    await syncUserProfile(cred.user);
    if (cred.user.email) {
      const isBootstrapAdmin = cred.user.email.toLowerCase() === PRIMARY_ADMIN_EMAIL.toLowerCase();
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({
        uid: cred.user.uid,
        email: cred.user.email,
        displayName: cred.user.displayName || 'Thành viên',
        role: isBootstrapAdmin ? 'admin' : 'user',
      }));
    }
    setIsAuthModalOpen(false);
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('SignOut note:', e);
    }
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setUser(null);
    setUserProfile(null);
  };

  const updateRole = async (targetUid: string, newRole: UserRole) => {
    if (!isAdmin) {
      throw new Error('Chỉ Quản trị viên mới có quyền thay đổi vai trò.');
    }
    await setDoc(doc(db, 'users', targetUid), { role: newRole }, { merge: true });
    if (newRole === 'admin') {
      await setDoc(doc(db, 'admins', targetUid), {
        uid: targetUid,
        createdAt: new Date().toISOString(),
      });
    }
    if (targetUid === user?.uid && userProfile) {
      setUserProfile({ ...userProfile, role: newRole });
    }
  };

  const isAdmin = Boolean(
    userProfile?.role === 'admin' ||
      user?.email?.toLowerCase() === PRIMARY_ADMIN_EMAIL.toLowerCase()
  );

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
        updateRole,
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
