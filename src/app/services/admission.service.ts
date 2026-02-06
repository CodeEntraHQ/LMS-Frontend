import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';

export interface StudentAdmission {
  id?: number;
  entityId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  gender?: string;
  classCourse?: string;
  academicYear?: string;
  address?: string;
  previousQualification?: string;
  idProof?: string;
  marksheet?: string;
  tcLc?: string;
  photo?: string;
  status: string;
  adminRemark?: string;
  rollNumber?: string;
  classSection?: string;
  courseId?: number;
  classId?: number;
  sectionId?: number;
  paymentStatus?: string;
  submittedAt?: string;
  reviewedAt?: string;
  approvedAt?: string;
}

export interface TeacherAdmission {
  id?: number;
  entityId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  gender?: string;
  qualification?: string;
  experience?: string;
  address?: string;
  idProof?: string;
  degreeCertificate?: string;
  resume?: string;
  photo?: string;
  status: string;
  adminRemark?: string;
  subjects?: string;
  assignedClasses?: string;
  submittedAt?: string;
  reviewedAt?: string;
  approvedAt?: string;
}

const API_BASE = 'http://localhost:8080/api/admissions';

@Injectable({
  providedIn: 'root'
})
export class AdmissionService {
  constructor(private http: HttpClient) {}

  // Student Admissions
  createStudentAdmission(entityId: number, data: Partial<StudentAdmission>): Observable<{ ok: boolean; message?: string; admission?: StudentAdmission }> {
    return this.http.post<{ ok: boolean; message?: string; admission?: any }>(`${API_BASE}/students/entity/${entityId}`, data).pipe(
      map(response => ({
        ok: response.ok,
        message: response.message,
        admission: response.admission ? this.mapStudentAdmission(response.admission) : undefined
      })),
      catchError(error => {
        console.error('Error creating student admission:', error);
        return of({ ok: false, message: error.error?.message || 'Failed to create admission' });
      })
    );
  }

  getStudentAdmissions(entityId: number): Observable<{ ok: boolean; admissions?: StudentAdmission[]; message?: string }> {
    return this.http.get<{ ok: boolean; admissions?: any[]; message?: string }>(`${API_BASE}/students/entity/${entityId}`).pipe(
      map(response => ({
        ok: response.ok,
        admissions: response.admissions?.map(a => this.mapStudentAdmission(a)),
        message: response.message
      })),
      catchError(error => {
        return of({ ok: false, message: error.error?.message || 'Failed to load admissions' });
      })
    );
  }

  getStudentAdmissionsByStatus(entityId: number, status: string): Observable<{ ok: boolean; admissions?: StudentAdmission[]; message?: string }> {
    return this.http.get<{ ok: boolean; admissions?: any[]; message?: string }>(`${API_BASE}/students/entity/${entityId}/status/${status}`).pipe(
      map(response => ({
        ok: response.ok,
        admissions: response.admissions?.map(a => this.mapStudentAdmission(a)),
        message: response.message
      })),
      catchError(error => {
        return of({ ok: false, message: error.error?.message || 'Failed to load admissions' });
      })
    );
  }

  updateStudentAdmissionStatus(id: number, status: string, remark?: string, rollNumber?: string, classSection?: string, courseId?: number, classId?: number, sectionId?: number): Observable<{ ok: boolean; message?: string; admission?: StudentAdmission }> {
    return this.http.put<{ ok: boolean; message?: string; admission?: any }>(`${API_BASE}/students/${id}/status`, {
      status,
      remark,
      rollNumber,
      classSection,
      courseId,
      classId,
      sectionId
    }).pipe(
      map(response => ({
        ok: response.ok,
        message: response.message,
        admission: response.admission ? this.mapStudentAdmission(response.admission) : undefined
      })),
      catchError(error => {
        return of({ ok: false, message: error.error?.message || 'Failed to update status' });
      })
    );
  }

  deleteStudentAdmission(id: number): Observable<{ ok: boolean; message?: string }> {
    return this.http.delete<{ ok: boolean; message?: string }>(`${API_BASE}/students/${id}`).pipe(
      catchError(error => {
        return of({ ok: false, message: error.error?.message || 'Failed to delete admission' });
      })
    );
  }

