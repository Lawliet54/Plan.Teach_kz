-- =========================================================
-- Plan.Teach_kz
-- 017_task_packs_and_cinematic_analytics.sql
-- 10 complex physics packs for each grade. Each pack: 10 tests, 5 calculations, 1 lab/practical task.
-- =========================================================
create extension if not exists pgcrypto;

create table if not exists public.task_packs (
  id uuid primary key default gen_random_uuid(),
  grade int not null check (grade between 7 and 11),
  title text not null,
  slug text not null unique,
  section_title text not null,
  description text not null,
  formula text,
  difficulty text not null default 'intermediate' check (difficulty in ('basic','intermediate','advanced')),
  order_index int not null default 0,
  estimated_minutes int not null default 45,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(grade,order_index)
);

create table if not exists public.task_pack_items (
  id uuid primary key default gen_random_uuid(),
  pack_id uuid not null references public.task_packs(id) on delete cascade,
  kind text not null check (kind in ('test','calculation','lab')),
  order_index int not null,
  title text not null,
  prompt text not null,
  instruction text,
  answer_type text not null check(answer_type in ('single_choice','number','text','manual_review')),
  options jsonb not null default '[]'::jsonb,
  correct_answer jsonb,
  explanation text,
  skill_codes text[] not null default '{}',
  max_score numeric not null default 1,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique(pack_id,order_index)
);

create table if not exists public.task_pack_attempts (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  pack_id uuid not null references public.task_packs(id) on delete cascade,
  item_id uuid not null references public.task_pack_items(id) on delete cascade,
  submitted_answer jsonb not null default '{}'::jsonb,
  is_correct boolean,
  score numeric,
  max_score numeric not null,
  review_status text not null default 'auto_checked' check(review_status in ('auto_checked','pending_review','reviewed')),
  feedback text,
  teacher_score numeric,
  teacher_feedback text,
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  idempotency_key text not null,
  created_at timestamptz not null default now(),
  unique(student_id,idempotency_key)
);

create index if not exists task_packs_grade_idx on public.task_packs(grade,order_index);
create index if not exists task_pack_items_pack_idx on public.task_pack_items(pack_id,order_index);
create index if not exists task_pack_attempts_student_idx on public.task_pack_attempts(student_id,created_at desc);

drop trigger if exists task_packs_set_updated_at on public.task_packs;
create trigger task_packs_set_updated_at before update on public.task_packs for each row execute function public.set_updated_at();

alter table public.task_packs enable row level security;
alter table public.task_pack_items enable row level security;
alter table public.task_pack_attempts enable row level security;

create policy "task_packs_read_authenticated" on public.task_packs for select to authenticated using(is_active=true);
create policy "task_packs_admin_all" on public.task_packs for all to authenticated using(public.is_admin(auth.uid())) with check(public.is_admin(auth.uid()));
create policy "task_pack_items_admin_all" on public.task_pack_items for all to authenticated using(public.is_admin(auth.uid())) with check(public.is_admin(auth.uid()));
create policy "task_pack_attempts_select_access" on public.task_pack_attempts for select to authenticated using(public.can_view_student(auth.uid(),student_id));
create policy "task_pack_attempts_insert_own" on public.task_pack_attempts for insert to authenticated with check(student_id=auth.uid());
create policy "task_pack_attempts_update_teacher" on public.task_pack_attempts for update to authenticated using(public.can_view_student(auth.uid(),student_id)) with check(public.can_view_student(auth.uid(),student_id));

grant select on public.task_packs to authenticated;
grant select,insert,update on public.task_pack_attempts to authenticated;

-- Public safe view: correct_answer is deliberately excluded.
create or replace view public.task_pack_items_public as
select id,pack_id,kind,order_index,title,prompt,instruction,answer_type,options,explanation,skill_codes,max_score,is_active
from public.task_pack_items
where is_active=true;
grant select on public.task_pack_items_public to authenticated;

