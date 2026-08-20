import { type ComponentType, type CSSProperties, type ReactNode, useEffect, useState } from 'react';
import { Link, Route, Switch, useLocation, useParams } from 'wouter';
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  FileText,
  Flame,
  LayoutGrid,
  ListPlus,
  Menu,
  Moon,
  Pencil,
  Plus,
  Search,
  Settings2,
  Sparkles,
  Sun,
  Target,
  Trash2,
  TrendingUp,
  X,
} from 'lucide-react';
import NotFound from '@/pages/not-found';

type Subject = {
  id: string;
  name: string;
  code: string;
  board: string;
  accent: string;
  note: string;
  spec: { id: string; title: string; unit: string; done: boolean }[];
  prompts: { id: string; title: string; tag: string }[];
  papers: { id: string; label: string; score: string; date: string }[];
};
type Task = { id: string; day: string; time: string; title: string; subject: string; done: boolean };
type Exam = { id: string; subject: string; title: string; date: string; color: string };
type Grade = { id: string; title: string; subject: string; mark: number; outOf: number; target: string; date: string; reflection: string };
type IconType = ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;

const seedSubjects: Subject[] = [
  {
    id: 'english-lit', name: 'English Literature', code: 'ENGLISH LIT', board: 'AQA · 7717', accent: '#df8a73',
    note: 'Find the pressure points between a text and its time.',
    spec: [
      { id: 'en-1', title: 'Love through the ages', unit: 'Paper 1 · Tragedy', done: true },
      { id: 'en-2', title: 'Othello: character and structure', unit: 'Shakespeare', done: true },
      { id: 'en-3', title: 'The Great Gatsby: context', unit: 'Novel study', done: false },
      { id: 'en-4', title: 'Poetry anthology: meanings and methods', unit: 'Poetry', done: false },
      { id: 'en-5', title: 'Unseen poetry comparison', unit: 'Paper 2 · Modern texts', done: false },
    ],
    prompts: [
      { id: 'ep-1', title: 'How does Fitzgerald make desire feel dangerous?', tag: 'The Great Gatsby' },
      { id: 'ep-2', title: 'Explore the presentation of jealousy in Othello.', tag: 'Othello' },
    ],
    papers: [{ id: 'epp-1', label: 'AQA June 2022 · Paper 1', score: '31 / 55', date: '12 Sep' }, { id: 'epp-2', label: 'AQA June 2021 · Paper 2', score: '42 / 75', date: '28 Aug' }],
  },
  {
    id: 'history', name: 'History', code: 'HISTORY', board: 'OCR · Y113', accent: '#5c9f94',
    note: 'Build the argument first; the dates will follow.',
    spec: [
      { id: 'hi-1', title: 'The early Tudors, 1485–1558', unit: 'Unit 1 · British period', done: true },
      { id: 'hi-2', title: 'England 1547–1603: religious change', unit: 'Unit 1', done: true },
      { id: 'hi-3', title: 'The Cold War in Europe', unit: 'Unit 3 · Non-British period', done: true },
      { id: 'hi-4', title: 'The Vietnam War and its impact', unit: 'Unit 3', done: false },
    ],
    prompts: [{ id: 'hp-1', title: 'How far did fear, rather than ideology, drive the Cold War?', tag: 'Cold War' }],
    papers: [{ id: 'hpp-1', label: 'OCR June 2023 · Unit 3', score: '48 / 60', date: '09 Sep' }],
  },
  {
    id: 'psychology', name: 'Psychology', code: 'PSYCHOLOGY', board: 'AQA · 7182', accent: '#d6a93d',
    note: 'Stay curious. Then make every study a little more precise.',
    spec: [
      { id: 'ps-1', title: 'Social influence', unit: 'Paper 1', done: true },
      { id: 'ps-2', title: 'Memory', unit: 'Paper 1', done: true },
      { id: 'ps-3', title: 'Attachment', unit: 'Paper 1', done: false },
      { id: 'ps-4', title: 'Research methods', unit: 'Paper 2', done: false },
      { id: 'ps-5', title: 'Biopsychology', unit: 'Paper 2', done: false },
    ],
    prompts: [{ id: 'pp-1', title: 'Discuss the role of conformity in explaining obedience.', tag: 'Social influence' }],
    papers: [{ id: 'ppp-1', label: 'AQA June 2022 · Paper 1', score: '62 / 96', date: '06 Sep' }],
  },
];

