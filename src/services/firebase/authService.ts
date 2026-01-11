// src/services/firebase/authService.ts
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  User,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';
import { UserRole } from '../../types';

export class AuthService {
  static async signIn(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  static async signUp(
    email: string,
    password: string,
    displayName: string,
    role: UserRole
  ): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName });

      await this.createUserDocument(user.uid, {
        email,
        name: displayName,
        role,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return user;
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  static async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  static async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  static getCurrentUser(): User | null {
    return auth.currentUser;
  }

  static async getUserRole(uid: string): Promise<UserRole | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        return userDoc.data().role as UserRole;
      }
      return null;
    } catch (error) {
      console.error('Error getting user role:', error);
      return null;
    }
  }

  private static async createUserDocument(uid: string, data: any): Promise<void> {
    try {
      await setDoc(doc(db, 'users', uid), data);
    } catch (error) {
      console.error('Error creating user document:', error);
      throw error;
    }
  }

  private static handleAuthError(error: any): Error {
    let message = 'An error occurred during authentication';

    switch (error.code) {
      case 'auth/email-already-in-use':
        message = 'This email is already registered';
        break;
      case 'auth/invalid-email':
        message = 'Invalid email address';
        break;
      case 'auth/weak-password':
        message = 'Password is too weak. Use at least 6 characters';
        break;
      case 'auth/user-not-found':
        message = 'No account found with this email';
        break;
      case 'auth/wrong-password':
        message = 'Incorrect password';
        break;
      case 'auth/too-many-requests':
        message = 'Too many failed attempts. Please try again later';
        break;
      case 'auth/network-request-failed':
        message = 'Network error. Check your connection';
        break;
      default:
        message = error.message || message;
    }

    return new Error(message);
  }
}

export default AuthService;