  // Teacher Admissions
  createTeacherAdmission(entityId: number, data: Partial<TeacherAdmission>): Observable<{ ok: boolean; message?: string; admission?: TeacherAdmission }> {
    return this.http.post<{ ok: boolean; message?: string; admission?: any }>(`${API_BASE}/teachers/entity/${entityId}`, data).pipe(
      map(response => ({
        ok: response.ok,
        message: response.message,
        admission: response.admission ? this.mapTeacherAdmission(response.admission) : undefined
      })),
      catchError(error => {
        console.error('Error creating teacher admission:', error);
        return of({ ok: false, message: error.error?.message || 'Failed to create admission' });
      })
    );
  }

  getTeacherAdmissions(entityId: number): Observable<{ ok: boolean; admissions?: TeacherAdmission[]; message?: string }> {
    return this.http.get<{ ok: boolean; admissions?: any[]; message?: string }>(`${API_BASE}/teachers/entity/${entityId}`).pipe(
      map(response => ({
        ok: response.ok,
        admissions: response.admissions?.map(a => this.mapTeacherAdmission(a)),
        message: response.message
      })),
      catchError(error => {
        return of({ ok: false, message: error.error?.message || 'Failed to load admissions' });
      })
    );
  }

  getTeacherAdmissionsByStatus(entityId: number, status: string): Observable<{ ok: boolean; admissions?: TeacherAdmission[]; message?: string }> {
    return this.http.get<{ ok: boolean; admissions?: any[]; message?: string }>(`${API_BASE}/teachers/entity/${entityId}/status/${status}`).pipe(
      map(response => ({
        ok: response.ok,
        admissions: response.admissions?.map(a => this.mapTeacherAdmission(a)),
        message: response.message
      })),
      catchError(error => {
        return of({ ok: false, message: error.error?.message || 'Failed to load admissions' });
      })
    );
  }

  updateTeacherAdmissionStatus(id: number, status: string, remark?: string, subjects?: string, assignedClasses?: string): Observable<{ ok: boolean; message?: string; admission?: TeacherAdmission }> {
    return this.http.put<{ ok: boolean; message?: string; admission?: any }>(`${API_BASE}/teachers/${id}/status`, {
      status,
      remark,
      subjects,
      assignedClasses
    }).pipe(
      map(response => ({
        ok: response.ok,
        message: response.message,
        admission: response.admission ? this.mapTeacherAdmission(response.admission) : undefined
      })),
      catchError(error => {
        return of({ ok: false, message: error.error?.message || 'Failed to update status' });
      })
    );
  }

  deleteTeacherAdmission(id: number): Observable<{ ok: boolean; message?: string }> {
    return this.http.delete<{ ok: boolean; message?: string }>(`${API_BASE}/teachers/${id}`).pipe(
      catchError(error => {
        return of({ ok: false, message: error.error?.message || 'Failed to delete admission' });
      })
    );
  }

  // Helper methods
  private mapStudentAdmission(data: any): StudentAdmission {
    return {
      id: data.id,
      entityId: data.entityId,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      gender: data.gender,
      classCourse: data.classCourse,
      academicYear: data.academicYear,
      address: data.address,
      previousQualification: data.previousQualification,
      idProof: data.idProof,
      marksheet: data.marksheet,
      tcLc: data.tcLc,
      photo: data.photo,
      status: data.status,
      adminRemark: data.adminRemark,
      rollNumber: data.rollNumber,
      classSection: data.classSection,
      paymentStatus: data.paymentStatus,
      submittedAt: data.submittedAt,
      reviewedAt: data.reviewedAt,
      approvedAt: data.approvedAt
    };
  }

  private mapTeacherAdmission(data: any): TeacherAdmission {
    return {
      id: data.id,
      entityId: data.entityId,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      gender: data.gender,
      qualification: data.qualification,
      experience: data.experience,
      address: data.address,
      idProof: data.idProof,
      degreeCertificate: data.degreeCertificate,
      resume: data.resume,
      photo: data.photo,
      status: data.status,
      adminRemark: data.adminRemark,
      subjects: data.subjects,
      assignedClasses: data.assignedClasses,
      submittedAt: data.submittedAt,
      reviewedAt: data.reviewedAt,
      approvedAt: data.approvedAt
    };
  }
}
