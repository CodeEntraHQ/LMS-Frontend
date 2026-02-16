import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Exam {
  id?: number;
  entityId: number;
  courseId: number;
  classId: number;
  subjectId: number;
  sectionId?: number;
  name: string;
  examType: string; // UNIT_TEST, MID_TERM, FINAL_EXAM, PRACTICAL_EXAM, MCQ, SUBJECTIVE, PRACTICAL
  totalMarks: number;
  passingMarks: number;
  examDate: string;
  startTime?: string;
  endTime?: string;
  durationMinutes?: number;
  academicYear?: string;
  instructions?: string;
  negativeMarking?: boolean;
  negativeMarksPerQuestion?: number;
  allowMcq?: boolean;
  allowSubjective?: boolean;
  allowFileUpload?: boolean;
  reAttemptAllowed?: boolean;
  timeLimitStrict?: boolean;
  randomQuestionShuffle?: boolean;
  status?: string; // draft, scheduled, live, completed, locked, disabled
  resultPublished?: boolean;
  examLocked?: boolean;
  createdByTeacherId?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ExamQuestion {
  id?: number;
  examId: number;
  questionText: string;
  questionType: string; // MCQ_SINGLE, MCQ_MULTIPLE, DESCRIPTIVE, ONE_WORD, FILE_UPLOAD
  marks?: number;
  orderIndex?: number;
  optionShuffle?: boolean;
}

export interface ExamQuestionOption {
  id?: number;
  questionId: number;
  optionText: string;
  isCorrect?: boolean;
  orderIndex?: number;
}

export interface ExamTeacherAssignment {
  id?: number;
  examId: number;
  teacherId: number;
  canEvaluate?: boolean;
  canPublishResult?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ExamService {
  private apiUrl = 'http://localhost:8080/api/exams';

  constructor(private http: HttpClient) {}

  createExam(exam: Exam, userId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/create?userId=${userId}`, exam);
  }

  updateExam(id: number, exam: Partial<Exam>, userId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/${id}?userId=${userId}`, exam);
  }

  getExam(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/${id}`);
  }

  getExams(entityId: number, courseId?: number, classId?: number, subjectId?: number, examType?: string, status?: string): Observable<any> {
    let params = new HttpParams().set('entityId', entityId.toString());
    if (courseId) params = params.set('courseId', courseId.toString());
    if (classId) params = params.set('classId', classId.toString());
    if (subjectId) params = params.set('subjectId', subjectId.toString());
    if (examType) params = params.set('examType', examType);
    if (status) params = params.set('status', status);
    return this.http.get(`${this.apiUrl}/admin/list`, { params });
  }

  deleteExam(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/admin/${id}`);
  }

  assignTeacher(examId: number, teacherId: number, canEvaluate = true, canPublishResult = false): Observable<any> {
    let params = new HttpParams().set('teacherId', teacherId.toString()).set('canEvaluate', canEvaluate.toString()).set('canPublishResult', canPublishResult.toString());
    return this.http.post(`${this.apiUrl}/admin/${examId}/assign-teacher?teacherId=${teacherId}&canEvaluate=${canEvaluate}&canPublishResult=${canPublishResult}`, null);
  }

  removeTeacherAssignment(examId: number, teacherId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/admin/${examId}/assign-teacher/${teacherId}`);
  }

  getTeacherAssignments(examId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/${examId}/teachers`);
  }

  getExamMonitoring(examId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/${examId}/monitoring`);
  }

  publishExamByAdmin(examId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/${examId}/publish-exam`, null);
  }

  publishResult(examId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/${examId}/publish-result`, null);
  }

  unpublishResult(examId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/${examId}/unpublish-result`, null);
  }

  lockExam(examId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/${examId}/lock`, null);
  }

  unlockExam(examId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/${examId}/unlock`, null);
  }

  disableExam(examId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/${examId}/disable`, null);
  }

  enableExam(examId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/${examId}/enable`, null);
  }

  getPerformanceReport(examId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/${examId}/performance`);
  }

  getClassWisePerformance(entityId: number, classId: number, examType?: string): Observable<any> {
    let params = new HttpParams().set('entityId', entityId.toString()).set('classId', classId.toString());
    if (examType) params = params.set('examType', examType);
    return this.http.get(`${this.apiUrl}/admin/class-performance`, { params });
  }

  // Teacher APIs
  getExamsForTeacher(teacherId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/teacher/list?teacherId=${teacherId}`);
  }

  createExamByTeacher(exam: Exam, teacherId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/teacher/create?teacherId=${teacherId}`, exam);
  }

  updateExamByTeacher(id: number, exam: Partial<Exam>, teacherId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/teacher/${id}?teacherId=${teacherId}`, exam);
  }

  deleteExamByTeacher(id: number, teacherId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/teacher/${id}?teacherId=${teacherId}`);
  }

  getQuestions(examId: number, teacherId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/teacher/${examId}/questions?teacherId=${teacherId}`);
  }

  addQuestion(question: ExamQuestion, teacherId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/teacher/question?teacherId=${teacherId}`, question);
  }

  updateQuestion(questionId: number, question: Partial<ExamQuestion>, teacherId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/teacher/question/${questionId}?teacherId=${teacherId}`, question);
  }

  deleteQuestion(questionId: number, teacherId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/teacher/question/${questionId}?teacherId=${teacherId}`);
  }

  addQuestionOption(option: ExamQuestionOption, teacherId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/teacher/question/option?teacherId=${teacherId}`, option);
  }

  addQuestionsFromBank(examId: number, questionBankIds: number[], teacherId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/teacher/${examId}/questions-from-bank?teacherId=${teacherId}`, { questionBankIds });
  }

  publishExam(examId: number, teacherId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/teacher/${examId}/publish?teacherId=${teacherId}`, null);
  }

  closeExam(examId: number, teacherId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/teacher/${examId}/close?teacherId=${teacherId}`, null);
  }

  getAttemptsForEvaluation(examId: number, teacherId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/teacher/${examId}/attempts?teacherId=${teacherId}`);
  }

  evaluateAttempt(attemptId: number, marks: number, feedback: string, userId: number): Observable<any> {
    let params = new HttpParams().set('marks', marks.toString()).set('userId', userId.toString());
    if (feedback) params = params.set('feedback', feedback);
    return this.http.post(`${this.apiUrl}/teacher/attempt/${attemptId}/evaluate`, null, { params });
  }

  publishResultByTeacher(examId: number, teacherId: number, userId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/teacher/${examId}/publish-result?teacherId=${teacherId}&userId=${userId}`, null);
  }

  // Student APIs
  getExamsForStudent(studentId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/student/list?studentId=${studentId}`);
  }

  startExamAttempt(examId: number, studentId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/student/${examId}/start?studentId=${studentId}`, null);
  }

  getExamQuestions(examId: number, studentId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/student/${examId}/questions?studentId=${studentId}`);
  }

  submitExamAttempt(attemptId: number, studentId: number, answers: any[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/student/attempt/${attemptId}/submit?studentId=${studentId}`, answers);
  }

  getAttemptResult(attemptId: number, studentId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/student/attempt/${attemptId}/result?studentId=${studentId}`);
  }
}
