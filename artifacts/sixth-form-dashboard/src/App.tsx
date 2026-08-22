import { type ComponentType, type CSSProperties, type ReactNode, useEffect, useMemo, useState } from 'react';
import { Link, Route, Switch, useLocation, useParams } from 'wouter';
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  FileText,
  Flame,
  LayoutGrid,
  Menu,
  Moon,
  Pencil,
  Plus,
  Search,
  Settings2,
  Sparkles,
  Sun,
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
type CalendarBlock = { id: string; title: string; time: string; kind: string };
type DailyTask = { id: string; title: string; done: boolean };
type DayDetails = { blocks: CalendarBlock[]; tasks: DailyTask[]; notes: string };
type CalendarData = Record<string, DayDetails>;
type Timetable = { A: Record<string, CalendarBlock[]>; B: Record<string, CalendarBlock[]> };
type Holiday = { id: string; label: string; start: string; end: string; kind: string };
type TermSettings = { anchorDate: string; anchorWeek: 'A' | 'B'; holidays: Holiday[] };
type Grade = { id: string; title: string; subject: string; mark: number; outOf: number; target: string; actualGrade: string; date: string; reflection: string };
type IconType = ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;

if (!localStorage.getItem('focus-clean-slate-v2')) {
  ['focus-tasks', 'focus-exams', 'focus-subjects', 'focus-grades', 'focus-calendar'].forEach((key) => localStorage.removeItem(key));
  localStorage.setItem('focus-clean-slate-v2', 'true');
}

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
            {nav.map(({ href, label, icon: Icon }) => <Link key={href} href={href} data-testid={`link-nav-${label.toLowerCase().replaceAll(' ', '-')}`} className={`nav-link ${location === href ? '[...]' : ''}`}>{/* trimmed for brevity */}</Link>)}
          </nav>
        </div>
        <div className="border-t border-sidebar-border pt-5">
          <button data-testid="button-theme-toggle" onClick={onTheme} className="nav-link w-full text-sidebar-foreground/75"><span className="flex size-7 items-center justify-center rounded-full b[...]</button>
          <div data-testid="text-settings" className="nav-link w-full cursor-default text-sidebar-foreground/45"><Settings2 size={18} /><span>Settings</span></div>
           <div className="mt-5 flex items-center gap-3 rounded-2xl bg-sidebar-accent p-3"><div className="flex size-9 items-center justify-center rounded-full bg-secondary font-mono text-xs font-[...]
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border/70 bg-background/90 px-5 py-4 backdrop-blur-md md:hidden">
          <Brand compact />
          <button data-testid="button-mobile-menu" onClick={() => setMenuOpen((v) => !v)} className="icon-button">{menuOpen ? <X size={21} /> : <Menu size={21} />}</button>
        </header>
        {menuOpen && <div className="absolute inset-x-0 top-[65px] z-30 border-b border-border bg-card px-5 py-3 shadow-lg md:hidden">{/* trimmed */}</div>}
        <div className="hidden justify-end px-8 pt-5 md:flex lg:px-12"><button data-testid="button-theme-toggle-header" onClick={onTheme} className="theme-toggle"><span>{dark ? <Sun size={15} /> : <Moon size={15} />}</span>{dark ? 'Light mode' : 'Dark mode'}</button></div>
        <main className="mx-auto w-full max-w-[1420px] flex-1 px-5 py-7 sm:px-8 lg:px-12 lg:py-10"><Switch><Route path="/" component={Planner} /><Route path="/subjects/:subjectId" component={SubjectDetail} /><Route path="/subjects" component={Subjects} /><Route path="/grades" component={Grades} /><Route component={NotFound} /></Switch></main>
      </div>
    </div>
  );
}

