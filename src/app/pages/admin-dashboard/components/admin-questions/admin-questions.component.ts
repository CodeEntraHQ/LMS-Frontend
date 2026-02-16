import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Entity } from '../../../../services/entity.service';
import { Course, ClassEntity, Subject } from '../../../../services/subject.service';
import { Teacher } from '../../../../services/teacher.service';
import { QuestionService, QuestionBank, QuestionPolicy } from '../../../../services/question.service';
import { SubjectService } from '../../../../services/subject.service';

@Component({
  selector: 'app-admin-questions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-questions.component.html',
  styleUrls: ['./admin-questions.component.css']
})
export class AdminQuestionsComponent implements OnInit {
  @Input() entity!: Entity;
  @Input() courses: Course[] = [];
  @Input() teachers: Teacher[] = [];
  @Output() showSnackbar = new EventEmitter<{ message: string; type: 'success' | 'error' }>();

  subTab: 'bank' | 'policy' | 'monitoring' | 'control' = 'bank';

  questions: any[] = [];
  isLoading = false;
  showFilters = false;
  filters: any = { courseId: '', classId: '', subjectId: '', status: '', teacherId: '' };
  filterClasses: ClassEntity[] = [];
  filterSubjects: Subject[] = [];
  allSubjects: Subject[] = [];

  policy: QuestionPolicy | null = null;
  policyForm: Partial<QuestionPolicy> = {};
  isSavingPolicy = false;

  monitoringStats: any = null;

  selectedQuestion: any = null;
  showQuestionModal = false;

  showCreateQuestionModal = false;
  createQuestionForm: any = { courseId: 0, classId: 0, subjectId: 0, questionText: '', questionType: 'MCQ_SINGLE', marks: 1, difficulty: 'medium', chapterUnit: '' };
  createFilterClasses: ClassEntity[] = [];
  createFilterSubjects: Subject[] = [];
  createQuestionOptions: { optionText: string; isCorrect: boolean }[] = [{ optionText: '', isCorrect: false }, { optionText: '', isCorrect: false }];

  constructor(
    private questionService: QuestionService,
    private subjectService: SubjectService
  ) {}

  ngOnInit(): void {
    this.loadPolicy();
    this.loadQuestions();
    const entityId = typeof this.entity?.id === 'string' ? parseInt(this.entity.id) : (this.entity?.id || 0);
    if (entityId) {
      this.subjectService.getSubjectsByEntity(entityId).subscribe({
        next: (r: any) => { this.allSubjects = r?.data || (Array.isArray(r) ? r : []); }
      });
    }
  }

  onSubTabChange(tab: 'bank' | 'policy' | 'monitoring' | 'control'): void {
    this.subTab = tab;
    if (tab === 'bank') this.loadQuestions();
    if (tab === 'policy') this.loadPolicy();
    if (tab === 'monitoring') this.loadMonitoring();
  }

  onCourseChange(): void {
    this.filters.classId = '';
    this.filters.subjectId = '';
    this.filterClasses = [];
    this.filterSubjects = [];
    if (this.filters.courseId) {
      this.subjectService.getClassesByCourse(this.filters.courseId).subscribe({
        next: (r: any) => { this.filterClasses = r?.data || (Array.isArray(r) ? r : []); }
      });
    }
  }

  onClassChange(): void {
    this.filters.subjectId = '';
    this.filterSubjects = [];
    if (this.filters.courseId && this.filters.classId) {
      this.subjectService.getSubjectsByCourseAndClass(parseInt(this.filters.courseId), parseInt(this.filters.classId)).subscribe({
        next: (r: any) => { this.filterSubjects = r?.data || (Array.isArray(r) ? r : []); }
      });
    }
  }

  openCreateQuestionModal(): void {
    this.createQuestionForm = { courseId: 0, classId: 0, subjectId: 0, questionText: '', questionType: 'MCQ_SINGLE', marks: 1, difficulty: 'medium', chapterUnit: '' };
    this.createFilterClasses = [];
    this.createFilterSubjects = [];
    this.createQuestionOptions = [{ optionText: '', isCorrect: false }, { optionText: '', isCorrect: false }];
    this.showCreateQuestionModal = true;
  }

