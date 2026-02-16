import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ExamService } from '../../services/exam.service';
import { AuthService } from '../../services/auth.service';
import { StudentService } from '../../services/student.service';

type ViewStep = 'instructions' | 'exam' | 'submitted' | 'result';

interface ExamQuestion {
  id: number;
  questionText: string;
  questionType: string;
  marks: number;
  orderIndex: number;
  options?: { id: number; optionText: string }[];
}

interface AnswerState {
  questionId: number;
  selectedOptionIds?: string;
  answerText?: string;
  markedForReview?: boolean;
}

@Component({
  selector: 'app-student-exam-attempt',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './student-exam-attempt.component.html',
  styleUrls: ['./student-exam-attempt.component.css']
})
export class StudentExamAttemptComponent implements OnInit, OnDestroy {
  examId: number | null = null;
  studentId: number | null = null;
  attemptId: number | null = null;
  step: ViewStep = 'instructions';

  exam: any = null;
  subjectName = '';
  questions: ExamQuestion[] = [];
  questionCount = 0;
  totalMarks = 0;
  durationMinutes = 60;
  negativeMarking = false;
  negativeMarksPerQuestion = 0;

  currentIndex = 0;
  answers: Map<number, AnswerState> = new Map();
  markedForReview: Set<number> = new Set();
  timerSeconds = 0;
  timerInterval: any = null;
  isLoading = true;
  isSubmitting = false;
  errorMessage = '';