function Brand({ compact = false }: { compact?: boolean }) {
  return <Link href="/" data-testid="link-brand" className="flex items-center gap-3"><span className="brand-mark"><span /></span><span className={compact ? 'text-lg' : 'text-[20px]'} style={{ fon[...] } as CSSProperties>Focus</span></Link>
}

function PageIntro({ eyebrow, title, children, action }: { eyebrow: string; title: ReactNode; children: ReactNode; action?: ReactNode }) {
  return <div className="mb-9 flex flex-col justify-between gap-5 lg:flex-row lg:items-end"><div><p className="eyebrow">{eyebrow}</p><h1 className="mt-2 max-w-3xl text-4xl font-extrabold tracking[...]</h1></div>{action}</div>
}

function Planner() {
  const today = formatDate(new Date());
  const [viewDate, setViewDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(today);
  const [calendar, setCalendar] = useStored<CalendarData>('focus-calendar', {});
  const [timetable, setTimetable] = useStored<Timetable>('focus-timetable', { A: {}, B: {} });
  const [settings, setSettings] = useStored<TermSettings>('focus-term-settings', { anchorDate: '', anchorWeek: 'A', holidays: [] });
  const [setupWeek, setSetupWeek] = useState<'A' | 'B'>('A');
  const [setupDay, setSetupDay] = useState('0');
  const details = calendar[selectedDate] ?? { blocks: [], tasks: [], notes: '' };
  const activeWeek = getWeekKey(selectedDate, settings);
  const holiday = isHoliday(selectedDate, settings.holidays);
  const repeatingBlocks = holiday ? [] : (timetable[activeWeek][String((new Date(`${selectedDate}T12:00:00`).getDay() + 6) % 7)] ?? []);
  
  // week label (Mon - Sun range)
  const weekLabel = useMemo(() => {
    const start = new Date(viewDate);
    const startOffset = (start.getDay() + 6) % 7; // Monday = 0
    start.setDate(start.getDate() - startOffset);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    const fmt = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    return `${fmt(start)} — ${fmt(end)}`;
  }, [viewDate]);

  // compute the 7 days for the active week
  const days = useMemo(() => {
    const start = new Date(viewDate);
    const startOffset = (start.getDay() + 6) % 7; // Monday = 0
    start.setDate(start.getDate() - startOffset);
    return Array.from({ length: 7 }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
  }, [viewDate]);

  const saveDay = (next: DayDetails) => setCalendar((all) => ({ ...all, [selectedDate]: next }));
  const changeWeek = (offset: number) => setViewDate((date) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + offset * 7));
  const saveSchedule = (week: 'A' | 'B', day: string, blocks: CalendarBlock[]) => setTimetable((all) => ({ ...all, [week]: { ...all[week], [day]: blocks } }));
  return <section className="animate-in">
    <PageIntro eyebrow="Your planner" title={<>Make room for<br className="hidden sm:block" /> what matters next.</>} action={<div className="flex flex-wrap items-center gap-2"><span className="week-indicator">Active week <b>Week {activeWeek}</b></span><button data-testid="button-today" onClick={() => { setViewDate(new Date()); setSelectedDate(today); }} className="secondary-button"><CalendarDays size={16} /> Today</button></div>}>A clear calendar makes the week feel possible. Select any date to add your classes, study blocks, due work, and reflections.</PageIntro>
    <section className="panel overflow-hidden p-0">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border px-5 py-5 sm:px-7"><div><p className="eyebrow">Calendar</p><h2 className="mt-1 text-2xl font-extrabold">{weekLabel}</h2></div><div className="flex items-center gap-2"><button aria-label="Previous week" onClick={() => changeWeek(-1)} className="icon-button"><ChevronLeft size={18} /></button><button aria-label="Next week" onClick={() => changeWeek(1)} className="icon-button"><ChevronRight size={18} /></button></div></div>
      <div className="grid grid-cols-7 border-b border-border bg-muted/35">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => <div key={day} className="calendar-weekday">{day}</div>)}</div>
      <div className="calendar-grid">{days.map((date, index) => {
        const key = formatDate(date);
         const day = calendar[key];
         const dayWeek = getWeekKey(key, settings);
         const dayHoliday = isHoliday(key, settings.holidays);
         const dayBlocks = dayHoliday ? [] : (timetable[dayWeek][String((date.getDay() + 6) % 7)] ?? []);
        const isToday = key === today;
        const isSelected = key === selectedDate;
        return <button key={key} onClick={() => setSelectedDate(key)} className={`calendar-day ${isSelected ? 'calendar-day-selected' : ''} ${isToday ? 'calendar-day-today' : ''} ${dayHoliday ? 'calendar-day-holiday' : ''}`}><span className="calendar-day-number">{date.getDate()}</span><span className="calendar-day-counts">{dayHoliday ? 'Holiday' : `${dayBlocks.length + (day?.blocks.length ?? 0)} blocks · ${day?.tasks.length ?? 0} tasks`}</span></button>;
      })}</div>
    </section>
    <section className="mt-6 panel p-5 sm:p-7">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border pb-5"><div><p className="eyebrow">Daily details</p><h2 className="mt-1 text-2xl font-extrabold">Details for {formatLongDate(selectedDate)}</h2></div><span className="autosave-status"><span /> Saved automatically</span></div>
       <div className="mt-6 grid gap-6 xl:grid-cols-3">
         <div className="day-section"><div><h3>Timetable / Study Blocks</h3><p>{holiday ? 'Repeating classes pause during this holiday.' : `Week ${activeWeek} schedule plus your custom blocks.`}</p></div><div className="day-list">{repeatingBlocks.map((block) => <div key={block.id} className="day-entry">{block.time} — {block.title}</div>)}</div></div>
        <EditableDaySection title="Tasks & Assignments Due" hint="Keep the next actions visible." items={details.tasks} onAdd={() => saveDay({ ...details, tasks: [...details.tasks, { id: crypto.randomUUID(), title: '', done: false }] })} renderItem={(task, i) => <DayTaskRow key={task.id} index={i} task={task} onChange={(next) => saveDay({ ...details, tasks: details.tasks.map((t, j) => j === i ? next : t) })} onDelete={() => saveDay({ ...details, tasks: details.tasks.filter((_, j) => j !== i) })} />} empty={<div className="text-sm text-muted-foreground">No tasks</div>} />
        <div className="day-section"><div><h3>Daily Notes / Reflection</h3><p>Capture what you learned, noticed, or want to remember.</p></div><textarea className="day-notes" value={details.notes} onChange={(event) => saveDay({ ...details, notes: event.target.value })} placeholder="Start writing..." aria-label="Daily notes and reflection" /></div>
      </div>
    </section>
    <section className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_.75fr]">
      <ScheduleEditor week={setupWeek} day={setupDay} timetable={timetable} onWeekChange={setSetupWeek} onDayChange={setSetupDay} onChange={saveSchedule} />
      <TermManager settings={settings} onChange={setSettings} />
    </section>
  </section>;
}

