import { Injectable, inject } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from '@angular/fire/auth';
import { Firestore, doc, setDoc, updateDoc } from '@angular/fire/firestore';

export interface UserProfile {
  uid: string;
  email: string;
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  ip?: string;
  phone?: string;
  specialty?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);

  async signUp(email: string, password: string) {
    const result = await createUserWithEmailAndPassword(this.auth, email, password);
    await this.updateUserDocument({
      uid: result.user.uid, email,
      name: '', address: '', city: '', state: '',
      zip: '', ip: '', phone: '', specialty: 'field agent'
    });
    return result;
  }

  signIn(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  async updateUserDocument(profile: UserProfile) {
    const ref = doc(this.firestore, `users/${profile.uid}`);
    try {
      await updateDoc(ref, { ...profile });
    } catch {
      // doc doesn't exist yet — create it
      await setDoc(ref, profile);
    }
  }
}