  resultData: any = null;
  isViewingResult = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private examService: ExamService,
    private auth: AuthService,
    private studentService: StudentService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('examId');
    this.examId = id ? parseInt(id, 10) : null;
    const attemptIdParam = this.route.snapshot.queryParamMap.get('attemptId');
    if (attemptIdParam) this.attemptId = parseInt(attemptIdParam, 10);
    if (!this.examId) {
      this.errorMessage = 'Invalid exam';
      this.isLoading = false;
      return;
    }
    const user = this.auth.getUser();
    if (!user?.id) {
      this.router.navigate(['/login']);
      return;
    }
    this.studentService.getStudentByUserId(user.id).subscribe({
      next: (r: any) => {
        if (r?.ok && r.student?.id) {
          this.studentId = r.student.id;
          if (this.attemptId && this.studentId) {
            this.step = 'submitted';
            this.isViewingResult = true;
            this.loadResult();
            this.isLoading = false;
          } else {
            this.loadExamInfo();
          }
        } else {
          this.errorMessage = 'Student profile not found';
          this.isLoading = false;
        }
      },
      error: () => {
        this.errorMessage = 'Failed to load student data';
        this.isLoading = false;
      }
    });
  }

  loadExamInfo(): void {
    if (!this.examId || !this.studentId) return;
    this.examService.getExamQuestions(this.examId, this.studentId).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res?.ok && res.data) {
          this.exam = res.data.exam;
          this.questions = res.data.questions || [];
          this.subjectName = res.data.subjectName || 'N/A';
          this.questionCount = this.questions.length;
          this.totalMarks = this.exam?.totalMarks ?? 100;
          this.durationMinutes = this.exam?.durationMinutes ?? 60;
          this.negativeMarking = !!this.exam?.negativeMarking;
          this.negativeMarksPerQuestion = this.exam?.negativeMarksPerQuestion ?? 0;
          this.questions.forEach(q => this.answers.set(q.id, { questionId: q.id }));
        } else {
          this.errorMessage = res?.message || 'Failed to load exam';
        }
      },
      error: (e: any) => {
        this.isLoading = false;
        this.errorMessage = e?.error?.message || 'Failed to load exam';
      }
    });
  }

  startExam(): void {
    if (!this.examId || !this.studentId) return;
    this.isLoading = true;
    this.examService.startExamAttempt(this.examId, this.studentId).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res?.ok && res.data) {
          this.attemptId = res.data.id;
          this.step = 'exam';
          this.timerSeconds = (this.durationMinutes || 60) * 60;
          this.startTimer();
        } else {
          this.errorMessage = res?.message || 'Failed to start exam';
        }
      },
      error: (e: any) => {
        this.isLoading = false;
        this.errorMessage = e?.error?.message || 'Failed to start exam';
      }
    });
  }

  startTimer(): void {
    this.timerInterval = setInterval(() => {
      this.timerSeconds--;
      if (this.timerSeconds <= 0) {
        this.stopTimer();
        this.autoSubmit();
      }
    }, 1000);
  }

  stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  get timerDisplay(): string {
    const m = Math.floor(this.timerSeconds / 60);
    const s = this.timerSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  get currentQuestion(): ExamQuestion | null {
    return this.questions[this.currentIndex] ?? null;
  }

  goToQuestion(index: number): void {
    if (index >= 0 && index < this.questions.length) this.currentIndex = index;
  }

  nextQuestion(): void {
    if (this.currentIndex < this.questions.length - 1) this.currentIndex++;
  }

  prevQuestion(): void {
    if (this.currentIndex > 0) this.currentIndex--;
  }

  toggleMarkForReview(): void {
    const q = this.currentQuestion;
    if (q) {
      if (this.markedForReview.has(q.id)) this.markedForReview.delete(q.id);
      else this.markedForReview.add(q.id);
      this.markedForReview = new Set(this.markedForReview);
    }
  }

  isMarkedForReview(id: number): boolean {
    return this.markedForReview.has(id);
  }

  setMcqAnswer(questionId: number, optionId: number, isMultiple: boolean): void {
    const a = this.answers.get(questionId) || { questionId };
    if (isMultiple) {
      const ids = (a.selectedOptionIds || '').split(',').filter(Boolean).map(s => parseInt(s.trim(), 10));
      const idx = ids.indexOf(optionId);
      if (idx >= 0) ids.splice(idx, 1);
      else ids.push(optionId);
      a.selectedOptionIds = ids.sort((x, y) => x - y).join(',');
    } else {
      a.selectedOptionIds = String(optionId);
    }
    this.answers.set(questionId, a);
  }

  setTextAnswer(questionId: number, text: string): void {
    const a = this.answers.get(questionId) || { questionId };
    a.answerText = text;
    this.answers.set(questionId, a);
  }

  isOptionSelected(questionId: number, optionId: number): boolean {
    const a = this.answers.get(questionId);
    if (!a?.selectedOptionIds) return false;
    return a.selectedOptionIds.split(',').map(s => parseInt(s.trim(), 10)).includes(optionId);
  }

  getAnswerText(questionId: number): string {
    return this.answers.get(questionId)?.answerText || '';
  }

  getAnsweredCount(): number {
    let c = 0;
    this.answers.forEach(a => {
      if ((a.selectedOptionIds && a.selectedOptionIds.trim()) || (a.answerText && a.answerText.trim())) c++;
    });
    return c;
  }

  confirmSubmit(): void {
    if (confirm('Are you sure you want to submit? You cannot change your answers after submission.')) {
      this.submitExam();
    }
  }

  autoSubmit(): void {
    this.submitExam();
  }

  submitExam(): void {
    if (!this.attemptId || !this.studentId) return;
    this.stopTimer();
    this.isSubmitting = true;
    const payload = Array.from(this.answers.values()).map(a => ({
      questionId: a.questionId,
      selectedOptionIds: a.selectedOptionIds || undefined,
      answerText: a.answerText || undefined
    }));
    this.examService.submitExamAttempt(this.attemptId, this.studentId, payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.step = 'submitted';
        this.loadResult();
      },
      error: (e: any) => {
        this.isSubmitting = false;
        this.errorMessage = e?.error?.message || 'Failed to submit';
      }
    });
  }

  loadResult(): void {
    if (!this.attemptId || !this.studentId) return;
    this.examService.getAttemptResult(this.attemptId, this.studentId).subscribe({
      next: (res: any) => {
        if (res?.ok && res.data) this.resultData = res.data;
      }
    });
  }

  goBackToExams(): void {
    this.router.navigate(['/student/dashboard'], { queryParams: { tab: 'exams' } });
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }
}