function formatDate(date: Date) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; }
function formatLongDate(value: string) { return new Date(`${value}T12:00:00`).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }); }
function getWeekKey(date: string, settings: TermSettings) {
  if (!settings.anchorDate) return 'A';
  const selected = new Date(`${date}T12:00:00`).getTime();
  const anchor = new Date(`${settings.anchorDate}T12:00:00`).getTime();
  const weekNumber = Math.floor((selected - anchor) / (7 * 86400000));
  const isEven = weekNumber % 2 === 0;
  return settings.anchorWeek === 'A' ? (isEven ? 'A' : 'B') : (isEven ? 'B' : 'A');
}
function isHoliday(date: string, holidays: Holiday[]) {
  return holidays.some((holiday) => date >= holiday.start && date <= holiday.end);
}

const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function ScheduleEditor({ week, day, timetable, onWeekChange, onDayChange, onChange }: { week: 'A' | 'B'; day: string; timetable: Timetable; onWeekChange: (week: 'A' | 'B') => void; onDayChange: (day: string) => void; onChange: (week: 'A' | 'B', day: string, blocks: CalendarBlock[]) => void }) {
  const blocks = timetable[week][day] ?? [];
  const update = (next: CalendarBlock[]) => onChange(week, day, next);
  return <section className="panel p-5 sm:p-7"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="eyebrow">Repeating timetable</p><h2 className="mt-1 text-2xl font[...]</h2></div></div>{/* trimmed */}</section>
}

