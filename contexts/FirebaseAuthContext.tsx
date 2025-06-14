import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
    User as FirebaseUser,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    updateProfile,
    onAuthStateChanged,
    sendEmailVerification
} from 'firebase/auth';
import { auth } from '@/config/firebase';
import axios from 'axios';
import { getApiBaseUrl } from '@/config/api';

// Define our app's User type
interface User {
    id: string;
    email: string;
    name: string;
    emailVerified: boolean;
    profile: {
        id: string;
        name: string;
        email: string;
        bio: string;
        website: string;
        socialHandles: {
            instagram: string;
            tiktok: string;
            youtube: string;
        };
        createdAt: string;
        updatedAt: string;
    };
}

interface UserProfile {
    name: string;
    email: string;
    bio: string;
    website: string;
    socialHandles: {
        instagram: string;
        tiktok: string;
        youtube: string;
    };
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, name: string) => Promise<void>;
    signOut: () => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
    updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
    sendVerificationEmail: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Convert Firebase user to our app's user format
    const mapFirebaseUser = (firebaseUser: FirebaseUser): User => {
        const displayName = firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User';

        return {
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: displayName,
            emailVerified: firebaseUser.emailVerified,
            profile: {
                id: firebaseUser.uid,
                name: displayName,
                email: firebaseUser.email || '',
                bio: '',
                website: '',
                socialHandles: {
                    instagram: '',
                    tiktok: '',
                    youtube: '',
                },
                createdAt: firebaseUser.metadata.creationTime || new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
        };
    };

    // Listen to authentication state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            if (firebaseUser) {
                const appUser = mapFirebaseUser(firebaseUser);
                setUser(appUser);
            } else {
                setUser(null);
            }
            setIsLoading(false);
        });

        return unsubscribe;
    }, []);

    const signIn = async (email: string, password: string) => {
        try {
            setIsLoading(true);
            await signInWithEmailAndPassword(auth, email, password);
            // User state will be updated automatically by onAuthStateChanged
        } catch (error: any) {
            setIsLoading(false);
            throw new Error(getFirebaseErrorMessage(error.code));
        }
    };

    const signUp = async (email: string, password: string, name: string) => {
        try {
            setIsLoading(true);
            const result = await createUserWithEmailAndPassword(auth, email, password);

            // Update the user's display name
            await updateProfile(result.user, {
                displayName: name,
            });

            // Send email verification
            await sendEmailVerification(result.user);

            // Get the ID token
            const idToken = await result.user.getIdToken();

            // Sync user with backend
            await axios.post(
                `${getApiBaseUrl()}/users/sync`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${idToken}`,
                    },
                }
            );

            // User state will be updated automatically by onAuthStateChanged
        } catch (error: any) {
            setIsLoading(false);
            throw new Error(getFirebaseErrorMessage(error.code));
        }
    };

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            // User state will be updated automatically by onAuthStateChanged
        } catch (error: any) {
            throw new Error('Failed to sign out');
        }
    };

    const resetPassword = async (email: string) => {
        try {
            await sendPasswordResetEmail(auth, email);
        } catch (error: any) {
            throw new Error(getFirebaseErrorMessage(error.code));
        }
    };

    const updateUserProfile = async (updates: Partial<UserProfile>) => {
        if (!auth.currentUser) return;

        try {
            // Update Firebase profile
            if (updates.name) {
                await updateProfile(auth.currentUser, {
                    displayName: updates.name,
                });
            }

            // Update local user state
            if (user) {
                const updatedUser = {
                    ...user,
                    name: updates.name || user.name,
                    profile: {
                        ...user.profile,
                        ...updates,
                        updatedAt: new Date().toISOString(),
                    },
                };
                setUser(updatedUser);
            }
        } catch (error: any) {
            throw new Error('Failed to update profile');
        }
    };

    const sendVerificationEmail = async () => {
        if (!auth.currentUser) return;

        try {
            await sendEmailVerification(auth.currentUser);
        } catch (error: any) {
            throw new Error('Failed to send verification email');
        }
    };

    const isAuthenticated = !!user;

    return (
        <AuthContext.Provider value={{
            user,
            isLoading,
            isAuthenticated,
            signIn,
            signUp,
            signOut: handleSignOut,
            resetPassword,
            updateUserProfile,
            sendVerificationEmail,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

// Helper function to convert Firebase error codes to user-friendly messages
function getFirebaseErrorMessage(errorCode: string): string {
    switch (errorCode) {
        case 'auth/user-not-found':
            return 'No account found with this email address.';
        case 'auth/wrong-password':
            return 'Incorrect password. Please try again.';
        case 'auth/invalid-email':
            return 'Please enter a valid email address.';
        case 'auth/user-disabled':
            return 'This account has been disabled. Please contact support.';
        case 'auth/email-already-in-use':
            return 'An account with this email already exists.';
        case 'auth/weak-password':
            return 'Password should be at least 6 characters long.';
        case 'auth/invalid-credential':
            return 'Invalid email or password. Please check your credentials.';
        case 'auth/too-many-requests':
            return 'Too many failed attempts. Please try again later.';
        case 'auth/network-request-failed':
            return 'Network error. Please check your connection and try again.';
        default:
            return 'An error occurred. Please try again.';
    }
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}; 