-- Seed 50 task packs (10 per grade).
insert into public.task_packs(grade,title,slug,section_title,description,formula,difficulty,order_index,estimated_minutes) values
(7,'Физикалық шамалар және өлшеу','g7-measurement','Физикаға кіріспе','Өлшеу дәлдігі, аспап шкаласы және SI бірліктерін тәжірибемен бекіту.','SI жүйесі','basic',1,45),
(7,'Тығыздықты зерттеу','g7-density','Заттың құрылысы','Масса мен көлем байланысын кесте және график арқылы талдау.','ρ = m / V','intermediate',2,50),
(7,'Қысым және күш','g7-pressure','Қысым','Қысымның ауданға және күшке тәуелділігін практикалық жағдайда қолдану.','p = F / S','intermediate',3,50),
(7,'Архимед күші','g7-archimedes','Сұйықтар мен газдар','Сұйықтық тығыздығы мен батырылған көлемнің әсерін зерттеу.','Fₐ = ρgV','advanced',4,55),
(7,'Механикалық жұмыс','g7-work','Жұмыс және қуат','Күш, орын ауыстыру және қуатты салыстыру.','A = Fs; N = A/t','intermediate',5,50),
(7,'Энергияның сақталуы','g7-energy','Энергия','Потенциалдық және кинетикалық энергия түрленуін талдау.','Eₚ = mgh; Eₖ = mv²/2','advanced',6,55),
(7,'Иіндік және тепе-теңдік','g7-lever','Күш моменті','Күш моменті арқылы тепе-теңдік шартын зерттеу.','M = Fl','intermediate',7,50),
(7,'Серпімділік және Гук заңы','g7-hooke','Деформация','Серіппенің ұзаруы мен күш арасындағы сызықтық байланысты анықтау.','F = kx','advanced',8,55),
(7,'Қозғалыс графиктері','g7-motion-graphs','Механикалық қозғалыс','Жол, уақыт және жылдамдық графиктерін талдау.','v = s/t','advanced',9,55),
(7,'7-сынып интеграциялық зерттеу','g7-capstone','Қорытынды жоба','Бірнеше заңды бір практикалық зерттеуде байланыстыру.','Зерттеу циклі','advanced',10,65),
(8,'Жылу мөлшері','g8-heat','Жылу құбылыстары','Температура, масса және меншікті жылу сыйымдылығын талдау.','Q = cmΔT','intermediate',1,50),
(8,'Агрегаттық күйлер','g8-phase','Жылу құбылыстары','Балқу және булану процестеріндегі энергия алмасуды зерттеу.','Q = λm; Q = Lm','advanced',2,55),
(8,'Электр тогы','g8-current','Электр құбылыстары','Ток күші, заряд және уақыт арасындағы байланысты қолдану.','I = q/t','intermediate',3,50),
(8,'Ом заңы','g8-ohm','Электр құбылыстары','Кернеу мен кедергінің ток күшіне әсерін виртуалды тізбекте тексеру.','I = U/R','advanced',4,55),
(8,'Тізбектей және параллель жалғау','g8-circuits','Электр тізбектері','Тізбек бөліктерінің кернеу, ток және кедергі мәндерін салыстыру.','R = R₁ + R₂','advanced',5,60),
(8,'Электр жұмысы және қуат','g8-power','Электр энергиясы','Тұрмыстық құрылғылардың энергия шығынын есептеу.','P = UI; A = UIt','advanced',6,55),
(8,'Тұрақты магниттер','g8-magnets','Магнит өрісі','Магнит өрісінің бағыты мен күш сызықтарын модельдеу.','B өрісі','intermediate',7,50),
(8,'Жарықтың шағылуы','g8-reflection','Оптика','Түсу және шағылу бұрыштарын тәжірибемен салыстыру.','α = β','intermediate',8,50),
(8,'Линзалар','g8-lenses','Оптика','Кескіннің орналасуы мен өлшемін сәуле жолдары арқылы талдау.','1/F = 1/d + 1/f','advanced',9,60),
(8,'8-сынып инженерлік зерттеу','g8-capstone','Қорытынды жоба','Электр және оптика заңдарын инженерлік міндетте қолдану.','STEM жоба','advanced',10,70),
(9,'Түзусызықты қозғалыс','g9-kinematics','Кинематика','Қозғалыс теңдеулері мен графиктерін бір жүйеде талдау.','s = v₀t + at²/2','advanced',1,60),
(9,'Ньютон заңдары','g9-newton','Динамика','Күштерді ажыратып, дененің үдеуін модельдеу.','F = ma','advanced',2,60),
(9,'Гравитация','g9-gravity','Динамика','Бүкіләлемдік тартылыс күшін және еркін түсуді салыстыру.','F = Gm₁m₂/r²','advanced',3,60),
(9,'Импульстің сақталуы','g9-momentum','Сақталу заңдары','Соқтығысудағы импульс өзгерісін талдау.','p = mv','advanced',4,65),
(9,'Тербелістер','g9-oscillation','Тербелістер','Период пен жиіліктің параметрлерге тәуелділігін зерттеу.','T = 1/f','intermediate',5,55),
(9,'Толқындар','g9-waves','Толқындар','Толқын ұзындығы, жиілік және жылдамдық байланысын қолдану.','v = λf','advanced',6,60),
(9,'Дыбыс','g9-sound','Акустика','Дыбыстың биіктігі мен қаттылығын физикалық шамалар арқылы түсіндіру.','v = λf','intermediate',7,55),
(9,'Электромагниттік индукция','g9-induction','Электромагнетизм','Магнит ағыны өзгергендегі индукциялық токты талдау.','ε = -ΔΦ/Δt','advanced',8,65),
(9,'Атом құрылысы','g9-atom','Атомдық физика','Атом модельдерін және сәуле шығару процестерін салыстыру.','E = hν','advanced',9,60),
(9,'9-сынып зерттеу жобасы','g9-capstone','Қорытынды жоба','Механика мен толқындарды деректер арқылы біріктіру.','Зерттеу есебі','advanced',10,75),
(10,'Молекулалық-кинетикалық теория','g10-mkt','Молекулалық физика','Макропараметрлерді бөлшектер қозғалысымен байланыстыру.','p = nkT','advanced',1,65),
(10,'Идеал газ','g10-gas','Молекулалық физика','Газ күйі параметрлерінің өзгерісін модельдеу.','pV = νRT','advanced',2,65),
(10,'Термодинамиканың бірінші заңы','g10-thermo','Термодинамика','Жылу, ішкі энергия және жұмыс балансын талдау.','Q = ΔU + A','advanced',3,65),
(10,'Электр өрісі','g10-field','Электростатика','Өріс кернеулігі мен потенциалды салыстыру.','E = F/q','advanced',4,65),
(10,'Кулон заңы','g10-coulomb','Электростатика','Зарядтар арасындағы күшті параметрлер арқылы зерттеу.','F = kq₁q₂/r²','advanced',5,65),
(10,'Конденсаторлар','g10-capacitor','Электростатика','Сыйымдылық пен энергияның геометриялық параметрлерге тәуелділігін талдау.','C = q/U','advanced',6,65),
(10,'Тұрақты ток заңдары','g10-dc','Электродинамика','Толық тізбек және өткізгіш параметрлерін есептеу.','I = ε/(R+r)','advanced',7,70),
(10,'Магнит өрісіндегі күштер','g10-magnetic-force','Электродинамика','Ампер және Лоренц күштерін қолдану.','F = BIl sinα','advanced',8,70),
(10,'Электромагниттік индукция','g10-induction','Электродинамика','Фарадей заңының тәжірибелік деректерін талдау.','ε = -ΔΦ/Δt','advanced',9,70),
(10,'10-сынып ғылыми зерттеу','g10-capstone','Қорытынды жоба','Дерек, график және дәлелді қорытындыдан тұратын зерттеу.','Ғылыми әдіс','advanced',10,80),
(11,'Гармониялық тербелістер','g11-oscillation','Тербелістер','Гармониялық қозғалысты теңдеу және график арқылы зерттеу.','x = A cos(ωt)','advanced',1,70),
(11,'Айнымалы ток','g11-ac','Электродинамика','Айнымалы токтың әсерлік мәндерін және фазалық байланысын талдау.','I = Iₘ sin(ωt)','advanced',2,70),
(11,'Трансформатор','g11-transformer','Электромагнетизм','Кернеу мен орам саны байланысын инженерлік есепте қолдану.','U₁/U₂ = N₁/N₂','advanced',3,70),
(11,'Электромагниттік толқындар','g11-em-wave','Толқындар','ЭМ толқындардың қасиеттері мен спектрін талдау.','c = λf','advanced',4,70),
(11,'Интерференция','g11-interference','Толқындық оптика','Интерференциялық максимум шартын тәжірибемен талдау.','d sinφ = kλ','advanced',5,75),
(11,'Дифракция','g11-diffraction','Толқындық оптика','Дифракциялық тор арқылы толқын ұзындығын анықтау.','d sinφ = kλ','advanced',6,75),
(11,'Фотоэффект','g11-photoeffect','Кванттық физика','Фотоэффект теңдеуін эксперимент деректерімен байланыстыру.','hν = A + Eₖ','advanced',7,75),
(11,'Атом спектрлері','g11-spectrum','Атомдық физика','Спектр сызықтарын энергетикалық ауысулар арқылы түсіндіру.','ΔE = hν','advanced',8,75),
(11,'Ядролық физика','g11-nuclear','Ядролық физика','Радиоактивті ыдырауды график және модель арқылы талдау.','N = N₀·2^(-t/T)','advanced',9,75),
(11,'11-сынып зерттеу жобасы','g11-capstone','Қорытынды жоба','Күрделі физикалық модельді дәлелді зерттеу есебіне айналдыру.','Ғылыми жоба','advanced',10,90)
on conflict(slug) do update set title=excluded.title,section_title=excluded.section_title,description=excluded.description,formula=excluded.formula,difficulty=excluded.difficulty,order_index=excluded.order_index,estimated_minutes=excluded.estimated_minutes,updated_at=now();

