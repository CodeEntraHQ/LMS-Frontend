import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Entity } from '../../../../services/entity.service';
import { Course, ClassEntity, Section, Subject } from '../../../../services/subject.service';
import { Teacher } from '../../../../services/teacher.service';
import { ExamService, Exam, ExamTeacherAssignment } from '../../../../services/exam.service';
import { SubjectService } from '../../../../services/subject.service';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-admin-exams',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-exams.component.html',
  styleUrls: ['./admin-exams.component.css']
})
export class AdminExamsComponent implements OnInit {
  @Input() entity!: Entity;
  @Input() courses: Course[] = [];
  @Input() teachers: Teacher[] = [];
  @Output() showSnackbar = new EventEmitter<{ message: string; type: 'success' | 'error' }>();

  examsSubTab: 'configuration' | 'teachers' | 'monitoring' | 'results' | 'control' = 'configuration';

  exams: Exam[] = [];
  isLoadingExams = false;
  showFilters = false;
  filters: any = { courseId: '', classId: '', subjectId: '', examType: '', status: '' };
  filterClasses: ClassEntity[] = [];
  filterSections: Section[] = [];
  filterSubjects: Subject[] = [];
  allSubjects: Subject[] = []; // For resolving subject names in exam list

  examForm: Partial<Exam> = {};
  showExamModal = false;
  isEditingExam = false;
  selectedExam: Exam | null = null;

  selectedExamForTeachers: Exam | null = null;
  teacherAssignments: ExamTeacherAssignment[] = [];
  showAssignTeacherModal = false;
  assignTeacherForm: { teacherId?: number; canEvaluate: boolean; canPublishResult: boolean } = { canEvaluate: true, canPublishResult: false };

  selectedExamForMonitor: Exam | null = null;
  monitoringData: any = null;

  selectedExamForPerf: Exam | null = null;
  performanceData: any = null;

  constructor(
    private examService: ExamService,
    private subjectService: SubjectService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.loadExams();
    const entityId = typeof this.entity?.id === 'string' ? parseInt(this.entity.id) : (this.entity?.id || 0);
    if (entityId) {
      this.subjectService.getSubjectsByEntity(entityId).subscribe({
        next: (r: any) => { this.allSubjects = r?.data || (Array.isArray(r) ? r : []); }
      });
    }
  }

  loadExams(): void {
    this.isLoadingExams = true;
    const entityId = typeof this.entity?.id === 'string' ? parseInt(this.entity.id) : (this.entity?.id || 0);
    const courseId = this.filters.courseId ? parseInt(this.filters.courseId) : undefined;
    const classId = this.filters.classId ? parseInt(this.filters.classId) : undefined;
    const subjectId = this.filters.subjectId ? parseInt(this.filters.subjectId) : undefined;
    this.examService.getExams(entityId, courseId, classId, subjectId, this.filters.examType || undefined, this.filters.status || undefined).subscribe({
      next: (res: any) => {
        if (res?.ok && res.data) this.exams = res.data;
        else this.exams = [];
        this.isLoadingExams = false;
      },
      error: () => { this.isLoadingExams = false; }
    });
  }

