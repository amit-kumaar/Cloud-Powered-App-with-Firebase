import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Profile } from './profile/profile';
import { Users } from './users/users';

export const routes: Routes = [
  { path: '', component: Login },
  { path: 'profile/:id', component: Profile },
  { path: 'users', component: Users },
];