function TermManager({ settings, onChange }: { settings: TermSettings; onChange: (next: TermSettings) => void }) {
  const addHoliday = () => onChange({ ...settings, holidays: [...settings.holidays, { id: crypto.randomUUID(), label: '', start: '', end: '', kind: 'Holiday' }] });
  return <section className="panel p-5 sm:p-7"><p className="eyebrow">Term & holiday manager</p><h2 className="mt-1 text-2xl font-extrabold">Pause repeating dates</h2><p className="mt-2 text-sm l[...]</p></section>
}
function EditableDaySection<T>({ title, hint, items, onAdd, renderItem, empty }: { title: string; hint: string; items: T[]; onAdd: () => void; renderItem: (item: T, index: number) => ReactNode; empty?: ReactNode }) {
  return <div className="day-section"><div className="flex items-start justify-between gap-3"><div><h3>{title}</h3><p>{hint}</p></div><button onClick={onAdd} className="mini-add" aria-label={`Add ${title}`}>+</button></div><div className="space-y-3">{items.length === 0 ? (empty ?? <div className="text-sm text-muted-foreground">No items</div>) : items.map((item, i) => <div key={(item as unknown as { id?: string }).id ?? i}>{renderItem(item, i)}</div>)}</div></div>
}
function DayBlockRow({ block, index, onChange, onDelete }: { block: CalendarBlock; index: number; onChange: (next: CalendarBlock) => void; onDelete: () => void }) {
  return <div className="day-entry"><input aria-label={`Block ${index + 1} title`} value={block.title} onChange={(event) => onChange({ ...block, title: event.target.value })} placeholder="What is this study block?" /></div>
}
function DayTaskRow({ task, index, onChange, onDelete }: { task: DailyTask; index: number; onChange: (next: DailyTask) => void; onDelete: () => void }) {
  return <div className={`day-task ${task.done ? 'day-task-done' : ''}`}><button aria-label={`Mark task ${index + 1} complete`} onClick={() => onChange({ ...task, done: !task.done })} className={`task-toggle`}>{task.done ? <Check size={14} /> : <div className="task-empty" />}</button><input value={task.title} onChange={(e) => onChange({ ...task, title: e.target.value })} /><button aria-label={`Delete task ${index + 1}`} onClick={onDelete} className="task-delete"><Trash2 size={14} /></button></div>
}

