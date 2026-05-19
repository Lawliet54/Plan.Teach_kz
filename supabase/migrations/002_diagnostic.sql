-- =========================================================
-- Plan.Teach_kz
-- 002_diagnostic.sql
-- Diagnostic tests for grades 7-11
-- =========================================================

create extension if not exists pgcrypto;

-- =========================================================
-- 1. diagnostic_questions
-- =========================================================

create table if not exists public.diagnostic_questions (
  id uuid primary key default gen_random_uuid(),

  grade int not null check (grade between 7 and 11),
  topic text not null,
  question_text text not null,

  option_a text not null,
  option_b text not null,
  option_c text not null,
  option_d text not null,

  correct_option text not null check (correct_option in ('A', 'B', 'C', 'D')),

  difficulty text not null check (difficulty in ('easy', 'medium', 'hard')),
  skill_tag text not null default 'general',

  explanation text,
  is_active boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists diagnostic_questions_grade_idx
on public.diagnostic_questions(grade);

create index if not exists diagnostic_questions_active_idx
on public.diagnostic_questions(is_active);

create index if not exists diagnostic_questions_skill_tag_idx
on public.diagnostic_questions(skill_tag);

drop trigger if exists diagnostic_questions_set_updated_at on public.diagnostic_questions;

create trigger diagnostic_questions_set_updated_at
before update on public.diagnostic_questions
for each row
execute function public.set_updated_at();

-- =========================================================
-- 2. diagnostic_attempts
-- Бір оқушының толық диагностика сессиясы.
-- 7-11 сынып бойынша барлық жауап осы attempt-ке байланады.
-- =========================================================

create table if not exists public.diagnostic_attempts (
  id uuid primary key default gen_random_uuid(),

  student_id uuid not null references public.profiles(id) on delete cascade,

  status text not null default 'in_progress'
    check (status in ('in_progress', 'completed')),

  started_at timestamptz not null default now(),
  completed_at timestamptz,

  total_score int not null default 0,
  max_score int not null default 50,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists diagnostic_attempts_student_id_idx
on public.diagnostic_attempts(student_id);

create index if not exists diagnostic_attempts_status_idx
on public.diagnostic_attempts(status);

drop trigger if exists diagnostic_attempts_set_updated_at on public.diagnostic_attempts;

create trigger diagnostic_attempts_set_updated_at
before update on public.diagnostic_attempts
for each row
execute function public.set_updated_at();

-- =========================================================
-- 3. diagnostic_answers
-- =========================================================

create table if not exists public.diagnostic_answers (
  id uuid primary key default gen_random_uuid(),

  attempt_id uuid not null references public.diagnostic_attempts(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  question_id uuid not null references public.diagnostic_questions(id) on delete cascade,

  selected_option text not null check (selected_option in ('A', 'B', 'C', 'D')),
  is_correct boolean not null default false,

  answered_at timestamptz not null default now(),

  unique (attempt_id, question_id)
);

create index if not exists diagnostic_answers_attempt_id_idx
on public.diagnostic_answers(attempt_id);

create index if not exists diagnostic_answers_student_id_idx
on public.diagnostic_answers(student_id);

create index if not exists diagnostic_answers_question_id_idx
on public.diagnostic_answers(question_id);

-- =========================================================
-- 4. diagnostic_results
-- AI анализ кейін осы кестеге жазылады.
-- Қазір basic result сақтаймыз.
-- =========================================================

create table if not exists public.diagnostic_results (
  id uuid primary key default gen_random_uuid(),

  attempt_id uuid not null references public.diagnostic_attempts(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,

  total_score int not null,
  max_score int not null default 50,

  level text not null check (level in ('beginner', 'intermediate', 'advanced')),

  grade_scores jsonb not null default '{}',
  strong_topics jsonb not null default '[]',
  weak_topics jsonb not null default '[]',

  ai_summary text,
  recommended_route jsonb not null default '[]',

  created_at timestamptz not null default now(),

  unique (attempt_id)
);

create index if not exists diagnostic_results_student_id_idx
on public.diagnostic_results(student_id);

create index if not exists diagnostic_results_level_idx
on public.diagnostic_results(level);

-- =========================================================
-- 5. RLS
-- =========================================================

alter table public.diagnostic_questions enable row level security;
alter table public.diagnostic_attempts enable row level security;
alter table public.diagnostic_answers enable row level security;
alter table public.diagnostic_results enable row level security;

-- diagnostic_questions
drop policy if exists "diagnostic_questions_select_authenticated" on public.diagnostic_questions;
drop policy if exists "diagnostic_questions_admin_all" on public.diagnostic_questions;

create policy "diagnostic_questions_select_authenticated"
on public.diagnostic_questions
for select
to authenticated
using (is_active = true);

create policy "diagnostic_questions_admin_all"
on public.diagnostic_questions
for all
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- diagnostic_attempts
drop policy if exists "diagnostic_attempts_select_access" on public.diagnostic_attempts;
drop policy if exists "diagnostic_attempts_insert_own" on public.diagnostic_attempts;
drop policy if exists "diagnostic_attempts_update_own" on public.diagnostic_attempts;
drop policy if exists "diagnostic_attempts_delete_admin" on public.diagnostic_attempts;

create policy "diagnostic_attempts_select_access"
on public.diagnostic_attempts
for select
to authenticated
using (
  student_id = auth.uid()
  or public.can_view_student(auth.uid(), student_id)
);

create policy "diagnostic_attempts_insert_own"
on public.diagnostic_attempts
for insert
to authenticated
with check (student_id = auth.uid());

create policy "diagnostic_attempts_update_own"
on public.diagnostic_attempts
for update
to authenticated
using (student_id = auth.uid())
with check (student_id = auth.uid());

create policy "diagnostic_attempts_delete_admin"
on public.diagnostic_attempts
for delete
to authenticated
using (public.is_admin(auth.uid()));

-- diagnostic_answers
drop policy if exists "diagnostic_answers_select_access" on public.diagnostic_answers;
drop policy if exists "diagnostic_answers_insert_own" on public.diagnostic_answers;
drop policy if exists "diagnostic_answers_update_own" on public.diagnostic_answers;
drop policy if exists "diagnostic_answers_delete_admin" on public.diagnostic_answers;

create policy "diagnostic_answers_select_access"
on public.diagnostic_answers
for select
to authenticated
using (
  student_id = auth.uid()
  or public.can_view_student(auth.uid(), student_id)
);

create policy "diagnostic_answers_insert_own"
on public.diagnostic_answers
for insert
to authenticated
with check (student_id = auth.uid());

create policy "diagnostic_answers_update_own"
on public.diagnostic_answers
for update
to authenticated
using (student_id = auth.uid())
with check (student_id = auth.uid());

create policy "diagnostic_answers_delete_admin"
on public.diagnostic_answers
for delete
to authenticated
using (public.is_admin(auth.uid()));

-- diagnostic_results
drop policy if exists "diagnostic_results_select_access" on public.diagnostic_results;
drop policy if exists "diagnostic_results_insert_own" on public.diagnostic_results;
drop policy if exists "diagnostic_results_update_own" on public.diagnostic_results;
drop policy if exists "diagnostic_results_delete_admin" on public.diagnostic_results;

create policy "diagnostic_results_select_access"
on public.diagnostic_results
for select
to authenticated
using (
  student_id = auth.uid()
  or public.can_view_student(auth.uid(), student_id)
);

create policy "diagnostic_results_insert_own"
on public.diagnostic_results
for insert
to authenticated
with check (student_id = auth.uid());

create policy "diagnostic_results_update_own"
on public.diagnostic_results
for update
to authenticated
using (student_id = auth.uid())
with check (student_id = auth.uid());

create policy "diagnostic_results_delete_admin"
on public.diagnostic_results
for delete
to authenticated
using (public.is_admin(auth.uid()));

-- =========================================================
-- 6. Seed diagnostic questions
-- 7-11 сынып, әрқайсысы 10 сұрақ.
-- Егер қайта Run бассаң duplicate болмауы үшін алдымен seed сұрақтарын тазалаймыз.
-- =========================================================

delete from public.diagnostic_questions
where skill_tag like 'seed_%';

-- 7 сынып
insert into public.diagnostic_questions
(grade, topic, question_text, option_a, option_b, option_c, option_d, correct_option, difficulty, skill_tag, explanation)
values
(7, 'Физика – табиғат туралы ғылым', 'Физика нені зерттейді?', 'Тек өсімдіктерді', 'Табиғат құбылыстарын және олардың заңдылықтарын', 'Тек тарихи оқиғаларды', 'Тек тіл ережелерін', 'B', 'easy', 'seed_7_intro', 'Физика табиғаттағы құбылыстарды, денелердің қозғалысын, энергияны және олардың байланысын зерттейді.'),
(7, 'Табиғатты зерттеудің ғылыми әдістері', 'Ғылыми зерттеудің дұрыс реті қайсы?', 'Болжам → бақылау → тәжірибе → қорытынды', 'Қорытынды → тәжірибе → бақылау', 'Жауап → сұрақ → тәжірибе', 'Баға → бақылау → ойын', 'A', 'easy', 'seed_7_method', 'Ғылыми зерттеу көбіне бақылаудан, болжамнан, тәжірибеден және қорытындыдан тұрады.'),
(7, 'Халықаралық бірліктер жүйесі', 'SI жүйесінде ұзындықтың негізгі өлшем бірлігі қандай?', 'килограмм', 'секунд', 'метр', 'ньютон', 'C', 'easy', 'seed_7_si', 'SI жүйесінде ұзындық метрмен өлшенеді.'),
(7, 'Скаляр және векторлық шамалар', 'Қай шама векторлық шамаға жатады?', 'масса', 'температура', 'жол', 'күш', 'D', 'medium', 'seed_7_vector', 'Күштің сан мәні ғана емес, бағыты да бар. Сондықтан ол векторлық шама.'),
(7, 'Өлшеулер дәлдігі', 'Мензурка шкаласының бөлік құны 2 мл болса, абсолютті қате шамамен қанша?', '1 мл', '2 мл', '4 мл', '0 мл', 'A', 'medium', 'seed_7_measure', 'Көп жағдайда аспаптың абсолютті қатесі бөлік құнының жартысына тең деп алынады.'),
(7, 'Механикалық қозғалыс', 'Дене орнының уақыт бойынша өзгеруі қалай аталады?', 'тығыздық', 'механикалық қозғалыс', 'қысым', 'энергия', 'B', 'easy', 'seed_7_motion', 'Механикалық қозғалыс — дененің басқа денелерге қатысты орнының уақыт бойынша өзгеруі.'),
(7, 'Жылдамдық', 'Жылдамдық формуласы қайсы?', 'v = s / t', 'v = m / V', 'v = F / S', 'v = A / t', 'A', 'easy', 'seed_7_speed', 'Бірқалыпты қозғалыста жылдамдық жолдың уақытқа қатынасына тең.'),
(7, 'Тығыздық', 'Тығыздық формуласы қайсы?', 'ρ = m / V', 'ρ = V / m', 'ρ = F / S', 'ρ = s / t', 'A', 'medium', 'seed_7_density', 'Тығыздық — массаның көлемге қатынасы.'),
(7, 'Қысым', 'Қысымның формуласы қайсы?', 'p = F / S', 'p = m / V', 'p = s / t', 'p = A / t', 'A', 'medium', 'seed_7_pressure', 'Қысым күштің ауданға қатынасына тең.'),
(7, 'Механикалық жұмыс және қуат', 'Қуат нені көрсетеді?', 'Көлемнің массамен байланысын', 'Жұмыстың орындалу жылдамдығын', 'Дененің түсін', 'Температураның бағытын', 'B', 'hard', 'seed_7_power', 'Қуат — бірлік уақытта атқарылған жұмыс.');

-- 8 сынып
insert into public.diagnostic_questions
(grade, topic, question_text, option_a, option_b, option_c, option_d, correct_option, difficulty, skill_tag, explanation)
values
(8, 'Жылулық қозғалыс', 'Диффузия құбылысы нені дәлелдейді?', 'Молекулалардың ретсіз қозғалысын', 'Денелердің түсін', 'Тек жарықтың таралуын', 'Магнит өрісінің бағытын', 'A', 'easy', 'seed_8_heat_motion', 'Диффузия молекулалардың үздіксіз ретсіз қозғалыста болатынын көрсетеді.'),
(8, 'Температура', '0°C шамасы Кельвин шкаласында шамамен нешеге тең?', '0 K', '100 K', '273 K', '373 K', 'C', 'easy', 'seed_8_temperature', 'Кельвин шкаласында T = t + 273.'),
(8, 'Ішкі энергия', 'Дененің ішкі энергиясын қалай өзгертуге болады?', 'Тек бояу арқылы', 'Жұмыс істеу және жылу беру арқылы', 'Тек өлшеу арқылы', 'Тек дыбыс арқылы', 'B', 'medium', 'seed_8_internal_energy', 'Ішкі энергия жұмыс істеу немесе жылу алмасу арқылы өзгереді.'),
(8, 'Жылу берілу', 'Жылу берілудің түрлері қайсы?', 'Диффузия, инерция, қысым', 'Жылу өткізгіштік, конвекция, сәуле шығару', 'Салмақ, масса, көлем', 'Жол, уақыт, жылдамдық', 'B', 'easy', 'seed_8_heat_transfer', 'Жылу берілу үш негізгі түрде жүреді.'),
(8, 'Жылу мөлшері', 'Жылу мөлшерінің формуласы қайсы?', 'Q = cmΔt', 'Q = mv', 'Q = F/S', 'Q = U/R', 'A', 'medium', 'seed_8_heat_amount', 'Затты қыздыру немесе суыту кезіндегі жылу мөлшері Q = cmΔt формуласымен анықталады.'),
(8, 'Электр заряды', 'Электр зарядының өлшем бірлігі қандай?', 'Ньютон', 'Кулон', 'Вольт', 'Ом', 'B', 'easy', 'seed_8_charge', 'Электр заряды кулонмен өлшенеді.'),
(8, 'Кулон заңы', 'Кулон заңы қандай денелердің әсерлесуін сипаттайды?', 'Зарядталған денелердің', 'Жарық сәулелерінің', 'Газ молекулаларының', 'Дыбыс толқындарының', 'A', 'medium', 'seed_8_coulomb', 'Кулон заңы зарядтардың өзара әсерлесу күшін сипаттайды.'),
(8, 'Электр өрісі', 'Электр өрісінің күштік сипаттамасы қалай аталады?', 'потенциал', 'кернеулік', 'кедергі', 'қуат', 'B', 'medium', 'seed_8_electric_field', 'Электр өрісінің күштік сипаттамасы — кернеулік.'),
(8, 'Ом заңы', 'Тізбек бөлігі үшін Ом заңы қайсы?', 'I = U / R', 'I = R / U', 'I = q / U', 'I = F / S', 'A', 'easy', 'seed_8_ohm', 'Ом заңы бойынша ток күші кернеуге тура, кедергіге кері пропорционал.'),
(8, 'Линза', 'Жинағыш линза қандай сәулелерді жинайды?', 'Тек дыбыс толқындарын', 'Параллель жарық сәулелерін фокусқа жинайды', 'Электр зарядтарын жояды', 'Магнит өрісін тоқтатады', 'B', 'hard', 'seed_8_lens', 'Жинағыш линза параллель сәулелерді фокусқа жинайды.');

-- 9 сынып
insert into public.diagnostic_questions
(grade, topic, question_text, option_a, option_b, option_c, option_d, correct_option, difficulty, skill_tag, explanation)
values
(9, 'Механикалық қозғалыс', 'Материялық нүкте деген не?', 'Өлшемін есептеуде елемеуге болатын дене', 'Мүлде массасы жоқ дене', 'Тек сұйық дене', 'Тек жарық көзі', 'A', 'easy', 'seed_9_material_point', 'Егер дененің өлшемі қозғалысты сипаттауда маңызды болмаса, оны материялық нүкте деп қарастыруға болады.'),
(9, 'Векторлар', 'Векторлық шаманың ерекшелігі қандай?', 'Тек сан мәні бар', 'Сан мәні және бағыты бар', 'Тек түсі бар', 'Өлшем бірлігі болмайды', 'B', 'easy', 'seed_9_vector', 'Векторлық шамалар бағытпен сипатталады.'),
(9, 'Теңайнымалы қозғалыс', 'Үдеу нені көрсетеді?', 'Жылдамдықтың уақыт бойынша өзгеруін', 'Массаның көлемге қатынасын', 'Күштің ауданға қатынасын', 'Жылу мөлшерін', 'A', 'medium', 'seed_9_acceleration', 'Үдеу жылдамдықтың қаншалықты тез өзгеретінін көрсетеді.'),
(9, 'Еркін түсу', 'Еркін түсу үдеуінің жуық мәні қандай?', '1 м/с²', '3 м/с²', '9,8 м/с²', '100 м/с²', 'C', 'easy', 'seed_9_free_fall', 'Жер бетіне жақын жерде еркін түсу үдеуі шамамен 9,8 м/с².'),
(9, 'Ньютон заңдары', 'Ньютонның екінші заңы қай формуламен жазылады?', 'F = ma', 'p = F/S', 'ρ = m/V', 'Q = cmΔt', 'A', 'medium', 'seed_9_newton2', 'Ньютонның екінші заңы денеге әсер ететін қорытқы күшті масса мен үдеумен байланыстырады.'),
(9, 'Бүкіләлемдік тартылыс', 'Гравитациялық күш қандай шамаларға тәуелді?', 'Денелер массасына және арақашықтыққа', 'Тек түске', 'Тек температураға', 'Тек дыбысқа', 'A', 'medium', 'seed_9_gravity', 'Тартылыс күші массаларға тура, арақашықтық квадратына кері тәуелді.'),
(9, 'Импульс', 'Дене импульсі формуласы қайсы?', 'p = mv', 'p = F/S', 'p = m/V', 'p = U/I', 'A', 'medium', 'seed_9_momentum', 'Импульс дене массасы мен жылдамдығының көбейтіндісіне тең.'),
(9, 'Тербеліс', 'Тербеліс периоды нені білдіреді?', 'Бір толық тербеліс жасауға кеткен уақыт', 'Бірлік уақытта өткен жол', 'Дененің массасы', 'Күштің бағыты', 'A', 'easy', 'seed_9_oscillation', 'Период — бір толық тербелістің уақыты.'),
(9, 'Толқындар', 'Толқын жылдамдығының формуласы қайсы?', 'v = λf', 'v = m/V', 'v = F/S', 'v = U/R', 'A', 'hard', 'seed_9_wave', 'Толқын жылдамдығы толқын ұзындығы мен жиіліктің көбейтіндісіне тең.'),
(9, 'Фотоэффект', 'Фотоэффект құбылысы нені білдіреді?', 'Жарық әсерінен электрондардың бөлініп шығуын', 'Судың қайнауын', 'Дененің массасының артуын', 'Магниттің қызуын', 'A', 'hard', 'seed_9_photoeffect', 'Фотоэффект — жарық әсерінен зат бетінен электрондардың шығуы.');

-- 10 сынып
insert into public.diagnostic_questions
(grade, topic, question_text, option_a, option_b, option_c, option_d, correct_option, difficulty, skill_tag, explanation)
values
(10, 'Кинематика', 'Теңүдемелі қозғалыста жылдамдық формуласы қайсы?', 'v = v0 + at', 'v = s/t ғана', 'v = F/S', 'v = m/V', 'A', 'medium', 'seed_10_kinematics', 'Теңүдемелі қозғалыста жылдамдық уақыт бойынша v = v0 + at формуламен өзгереді.'),
(10, 'Салыстырмалылық принципі', 'Галилейдің салыстырмалылық принципі қай жүйелерге қатысты?', 'Инерциялық санақ жүйелеріне', 'Тек сұйықтарға', 'Тек жарыққа', 'Тек магниттерге', 'A', 'medium', 'seed_10_galileo', 'Классикалық механика заңдары барлық инерциялық санақ жүйелерінде бірдей орындалады.'),
(10, 'Динамика', 'Бірнеше күш әсер етсе, дене үдеуі қандай күшпен анықталады?', 'Қорытқы күшпен', 'Тек ауырлық күшімен', 'Тек үйкеліс күшімен', 'Дененің түсімен', 'A', 'medium', 'seed_10_dynamics', 'Ньютонның екінші заңы қорытқы күшке қолданылады.'),
(10, 'Сақталу заңдары', 'Импульстің сақталу заңы қашан орындалады?', 'Жабық жүйеде сыртқы күштер елеусіз болса', 'Әрқашан тек суда', 'Тек дене тыныш тұрса', 'Тек температура тұрақты болса', 'A', 'hard', 'seed_10_conservation', 'Жабық жүйеде толық импульс сақталады.'),
(10, 'Газ заңдары', 'Идеал газ күйінің теңдеуі қайсы?', 'pV = νRT', 'F = ma', 'I = U/R', 'p = F/S', 'A', 'medium', 'seed_10_gas', 'Идеал газ күйі қысым, көлем, температура және зат мөлшері арқылы сипатталады.'),
(10, 'Термодинамика', 'Термодинамиканың бірінші заңы нені сипаттайды?', 'Энергияның сақталуын жылулық процестерде', 'Тек зарядтың сақталуын', 'Тек жарықтың шағылуын', 'Тек магнит өрісін', 'A', 'medium', 'seed_10_thermo', 'Бірінші заң ішкі энергия, жылу мөлшері және жұмыс арасындағы байланысты көрсетеді.'),
(10, 'Электростатика', 'Кулон заңы бойынша зарядтар арақашықтығы артса күш қалай өзгереді?', 'Кемиді', 'Артады', 'Өзгермейді', 'Нөлденеді', 'A', 'medium', 'seed_10_electrostatics', 'Кулон күші арақашықтық квадратына кері пропорционал.'),
(10, 'Тұрақты ток', 'Толық тізбек үшін Ом заңы қандай шамаларды ескереді?', 'ЭҚК, сыртқы және ішкі кедергіні', 'Тек температураны', 'Тек массаны', 'Тек тығыздықты', 'A', 'hard', 'seed_10_full_ohm', 'Толық тізбекте ток күші ЭҚК пен толық кедергі арқылы анықталады.'),
(10, 'Магнит өрісі', 'Ампер күші қандай жағдайда пайда болады?', 'Магнит өрісіндегі тогы бар өткізгішке әсер еткенде', 'Дене қызғанда', 'Су буланғанда', 'Жарық сынғанда', 'A', 'medium', 'seed_10_ampere', 'Магнит өрісі тогы бар өткізгішке күшпен әсер етеді.'),
(10, 'Электромагниттік индукция', 'Электромагниттік индукция қашан пайда болады?', 'Магнит ағыны өзгергенде', 'Температура тұрақты болғанда', 'Масса өзгермегенде', 'Дене тыныш тұрғанда', 'A', 'hard', 'seed_10_induction', 'Индукциялық ЭҚК магнит ағыны өзгерген кезде пайда болады.');

-- 11 сынып
insert into public.diagnostic_questions
(grade, topic, question_text, option_a, option_b, option_c, option_d, correct_option, difficulty, skill_tag, explanation)
values
(11, 'Гармоникалық тербелістер', 'Гармоникалық тербелісте координата уақыт бойынша қалай өзгереді?', 'Синус немесе косинус заңымен', 'Тек сызықты артады', 'Мүлде өзгермейді', 'Кездейсоқ өзгереді', 'A', 'medium', 'seed_11_harmonic', 'Гармоникалық тербеліс синусоидалық заңмен сипатталады.'),
(11, 'Электромагниттік тербелістер', 'Тербелмелі контурда энергия қай шамалар арасында алмасады?', 'Электр және магнит өрісі энергиялары арасында', 'Тек жылу мен масса арасында', 'Тек дыбыс пен жарық арасында', 'Тек қысым мен көлем арасында', 'A', 'medium', 'seed_11_em_oscillation', 'LC контурда электр өрісі мен магнит өрісі энергиялары өзара түрленеді.'),
(11, 'Айнымалы ток', 'Айнымалы токтың әсерлік мәні нені сипаттайды?', 'Тұрақты токпен бірдей жылулық әсер беретін мәнді', 'Токтың түсін', 'Өткізгіш ұзындығын', 'Массаны', 'A', 'hard', 'seed_11_ac', 'Әсерлік мән айнымалы токтың жылулық әсерін салыстыруға қолданылады.'),
(11, 'Резонанс', 'Резонанс қашан байқалады?', 'Сыртқы әсер жиілігі жүйенің меншікті жиілігіне жақындағанда', 'Дене тыныш тұрғанда', 'Температура нөл болғанда', 'Заряд жоғалғанда', 'A', 'medium', 'seed_11_resonance', 'Резонанста тербеліс амплитудасы күрт артады.'),
(11, 'Толқындық қозғалыс', 'Интерференция деген не?', 'Толқындардың қабаттасуы нәтижесінде күшеюі немесе әлсіреуі', 'Дененің құлауы', 'Зарядтардың сақталуы', 'Газдың сығылуы', 'A', 'medium', 'seed_11_interference', 'Интерференция — когерентті толқындардың қабаттасу құбылысы.'),
(11, 'Толқындық оптика', 'Дифракция құбылысы нені көрсетеді?', 'Жарықтың толқындық қасиетін', 'Жарықтың массасын', 'Дененің тығыздығын', 'Ток күшін', 'A', 'medium', 'seed_11_diffraction', 'Дифракция жарықтың бөгеттерді айналып өту қасиетін көрсетеді.'),
(11, 'Геометриялық оптика', 'Жұқа линза формуласы қандай шамаларды байланыстырады?', 'Фокус, зат және кескін арақашықтықтарын', 'Масса мен көлемді', 'Күш пен ауданды', 'Ток пен кедергіні', 'A', 'hard', 'seed_11_lens', 'Жұқа линза формуласы 1/F = 1/d + 1/f түрінде қолданылады.'),
(11, 'Фотоэффект', 'Эйнштейн теңдеуі фотоэффектте нені байланыстырады?', 'Фотон энергиясын, шығу жұмысын және электрон энергиясын', 'Қысым мен көлемді ғана', 'Масса мен тығыздықты ғана', 'Күш пен моментті ғана', 'A', 'hard', 'seed_11_photoeffect', 'Фотоэффект теңдеуі энергияның сақталуына негізделген.'),
(11, 'Радиоактивтілік', 'Жартылай ыдырау периоды нені білдіреді?', 'Ядролар санының жартысы ыдырайтын уақытты', 'Дененің жарты жол жүруін', 'Температураның екі есе артуын', 'Токтың нөлге түсуін', 'A', 'medium', 'seed_11_decay', 'Жартылай ыдырау периоды радиоактивті ядролар саны екі есе азаятын уақыт.'),
(11, 'Космология', 'Қызыл ығысу көбіне нені көрсетеді?', 'Галактикалардың бізден алыстап бара жатқанын', 'Дененің қызғанын', 'Жарықтың тоқтағанын', 'Массаның жоғалғанын', 'A', 'hard', 'seed_11_cosmology', 'Қызыл ығысу Әлемнің кеңеюімен байланысты түсіндіріледі.');