  closeCreateQuestionModal(): void {
    this.showCreateQuestionModal = false;
  }

  onCreateCourseChange(): void {
    this.createQuestionForm.classId = 0;
    this.createQuestionForm.subjectId = 0;
    this.createFilterClasses = [];
    this.createFilterSubjects = [];
    if (this.createQuestionForm.courseId) {
      this.subjectService.getClassesByCourse(this.createQuestionForm.courseId).subscribe({
        next: (r: any) => { this.createFilterClasses = r?.data || (Array.isArray(r) ? r : []); }
      });
    }
  }

  onCreateClassChange(): void {
    this.createQuestionForm.subjectId = 0;
    this.createFilterSubjects = [];
    if (this.createQuestionForm.courseId && this.createQuestionForm.classId) {
      this.subjectService.getSubjectsByCourseAndClass(this.createQuestionForm.courseId, this.createQuestionForm.classId).subscribe({
        next: (r: any) => { this.createFilterSubjects = r?.data || (Array.isArray(r) ? r : []); }
      });
    }
  }

  addCreateOption(): void {
    this.createQuestionOptions.push({ optionText: '', isCorrect: false });
  }

  removeCreateOption(i: number): void {
    this.createQuestionOptions.splice(i, 1);
  }

  createQuestion(): void {
    const entityId = typeof this.entity?.id === 'string' ? parseInt(this.entity.id) : (this.entity?.id || 0);
    if (!entityId || !this.createQuestionForm.courseId || !this.createQuestionForm.classId || !this.createQuestionForm.subjectId || !this.createQuestionForm.questionText?.trim()) {
      this.showSnackbar.emit({ message: 'Fill Course, Class, Subject and Question text', type: 'error' });
      return;
    }
    const q: QuestionBank = {
      entityId,
      courseId: this.createQuestionForm.courseId,
      classId: this.createQuestionForm.classId,
      subjectId: this.createQuestionForm.subjectId,
      questionText: this.createQuestionForm.questionText.trim(),
      questionType: this.createQuestionForm.questionType,
      marks: this.createQuestionForm.marks || 1,
      difficulty: this.createQuestionForm.difficulty || 'medium',
      chapterUnit: this.createQuestionForm.chapterUnit || undefined
    };
    this.questionService.createQuestionByAdmin(q).subscribe({
      next: (res: any) => {
        if (res?.ok && res.data) {
          const questionId = res.data.id;
          const needsOptions = ['MCQ_SINGLE', 'MCQ_MULTIPLE'].includes(this.createQuestionForm.questionType);
          if (needsOptions && this.createQuestionOptions.some(o => o.optionText?.trim())) {
            let done = 0;
            const total = this.createQuestionOptions.filter(o => o.optionText?.trim()).length;
            this.createQuestionOptions.forEach((opt, idx) => {
              if (!opt.optionText?.trim()) return;
              this.questionService.addOptionByAdmin({ questionId, optionText: opt.optionText.trim(), isCorrect: !!opt.isCorrect, orderIndex: idx }).subscribe({
                next: () => { done++; if (done >= total) { this.showSnackbar.emit({ message: 'Question created (auto-approved)', type: 'success' }); this.closeCreateQuestionModal(); this.loadQuestions(); } },
                error: () => { this.showSnackbar.emit({ message: 'Question created but option failed', type: 'error' }); this.closeCreateQuestionModal(); this.loadQuestions(); }
              });
            });
          } else {
            this.showSnackbar.emit({ message: 'Question created (auto-approved)', type: 'success' });
            this.closeCreateQuestionModal();
            this.loadQuestions();
          }
        } else this.showSnackbar.emit({ message: res?.message || 'Failed', type: 'error' });
      },
      error: (e: any) => this.showSnackbar.emit({ message: e?.error?.message || 'Failed to create', type: 'error' })
    });
  }

