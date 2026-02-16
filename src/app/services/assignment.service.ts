import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AssignmentOverview {
  totalAssignments: number;
  overdueAssignments: number;
  totalStudents: number;
  submittedCount: number;
  pendingCount: number;
  submissionPercentage: number;
  pendingEvaluations: number;
  evaluationsCompleted: number;
  lateSubmissions: number;
  feedbackCount: number;
  assignmentFrequencyBySubject: Record<number, number>;
  averageMarksBySubject: Record<number, number>;
  syllabusAlignedCount: number;
  qualityCheckCounts: Record<string, number>;
}

export interface AssignmentSummary {
  id: number;
  title: string;
  subjectId?: number;
  courseId?: number;
  classId?: number;
  sectionId?: number;
  teacherId?: number;
  dueDate?: string;
  extendedDueDate?: string;
  status?: string;
  submissionStatus?: string;
  totalStudents?: number;
  submittedCount?: number;
  pendingCount?: number;
  lateSubmissions?: number;
  evaluationsCompleted?: number;
  evaluationsPending?: number;
  averageMarks?: number;
  feedbackCount?: number;
  syllabusAligned?: boolean;
  qualityCheckStatus?: string;
  internalRemarks?: string;
  extensionReason?: string;
  lockAfterDueDate?: boolean;
  maxMarks?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AssignmentService {
  private apiUrl = 'http://localhost:8080/api/assignments';

  constructor(private http: HttpClient) {}

  getAdminOverview(params: Record<string, any>): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/overview`, { params: this.toParams(params) });
  }

  getAdminAssignments(params: Record<string, any>): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/list`, { params: this.toParams(params) });
  }

  updateStatus(id: number, status: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/status`, { status });
  }

  updateLock(id: number, lockAfterDueDate: boolean): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/lock`, { lockAfterDueDate });
  }

  extendDueDate(id: number, extendedDueDate: string, reason: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/extend`, { extendedDueDate, reason });
  }

  // ========== TEACHER METHODS ==========

  getAssignmentForTeacher(teacherId: number, assignmentId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/teacher/${assignmentId}?teacherId=${teacherId}`);
  }

  getTeacherAssignments(teacherId: number, params?: Record<string, any>): Observable<any> {
    const allParams = { teacherId, ...params };
    return this.http.get(`${this.apiUrl}/teacher/list`, { params: this.toParams(allParams) });
  }

  getTeacherOverview(teacherId: number, params?: Record<string, any>): Observable<any> {
    const allParams = { teacherId, ...params };
    return this.http.get(`${this.apiUrl}/teacher/overview`, { params: this.toParams(allParams) });
  }

  createAssignmentForTeacher(teacherId: number, assignment: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/teacher/create?teacherId=${teacherId}`, assignment);
  }

  updateAssignmentForTeacher(teacherId: number, assignmentId: number, assignment: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/teacher/${assignmentId}?teacherId=${teacherId}`, assignment);
  }

  deleteAssignmentForTeacher(teacherId: number, assignmentId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/teacher/${assignmentId}?teacherId=${teacherId}`);
  }

  getSubmissionsForTeacher(teacherId: number, assignmentId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/teacher/${assignmentId}/submissions?teacherId=${teacherId}`);
  }

  evaluateSubmission(teacherId: number, submissionId: number, marks: number | null, feedback: string, allowResubmit?: boolean): Observable<any> {
    return this.http.put(`${this.apiUrl}/teacher/submissions/${submissionId}/evaluate?teacherId=${teacherId}`, {
      marks,
      feedback,
      allowResubmit
    });
  }

  getAssignmentAnalytics(teacherId: number, assignmentId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/teacher/${assignmentId}/analytics?teacherId=${teacherId}`);
  }

  extendDueDateForTeacher(teacherId: number, assignmentId: number, extendedDueDate: string, reason: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/teacher/${assignmentId}/extend?teacherId=${teacherId}`, {
      extendedDueDate,
      reason
    });
  }

  closeAssignmentForTeacher(teacherId: number, assignmentId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/teacher/${assignmentId}/close?teacherId=${teacherId}`, {});
  }

  // ========== STUDENT METHODS ==========

  getStudentAssignments(studentId: number, classId: number, sectionId?: number, subjectId?: number): Observable<any> {
    const params: any = { studentId, classId };
    if (sectionId) params.sectionId = sectionId;
    if (subjectId) params.subjectId = subjectId;
    return this.http.get(`${this.apiUrl}/student/list`, { params: this.toParams(params) });
  }

  submitAssignment(studentId: number, assignmentId: number, submission: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/student/submit?studentId=${studentId}&assignmentId=${assignmentId}`, submission);
  }

  getStudentSubmission(studentId: number, assignmentId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/student/${assignmentId}/submission?studentId=${studentId}`);
  }

  private toParams(params: Record<string, any>): HttpParams {
    let httpParams = new HttpParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        httpParams = httpParams.set(key, String(value));
      }
    });
    return httpParams;
  }
}
