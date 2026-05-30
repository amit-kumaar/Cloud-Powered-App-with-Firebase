import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';
import { Storage, ref, getDownloadURL } from '@angular/fire/storage';
import { uploadBytesResumable } from 'firebase/storage';
import { BehaviorSubject, Observable } from 'rxjs';
import { UserProfile } from '../core/auth.service';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile implements OnInit {
  private route = inject(ActivatedRoute);
  private firestore = inject(Firestore);
  private storage = inject(Storage);

  @ViewChild('profileForm') profileForm!: NgForm;

  uid = '';
  profile: UserProfile = { uid: '', email: '', name: '', address: '', city: '', state: '', zip: '', ip: '', phone: '', specialty: 'field agent' };
  loading = false;
  error: string | null = null;
  success = false;

  uploadProgress$ = new BehaviorSubject<number | null>(null);
  downloadURL$ = new BehaviorSubject<string | null>(null);
  get uploadProgress(): Observable<number | null> { return this.uploadProgress$; }
  get downloadURL(): Observable<string | null> { return this.downloadURL$; }

  async ngOnInit() {
    this.uid = this.route.snapshot.paramMap.get('id') ?? '';
    const docRef = doc(this.firestore, `users/${this.uid}`);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      this.profile = { uid: this.uid, ...snap.data() } as UserProfile;
    } else {
      this.profile = { uid: this.uid, email: '', name: '', address: '', city: '', state: '', zip: '', ip: '', phone: '', specialty: 'field agent' };
    }

    const imgRef = ref(this.storage, `users/${this.uid}/profile-image`);
    getDownloadURL(imgRef)
      .then(url => this.downloadURL$.next(url))
      .catch(() => this.downloadURL$.next(null));
  }

  async onSubmit(ngForm: NgForm) {
    this.error = null;
    this.loading = true;
    const data: UserProfile = { uid: this.uid, ...ngForm.form.getRawValue() };
    try {
      await setDoc(doc(this.firestore, `users/${this.uid}`), data, { merge: true });
      this.profile = data;
      this.success = true;
      setTimeout(() => this.success = false, 3000);
    } catch (err: any) {
      this.error = err.message ?? 'Failed to save. Check Firestore rules.';
    } finally {
      this.loading = false;
    }
  }

  fileChange(event: Event) {
    this.error = null;
    this.uploadProgress$.next(null);
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const storageRef = ref(this.storage, `users/${this.uid}/profile-image`);
    const task = uploadBytesResumable(storageRef as any, file);
    task.on('state_changed',
      s => this.uploadProgress$.next((s.bytesTransferred / s.totalBytes) * 100),
      (err: any) => this.error = err.message,
      () => getDownloadURL(storageRef).then(url => {
        this.downloadURL$.next(url);
        this.uploadProgress$.next(null);
      })
    );
  }
}
