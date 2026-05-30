import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Firestore, collection, getDocs, doc, setDoc } from '@angular/fire/firestore';
import { UserProfile } from '../core/auth.service';

const SAMPLE_PROFILES: UserProfile[] = [
  { uid: 'sample-1', name: 'James Holloway', email: 'james.holloway@grid.io', phone: '+1 (312) 555-0191', address: '742 Evergreen Terrace', city: 'Chicago', state: 'IL', zip: '60601', ip: '192.168.1.10', specialty: 'field agent' },
  { uid: 'sample-2', name: 'Sophia Reyes', email: 'sophia.reyes@grid.io', phone: '+1 (415) 555-0284', address: '88 Mission Street', city: 'San Francisco', state: 'CA', zip: '94105', ip: '10.0.0.22', specialty: 'intelligence officer' },
  { uid: 'sample-3', name: 'Marcus Chen', email: 'marcus.chen@grid.io', phone: '+1 (646) 555-0377', address: '350 Fifth Avenue', city: 'New York', state: 'NY', zip: '10118', ip: '172.16.0.5', specialty: 'covert operations' },
  { uid: 'sample-4', name: 'Ava Mitchell', email: 'ava.mitchell@grid.io', phone: '+1 (713) 555-0462', address: '1600 Main Street', city: 'Houston', state: 'TX', zip: '77002', ip: '192.168.2.14', specialty: 'field agent' },
  { uid: 'sample-5', name: 'Ethan Brooks', email: 'ethan.brooks@grid.io', phone: '+1 (206) 555-0553', address: '400 Broad Street', city: 'Seattle', state: 'WA', zip: '98109', ip: '10.10.1.8', specialty: 'intelligence officer' },
  { uid: 'sample-6', name: 'Lena Novak', email: 'lena.novak@grid.io', phone: '+1 (305) 555-0648', address: '200 Biscayne Blvd', city: 'Miami', state: 'FL', zip: '33132', ip: '172.20.0.3', specialty: 'covert operations' },
];

@Component({
  selector: 'app-users',
  imports: [CommonModule, RouterModule],
  templateUrl: './users.html',
  styleUrl: './users.scss',
})
export class Users implements OnInit {
  private firestore = inject(Firestore);

  users: UserProfile[] = [];
  loading = true;
  error: string | null = null;
  seeding = false;
  seeded = false;

  async ngOnInit() {
    await this.loadUsers();
  }

  async loadUsers() {
    this.loading = true;
    this.error = null;
    try {
      const snap = await getDocs(collection(this.firestore, 'users'));
      this.users = snap.docs.map(d => ({ uid: d.id, ...d.data() } as UserProfile));
    } catch (err: any) {
      this.error = err.message;
    } finally {
      this.loading = false;
    }
  }

  async seedSamples() {
    this.seeding = true;
    try {
      await Promise.all(
        SAMPLE_PROFILES.map(p => setDoc(doc(this.firestore, `users/${p.uid}`), p))
      );
      await this.loadUsers();
      this.seeded = true;
      setTimeout(() => this.seeded = false, 3000);
    } catch (err: any) {
      this.error = err.message;
    } finally {
      this.seeding = false;
    }
  }

  avatarUrl(u: UserProfile): string {
    const name = encodeURIComponent(u.name || u.email || 'User');
    return `https://ui-avatars.com/api/?name=${name}&background=6c63ff&color=fff&size=80&bold=true`;
  }
}