function Subjects() {
  const [subjects, setSubjects] = useStored<Subject[]>('focus-subjects', []);
  const [modal, setModal] = useState(false);
  const average = Math.round(subjects.reduce((sum, subject) => sum + subject.spec.filter((item) => item.done).length / Math.max(subject.spec.length, 1) * 100, 0) / Math.max(subjects.length, 1));
  return <section className="animate-in"><PageIntro eyebrow="Your subjects" title={<>Coverage is confidence<br className="hidden sm:block" /> you can actually see.</>} action={<button data-testid
}

function StatCard({ label, value, icon: Icon, tone }: { label: string; value: string; icon: IconType; tone: 'teal' | 'yellow' | 'coral' }) {
  return <div className={`stat-card stat-${tone}`}><span className="stat-icon"><Icon size={17} /></span><div><p className="eyebrow">{label}</p><p className="mt-1 text-3xl font-extrabold tracking-[...]">{value}</p></div></div>
}

function SubjectCard({ subject, onDelete }: { subject: Subject; onDelete: () => void }) {
  const covered = subject.spec.filter((item) => item.done).length;
  const progress = Math.round(covered / Math.max(subject.spec.length, 1) * 100);
  return <article data-testid={`card-subject-${subject.id}`} className="subject-card group"><div className="flex items-start justify-between"><div className="subject-dot" style={{ backgroundColor: subject.accent }}></div><div className="flex-1 ml-3"><h3>{subject.name}</h3><p className="text-sm text-muted-foreground">{subject.code} · {subject.board}</p></div><div className="flex items-center gap-3"><button onClick={onDelete} className="icon-button"><Trash2 size={14} /></button></div></div></article>
}

function SubjectDetail() {
  const { subjectId } = useParams<{ subjectId: string }>();
  const [subjects, setSubjects] = useStored<Subject[]>('focus-subjects', []);
  const [modal, setModal] = useState<'spec' | 'prompt' | 'paper' | null>(null);
  const subject = subjects.find((item) => item.id === subjectId);
  if (!subject) return <EmptyState icon={Search} title="Subject not found" text="This subject may have been removed from your tracker." />;
  const covered = subject.spec.filter((item) => item.done).length;
  const update = (next: Subject) => setSubjects((all) => all.map((item) => item.id === subject.id ? next : item));
  return <section className="animate-in"><Link href="/subjects" data-testid="link-back-subjects" className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-muted-foreground transition-[...]">Back</Link>{/* trimmed */}</section>;
}

function SectionHeader({ eyebrow, title, action }: { eyebrow: string; title: string; action?: ReactNode }) { return <div className="flex items-end justify-between"><div><p className="eyebrow">{eyebrow}</p><h3 className="mt-1 text-xl font-bold">{title}</h3></div>{action}</div> }

function ContentList({ title, eyebrow, icon: Icon, items, onAdd, onDelete, onEdit }: { title: string; eyebrow: string; icon: IconType; items: { id: string; title: string; sub: string }[]; onAdd: () => void; onDelete?: (id: string) => void; onEdit?: (id: string) => void }) {
  return <section className="panel p-5 sm:p-6"><SectionHeader eyebrow={eyebrow} title={title} action={<button data-testid={`button-add-${title.toLowerCase().replaceAll(' ', '-')}`} onClick={onAdd} className="mini-add">+</button>} /><div className="mt-4 space-y-3">{items.map((it) => <div key={it.id} className="content-row"><div className="flex-1"><h4>{it.title}</h4><p className="text-sm text-muted-foreground">{it.sub}</p></div><div className="flex gap-2">{onEdit && <button onClick={() => onEdit(it.id)} className="icon-button"><Pencil size={14} /></button>}{onDelete && <button onClick={() => onDelete(it.id)} className="icon-button"><Trash2 size={14} /></button>}</div></div>)}</div></section>
}

function Grades() {
  const [grades, setGrades] = useStored<Grade[]>('focus-grades', []);
  const [modal, setModal] = useState(false);
  const [subjectFilter, setSubjectFilter] = useState('All subjects');
  const [sortBy, setSortBy] = useState<'date' | 'subject'>('date');
  const subjects = Array.from(new Set(grades.map((grade) => grade.subject).filter(Boolean))).sort();
  const filteredGrades = grades.filter((grade) => subjectFilter === 'All subjects' || grade.subject === subjectFilter).sort((a, b) => sortBy === 'subject' ? a.subject.localeCompare(b.subject) : b.date.localeCompare(a.date));
  const subjectSummaries = Array.from(new Set(filteredGrades.map((grade) => grade.subject))).map((subject) => {
    const entries = filteredGrades.filter((grade) => grade.subject === subject);
    const latest = entries[0];
    return { subject, target: latest?.target || '—', actual: latest?.actualGrade || '—', count: entries.length };
  });
  const average = grades.length ? (grades.reduce((sum, g) => sum + g.mark / g.outOf * 100, 0) / grades.length).toFixed(1) : '0.0';
  return <section className="animate-in"><PageIntro eyebrow="Marks are information" title={<>Notice the mark.<br className="hidden sm:block" /> Then choose the next move.</>} action={<button data-testid
}

function GradeRow({ grade, onEdit, onDelete }: { grade: Grade; onEdit: () => void; onDelete: () => void }) {
  const pct = Math.round(grade.mark / grade.outOf * 100);
  return <div data-testid={`row-grade-${grade.id}`} className="group grid gap-4 px-5 py-5 transition-colors hover:bg-muted/30 sm:grid-cols-[1fr_160px_90px] sm:items-center sm:px-7"><div className="flex items-center gap-3"><div className="grade-dot" style={{ backgroundColor: '#E5E7EB' }}></div><div><h4 className="font-bold">{grade.title}</h4><p className="text-sm text-muted-foreground">{grade.subject}</p></div></div><div className="text-right">{grade.actualGrade}</div><div className="text-right">{pct}%</div></div>
}

function EmptyState({ icon: Icon, title, text }: { icon: IconType; title: string; text: string }) { return <div className="empty-state"><Icon size={21} /><p className="mt-3 text-sm font-bold">{title}</p><p className="text-sm text-muted-foreground">{text}</p></div> }

type ModalType = 'subject' | 'spec' | 'prompt' | 'paper' | 'grade';
function EditorModal({ type, onClose, onSave }: { type: ModalType; onClose: () => void; onSave: (data: Record<string, string>) => void }) {
  const isSubject = type === 'subject'; const isSpec = type === 'spec'; const isPrompt = type === 'prompt'; const isPaper = type === 'paper';
  const [fields, setFields] = useState<Record<string, string>>(() => {
    return (isSubject ? { name: '', code: '', board: '', accent: '#D01937', note: '' } : isSpec ? { title: '', unit: '' } : isPrompt ? { title: '', tag: '' } : isPaper ? { label: '', score: '', date: '' } : { title: '', subject: '', mark: '', outOf: '', target: '', actualGrade: '', date: '', reflection: '' });
  });
  const set = (key: string, value: string) => setFields((all) => ({ ...all, [key]: value }));
  const title = isSubject ? 'Add a subject' : isSpec ? 'Add a topic' : isPrompt ? 'Capture an essay prompt' : isPaper ? 'Log a past paper' : 'Log a result';
  const save = () => { if (!Object.values(fields).some((value) => value.trim() === '')) onSave(fields); };
  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose(); }}><div className="modal-card animate-modal"><div className="flex items-cen[...]
}

function Field({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return <label className="field-label">{label}<input data-testid={`input-${label.toLowerCase().replaceAll(' ', '-')}`} type={type} value={value} onChange={(event) => onChange(event.target.value)} /></label>
}

export default App;
