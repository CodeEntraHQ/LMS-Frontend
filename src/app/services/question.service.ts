import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface QuestionBank {
  id?: number;
  entityId: number;
  courseId: number;
  classId: number;
  subjectId: number;
  questionText: string;
  questionType: string;
  marks: number;
  difficulty?: string;
  chapterUnit?: string;
  createdByTeacherId?: number;
  status?: string;
  subjectName?: string;
}

export interface QuestionBankOption {
  id?: number;
  questionId: number;
  optionText: string;
  isCorrect?: boolean;
  orderIndex?: number;
}

export interface QuestionPolicy {
  id?: number;
  entityId: number;
  allowMcq?: boolean;
  allowMcqMultiple?: boolean;
  allowDescriptive?: boolean;
  allowOneWord?: boolean;
  allowFileUpload?: boolean;
  maxMarksPerQuestion?: number;
  negativeMarkingAllowed?: boolean;
  randomizationAllowed?: boolean;
  requireApproval?: boolean;
}

@Injectable({ providedIn: 'root' })
export class QuestionService {
  private apiUrl = 'http://localhost:8080/api/question-bank';

  constructor(private http: HttpClient) {}

  // Admin APIs
  listQuestions(entityId: number, courseId?: number, classId?: number, subjectId?: number, status?: string, teacherId?: number): Observable<any> {
    let params = new HttpParams().set('entityId', entityId.toString());
    if (courseId) params = params.set('courseId', courseId.toString());
    if (classId) params = params.set('classId', classId.toString());
    if (subjectId) params = params.set('subjectId', subjectId.toString());
    if (status) params = params.set('status', status);
    if (teacherId) params = params.set('teacherId', teacherId.toString());
    return this.http.get(`${this.apiUrl}/admin/list`, { params });
  }

  getQuestion(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/${id}`);
  }

  getPolicy(entityId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/policy?entityId=${entityId}`);
  }

  updatePolicy(entityId: number, policy: Partial<QuestionPolicy>): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/policy?entityId=${entityId}`, policy);
  }

  approveQuestion(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/${id}/approve`, null);
  }

  rejectQuestion(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/${id}/reject`, null);
  }

  deleteQuestion(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/admin/${id}`);
  }

  getMonitoringStats(entityId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/monitoring?entityId=${entityId}`);
  }

  createQuestionByAdmin(question: QuestionBank): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/create`, question);
  }

  addOptionByAdmin(option: QuestionBankOption): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/option`, option);
  }

  // Teacher APIs
  createQuestion(question: QuestionBank, teacherId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/teacher/create?teacherId=${teacherId}`, question);
  }

  updateQuestion(id: number, question: Partial<QuestionBank>, teacherId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/teacher/${id}?teacherId=${teacherId}`, question);
  }

  deleteQuestionByTeacher(id: number, teacherId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/teacher/${id}?teacherId=${teacherId}`);
  }

  listForTeacher(teacherId: number, entityId?: number, subjectId?: number, chapterUnit?: string): Observable<any> {
    let params = new HttpParams().set('teacherId', teacherId.toString());
    if (entityId) params = params.set('entityId', entityId.toString());
    if (subjectId) params = params.set('subjectId', subjectId.toString());
    if (chapterUnit) params = params.set('chapterUnit', chapterUnit);
    return this.http.get(`${this.apiUrl}/teacher/list`, { params });
  }

  getQuestionForTeacher(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/teacher/${id}`);
  }

  addOption(option: QuestionBankOption, teacherId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/teacher/option?teacherId=${teacherId}`, option);
  }

  deleteOption(optionId: number, teacherId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/teacher/option/${optionId}?teacherId=${teacherId}`);
  }

  // For exam - get questions to select
  getQuestionsForExam(entityId: number, subjectId: number, courseId?: number, classId?: number, difficulty?: string): Observable<any> {
    let params = new HttpParams().set('entityId', entityId.toString()).set('subjectId', subjectId.toString());
    if (courseId) params = params.set('courseId', courseId.toString());
    if (classId) params = params.set('classId', classId.toString());
    if (difficulty) params = params.set('difficulty', difficulty);
    return this.http.get(`${this.apiUrl}/for-exam`, { params });
  }
}
