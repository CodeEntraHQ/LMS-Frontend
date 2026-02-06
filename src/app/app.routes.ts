import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
// Superadmin now uses AdminDashboardComponent - same page for both
import { authGuard } from './guards/auth.guard';
import { SuperadminProfileComponent } from './pages/superadmin-profile/superadmin-profile.component';
import { EntityManagementComponent } from './pages/entity-management/entity-management.component';
import { EntityDetailsComponent } from './pages/entity-details/entity-details.component';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';
import { SuperadminDashboardComponent } from './pages/superadmin-dashboard/superadmin-dashboard.component';
import { AdminProfileComponent } from './pages/admin-profile/admin-profile.component';
import { TeacherDashboardComponent } from './pages/teacher-dashboard/teacher-dashboard.component';
import { TeacherProfileComponent } from './pages/teacher-profile/teacher-profile.component';
import { StudentDashboardComponent } from './pages/student-dashboard/student-dashboard.component';
import { StudentProfileComponent } from './pages/student-profile/student-profile.component';
import { ParentDashboardComponent } from './pages/parent-dashboard/parent-dashboard.component';
import { ParentProfileComponent } from './pages/parent-profile/parent-profile.component';
import { AcceptInvitationComponent } from './pages/accept-invitation/accept-invitation.component';
import { AdmissionsComponent } from './pages/admissions/admissions.component';
import { SetupPasswordComponent } from './pages/setup-password/setup-password.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'home',
    component: HomeComponent
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'accept-invitation',
    component: AcceptInvitationComponent
  },
  {
    path: 'setup-password',
    component: SetupPasswordComponent
  },
  {
    path: 'superadmin/dashboard',
    component: SuperadminDashboardComponent,
    canActivate: [authGuard]
  },
  {
    path: 'superadmin/profile',
    component: SuperadminProfileComponent,
    canActivate: [authGuard]
  },
  {
    path: 'superadmin/entities',
    component: EntityManagementComponent,
    canActivate: [authGuard]
  },
  {
    path: 'superadmin/entities/:id',
    component: EntityDetailsComponent,
    canActivate: [authGuard]
  },
  {
    path: 'admin/dashboard',
    component: AdminDashboardComponent,
    canActivate: [authGuard]
  },
  {
    path: 'admin/profile',
    component: AdminProfileComponent,
    canActivate: [authGuard]
  },
  {
    path: 'teacher/dashboard',
    component: TeacherDashboardComponent,
    canActivate: [authGuard]
  },
  {
    path: 'teacher/profile',
    component: TeacherProfileComponent,
    canActivate: [authGuard]
  },
  {
    path: 'student/dashboard',
    component: StudentDashboardComponent,
    canActivate: [authGuard]
  },
  {
    path: 'student/profile',
    component: StudentProfileComponent,
    canActivate: [authGuard]
  },
  {
    path: 'parent/dashboard',
    component: ParentDashboardComponent,
    canActivate: [authGuard]
  },
  {
    path: 'parent/profile',
    component: ParentProfileComponent,
    canActivate: [authGuard]
  },
  {
    path: 'admissions',
    component: AdmissionsComponent,
    canActivate: [authGuard]
  }
];