  onCourseChange(): void {
    this.filters.classId = '';
    this.filters.subjectId = '';
    this.filterClasses = [];
    this.filterSubjects = [];
    if (this.filters.courseId) {
      this.subjectService.getClassesByCourse(this.filters.courseId).subscribe({
        next: (r: any) => { if (r?.data) this.filterClasses = r.data; else if (r?.ok) this.filterClasses = r; }
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

  openCreateExamModal(): void {
    this.isEditingExam = false;
    this.selectedExam = null;
    this.examForm = {
      entityId: typeof this.entity?.id === 'string' ? parseInt(this.entity.id) : (this.entity?.id || 0),
      courseId: 0,
      classId: 0,
      subjectId: 0,
      name: '',
      examType: 'UNIT_TEST',
      totalMarks: 100,
      passingMarks: 33,
      examDate: new Date().toISOString().split('T')[0],
      durationMinutes: 90,
      negativeMarking: false,
      negativeMarksPerQuestion: 0,
      allowMcq: true,
      allowSubjective: true,
      allowFileUpload: false,
      reAttemptAllowed: false,
      timeLimitStrict: true,
      randomQuestionShuffle: true,
      status: 'draft'
    };
    this.showExamModal = true;
  }

  editExam(exam: Exam): void {
    this.isEditingExam = true;
    this.selectedExam = exam;
    this.examForm = { ...exam };
    const courseId = typeof exam.courseId === 'number' ? exam.courseId : (exam.courseId ? parseInt(String(exam.courseId)) : 0);
    const classId = typeof exam.classId === 'number' ? exam.classId : (exam.classId ? parseInt(String(exam.classId)) : 0);
    const subjectId = typeof exam.subjectId === 'number' ? exam.subjectId : (exam.subjectId ? parseInt(String(exam.subjectId)) : 0);
    this.examForm.courseId = courseId;
    this.examForm.classId = classId;
    this.examForm.subjectId = subjectId;
    if (exam.examDate) this.examForm.examDate = String(exam.examDate).split('T')[0];
    if (exam.startTime) this.examForm.startTime = String(exam.startTime).substring(0, 5);
    if (exam.endTime) this.examForm.endTime = String(exam.endTime).substring(0, 5);
    this.filterClasses = [];
    this.filterSubjects = [];
    if (courseId) {
      this.subjectService.getClassesByCourse(courseId).subscribe({
        next: (r: any) => {
          this.filterClasses = r?.data || (Array.isArray(r) ? r : []);
          if (classId) {
            this.subjectService.getSubjectsByCourseAndClass(courseId, classId).subscribe({
              next: (s: any) => { this.filterSubjects = s?.data || (Array.isArray(s) ? s : []); }
            });
          }
        }
      });
    }
    this.showExamModal = true;
  }

  closeExamModal(): void {
    this.showExamModal = false;
    this.examForm = {};
    this.selectedExam = null;
  }

  onExamFormCourseChange(): void {
    this.examForm.classId = 0 as any;
    this.examForm.subjectId = 0 as any;
    if (this.examForm.courseId) {
      this.subjectService.getClassesByCourse(this.examForm.courseId).subscribe({
        next: (r: any) => { if (r?.data) this.filterClasses = r.data; else if (r?.ok) this.filterClasses = r; }
      });
    }
  }

  onExamFormClassChange(): void {
    this.examForm.subjectId = 0 as any;
    if (this.examForm.courseId && this.examForm.classId) {
      this.subjectService.getSubjectsByCourseAndClass(this.examForm.courseId, this.examForm.classId).subscribe({
        next: (r: any) => { this.filterSubjects = r?.data || (Array.isArray(r) ? r : []); }
      });
    }
  }

  saveExam(): void {
    if (!this.entity?.id) { this.showSnackbar.emit({ message: 'Entity not found', type: 'error' }); return; }
    const user = this.auth.getUser();
    if (!user?.id) { this.showSnackbar.emit({ message: 'User not authenticated', type: 'error' }); return; }
    const entityId = typeof this.entity.id === 'string' ? parseInt(this.entity.id) : this.entity.id;
    if (!this.examForm.name || !this.examForm.courseId || !this.examForm.classId || !this.examForm.subjectId || !this.examForm.examDate) {
      this.showSnackbar.emit({ message: 'Please fill required fields (Name, Course, Class, Subject, Date)', type: 'error' });
      return;
    }
    const exam: Exam = { ...this.examForm, entityId } as Exam;
    if (this.isEditingExam && this.examForm.id) {
      this.examService.updateExam(this.examForm.id, exam, user.id).subscribe({
        next: (r: any) => {
          if (r?.ok) { this.showSnackbar.emit({ message: 'Exam updated successfully', type: 'success' }); this.closeExamModal(); this.loadExams(); }
          else this.showSnackbar.emit({ message: r?.message || 'Failed to update', type: 'error' });
        },
        error: (e: any) => this.showSnackbar.emit({ message: e?.error?.message || 'Failed to update exam', type: 'error' })
      });
    } else {
      this.examService.createExam(exam, user.id).subscribe({
        next: (r: any) => {
          if (r?.ok) { this.showSnackbar.emit({ message: 'Exam created successfully', type: 'success' }); this.closeExamModal(); this.loadExams(); }
          else this.showSnackbar.emit({ message: r?.message || 'Failed to create', type: 'error' });
        },
        error: (e: any) => this.showSnackbar.emit({ message: e?.error?.message || 'Failed to create exam', type: 'error' })
      });
    }
  }

  deleteExam(exam: Exam): void {
    if (!confirm('Delete this exam?')) return;
    this.examService.deleteExam(exam.id!).subscribe({
      next: (r: any) => {
        if (r?.ok) { this.showSnackbar.emit({ message: 'Exam deleted', type: 'success' }); this.loadExams(); }
        else this.showSnackbar.emit({ message: r?.message || 'Failed to delete', type: 'error' });
      },
      error: (e: any) => this.showSnackbar.emit({ message: e?.error?.message || 'Failed to delete', type: 'error' })
    });
  }

  openAssignTeacher(exam: Exam): void {
    this.selectedExamForTeachers = exam;
    this.examService.getTeacherAssignments(exam.id!).subscribe({
      next: (r: any) => { this.teacherAssignments = r?.data || []; this.showAssignTeacherModal = true; }
    });
  }

  closeAssignTeacherModal(): void {
    this.showAssignTeacherModal = false;
    this.selectedExamForTeachers = null;
    this.teacherAssignments = [];
  }

  addTeacherAssignment(): void {
    if (!this.selectedExamForTeachers?.id || !this.assignTeacherForm.teacherId) return;
    this.examService.assignTeacher(this.selectedExamForTeachers.id, this.assignTeacherForm.teacherId, this.assignTeacherForm.canEvaluate, this.assignTeacherForm.canPublishResult).subscribe({
      next: (r: any) => {
        if (r?.ok) { this.showSnackbar.emit({ message: 'Teacher assigned', type: 'success' }); this.examService.getTeacherAssignments(this.selectedExamForTeachers!.id!).subscribe((res: any) => { this.teacherAssignments = res?.data || []; }); }
      }
    });
  }

  removeTeacherAssignment(teacherId: number): void {
    if (!this.selectedExamForTeachers?.id) return;
    this.examService.removeTeacherAssignment(this.selectedExamForTeachers.id, teacherId).subscribe({
      next: (r: any) => {
        if (r?.ok) { this.teacherAssignments = this.teacherAssignments.filter(a => a.teacherId !== teacherId); this.showSnackbar.emit({ message: 'Assignment removed', type: 'success' }); }
      }
    });
  }

  loadMonitoring(exam: Exam): void {
    this.selectedExamForMonitor = exam;
    this.examService.getExamMonitoring(exam.id!).subscribe({
      next: (r: any) => { this.monitoringData = r?.data || null; }
    });
  }

  loadPerformance(exam: Exam): void {
    this.selectedExamForPerf = exam;
    this.examService.getPerformanceReport(exam.id!).subscribe({
      next: (r: any) => { this.performanceData = r?.data || null; }
    });
  }

  publishExam(exam: Exam): void {
    this.examService.publishExamByAdmin(exam.id!).subscribe({
      next: (r: any) => {
        if (r?.ok) { this.showSnackbar.emit({ message: 'Exam published - students can now see and attempt', type: 'success' }); this.loadExams(); }
        else this.showSnackbar.emit({ message: r?.message || 'Failed', type: 'error' });
      },
      error: (e: any) => this.showSnackbar.emit({ message: e?.error?.message || 'Failed to publish exam', type: 'error' })
    });
  }

  publishResult(exam: Exam): void {
    this.examService.publishResult(exam.id!).subscribe({
      next: (r: any) => { if (r?.ok) { this.showSnackbar.emit({ message: 'Result published', type: 'success' }); this.loadExams(); } }
    });
  }

  unpublishResult(exam: Exam): void {
    this.examService.unpublishResult(exam.id!).subscribe({
      next: (r: any) => { if (r?.ok) { this.showSnackbar.emit({ message: 'Result unpublished', type: 'success' }); this.loadExams(); } }
    });
  }

  lockExam(exam: Exam): void {
    this.examService.lockExam(exam.id!).subscribe({
      next: (r: any) => { if (r?.ok) { this.showSnackbar.emit({ message: 'Exam locked', type: 'success' }); this.loadExams(); } }
    });
  }

  unlockExam(exam: Exam): void {
    this.examService.unlockExam(exam.id!).subscribe({
      next: (r: any) => { if (r?.ok) { this.showSnackbar.emit({ message: 'Exam unlocked', type: 'success' }); this.loadExams(); } }
    });
  }

  disableExam(exam: Exam): void {
    this.examService.disableExam(exam.id!).subscribe({
      next: (r: any) => { if (r?.ok) { this.showSnackbar.emit({ message: 'Exam disabled', type: 'success' }); this.loadExams(); } }
    });
  }

  enableExam(exam: Exam): void {
    this.examService.enableExam(exam.id!).subscribe({
      next: (r: any) => { if (r?.ok) { this.showSnackbar.emit({ message: 'Exam enabled', type: 'success' }); this.loadExams(); } }
    });
  }

  getCourseName(id?: number): string {
    return this.courses.find(c => c.id === id)?.name || '';
  }
  getClassName(id?: number): string {
    return this.filterClasses.find(c => c.id === id)?.name || '';
  }
  getSubjectName(id?: number): string {
    return this.filterSubjects.find(s => s.id === id)?.name || this.allSubjects.find(s => s.id === id)?.name || 'N/A';
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