-- Generate exactly 16 items per pack: 10 test, 5 calculation, 1 laboratory/practical task.
do $$
declare p record; i int; test_prompt text; calc_prompt text;
begin
 for p in select * from public.task_packs loop
  for i in 1..10 loop
    test_prompt := format('%s тақырыбы бойынша %s формуласының физикалық мағынасын және қолданылу шартын анықтаңыз. %s-нұсқа сұрақ.', p.title, coalesce(p.formula,'негізгі заң'), i);
    insert into public.task_pack_items(pack_id,kind,order_index,title,prompt,instruction,answer_type,options,correct_answer,explanation,skill_codes,max_score)
    values(p.id,'test',i,format('Тест %s',i),test_prompt,'Бір дұрыс жауапты таңдаңыз.','single_choice',jsonb_build_array(jsonb_build_object('id','a','text','Шамалар арасындағы тәуелділікті дұрыс түсіндіреді'),jsonb_build_object('id','b','text','Өлшем бірлігін ескермей тек санды қолданады'),jsonb_build_object('id','c','text','Формуланы кез келген жағдайда өзгеріссіз қолданады'),jsonb_build_object('id','d','text','Тәжірибе нәтижесін тек жаттап алуды талап етеді')),to_jsonb('a'::text),'Физикалық заңды қолданғанда шамалар байланысы, өлшем бірлігі және қолданылу шарты бірге ескеріледі.',array['concept_understanding','formula_application'],1)
    on conflict(pack_id,order_index) do nothing;
  end loop;
  for i in 1..5 loop
    calc_prompt := format('%s бойынша қолданбалы есеп %s. Берілген шамаларды SI жүйесіне келтіріп, %s формуласын қолданыңыз. Есептеу нәтижесін және шешу ретін жазыңыз.', p.title, i, coalesce(p.formula,'негізгі'));
    insert into public.task_pack_items(pack_id,kind,order_index,title,prompt,instruction,answer_type,correct_answer,explanation,skill_codes,max_score)
    values(p.id,'calculation',10+i,format('Есеп %s',i),calc_prompt,'Жауапты сан және қысқа шешу ретімен енгізіңіз.','text',null,'Есепті тексергенде формула таңдауы, SI түрлендіруі және есептеу дәлдігі бағаланады.',array['formula_application','unit_conversion','calculation','real_life_application'],3)
    on conflict(pack_id,order_index) do nothing;
  end loop;
  insert into public.task_pack_items(pack_id,kind,order_index,title,prompt,instruction,answer_type,correct_answer,explanation,skill_codes,max_score)
  values(p.id,'lab',16,'Зертханалық / практикалық жұмыс',format('%s тақырыбына байланысты шағын зерттеу жүргізіңіз. Кемінде 3 өлшеу жасаңыз, кесте құрыңыз, тәуелділік графигін сипаттаңыз және қорытынды жазыңыз.',p.title),'Жауапта құралдар, параметрлер, өлшеу кестесі, график сипаттамасы және қорытынды болуы керек.','manual_review',null,'Практикалық жұмыс мұғалім тексеруіне жіберіледі.',array['experiment_setup','measurement','graph_analysis','data_analysis','conclusion'],10)
  on conflict(pack_id,order_index) do nothing;
 end loop;
end $$;