  loadQuestions(): void {
    this.isLoading = true;
    const entityId = typeof this.entity?.id === 'string' ? parseInt(this.entity.id) : (this.entity?.id || 0);
    const courseId = this.filters.courseId ? parseInt(this.filters.courseId) : undefined;
    const classId = this.filters.classId ? parseInt(this.filters.classId) : undefined;
    const subjectId = this.filters.subjectId ? parseInt(this.filters.subjectId) : undefined;
    const teacherId = this.filters.teacherId ? parseInt(this.filters.teacherId) : undefined;
    this.questionService.listQuestions(entityId, courseId, classId, subjectId, this.filters.status || undefined, teacherId).subscribe({
      next: (res: any) => {
        this.questions = res?.ok && res.data ? res.data : [];
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
  }

  loadPolicy(): void {
    const entityId = typeof this.entity?.id === 'string' ? parseInt(this.entity.id) : (this.entity?.id || 0);
    this.questionService.getPolicy(entityId).subscribe({
      next: (res: any) => {
        this.policy = res?.data || null;
        this.policyForm = this.policy ? { ...this.policy } : {};
      }
    });
  }

  savePolicy(): void {
    const entityId = typeof this.entity?.id === 'string' ? parseInt(this.entity.id) : (this.entity?.id || 0);
    this.isSavingPolicy = true;
    this.questionService.updatePolicy(entityId, this.policyForm).subscribe({
      next: (res: any) => {
        if (res?.ok) { this.showSnackbar.emit({ message: 'Policy updated', type: 'success' }); this.loadPolicy(); }
        else this.showSnackbar.emit({ message: res?.message || 'Failed', type: 'error' });
        this.isSavingPolicy = false;
      },
      error: () => { this.isSavingPolicy = false; }
    });
  }

  loadMonitoring(): void {
    const entityId = typeof this.entity?.id === 'string' ? parseInt(this.entity.id) : (this.entity?.id || 0);
    this.questionService.getMonitoringStats(entityId).subscribe({
      next: (res: any) => { this.monitoringStats = res?.ok ? res.data : null; }
    });
  }

  viewQuestion(q: any): void {
    this.questionService.getQuestion(q.id).subscribe({
      next: (res: any) => { this.selectedQuestion = res?.data; this.showQuestionModal = true; }
    });
  }

  closeQuestionModal(): void {
    this.showQuestionModal = false;
    this.selectedQuestion = null;
  }

  approveQuestion(q: any): void {
    this.questionService.approveQuestion(q.id).subscribe({
      next: (r: any) => {
        if (r?.ok) { this.showSnackbar.emit({ message: 'Question approved', type: 'success' }); this.loadQuestions(); }
        else this.showSnackbar.emit({ message: r?.message || 'Failed', type: 'error' });
      }
    });
  }

  rejectQuestion(q: any): void {
    this.questionService.rejectQuestion(q.id).subscribe({
      next: (r: any) => {
        if (r?.ok) { this.showSnackbar.emit({ message: 'Question rejected', type: 'success' }); this.loadQuestions(); }
        else this.showSnackbar.emit({ message: r?.message || 'Failed', type: 'error' });
      }
    });
  }

  deleteQuestion(q: any): void {
    if (!confirm('Delete this question?')) return;
    this.questionService.deleteQuestion(q.id).subscribe({
      next: (r: any) => {
        if (r?.ok) { this.showSnackbar.emit({ message: 'Question deleted', type: 'success' }); this.loadQuestions(); this.closeQuestionModal(); }
        else this.showSnackbar.emit({ message: r?.message || 'Failed', type: 'error' });
      }
    });
  }

  getCourseName(id?: number): string {
    return this.courses.find(c => c.id === id)?.name || '';
  }
  getClassName(id?: number): string {
    return this.filterClasses.find(c => c.id === id)?.name || '';
  }
  getSubjectName(id?: number): string {
    const q = this.questions.find(x => x.subjectId === id);
    if (q?.subjectName) return q.subjectName;
    const s = this.allSubjects.find(x => x.id === id) || this.filterSubjects.find(x => x.id === id);
    return s?.name || 'N/A';
  }
  getTeacherName(id?: number): string {
    const t = this.teachers.find(t => t.id === id);
    return t ? `${t.firstName || ''} ${t.lastName || ''}`.trim() : '';
  }
  formatDate(d?: string): string {
    if (!d) return '';
    return new Date(d).toLocaleDateString();
  }
}