const seedTasks: Task[] = [
  { id: 't1', day: 'Today', time: '09:00', title: 'Finish Gatsby chapter 5 annotations', subject: 'English Lit', done: false },
  { id: 't2', day: 'Today', time: '16:30', title: 'Review Milgram evaluation cards', subject: 'Psychology', done: false },
  { id: 't3', day: 'Today', time: '19:00', title: 'Plan one Cold War 20-marker', subject: 'History', done: true },
  { id: 't4', day: 'Tomorrow', time: '17:00', title: 'Complete research methods quiz', subject: 'Psychology', done: false },
  { id: 't5', day: 'Thursday', time: '18:00', title: 'Timed Othello paragraph', subject: 'English Lit', done: false },
];
const seedExams: Exam[] = [
  { id: 'x1', subject: 'English Literature', title: 'Paper 1 · Tragedy', date: '2026-05-18', color: '#df8a73' },
  { id: 'x2', subject: 'History', title: 'Unit 1 · British period', date: '2026-05-27', color: '#5c9f94' },
  { id: 'x3', subject: 'Psychology', title: 'Paper 1 · Intro topics', date: '2026-06-03', color: '#d6a93d' },
];
const seedGrades: Grade[] = [
  { id: 'g1', title: 'The Great Gatsby essay', subject: 'English Literature', mark: 23, outOf: 30, target: 'A', date: '2024-10-02', reflection: 'Strong line of argument. Next time, weave context into the close analysis instead of adding it at the end.' },
  { id: 'g2', title: 'Cold War source paper', subject: 'History', mark: 31, outOf: 40, target: 'A', date: '2024-09-26', reflection: 'Evidence was accurate, but the final judgement needed a sharper comparison of significance.' },
  { id: 'g3', title: 'Social influence mini mock', subject: 'Psychology', mark: 42, outOf: 48, target: 'A*', date: '2024-09-19', reflection: 'AO3 is becoming more confident. Revisit ethical issues and write one perfect evaluation paragraph.' },
];

function useStored<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) as T : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => { localStorage.setItem(key, JSON.stringify(value)); }, [key, value]);
  return [value, setValue] as const;
}

function daysUntil(date: string) {
  const now = new Date();
  const target = new Date(`${date}T12:00:00`);
  return Math.max(0, Math.ceil((target.getTime() - now.getTime()) / 86400000));
}

function App() {
  const [dark, setDark] = useState(() => localStorage.getItem('focus-theme') === 'dark');
  useEffect(() => { document.documentElement.classList.toggle('dark', dark); localStorage.setItem('focus-theme', dark ? 'dark' : 'light'); }, [dark]);
  return <div className="min-h-[100dvh] bg-background text-foreground"><Shell dark={dark} onTheme={() => setDark((v) => !v)} /></div>;
}

function Shell({ dark, onTheme }: { dark: boolean; onTheme: () => void }) {
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const nav = [{ href: '/', label: 'Week view', icon: LayoutGrid }, { href: '/subjects', label: 'Subjects', icon: BookOpen }, { href: '/grades', label: 'Grades & targets', icon: TrendingUp }];
  return (
    <div className="flex min-h-[100dvh]">
      <aside className="hidden w-[248px] shrink-0 flex-col bg-sidebar px-5 py-6 text-sidebar-foreground md:flex">
        <Brand />
        <div className="mt-14 flex-1">
          <p className="eyebrow mb-4 px-3 text-sidebar-foreground/45">Your space</p>
          <nav className="space-y-1">
            {nav.map(({ href, label, icon: Icon }) => <Link key={href} href={href} data-testid={`link-nav-${label.toLowerCase().replaceAll(' ', '-')}`} className={`nav-link ${location === href ? 'nav-link-active' : ''}`}><Icon size={18} strokeWidth={1.8} /><span>{label}</span>{location === href && <ChevronRight className="ml-auto" size={15} />}</Link>)}
          </nav>
        </div>
        <div className="border-t border-sidebar-border pt-5">
          <button data-testid="button-theme-toggle" onClick={onTheme} className="nav-link w-full text-sidebar-foreground/75"><span className="flex size-7 items-center justify-center rounded-full bg-sidebar-accent">{dark ? <Sun size={15} /> : <Moon size={15} />}</span><span>{dark ? 'Light mode' : 'Night mode'}</span></button>
          <div data-testid="text-settings" className="nav-link w-full cursor-default text-sidebar-foreground/45"><Settings2 size={18} /><span>Settings</span></div>
          <div className="mt-5 flex items-center gap-3 rounded-2xl bg-sidebar-accent p-3"><div className="flex size-9 items-center justify-center rounded-full bg-secondary font-mono text-xs font-bold text-secondary-foreground">AM</div><div><p className="text-sm font-bold">Alex Morgan</p><p className="text-[11px] text-sidebar-foreground/55">Year 13 · 2024/25</p></div></div>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border/70 bg-background/90 px-5 py-4 backdrop-blur-md md:hidden">
          <Brand compact />
          <button data-testid="button-mobile-menu" onClick={() => setMenuOpen((v) => !v)} className="icon-button">{menuOpen ? <X size={21} /> : <Menu size={21} />}</button>
        </header>
        {menuOpen && <div className="absolute inset-x-0 top-[65px] z-30 border-b border-border bg-card px-5 py-3 shadow-lg md:hidden">{nav.map(({ href, label, icon: Icon }) => <Link key={href} href={href} onClick={() => setMenuOpen(false)} className={`nav-link text-foreground ${location === href ? 'bg-muted' : ''}`}><Icon size={18} /><span>{label}</span></Link>)}<button onClick={onTheme} className="nav-link w-full text-foreground"><Moon size={18} /><span>Switch to {dark ? 'day' : 'night'} mode</span></button></div>}
        <main className="mx-auto w-full max-w-[1420px] flex-1 px-5 py-7 sm:px-8 lg:px-12 lg:py-10"><Switch><Route path="/" component={Planner} /><Route path="/subjects/:subjectId" component={SubjectDetail} /><Route path="/subjects" component={Subjects} /><Route path="/grades" component={Grades} /><Route component={NotFound} /></Switch></main>
      </div>
    </div>
  );
}

