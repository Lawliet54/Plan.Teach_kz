-- =========================================================
-- 018_lab_catalog_seed.sql
-- Virtual laboratory catalog seed. Simulation configuration
-- remains in the application, while catalog metadata and every
-- completed experiment are persisted in Supabase.
-- =========================================================

insert into public.labs (
  grade,
  title,
  normalized_title,
  slug,
  description,
  instruction,
  requires_table,
  requires_graph,
  requires_conclusion,
  content_status,
  order_index,
  is_active
)
values
  (
    7,
    'Ньютонның екінші заңын зерттеу',
    'ньютонның екінші заңын зерттеу',
    'newton-second-law',
    'Күш пен масса өзгергенде үдеу қалай өзгеретінін өлшеп, a = F / m тәуелділігін тексеріңіз.',
    'Кемінде үш түрлі параметр таңдаңыз, өлшеулерді кестеге енгізіңіз, графикті талдап, қорытынды жазыңыз.',
    true, true, true, 'ready', 10, true
  ),
  (
    7,
    'Гук заңын зерттеу',
    'гук заңын зерттеу',
    'hooke-law',
    'Серіппенің ұзаруын өлшеп, күш пен ұзару арасындағы F = kx тәуелділігін тексеріңіз.',
    'Кемінде үш түрлі күш мәнін таңдаңыз, өлшеулерді салыстырыңыз және сызықтық тәуелділік туралы қорытынды жазыңыз.',
    true, true, true, 'ready', 20, true
  ),
  (
    7,
    'Архимед күшін зерттеу',
    'архимед күшін зерттеу',
    'archimedes-law',
    'Сұйықтық түрі, көлем және бату деңгейіне қарай Архимед күшінің өзгерісін өлшеңіз.',
    'Сұйықтық тығыздығын және батырылған көлемді өзгертіп, кемінде үш өлшеу жүргізіңіз.',
    true, true, true, 'ready', 30, true
  ),
  (
    8,
    'Ом заңын зерттеу',
    'ом заңын зерттеу',
    'ohm-law',
    'Кернеу мен кедергіні өзгертіп, ток күші I = U / R тәуелділігін өлшеңіз.',
    'Кернеу мен кедергіні өзгертіңіз, ток күшін салыстырыңыз және график бойынша қорытынды жазыңыз.',
    true, true, true, 'ready', 40, true
  ),
  (
    7,
    'Жарықтың шағылу заңын зерттеу',
    'жарықтың шағылу заңын зерттеу',
    'reflection-law',
    'Түсу бұрышын өзгертіп, шағылу бұрышының α = β теңдігін тексеріңіз.',
    'Әртүрлі түсу бұрыштарын орнатыңыз, шағылу бұрышын өлшеңіз және заңдылықты тұжырымдаңыз.',
    true, true, true, 'ready', 50, true
  )
on conflict (grade, normalized_title)
do update set
  slug = excluded.slug,
  title = excluded.title,
  description = excluded.description,
  instruction = excluded.instruction,
  requires_table = excluded.requires_table,
  requires_graph = excluded.requires_graph,
  requires_conclusion = excluded.requires_conclusion,
  content_status = excluded.content_status,
  order_index = excluded.order_index,
  is_active = excluded.is_active,
  updated_at = now();
