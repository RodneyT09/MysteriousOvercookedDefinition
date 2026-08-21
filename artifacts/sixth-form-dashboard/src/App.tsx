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
            {nav.map(({ href, label, icon: Icon }) => <Link key={href} href={href} data-testid={`link-nav-${label.toLowerCase().replaceAll(' ', '-')}`} className={`nav-link ${location === href ? 'nav-link-active' : ''}`}><Icon size={18} strokeWidth={1.8} /><span>{label}</span>{location === href && <ChevronRight className="ml-auto" size={15} />}</Link>)}
          </nav>
        </div>
        <div className="border-t border-sidebar-border pt-5">
          <button data-testid="button-theme-toggle" onClick={onTheme} className="nav-link w-full text-sidebar-foreground/75"><span className="flex size-7 items-center justify-center rounded-full bg-sidebar-accent">{dark ? <Sun size={15} /> : <Moon size={15} />}</span><span>{dark ? 'Light mode' : 'Night mode'}</span></button>
          <div data-testid="text-settings" className="nav-link w-full cursor-default text-sidebar-foreground/45"><Settings2 size={18} /><span>Settings</span></div>
           <div className="mt-5 flex items-center gap-3 rounded-2xl bg-sidebar-accent p-3"><div className="flex size-9 items-center justify-center rounded-full bg-secondary font-mono text-xs font-bold text-secondary-foreground">+</div><div><p className="text-sm font-bold">Your workspace</p><p className="text-[11px] text-sidebar-foreground/55">Add your details in Settings</p></div></div>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border/70 bg-background/90 px-5 py-4 backdrop-blur-md md:hidden">
          <Brand compact />
          <button data-testid="button-mobile-menu" onClick={() => setMenuOpen((v) => !v)} className="icon-button">{menuOpen ? <X size={21} /> : <Menu size={21} />}</button>
        </header>
        {menuOpen && <div className="absolute inset-x-0 top-[65px] z-30 border-b border-border bg-card px-5 py-3 shadow-lg md:hidden">{nav.map(({ href, label, icon: Icon }) => <Link key={href} href={href} onClick={() => setMenuOpen(false)} className={`nav-link text-foreground ${location === href ? 'bg-muted' : ''}`}><Icon size={18} /><span>{label}</span></Link>)}<button onClick={onTheme} className="nav-link w-full text-foreground"><Moon size={18} /><span>Switch to {dark ? 'day' : 'night'} mode</span></button></div>}
        <div className="hidden justify-end px-8 pt-5 md:flex lg:px-12"><button data-testid="button-theme-toggle-header" onClick={onTheme} className="theme-toggle"><span>{dark ? <Sun size={15} /> : <Moon size={15} />}</span>{dark ? 'Light mode' : 'Dark mode'}</button></div>
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
  const monthLabel = viewDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
  const days = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startOffset = (firstDay.getDay() + 6) % 7;
    const count = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: startOffset + count }, (_, index) => index < startOffset ? null : new Date(year, month, index - startOffset + 1));
  }, [viewDate]);
  const saveDay = (next: DayDetails) => setCalendar((all) => ({ ...all, [selectedDate]: next }));
  const changeMonth = (offset: number) => setViewDate((date) => new Date(date.getFullYear(), date.getMonth() + offset, 1));
  const saveSchedule = (week: 'A' | 'B', day: string, blocks: CalendarBlock[]) => setTimetable((all) => ({ ...all, [week]: { ...all[week], [day]: blocks } }));
  return <section className="animate-in">
    <PageIntro eyebrow="Your planner" title={<>Make room for<br className="hidden sm:block" /> what matters next.</>} action={<div className="flex flex-wrap items-center gap-2"><span className="week-indicator">Active week <b>Week {activeWeek}</b></span><button data-testid="button-today" onClick={() => { setViewDate(new Date()); setSelectedDate(today); }} className="secondary-button"><CalendarDays size={16} /> Today</button></div>}>A clear calendar makes the week feel possible. Select any date to add your classes, study blocks, due work, and reflections.</PageIntro>
    <section className="panel overflow-hidden p-0">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border px-5 py-5 sm:px-7"><div><p className="eyebrow">Calendar</p><h2 className="mt-1 text-2xl font-extrabold">{monthLabel}</h2></div><div className="flex items-center gap-2"><button aria-label="Previous month" onClick={() => changeMonth(-1)} className="icon-button"><ChevronLeft size={18} /></button><button aria-label="Next month" onClick={() => changeMonth(1)} className="icon-button"><ChevronRight size={18} /></button></div></div>
      <div className="grid grid-cols-7 border-b border-border bg-muted/35">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => <div key={day} className="calendar-weekday">{day}</div>)}</div>
      <div className="calendar-grid">{days.map((date, index) => {
        if (!date) return <div key={`blank-${index}`} className="calendar-blank" />;
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
         <div className="day-section"><div><h3>Timetable / Study Blocks</h3><p>{holiday ? 'Repeating classes pause during this holiday.' : `Week ${activeWeek} schedule plus your custom blocks.`}</p></div>{repeatingBlocks.length > 0 && <div className="mt-4 schedule-preview">{repeatingBlocks.map((block) => <div key={block.id}><span>{block.time || '—'}</span><b>{block.title || 'Untitled block'}</b><small>{block.kind || 'Class'}</small></div>)}</div>}<div className="mt-3"><EditableDaySection title="Custom blocks" hint="" items={details.blocks} onAdd={() => saveDay({ ...details, blocks: [...details.blocks, { id: crypto.randomUUID(), title: '', time: '', kind: '' }] })} renderItem={(block, index) => <DayBlockRow block={block} index={index} onChange={(next) => saveDay({ ...details, blocks: details.blocks.map((item) => item.id === block.id ? next : item) })} onDelete={() => saveDay({ ...details, blocks: details.blocks.filter((item) => item.id !== block.id) })} />} empty="No custom blocks planned." /></div></div>
        <EditableDaySection title="Tasks & Assignments Due" hint="Keep the next actions visible." items={details.tasks} onAdd={() => saveDay({ ...details, tasks: [...details.tasks, { id: crypto.randomUUID(), title: '', done: false }] })} renderItem={(task, index) => <DayTaskRow task={task} index={index} onChange={(next) => saveDay({ ...details, tasks: details.tasks.map((item) => item.id === task.id ? next : item) })} onDelete={() => saveDay({ ...details, tasks: details.tasks.filter((item) => item.id !== task.id) })} />} empty="No tasks due for this date." />
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
  return <section className="panel p-5 sm:p-7"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="eyebrow">Repeating timetable</p><h2 className="mt-1 text-2xl font-extrabold">Week A / Week B</h2><p className="mt-2 text-sm text-muted-foreground">Set the schedule that repeats across your calendar.</p></div><div className="week-tabs"><button className={week === 'A' ? 'week-tab-active' : ''} onClick={() => onWeekChange('A')}>Week A</button><button className={week === 'B' ? 'week-tab-active' : ''} onClick={() => onWeekChange('B')}>Week B</button></div></div><div className="mt-5 flex flex-wrap gap-2">{weekDays.map((label, index) => <button key={label} onClick={() => onDayChange(String(index))} className={`day-pill ${day === String(index) ? 'day-pill-active' : ''}`}>{label}</button>)}</div><div className="mt-5 space-y-2">{blocks.map((block, index) => <DayBlockRow key={block.id} block={block} index={index} onChange={(next) => update(blocks.map((item) => item.id === block.id ? next : item))} onDelete={() => update(blocks.filter((item) => item.id !== block.id))} />)}{blocks.length === 0 && <div className="day-empty">No repeating blocks for {weekDays[Number(day)]} in Week {week}.</div>}</div><button className="secondary-button mt-4" onClick={() => update([...blocks, { id: crypto.randomUUID(), title: '', time: '', kind: '' }])}><Plus size={15} /> Add repeating block</button></section>;
}

function TermManager({ settings, onChange }: { settings: TermSettings; onChange: (next: TermSettings) => void }) {
  const addHoliday = () => onChange({ ...settings, holidays: [...settings.holidays, { id: crypto.randomUUID(), label: '', start: '', end: '', kind: 'Holiday' }] });
  return <section className="panel p-5 sm:p-7"><p className="eyebrow">Term & holiday manager</p><h2 className="mt-1 text-2xl font-extrabold">Pause repeating dates</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Choose the week that anchors your rotation and add term dates, half-terms, or inset days where classes should pause.</p><div className="mt-5 grid gap-3"><label className="field-label">Rotation anchor date<input type="date" value={settings.anchorDate} onChange={(event) => onChange({ ...settings, anchorDate: event.target.value })} /></label><label className="field-label">Anchor is<select value={settings.anchorWeek} onChange={(event) => onChange({ ...settings, anchorWeek: event.target.value as 'A' | 'B' })}><option value="A">Week A</option><option value="B">Week B</option></select></label></div><div className="mt-6 flex items-center justify-between"><div><p className="text-sm font-extrabold">Term dates & breaks</p><p className="mt-1 text-xs text-muted-foreground">These dates stop the repeating schedule.</p></div><button className="mini-add" onClick={addHoliday} aria-label="Add term or break"><Plus size={15} /></button></div><div className="mt-4 space-y-2">{settings.holidays.map((holiday) => <div className="holiday-row" key={holiday.id}><input aria-label="Break label" value={holiday.label} onChange={(event) => onChange({ ...settings, holidays: settings.holidays.map((item) => item.id === holiday.id ? { ...item, label: event.target.value } : item) })} placeholder="Autumn term" /><select aria-label="Break type" value={holiday.kind} onChange={(event) => onChange({ ...settings, holidays: settings.holidays.map((item) => item.id === holiday.id ? { ...item, kind: event.target.value } : item) })}><option>School term</option><option>Half-term</option><option>Inset day</option><option>Holiday</option></select><input aria-label="Break start" type="date" value={holiday.start} onChange={(event) => onChange({ ...settings, holidays: settings.holidays.map((item) => item.id === holiday.id ? { ...item, start: event.target.value } : item) })} /><input aria-label="Break end" type="date" value={holiday.end} onChange={(event) => onChange({ ...settings, holidays: settings.holidays.map((item) => item.id === holiday.id ? { ...item, end: event.target.value } : item) })} /><button className="mini-button text-destructive" onClick={() => onChange({ ...settings, holidays: settings.holidays.filter((item) => item.id !== holiday.id) })} aria-label="Delete break"><Trash2 size={14} /></button></div>)}{settings.holidays.length === 0 && <div className="day-empty">No term dates or breaks added yet.</div>}</div></section>;
}
function EditableDaySection<T>({ title, hint, items, onAdd, renderItem, empty }: { title: string; hint: string; items: T[]; onAdd: () => void; renderItem: (item: T, index: number) => ReactNode; empty: string }) {
  return <div className="day-section"><div className="flex items-start justify-between gap-3"><div><h3>{title}</h3><p>{hint}</p></div><button onClick={onAdd} className="mini-add" aria-label={`Add ${title}`}><Plus size={15} /></button></div><div className="mt-4 space-y-2">{items.map((item, index) => <div key={index}>{renderItem(item, index)}</div>)}{items.length === 0 && <div className="day-empty">{empty}</div>}</div></div>;
}
function DayBlockRow({ block, index, onChange, onDelete }: { block: CalendarBlock; index: number; onChange: (next: CalendarBlock) => void; onDelete: () => void }) {
  return <div className="day-entry"><input aria-label={`Block ${index + 1} title`} value={block.title} onChange={(event) => onChange({ ...block, title: event.target.value })} placeholder="What is happening?" /><div className="grid grid-cols-[1fr_1fr_auto] gap-2"><input aria-label={`Block ${index + 1} time`} value={block.time} onChange={(event) => onChange({ ...block, time: event.target.value })} placeholder="Time" /><input aria-label={`Block ${index + 1} type`} value={block.kind} onChange={(event) => onChange({ ...block, kind: event.target.value })} placeholder="Type" /><button aria-label={`Delete block ${index + 1}`} onClick={onDelete} className="mini-button text-destructive"><Trash2 size={14} /></button></div></div>;
}
function DayTaskRow({ task, index, onChange, onDelete }: { task: DailyTask; index: number; onChange: (next: DailyTask) => void; onDelete: () => void }) {
  return <div className={`day-task ${task.done ? 'day-task-done' : ''}`}><button aria-label={`Mark task ${index + 1} complete`} onClick={() => onChange({ ...task, done: !task.done })} className={`check-circle ${task.done ? 'check-circle-done' : ''}`}>{task.done && <Check size={13} strokeWidth={3} />}</button><input aria-label={`Task ${index + 1}`} value={task.title} onChange={(event) => onChange({ ...task, title: event.target.value })} placeholder="Add a task or assignment" /><button aria-label={`Delete task ${index + 1}`} onClick={onDelete} className="mini-button text-destructive"><Trash2 size={14} /></button></div>;
}

function Subjects() {
  const [subjects, setSubjects] = useStored<Subject[]>('focus-subjects', []);
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
  const [subjects, setSubjects] = useStored<Subject[]>('focus-subjects', []);
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
  return <section className="animate-in"><PageIntro eyebrow="Marks are information" title={<>Notice the mark.<br className="hidden sm:block" /> Then choose the next move.</>} action={<button data-testid="button-add-grade" onClick={() => setModal(true)} className="primary-button"><Plus size={17} /> Log a result</button>}>Your tracker is a record of practice, not a verdict. The useful bit is the sentence you write after the number.</PageIntro>
    <div className="grade-summary"><div><p className="eyebrow text-secondary-foreground/55">Average across logged work</p><p className="mt-2 text-5xl font-extrabold tracking-[-0.06em] text-secondary-foreground">{average}<span className="ml-1 text-xl font-medium text-secondary-foreground/55">%</span></p></div><div className="max-w-sm"><div className="flex items-center gap-2 text-sm font-bold text-secondary-foreground"><TrendingUp size={17} /> Your reflection streak is building</div><p className="mt-2 text-sm leading-6 text-secondary-foreground/65">Three reflections this month. Keep the loop going: mark → notice → adjust.</p></div><div className="grade-orbit" /></div>
     <section className="panel mt-5 overflow-hidden"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-5 sm:px-7"><div><p className="eyebrow">Target vs actual</p><h2 className="mt-1 text-2xl font-extrabold">Subject snapshot</h2></div><div className="flex gap-2"><select className="filter-select" value={subjectFilter} onChange={(event) => setSubjectFilter(event.target.value)}><option>All subjects</option>{subjects.map((subject) => <option key={subject}>{subject}</option>)}</select><select className="filter-select" value={sortBy} onChange={(event) => setSortBy(event.target.value as 'date' | 'subject')}><option value="date">Newest first</option><option value="subject">By subject</option></select></div></div><div className="grid gap-3 p-5 sm:grid-cols-2 sm:p-7 lg:grid-cols-3">{subjectSummaries.map((summary) => <div className="subject-grade-card" key={summary.subject}><p className="text-sm font-extrabold">{summary.subject}</p><div className="mt-4 grid grid-cols-2 gap-3"><div><span>Target</span><b>{summary.target}</b></div><div><span>Actual</span><b>{summary.actual}</b></div></div><p className="mt-3 text-xs text-muted-foreground">{summary.count} logged {summary.count === 1 ? 'result' : 'results'}</p></div>)}{subjectSummaries.length === 0 && <div className="col-span-full"><EmptyState icon={TrendingUp} title="No subject results yet" text="Log a result to compare your target and actual grade." /></div>}</div></section>
     <section className="panel mt-5 overflow-hidden"><div className="flex items-center justify-between border-b border-border px-5 py-5 sm:px-7"><div><p className="eyebrow">Recent work</p><h2 className="mt-1 text-2xl font-extrabold">Results & reflections</h2></div><span className="rounded-full bg-muted px-3 py-1.5 text-xs font-bold text-muted-foreground">{filteredGrades.length} shown</span></div><div className="divide-y divide-border/70">{filteredGrades.map((grade) => <GradeRow key={grade.id} grade={grade} onEdit={() => setModal(true)} onDelete={() => setGrades((all) => all.filter((item) => item.id !== grade.id))} />)}{filteredGrades.length === 0 && <EmptyState icon={TrendingUp} title="No marks yet" text="Your first result can be a baseline, not a judgement." />}</div></section>
    {modal && <EditorModal type="grade" onClose={() => setModal(false)} onSave={(data) => { const grade = data as unknown as Grade; setGrades((all) => [...all, { ...grade, id: crypto.randomUUID(), mark: Number(grade.mark), outOf: Number(grade.outOf) }]); setModal(false); }} />}
  </section>;
}

function GradeRow({ grade, onEdit, onDelete }: { grade: Grade; onEdit: () => void; onDelete: () => void }) {
  const pct = Math.round(grade.mark / grade.outOf * 100);
  return <div data-testid={`row-grade-${grade.id}`} className="group grid gap-4 px-5 py-5 transition-colors hover:bg-muted/30 sm:grid-cols-[1fr_160px_90px] sm:items-center sm:px-7"><div className="flex min-w-0 items-start gap-3"><div className="grade-badge">{grade.actualGrade || '—'}</div><div className="min-w-0"><p className="truncate text-sm font-bold">{grade.title}</p><p className="mt-1 text-xs text-muted-foreground">{grade.subject} · {new Date(`${grade.date}T12:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</p><div className="mt-2 flex flex-wrap gap-2 text-xs"><span className="grade-chip">Target {grade.target || '—'}</span><span className="grade-chip">Actual {grade.actualGrade || '—'}</span></div><p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground"><span className="font-bold text-foreground">Improvement notes:</span> {grade.reflection || 'No notes added yet.'}</p></div></div><div><div className="mb-2 flex justify-between text-[11px] font-bold text-muted-foreground"><span>{grade.mark} / {grade.outOf}</span><span>{pct}%</span></div><div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} /></div></div><div className="flex items-center gap-1 sm:justify-end"><button data-testid={`button-edit-grade-${grade.id}`} onClick={onEdit} className="mini-button"><Pencil size={14} /></button><button data-testid={`button-delete-grade-${grade.id}`} onClick={onDelete} className="mini-button text-destructive"><Trash2 size={14} /></button></div></div>;
}

function EmptyState({ icon: Icon, title, text }: { icon: IconType; title: string; text: string }) { return <div className="empty-state"><Icon size={21} /><p className="mt-3 text-sm font-bold">{title}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{text}</p></div>; }

type ModalType = 'subject' | 'spec' | 'prompt' | 'paper' | 'grade';
function EditorModal({ type, onClose, onSave }: { type: ModalType; onClose: () => void; onSave: (data: Record<string, string>) => void }) {
  const isSubject = type === 'subject'; const isSpec = type === 'spec'; const isPrompt = type === 'prompt'; const isPaper = type === 'paper';
  const [fields, setFields] = useState<Record<string, string>>(() => {
    return (isSubject ? { name: '', code: '', board: '', accent: '#D01937', note: '' } : isSpec ? { title: '', unit: '' } : isPrompt ? { title: '', tag: '' } : isPaper ? { label: '', score: '', date: '' } : { title: '', subject: '', mark: '', outOf: '', target: '', actualGrade: '', date: '', reflection: '' }) as Record<string, string>;
  });
  const set = (key: string, value: string) => setFields((all) => ({ ...all, [key]: value }));
  const title = isSubject ? 'Add a subject' : isSpec ? 'Add a topic' : isPrompt ? 'Capture an essay prompt' : isPaper ? 'Log a past paper' : 'Log a result';
  const save = () => { if (!Object.values(fields).some((value) => value.trim() === '')) onSave(fields); };
  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose(); }}><div className="modal-card animate-modal"><div className="flex items-center justify-between"><div><p className="eyebrow">Focus Year</p><h2 className="mt-1 text-2xl font-extrabold">{title}</h2></div><button data-testid="button-close-modal" onClick={onClose} className="icon-button"><X size={18} /></button></div><div className="mt-6 grid gap-4">
    {(isSubject || type === 'grade') && <Field label={isSubject ? 'Subject name' : 'Title'} value={fields[isSubject ? 'name' : 'title']} onChange={(v) => set(isSubject ? 'name' : 'title', v)} />}
    {type === 'grade' && <Field label="Subject" value={fields.subject} onChange={(v) => set('subject', v)} />}
    {isSubject && <><Field label="Short code" value={fields.code} onChange={(v) => set('code', v)} /><Field label="Exam board" value={fields.board} onChange={(v) => set('board', v)} /><Field label="A note to yourself" value={fields.note} onChange={(v) => set('note', v)} /></>}
    {isSpec && <><Field label="Topic" value={fields.title} onChange={(v) => set('title', v)} /><Field label="Unit or paper" value={fields.unit} onChange={(v) => set('unit', v)} /></>}
    {isPrompt && <><Field label="Prompt" value={fields.title} onChange={(v) => set('title', v)} /><Field label="Text or topic" value={fields.tag} onChange={(v) => set('tag', v)} /></>}
    {isPaper && <><Field label="Paper label" value={fields.label} onChange={(v) => set('label', v)} /><Field label="Score (e.g. 42 / 75)" value={fields.score} onChange={(v) => set('score', v)} /><Field label="Date or note" value={fields.date} onChange={(v) => set('date', v)} /></>}
    {type === 'grade' && <><div className="grid grid-cols-2 gap-3"><Field label="Mark" type="number" value={fields.mark} onChange={(v) => set('mark', v)} /><Field label="Out of" type="number" value={fields.outOf} onChange={(v) => set('outOf', v)} /></div><div className="grid grid-cols-3 gap-3"><Field label="Target grade" value={fields.target} onChange={(v) => set('target', v)} /><Field label="Actual grade" value={fields.actualGrade} onChange={(v) => set('actualGrade', v)} /><Field label="Date" type="date" value={fields.date} onChange={(v) => set('date', v)} /></div><label className="field-label">What Went Wrong / Improvement Notes<textarea data-testid="input-grade-reflection" value={fields.reflection} onChange={(event) => set('reflection', event.target.value)} placeholder="What will you do differently next time?" /></label></>}
  </div><div className="mt-7 flex justify-end gap-2"><button data-testid="button-cancel-modal" onClick={onClose} className="secondary-button">Cancel</button><button data-testid="button-save-modal" onClick={save} className="primary-button">Save to Focus Year <Check size={16} /></button></div></div></div>;
}

function Field({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return <label className="field-label">{label}<input data-testid={`input-${label.toLowerCase().replaceAll(' ', '-')}`} type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={label} /></label>;
}

export default App;