function Brand({ compact = false }: { compact?: boolean }) {
  return <Link href="/" data-testid="link-brand" className="flex items-center gap-3"><span className="brand-mark"><span /></span><span className={compact ? 'text-lg' : 'text-[20px]'} style={{ fontFamily: 'var(--app-font-serif)' }}>Focus <i>Year</i></span></Link>;
}

function PageIntro({ eyebrow, title, children, action }: { eyebrow: string; title: ReactNode; children: ReactNode; action?: ReactNode }) {
  return <div className="mb-9 flex flex-col justify-between gap-5 lg:flex-row lg:items-end"><div><p className="eyebrow">{eyebrow}</p><h1 className="mt-2 max-w-3xl text-4xl font-extrabold tracking-[-0.04em] text-foreground sm:text-5xl">{title}</h1><p className="mt-3 max-w-2xl text-[15px] leading-7 text-muted-foreground">{children}</p></div>{action}</div>;
}

function Planner() {
  const [tasks, setTasks] = useStored<Task[]>('focus-tasks', seedTasks);
  const [exams, setExams] = useStored<Exam[]>('focus-exams', seedExams);
  const [modal, setModal] = useState<'task' | 'exam' | null>(null);
  const [editing, setEditing] = useState<Task | Exam | null>(null);
  const done = tasks.filter((task) => task.done).length;
  const openTask = (item: Task | null = null) => { setEditing(item); setModal('task'); };
  return <section className="animate-in">
    <PageIntro eyebrow="Tuesday · 08 October 2024" title={<>Make space for the work<br className="hidden sm:block" /> that moves you forward.</>} action={<button data-testid="button-add-task" onClick={() => openTask()} className="primary-button"><Plus size={17} /> Add priority</button>}>A clear week is a kind one. You have {tasks.length - done} things in motion today — enough to make progress, not enough to lose yourself in.</PageIntro>
    <div className="grid gap-5 xl:grid-cols-[1.45fr_.75fr]">
      <section className="panel overflow-hidden p-0">
        <div className="flex items-center justify-between border-b border-border px-5 py-4 sm:px-7"><div><p className="eyebrow">This week</p><h2 className="mt-1 text-xl font-bold">Priority rhythm</h2></div><div className="flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-xs font-semibold text-muted-foreground"><CheckCircle2 size={14} className="text-primary" /> {done} of {tasks.length} done</div></div>
        <div className="grid grid-cols-5 border-b border-border/80 bg-muted/35">{['Mon 07', 'Tue 08', 'Wed 09', 'Thu 10', 'Fri 11'].map((day, i) => <div key={day} className={`day-tab ${i === 1 ? 'day-tab-active' : ''}`}><span>{day.split(' ')[0]}</span><b>{day.split(' ')[1]}</b></div>)}</div>
        <div className="divide-y divide-border/70">
          {tasks.map((task) => <TaskRow key={task.id} task={task} onToggle={() => setTasks((all) => all.map((item) => item.id === task.id ? { ...item, done: !item.done } : item))} onEdit={() => openTask(task)} onDelete={() => setTasks((all) => all.filter((item) => item.id !== task.id))} />)}
          {tasks.length === 0 && <EmptyState icon={ListPlus} title="A clean page" text="Add one small priority to give this week a shape." />}
        </div>
        <button data-testid="button-add-task-inline" onClick={() => openTask()} className="flex w-full items-center justify-center gap-2 py-4 text-sm font-bold text-primary transition-colors hover:bg-muted"><Plus size={16} /> Add another priority</button>
      </section>
      <div className="space-y-5">
        <section className="pressure-card">
          <div className="relative z-10 flex items-start justify-between"><div><p className="eyebrow text-secondary-foreground/60">Pressure, visible</p><h2 className="mt-2 text-2xl font-extrabold tracking-tight text-secondary-foreground">Exam season<br />is {daysUntil('2026-05-18')} days away.</h2></div><div className="rounded-full bg-secondary-foreground/10 p-2.5 text-secondary-foreground"><Target size={20} /></div></div>
          <div className="relative z-10 mt-9 h-2 overflow-hidden rounded-full bg-secondary-foreground/15"><div className="h-full w-[18%] rounded-full bg-secondary-foreground" /></div><div className="relative z-10 mt-2 flex justify-between text-[11px] font-semibold text-secondary-foreground/60"><span>Now</span><span>First paper · 18 May</span></div>
          <div className="pressure-sun" />
        </section>
        <section className="panel p-5 sm:p-6"><div className="flex items-center justify-between"><div><p className="eyebrow">Next up</p><h2 className="mt-1 text-lg font-bold">Countdowns</h2></div><button data-testid="button-add-exam" onClick={() => { setEditing(null); setModal('exam'); }} className="icon-button" title="Add exam"><Plus size={17} /></button></div><div className="mt-4 space-y-3">{exams.map((exam) => <ExamRow key={exam.id} exam={exam} onEdit={() => { setEditing(exam); setModal('exam'); }} onDelete={() => setExams((all) => all.filter((item) => item.id !== exam.id))} />)}</div>{exams.length === 0 && <EmptyState icon={CalendarDays} title="No countdowns yet" text="Add the next paper you care about." />}</section>
      </div>
    </div>
    {modal && <EditorModal type={modal} initial={editing} onClose={() => setModal(null)} onSave={(data) => { if (modal === 'task') setTasks((all) => editing ? all.map((item) => item.id === editing.id ? { ...(data as unknown as Task), id: item.id, done: item.done } : item) : [...all, { ...(data as unknown as Task), id: crypto.randomUUID(), done: false }]); else setExams((all) => editing ? all.map((item) => item.id === editing.id ? { ...(data as unknown as Exam), id: item.id } : item) : [...all, { ...(data as unknown as Exam), id: crypto.randomUUID() }]); setModal(null); }} />}
  </section>;
}

function TaskRow({ task, onToggle, onEdit, onDelete }: { task: Task; onToggle: () => void; onEdit: () => void; onDelete: () => void }) {
  return <div data-testid={`row-task-${task.id}`} className={`group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/35 sm:px-7 ${task.done ? 'opacity-55' : ''}`}><button data-testid={`button-check-task-${task.id}`} onClick={onToggle} className={`check-circle ${task.done ? 'check-circle-done' : ''}`}>{task.done && <Check size={13} strokeWidth={3} />}</button><div className="w-12 shrink-0 font-mono text-[11px] text-muted-foreground">{task.time}</div><div className="min-w-0 flex-1"><p className={`truncate text-sm font-bold ${task.done ? 'line-through' : ''}`}>{task.title}</p><p className="mt-1 text-xs text-muted-foreground">{task.subject} · {task.day}</p></div><div className="flex items-center gap-1 sm:hidden sm:group-hover:flex"><button data-testid={`button-edit-task-${task.id}`} onClick={onEdit} className="mini-button"><Pencil size={14} /></button><button data-testid={`button-delete-task-${task.id}`} onClick={onDelete} className="mini-button text-destructive"><Trash2 size={14} /></button></div></div>;
}

function ExamRow({ exam, onEdit, onDelete }: { exam: Exam; onEdit: () => void; onDelete: () => void }) {
  return <div data-testid={`row-exam-${exam.id}`} className="group flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-muted"><span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: exam.color }} /><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{exam.subject}</p><p className="text-[11px] text-muted-foreground">{exam.title}</p></div><div className="text-right"><p className="font-mono text-sm font-bold text-primary">{daysUntil(exam.date)}d</p><p className="text-[10px] text-muted-foreground">{new Date(`${exam.date}T12:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</p></div><div className="flex gap-1 sm:hidden sm:group-hover:flex"><button data-testid={`button-edit-exam-${exam.id}`} onClick={onEdit} className="mini-button"><Pencil size={13} /></button><button data-testid={`button-delete-exam-${exam.id}`} onClick={onDelete} className="mini-button text-destructive"><Trash2 size={13} /></button></div></div>;
}

function Subjects() {
  const [subjects, setSubjects] = useStored<Subject[]>('focus-subjects', seedSubjects);
  const [modal, setModal] = useState(false);
  const average = Math.round(subjects.reduce((sum, subject) => sum + subject.spec.filter((item) => item.done).length / Math.max(subject.spec.length, 1) * 100, 0) / Math.max(subjects.length, 1));
  return <section className="animate-in"><PageIntro eyebrow="Your subjects" title={<>Coverage is confidence<br className="hidden sm:block" /> you can actually see.</>} action={<button data-testid="button-add-subject" onClick={() => setModal(true)} className="primary-button"><Plus size={17} /> Add subject</button>}>Keep the syllabus moving in small, visible sections. You are {average}% through the specification across your three subjects.</PageIntro>
    <div className="mb-6 grid gap-4 sm:grid-cols-3"><StatCard label="Specification covered" value={`${average}%`} icon={BookOpen} tone="teal" /><StatCard label="Topics in motion" value={`${subjects.reduce((n, s) => n + s.spec.filter((x) => !x.done).length, 0)}`} icon={Flame} tone="yellow" /><StatCard label="Past papers logged" value={`${subjects.reduce((n, s) => n + s.papers.length, 0)}`} icon={FileText} tone="coral" /></div>
    <div className="grid gap-5 lg:grid-cols-3">{subjects.map((subject) => <SubjectCard key={subject.id} subject={subject} onDelete={() => setSubjects((all) => all.filter((item) => item.id !== subject.id))} />)}{subjects.length === 0 && <EmptyState icon={BookOpen} title="Start with a subject" text="Your tracker is ready for the first one." />}</div>
    {modal && <EditorModal type="subject" onClose={() => setModal(false)} onSave={(data) => { setSubjects((all) => [...all, { ...(data as unknown as Subject), id: crypto.randomUUID(), spec: [], prompts: [], papers: [] }]); setModal(false); }} />}
  </section>;
}

function StatCard({ label, value, icon: Icon, tone }: { label: string; value: string; icon: IconType; tone: 'teal' | 'yellow' | 'coral' }) {
  return <div className={`stat-card stat-${tone}`}><span className="stat-icon"><Icon size={17} /></span><div><p className="eyebrow">{label}</p><p className="mt-1 text-3xl font-extrabold tracking-tight">{value}</p></div></div>;
}

function SubjectCard({ subject, onDelete }: { subject: Subject; onDelete: () => void }) {
  const covered = subject.spec.filter((item) => item.done).length;
  const progress = Math.round(covered / Math.max(subject.spec.length, 1) * 100);
  return <article data-testid={`card-subject-${subject.id}`} className="subject-card group"><div className="flex items-start justify-between"><div className="subject-dot" style={{ backgroundColor: subject.accent }} /><div className="flex gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100"><button data-testid={`button-delete-subject-${subject.id}`} onClick={onDelete} className="mini-button text-destructive"><Trash2 size={14} /></button></div></div><p className="mt-8 font-mono text-[10px] font-bold tracking-[0.16em] text-muted-foreground">{subject.code}</p><h2 className="mt-2 text-2xl font-extrabold tracking-[-0.035em]">{subject.name}</h2><p className="mt-2 min-h-12 text-sm leading-6 text-muted-foreground">{subject.note}</p><div className="mt-7 flex items-end justify-between"><div><span className="text-4xl font-extrabold">{progress}</span><span className="ml-1 text-sm text-muted-foreground">%</span></div><span className="text-right text-xs text-muted-foreground">{covered} of {subject.spec.length || 0} topics</span></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, backgroundColor: subject.accent }} /></div><div className="mt-5 flex items-center justify-between border-t border-border/70 pt-4"><span className="text-xs text-muted-foreground">{subject.board}</span><Link href={`/subjects/${subject.id}`} data-testid={`link-subject-${subject.id}`} className="inline-flex items-center gap-1 text-sm font-bold text-primary transition-transform group-hover:translate-x-0.5">Open tracker <ArrowUpRight size={15} /></Link></div></article>;
}

function SubjectDetail() {
  const { subjectId } = useParams<{ subjectId: string }>();
  const [subjects, setSubjects] = useStored<Subject[]>('focus-subjects', seedSubjects);
  const [modal, setModal] = useState<'spec' | 'prompt' | 'paper' | null>(null);
  const subject = subjects.find((item) => item.id === subjectId);
  if (!subject) return <EmptyState icon={Search} title="Subject not found" text="This subject may have been removed from your tracker." />;
  const covered = subject.spec.filter((item) => item.done).length;
  const update = (next: Subject) => setSubjects((all) => all.map((item) => item.id === subject.id ? next : item));
  return <section className="animate-in"><Link href="/subjects" data-testid="link-back-subjects" className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-muted-foreground transition-colors hover:text-foreground"><ArrowLeft size={16} /> All subjects</Link>
    <div className="detail-hero" style={{ '--subject-accent': subject.accent } as CSSProperties}><div className="relative z-10"><p className="eyebrow">Specification tracker · {subject.board}</p><h1 className="mt-2 max-w-2xl text-4xl font-extrabold tracking-[-0.05em] sm:text-6xl">{subject.name}</h1><p className="mt-4 max-w-xl text-[15px] leading-7 text-muted-foreground">{subject.note} Keep your next action small enough to start before you feel ready.</p></div><div className="relative z-10 flex items-center gap-5"><div className="detail-progress"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="43" /><circle className="progress-ring" cx="50" cy="50" r="43" style={{ stroke: subject.accent, strokeDashoffset: 270 - (covered / Math.max(subject.spec.length, 1) * 270) }} /></svg><span>{Math.round(covered / Math.max(subject.spec.length, 1) * 100)}<small>%</small></span></div><div className="hidden sm:block"><p className="text-sm font-bold">{covered} of {subject.spec.length} topics</p><p className="mt-1 text-xs text-muted-foreground">covered so far</p></div></div><div className="detail-shape" /></div>
    <div className="mt-6 grid gap-5 xl:grid-cols-[1.1fr_.9fr]"><section className="panel p-5 sm:p-7"><SectionHeader eyebrow="Specification" title="Move the line" action={<button data-testid="button-add-spec" onClick={() => setModal('spec')} className="secondary-button"><Plus size={15} /> Topic</button>} /><div className="mt-6 space-y-2">{subject.spec.map((item) => <div key={item.id} className={`spec-row group ${item.done ? 'spec-done' : ''}`}><button data-testid={`button-check-spec-${item.id}`} onClick={() => update({ ...subject, spec: subject.spec.map((x) => x.id === item.id ? { ...x, done: !x.done } : x) })} className="check-circle">{item.done && <Check size={13} strokeWidth={3} />}</button><div className="min-w-0 flex-1"><p className={`text-sm font-bold ${item.done ? 'line-through' : ''}`}>{item.title}</p><p className="mt-1 text-xs text-muted-foreground">{item.unit}</p></div><button data-testid={`button-delete-spec-${item.id}`} onClick={() => update({ ...subject, spec: subject.spec.filter((x) => x.id !== item.id) })} className="mini-button text-destructive opacity-0 group-hover:opacity-100"><Trash2 size={14} /></button></div>)}{subject.spec.length === 0 && <EmptyState icon={BookOpen} title="No topics yet" text="Add the first line of your specification." />}</div></section>
      <div className="space-y-5"><ContentList title="Essay prompts" eyebrow="Think in arguments" icon={Sparkles} items={subject.prompts.map((item) => ({ ...item, sub: item.tag }))} onAdd={() => setModal('prompt')} onDelete={(id) => update({ ...subject, prompts: subject.prompts.filter((item) => item.id !== id) })} onEdit={(id) => { const item = subject.prompts.find((x) => x.id === id); if (item) { setModal('prompt'); } }} /><ContentList title="Past paper practice" eyebrow="Marks into next steps" icon={FileText} items={subject.papers.map((item) => ({ id: item.id, title: item.label, sub: `${item.score} · ${item.date}` }))} onAdd={() => setModal('paper')} onDelete={(id) => update({ ...subject, papers: subject.papers.filter((item) => item.id !== id) })} /></div>
    </div><div className="mt-5 flex flex-col items-start justify-between gap-3 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:px-7"><div className="flex items-center gap-3"><div className="flex size-10 items-center justify-center rounded-xl bg-muted text-primary"><ArrowUpRight size={18} /></div><div><p className="text-sm font-bold">The official specification</p><p className="text-xs text-muted-foreground">Keep the source material close when you revise.</p></div></div><a data-testid="link-exam-board" href={`https://www.aqa.org.uk/subjects/${subject.id === 'history' ? 'history-7042' : subject.id === 'psychology' ? 'psychology-7182' : 'english-7717'}`} target="_blank" rel="noreferrer" className="secondary-button">Open exam board <ArrowUpRight size={15} /></a></div>
    {modal && <EditorModal type={modal} onClose={() => setModal(null)} onSave={(data) => { if (modal === 'spec') update({ ...subject, spec: [...subject.spec, { ...(data as unknown as Subject['spec'][number]), id: crypto.randomUUID(), done: false }] }); if (modal === 'prompt') update({ ...subject, prompts: [...subject.prompts, { ...(data as unknown as Subject['prompts'][number]), id: crypto.randomUUID() }] }); if (modal === 'paper') update({ ...subject, papers: [...subject.papers, { ...(data as unknown as Subject['papers'][number]), id: crypto.randomUUID() }] }); setModal(null); }} />}</section>;
}

function SectionHeader({ eyebrow, title, action }: { eyebrow: string; title: string; action: ReactNode }) { return <div className="flex items-end justify-between"><div><p className="eyebrow">{eyebrow}</p><h2 className="mt-1 text-2xl font-extrabold tracking-tight">{title}</h2></div>{action}</div>; }

function ContentList({ title, eyebrow, icon: Icon, items, onAdd, onDelete, onEdit }: { title: string; eyebrow: string; icon: IconType; items: { id: string; title: string; sub: string }[]; onAdd: () => void; onDelete: (id: string) => void; onEdit?: (id: string) => void }) {
  return <section className="panel p-5 sm:p-6"><SectionHeader eyebrow={eyebrow} title={title} action={<button data-testid={`button-add-${title.toLowerCase().replaceAll(' ', '-')}`} onClick={onAdd} className="icon-button"><Plus size={17} /></button>} /><div className="mt-5 space-y-2">{items.map((item) => <div key={item.id} className="content-row group"><span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-primary"><Icon size={15} /></span><div className="min-w-0 flex-1"><p className="text-sm font-bold leading-5">{item.title}</p><p className="mt-1 text-xs text-muted-foreground">{item.sub}</p></div>{onEdit && <button data-testid={`button-edit-prompt-${item.id}`} onClick={() => onEdit(item.id)} className="mini-button opacity-0 group-hover:opacity-100"><Pencil size={13} /></button>}<button data-testid={`button-delete-item-${item.id}`} onClick={() => onDelete(item.id)} className="mini-button text-destructive opacity-0 group-hover:opacity-100"><Trash2 size={13} /></button></div>)}{items.length === 0 && <EmptyState icon={Icon} title="Nothing logged yet" text="Add one to keep this area useful." />}</div></section>;
}

function Grades() {
  const [grades, setGrades] = useStored<Grade[]>('focus-grades', seedGrades);
  const [modal, setModal] = useState(false);
  const average = grades.length ? (grades.reduce((sum, g) => sum + g.mark / g.outOf * 100, 0) / grades.length).toFixed(1) : '0.0';
  return <section className="animate-in"><PageIntro eyebrow="Marks are information" title={<>Notice the mark.<br className="hidden sm:block" /> Then choose the next move.</>} action={<button data-testid="button-add-grade" onClick={() => setModal(true)} className="primary-button"><Plus size={17} /> Log a result</button>}>Your tracker is a record of practice, not a verdict. The useful bit is the sentence you write after the number.</PageIntro>
    <div className="grade-summary"><div><p className="eyebrow text-secondary-foreground/55">Average across logged work</p><p className="mt-2 text-5xl font-extrabold tracking-[-0.06em] text-secondary-foreground">{average}<span className="ml-1 text-xl font-medium text-secondary-foreground/55">%</span></p></div><div className="max-w-sm"><div className="flex items-center gap-2 text-sm font-bold text-secondary-foreground"><TrendingUp size={17} /> Your reflection streak is building</div><p className="mt-2 text-sm leading-6 text-secondary-foreground/65">Three reflections this month. Keep the loop going: mark → notice → adjust.</p></div><div className="grade-orbit" /></div>
    <section className="panel mt-5 overflow-hidden"><div className="flex items-center justify-between border-b border-border px-5 py-5 sm:px-7"><div><p className="eyebrow">Recent work</p><h2 className="mt-1 text-2xl font-extrabold">Results & reflections</h2></div><span className="rounded-full bg-muted px-3 py-1.5 text-xs font-bold text-muted-foreground">{grades.length} logged</span></div><div className="divide-y divide-border/70">{grades.map((grade) => <GradeRow key={grade.id} grade={grade} onEdit={() => setModal(true)} onDelete={() => setGrades((all) => all.filter((item) => item.id !== grade.id))} />)}{grades.length === 0 && <EmptyState icon={TrendingUp} title="No marks yet" text="Your first result can be a baseline, not a judgement." />}</div></section>
    {modal && <EditorModal type="grade" onClose={() => setModal(false)} onSave={(data) => { const grade = data as unknown as Grade; setGrades((all) => [...all, { ...grade, id: crypto.randomUUID(), mark: Number(grade.mark), outOf: Number(grade.outOf) }]); setModal(false); }} />}
  </section>;
}

function GradeRow({ grade, onEdit, onDelete }: { grade: Grade; onEdit: () => void; onDelete: () => void }) {
  const pct = Math.round(grade.mark / grade.outOf * 100);
  return <div data-testid={`row-grade-${grade.id}`} className="group grid gap-4 px-5 py-5 transition-colors hover:bg-muted/30 sm:grid-cols-[1fr_160px_90px] sm:items-center sm:px-7"><div className="flex min-w-0 items-start gap-3"><div className="grade-badge">{grade.target}</div><div className="min-w-0"><p className="truncate text-sm font-bold">{grade.title}</p><p className="mt-1 text-xs text-muted-foreground">{grade.subject} · {new Date(`${grade.date}T12:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</p><p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground"><span className="font-bold text-foreground">Next:</span> {grade.reflection}</p></div></div><div><div className="mb-2 flex justify-between text-[11px] font-bold text-muted-foreground"><span>{grade.mark} / {grade.outOf}</span><span>{pct}%</span></div><div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} /></div></div><div className="flex items-center gap-1 sm:justify-end"><button data-testid={`button-edit-grade-${grade.id}`} onClick={onEdit} className="mini-button"><Pencil size={14} /></button><button data-testid={`button-delete-grade-${grade.id}`} onClick={onDelete} className="mini-button text-destructive"><Trash2 size={14} /></button></div></div>;
}

function EmptyState({ icon: Icon, title, text }: { icon: IconType; title: string; text: string }) { return <div className="empty-state"><Icon size={21} /><p className="mt-3 text-sm font-bold">{title}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{text}</p></div>; }

type ModalType = 'task' | 'exam' | 'subject' | 'spec' | 'prompt' | 'paper' | 'grade';
function EditorModal({ type, initial, onClose, onSave }: { type: ModalType; initial?: Task | Exam | null; onClose: () => void; onSave: (data: Record<string, string>) => void }) {
  const isTask = type === 'task'; const isExam = type === 'exam'; const isSubject = type === 'subject'; const isSpec = type === 'spec'; const isPrompt = type === 'prompt'; const isPaper = type === 'paper';
  const [fields, setFields] = useState<Record<string, string>>(() => {
    if (isTask && initial) { const task = initial as Task; return { title: task.title, subject: task.subject, time: task.time, day: task.day } as Record<string, string>; }
    if (isExam && initial) { const exam = initial as Exam; return { subject: exam.subject, title: exam.title, date: exam.date, color: exam.color } as Record<string, string>; }
    return (isTask ? { title: '', subject: 'English Lit', time: '17:00', day: 'Today' } : isExam ? { subject: '', title: '', date: '2025-05-18', color: '#5c9f94' } : isSubject ? { name: '', code: '', board: '', accent: '#5c9f94', note: '' } : isSpec ? { title: '', unit: '' } : isPrompt ? { title: '', tag: '' } : isPaper ? { label: '', score: '', date: '' } : { title: '', subject: 'English Literature', mark: '0', outOf: '30', target: 'A', date: '2024-10-08', reflection: '' }) as Record<string, string>;
  });
  const set = (key: string, value: string) => setFields((all) => ({ ...all, [key]: value }));
  const title = isTask ? 'Shape a priority' : isExam ? 'Add a countdown' : isSubject ? 'Add a subject' : isSpec ? 'Add a topic' : isPrompt ? 'Capture an essay prompt' : isPaper ? 'Log a past paper' : 'Log a result';
  const save = () => { if (!Object.values(fields).some((value) => value.trim() === '')) onSave(fields); };
  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose(); }}><div className="modal-card animate-modal"><div className="flex items-center justify-between"><div><p className="eyebrow">Focus Year</p><h2 className="mt-1 text-2xl font-extrabold">{title}</h2></div><button data-testid="button-close-modal" onClick={onClose} className="icon-button"><X size={18} /></button></div><div className="mt-6 grid gap-4">
    {(isTask || isExam || isSubject || type === 'grade') && <Field label={isSubject ? 'Subject name' : 'Title'} value={fields[isSubject ? 'name' : 'title']} onChange={(v) => set(isSubject ? 'name' : 'title', v)} />}
    {(isTask || isExam || type === 'grade') && <Field label="Subject" value={fields.subject} onChange={(v) => set('subject', v)} />}
    {isSubject && <><Field label="Short code" value={fields.code} onChange={(v) => set('code', v)} /><Field label="Exam board" value={fields.board} onChange={(v) => set('board', v)} /><Field label="A note to yourself" value={fields.note} onChange={(v) => set('note', v)} /></>}
    {isSpec && <><Field label="Topic" value={fields.title} onChange={(v) => set('title', v)} /><Field label="Unit or paper" value={fields.unit} onChange={(v) => set('unit', v)} /></>}
    {isPrompt && <><Field label="Prompt" value={fields.title} onChange={(v) => set('title', v)} /><Field label="Text or topic" value={fields.tag} onChange={(v) => set('tag', v)} /></>}
    {isPaper && <><Field label="Paper label" value={fields.label} onChange={(v) => set('label', v)} /><Field label="Score (e.g. 42 / 75)" value={fields.score} onChange={(v) => set('score', v)} /><Field label="Date or note" value={fields.date} onChange={(v) => set('date', v)} /></>}
    {isTask && <div className="grid grid-cols-2 gap-3"><Field label="Day" value={fields.day} onChange={(v) => set('day', v)} /><Field label="Time" value={fields.time} onChange={(v) => set('time', v)} /></div>}
    {isExam && <><Field label="Exam date" type="date" value={fields.date} onChange={(v) => set('date', v)} /><Field label="Colour hex" value={fields.color} onChange={(v) => set('color', v)} /></>}
    {type === 'grade' && <><div className="grid grid-cols-2 gap-3"><Field label="Mark" type="number" value={fields.mark} onChange={(v) => set('mark', v)} /><Field label="Out of" type="number" value={fields.outOf} onChange={(v) => set('outOf', v)} /></div><div className="grid grid-cols-2 gap-3"><Field label="Target grade" value={fields.target} onChange={(v) => set('target', v)} /><Field label="Date" type="date" value={fields.date} onChange={(v) => set('date', v)} /></div><label className="field-label">Reflection<textarea data-testid="input-grade-reflection" value={fields.reflection} onChange={(event) => set('reflection', event.target.value)} placeholder="What will you do differently next time?" /></label></>}
  </div><div className="mt-7 flex justify-end gap-2"><button data-testid="button-cancel-modal" onClick={onClose} className="secondary-button">Cancel</button><button data-testid="button-save-modal" onClick={save} className="primary-button">Save to Focus Year <Check size={16} /></button></div></div></div>;
}

function Field({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return <label className="field-label">{label}<input data-testid={`input-${label.toLowerCase().replaceAll(' ', '-')}`} type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={label} /></label>;
}

export default App;