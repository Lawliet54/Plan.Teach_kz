-- =========================================================
-- Plan.Teach_kz
-- 005_ktz_seed_skeleton.sql
-- 7-11 сынып КТЖ тақырыптарының skeleton seed
-- =========================================================

-- =========================================================
-- 1. Learning sections: 7-11
-- =========================================================

insert into public.learning_sections (grade, title, slug, description, order_index)
values
-- 7 grade
(7, 'Физика – табиғат туралы ғылым', 'g7-physics-nature', 'Физика пәніне кіріспе, табиғат құбылыстары және ғылыми әдіс.', 1),
(7, 'Физикалық шамалар мен өлшеулер', 'g7-measurements', 'SI жүйесі, өлшеу дәлдігі, скаляр және векторлық шамалар.', 2),
(7, 'Механикалық қозғалыс', 'g7-mechanical-motion', 'Санақ жүйесі, қозғалыс түрлері, жылдамдық және графиктер.', 3),
(7, 'Тығыздық', 'g7-density', 'Масса, көлем, тығыздық және өлшеу.', 4),
(7, 'Денелердің өзара әрекеттесуі', 'g7-interaction-forces', 'Күш, ауырлық, серпімділік, үйкеліс және тең әрекетті күш.', 5),
(7, 'Қысым', 'g7-pressure', 'Қатты денелер, сұйықтар, газдар, Паскаль және Архимед заңдары.', 6),
(7, 'Жұмыс, қуат және энергия', 'g7-work-power-energy', 'Механикалық жұмыс, қуат, энергияның сақталуы.', 7),
(7, 'Күш моменті және жай механизмдер', 'g7-moment-machines', 'Күш моменті, иіндік, пайдалы әрекет коэффициенті.', 8),
(7, 'Жер және ғарыш', 'g7-earth-space', 'Аспан денелері, Күн жүйесі, күнтізбе негіздері.', 9),

-- 8 grade
(8, 'Жылу құбылыстары', 'g8-thermal-phenomena', 'Жылулық қозғалыс, температура, ішкі энергия, жылу берілу.', 1),
(8, 'Агрегаттық күйлер', 'g8-states-of-matter', 'Балқу, қатаю, булану, конденсация және фазалық ауысулар.', 2),
(8, 'Термодинамика негіздері', 'g8-thermodynamics', 'Термодинамика заңдары, жылу қозғалтқыштары және ПӘК.', 3),
(8, 'Электростатика негіздері', 'g8-electrostatics', 'Электр заряды, Кулон заңы, электр өрісі және конденсатор.', 4),
(8, 'Тұрақты электр тогы', 'g8-direct-current', 'Ток, кернеу, кедергі, Ом заңы, тізбек жалғаулары.', 5),
(8, 'Электромагниттік құбылыстар', 'g8-electromagnetism', 'Магнит өрісі, электромагнит, электрқозғалтқыш және индукция.', 6),
(8, 'Жарық құбылыстары', 'g8-light-phenomena', 'Шағылу, сыну, айна, линза және оптикалық аспаптар.', 7),

-- 9 grade
(9, 'Кинематика негіздері', 'g9-kinematics', 'Материялық нүкте, вектор, теңайнымалы қозғалыс, еркін түсу.', 1),
(9, 'Астрономия негіздері', 'g9-astronomy', 'Жұлдызды аспан, аспан координаталары, Кеплер заңдары.', 2),
(9, 'Динамика негіздері', 'g9-dynamics', 'Ньютон заңдары, күштер, тартылыс, салмақсыздық.', 3),
(9, 'Сақталу заңдары', 'g9-conservation-laws', 'Импульс, энергия, жұмыс және сақталу заңдары.', 4),
(9, 'Тербелістер мен толқындар', 'g9-oscillations-waves', 'Маятник, тербеліс, толқын, дыбыс және резонанс.', 5),
(9, 'Атом құрылысы және ядролық физика', 'g9-atomic-nuclear', 'Атом, ядро, радиоактивтілік, ядролық энергия.', 6),
(9, 'Әлемнің қазіргі физикалық бейнесі', 'g9-modern-physics-picture', 'Физикалық әлем бейнесі, экологиялық мәдениет және технология.', 7),

-- 10 grade
(10, 'Кіріспе және физикалық өлшеулер', 'g10-intro-measurements', 'Физиканың рөлі, өлшеу қателіктері және эксперимент нәтижесін өңдеу.', 1),
(10, 'Кинематика', 'g10-kinematics', 'Теңүдемелі, қисықсызықты және лақтырылған дене қозғалысы.', 2),
(10, 'Динамика', 'g10-dynamics', 'Күштер, Ньютон заңдары, тартылыс, инерция моменті.', 3),
(10, 'Статика және сақталу заңдары', 'g10-statics-conservation', 'Массалар центрі, тепе-теңдік, импульс және энергия сақталуы.', 4),
(10, 'Сұйықтар мен газдардың механикасы', 'g10-fluid-mechanics', 'Гидродинамика, Бернулли теңдеуі, тұтқыр сұйық қозғалысы.', 5),
(10, 'Молекулалық-кинетикалық теория', 'g10-mkt', 'МКТ негіздері, идеал газ, температура және молекулалар қозғалысы.', 6),
(10, 'Газ заңдары және термодинамика', 'g10-gas-laws-thermodynamics', 'Идеал газ күйі, изопроцестер, термодинамика заңдары.', 7),
(10, 'Электростатика', 'g10-electrostatics', 'Электр өрісі, потенциал, конденсатор және өріс энергиясы.', 8),
(10, 'Тұрақты ток', 'g10-direct-current', 'Ом заңы, толық тізбек, ЭҚК, ішкі кедергі.', 9),
(10, 'Әртүрлі ортадағы электр тогы', 'g10-current-in-media', 'Металл, сұйық, газ және вакуумдағы электр тогы.', 10),
(10, 'Магнит өрісі және электромагниттік индукция', 'g10-magnetism-induction', 'Ампер күші, Лоренц күші, магнит ағыны және индукция.', 11),

-- 11 grade
(11, 'Механикалық тербелістер', 'g11-mechanical-oscillations', 'Гармоникалық тербелістер және олардың графиктері.', 1),
(11, 'Электромагниттік тербелістер', 'g11-em-oscillations', 'Еркін және еріксіз электромагниттік тербелістер.', 2),
(11, 'Айнымалы ток', 'g11-ac-current', 'Айнымалы ток, RLC тізбек, қуат, резонанс және трансформатор.', 3),
(11, 'Толқындық қозғалыс', 'g11-wave-motion', 'Механикалық толқындар, тұрғын толқындар және дыбыс жылдамдығы.', 4),
(11, 'Электромагниттік толқындар', 'g11-em-waves', 'Радиобайланыс, модуляция, байланыс арналары.', 5),
(11, 'Толқындық оптика', 'g11-wave-optics', 'Жарық жылдамдығы, дисперсия, интерференция, дифракция, поляризация.', 6),
(11, 'Геометриялық оптика', 'g11-geometrical-optics', 'Гюйгенс принципі, айналар, сыну, линза және оптикалық құралдар.', 7),
(11, 'Салыстырмалы теория элементтері', 'g11-relativity', 'Постулаттар, Лоренц түрлендірулері, релятивистік энергия және импульс.', 8),
(11, 'Атомдық және кванттық физика', 'g11-atomic-quantum', 'Сәулелену, спектрлер, Планк формуласы, фотоэффект, фотон.', 9),
(11, 'Атом ядросының физикасы', 'g11-nuclear-physics', 'Радиоактивтілік, ядролық реакциялар, бөлшектер тректері.', 10),
(11, 'Космология және физикалық практикум', 'g11-cosmology-practicum', 'Ғалам, жұлдыздар, практикалық өлшеулер және эксперименттер.', 11)
on conflict (grade, slug) do update set
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  updated_at = now();

-- =========================================================
-- 2. Topics skeleton
-- duplicate тақырыптар бір рет қана енгізіледі
-- =========================================================

insert into public.topics (
  grade, section_id, title, normalized_title, slug, description, ktz_order,
  content_type, content_status, level, has_bjb, source_note
)
values
-- 7 grade topics
(7, (select id from public.learning_sections where grade=7 and slug='g7-physics-nature'), 'Физика – табиғат туралы ғылым', lower('Физика – табиғат туралы ғылым'), 'g7-physics-nature-topic', 'Физика пәніне кіріспе және табиғат құбылыстары.', 1, 'lesson', 'ready', 'beginner', false, 'KTZ 7'),
(7, (select id from public.learning_sections where grade=7 and slug='g7-physics-nature'), 'Табиғатты зерттеудің ғылыми әдістері', lower('Табиғатты зерттеудің ғылыми әдістері'), 'g7-scientific-methods', null, 2, 'lesson', 'ready', 'beginner', false, 'KTZ 7'),
(7, (select id from public.learning_sections where grade=7 and slug='g7-measurements'), 'Халықаралық бірліктер жүйесі (SI)', lower('Халықаралық бірліктер жүйесі (SI)'), 'g7-si-units-topic', null, 3, 'lesson', 'ready', 'beginner', false, 'KTZ 7'),
(7, (select id from public.learning_sections where grade=7 and slug='g7-measurements'), 'Скаляр және векторлық физикалық шама', lower('Скаляр және векторлық физикалық шама'), 'g7-scalar-vector-topic', null, 4, 'lesson', 'ready', 'beginner', false, 'KTZ 7'),
(7, (select id from public.learning_sections where grade=7 and slug='g7-measurements'), 'Өлшеулер мен есептеулердің дәлдігі', lower('Өлшеулер мен есептеулердің дәлдігі'), 'g7-measurement-accuracy', null, 5, 'placeholder', 'placeholder', 'beginner', false, 'KTZ 7'),
(7, (select id from public.learning_sections where grade=7 and slug='g7-mechanical-motion'), 'Механикалық қозғалыс және санақ жүйесі', lower('Механикалық қозғалыс және санақ жүйесі'), 'g7-mechanical-motion-reference-frame', null, 8, 'placeholder', 'placeholder', 'beginner', false, 'KTZ 7'),
(7, (select id from public.learning_sections where grade=7 and slug='g7-mechanical-motion'), 'Қозғалыстың салыстырмалылығы', lower('Қозғалыстың салыстырмалылығы'), 'g7-relative-motion', null, 9, 'placeholder', 'placeholder', 'beginner', false, 'KTZ 7'),
(7, (select id from public.learning_sections where grade=7 and slug='g7-mechanical-motion'), 'Түзусызықты бірқалыпты және бірқалыпсыз қозғалыстар', lower('Түзусызықты бірқалыпты және бірқалыпсыз қозғалыстар'), 'g7-uniform-nonuniform-motion', null, 10, 'placeholder', 'placeholder', 'beginner', false, 'KTZ 7'),
(7, (select id from public.learning_sections where grade=7 and slug='g7-mechanical-motion'), 'Жылдамдық және орташа жылдамдықты есептеу', lower('Жылдамдық және орташа жылдамдықты есептеу'), 'g7-speed-average-speed-topic', null, 11, 'lesson', 'ready', 'beginner', false, 'KTZ 7 duplicate merged'),
(7, (select id from public.learning_sections where grade=7 and slug='g7-density'), 'Масса және денелердің массасын өлшеу', lower('Масса және денелердің массасын өлшеу'), 'g7-mass-measurement-topic', null, 17, 'placeholder', 'placeholder', 'beginner', false, 'KTZ 7'),
(7, (select id from public.learning_sections where grade=7 and slug='g7-density'), 'Дұрыс және дұрыс емес пішінді денелердің көлемін өлшеу', lower('Дұрыс және дұрыс емес пішінді денелердің көлемін өлшеу'), 'g7-volume-measurement', null, 18, 'placeholder', 'placeholder', 'beginner', false, 'KTZ 7'),
(7, (select id from public.learning_sections where grade=7 and slug='g7-density'), 'Заттың тығыздығы және тығыздықтың өлшем бірлігі', lower('Заттың тығыздығы және тығыздықтың өлшем бірлігі'), 'g7-density-unit-topic', null, 19, 'placeholder', 'placeholder', 'beginner', false, 'KTZ 7'),
(7, (select id from public.learning_sections where grade=7 and slug='g7-density'), 'Тығыздықты есептеу', lower('Тығыздықты есептеу'), 'g7-density-calculation', null, 21, 'placeholder', 'placeholder', 'beginner', true, 'KTZ 7 BJB'),
(7, (select id from public.learning_sections where grade=7 and slug='g7-interaction-forces'), 'Инерция құбылысы', lower('Инерция құбылысы'), 'g7-inertia', null, 22, 'placeholder', 'placeholder', 'beginner', false, 'KTZ 7'),
(7, (select id from public.learning_sections where grade=7 and slug='g7-interaction-forces'), 'Күш', lower('Күш'), 'g7-force', null, 23, 'placeholder', 'placeholder', 'beginner', false, 'KTZ 7'),
(7, (select id from public.learning_sections where grade=7 and slug='g7-interaction-forces'), 'Серпімділік күші, Гук заңы', lower('Серпімділік күші, Гук заңы'), 'g7-hooke-law', null, 27, 'placeholder', 'placeholder', 'beginner', false, 'KTZ 7'),
(7, (select id from public.learning_sections where grade=7 and slug='g7-pressure'), 'Қатты денелердегі қысым', lower('Қатты денелердегі қысым'), 'g7-solid-pressure-topic', null, 34, 'placeholder', 'placeholder', 'beginner', false, 'KTZ 7'),
(7, (select id from public.learning_sections where grade=7 and slug='g7-pressure'), 'Сұйықтар мен газдардағы қысым, Паскаль заңы', lower('Сұйықтар мен газдардағы қысым, Паскаль заңы'), 'g7-pascal-law', null, 36, 'placeholder', 'placeholder', 'beginner', false, 'KTZ 7 duplicate merged'),
(7, (select id from public.learning_sections where grade=7 and slug='g7-work-power-energy'), 'Механикалық жұмыс және қуат', lower('Механикалық жұмыс және қуат'), 'g7-work-power', null, 48, 'placeholder', 'placeholder', 'beginner', true, 'KTZ 7 BJB'),
(7, (select id from public.learning_sections where grade=7 and slug='g7-earth-space'), 'Күн жүйесі', lower('Күн жүйесі'), 'g7-solar-system', null, 65, 'placeholder', 'placeholder', 'beginner', false, 'KTZ 7'),

-- 8 grade topics
(8, (select id from public.learning_sections where grade=8 and slug='g8-thermal-phenomena'), 'Жылулық қозғалыс, броундық қозғалыс, диффузия', lower('Жылулық қозғалыс, броундық қозғалыс, диффузия'), 'g8-thermal-motion-diffusion', null, 1, 'lesson', 'ready', 'beginner', false, 'KTZ 8'),
(8, (select id from public.learning_sections where grade=8 and slug='g8-thermal-phenomena'), 'Температура және температура шкалалары', lower('Температура және температура шкалалары'), 'g8-temperature-scales', null, 2, 'lesson', 'ready', 'beginner', false, 'KTZ 8'),
(8, (select id from public.learning_sections where grade=8 and slug='g8-thermal-phenomena'), 'Ішкі энергия және оны өзгерту тәсілдері', lower('Ішкі энергия және оны өзгерту тәсілдері'), 'g8-internal-energy', null, 3, 'lesson', 'ready', 'beginner', false, 'KTZ 8'),
(8, (select id from public.learning_sections where grade=8 and slug='g8-thermal-phenomena'), 'Жылу өткізгіштік, конвекция, сәуле шығару', lower('Жылу өткізгіштік, конвекция, сәуле шығару'), 'g8-heat-transfer-types', null, 4, 'lesson', 'ready', 'beginner', false, 'KTZ 8'),
(8, (select id from public.learning_sections where grade=8 and slug='g8-thermal-phenomena'), 'Жылу мөлшері және меншікті жылу сыйымдылығы', lower('Жылу мөлшері және меншікті жылу сыйымдылығы'), 'g8-heat-amount-specific-heat', null, 7, 'lesson', 'ready', 'intermediate', false, 'KTZ 8'),
(8, (select id from public.learning_sections where grade=8 and slug='g8-electrostatics'), 'Денелердің электрленуі, электр заряды', lower('Денелердің электрленуі, электр заряды'), 'g8-electrification-charge', null, 23, 'placeholder', 'placeholder', 'intermediate', false, 'KTZ 8'),
(8, (select id from public.learning_sections where grade=8 and slug='g8-electrostatics'), 'Кулон заңы, элементар электр заряды', lower('Кулон заңы, элементар электр заряды'), 'g8-coulomb-law', null, 25, 'placeholder', 'placeholder', 'intermediate', false, 'KTZ 8 duplicate merged'),
(8, (select id from public.learning_sections where grade=8 and slug='g8-electrostatics'), 'Электр өрісі, электр өрісінің кернеулігі', lower('Электр өрісі, электр өрісінің кернеулігі'), 'g8-electric-field-strength', null, 27, 'placeholder', 'placeholder', 'intermediate', false, 'KTZ 8 duplicate merged'),
(8, (select id from public.learning_sections where grade=8 and slug='g8-direct-current'), 'Электр тогы, электр тогы көздері', lower('Электр тогы, электр тогы көздері'), 'g8-electric-current-sources', null, 33, 'placeholder', 'placeholder', 'intermediate', false, 'KTZ 8'),
(8, (select id from public.learning_sections where grade=8 and slug='g8-direct-current'), 'Тізбек бөлігі үшін Ом заңы', lower('Тізбек бөлігі үшін Ом заңы'), 'g8-ohm-law-circuit-part', null, 36, 'placeholder', 'placeholder', 'intermediate', false, 'KTZ 8'),
(8, (select id from public.learning_sections where grade=8 and slug='g8-direct-current'), 'Өткізгіштерді тізбектей және параллель жалғау', lower('Өткізгіштерді тізбектей және параллель жалғау'), 'g8-series-parallel-connections', null, 38, 'placeholder', 'placeholder', 'intermediate', false, 'KTZ 8'),
(8, (select id from public.learning_sections where grade=8 and slug='g8-electromagnetism'), 'Тұрақты магниттер, магнит өрісі', lower('Тұрақты магниттер, магнит өрісі'), 'g8-permanent-magnets-field', null, 46, 'placeholder', 'placeholder', 'intermediate', false, 'KTZ 8'),
(8, (select id from public.learning_sections where grade=8 and slug='g8-electromagnetism'), 'Электромагниттік индукция, генераторлар', lower('Электромагниттік индукция, генераторлар'), 'g8-electromagnetic-induction-generators', null, 50, 'placeholder', 'placeholder', 'intermediate', true, 'KTZ 8 BJB'),
(8, (select id from public.learning_sections where grade=8 and slug='g8-light-phenomena'), 'Жарықтың шағылуы, шағылу заңдары, жазық айналар', lower('Жарықтың шағылуы, шағылу заңдары, жазық айналар'), 'g8-reflection-mirrors', null, 54, 'placeholder', 'placeholder', 'intermediate', false, 'KTZ 8 duplicate merged'),
(8, (select id from public.learning_sections where grade=8 and slug='g8-light-phenomena'), 'Линзалар, линзаның оптикалық күші, жұқа линзаның формуласы', lower('Линзалар, линзаның оптикалық күші, жұқа линзаның формуласы'), 'g8-lenses-thin-lens-formula', null, 61, 'placeholder', 'placeholder', 'intermediate', false, 'KTZ 8'),

-- 9 grade topics
(9, (select id from public.learning_sections where grade=9 and slug='g9-kinematics'), 'Механикалық қозғалыс', lower('Механикалық қозғалыс'), 'g9-mechanical-motion', null, 1, 'lesson', 'ready', 'intermediate', false, 'KTZ 9'),
(9, (select id from public.learning_sections where grade=9 and slug='g9-kinematics'), 'Векторлар және оларға амалдар қолдану', lower('Векторлар және оларға амалдар қолдану'), 'g9-vectors-operations', null, 2, 'lesson', 'ready', 'intermediate', false, 'KTZ 9'),
(9, (select id from public.learning_sections where grade=9 and slug='g9-kinematics'), 'Түзусызықты теңайнымалы қозғалыс, үдеу', lower('Түзусызықты теңайнымалы қозғалыс, үдеу'), 'g9-uniformly-accelerated-motion', null, 3, 'lesson', 'ready', 'intermediate', false, 'KTZ 9'),
(9, (select id from public.learning_sections where grade=9 and slug='g9-kinematics'), 'Дененің еркін түсуі, еркін түсу үдеуі', lower('Дененің еркін түсуі, еркін түсу үдеуі'), 'g9-free-fall', null, 6, 'lesson', 'ready', 'intermediate', false, 'KTZ 9'),
(9, (select id from public.learning_sections where grade=9 and slug='g9-astronomy'), 'Күн жүйесіндегі ғаламшарлардың қозғалыс заңдары', lower('Күн жүйесіндегі ғаламшарлардың қозғалыс заңдары'), 'g9-kepler-laws', null, 13, 'lesson', 'ready', 'intermediate', false, 'KTZ 9'),
(9, (select id from public.learning_sections where grade=9 and slug='g9-dynamics'), 'Ньютонның бірінші заңы', lower('Ньютонның бірінші заңы'), 'g9-newton-first-law', null, 18, 'placeholder', 'placeholder', 'intermediate', false, 'KTZ 9'),
(9, (select id from public.learning_sections where grade=9 and slug='g9-dynamics'), 'Ньютонның екінші заңы, масса', lower('Ньютонның екінші заңы, масса'), 'g9-newton-second-law', null, 20, 'placeholder', 'placeholder', 'intermediate', false, 'KTZ 9 duplicate merged'),
(9, (select id from public.learning_sections where grade=9 and slug='g9-dynamics'), 'Ньютонның үшінші заңы', lower('Ньютонның үшінші заңы'), 'g9-newton-third-law', null, 22, 'placeholder', 'placeholder', 'intermediate', true, 'KTZ 9 BJB'),
(9, (select id from public.learning_sections where grade=9 and slug='g9-dynamics'), 'Бүкіләлемдік тартылыс заңы', lower('Бүкіләлемдік тартылыс заңы'), 'g9-gravitation-law', null, 25, 'placeholder', 'placeholder', 'intermediate', false, 'KTZ 9'),
(9, (select id from public.learning_sections where grade=9 and slug='g9-dynamics'), 'Дененің салмағы, салмақсыздық', lower('Дененің салмағы, салмақсыздық'), 'g9-weight-weightlessness', null, 26, 'placeholder', 'placeholder', 'intermediate', false, 'KTZ 9 duplicate merged'),
(9, (select id from public.learning_sections where grade=9 and slug='g9-conservation-laws'), 'Импульс және импульстің сақталу заңы', lower('Импульс және импульстің сақталу заңы'), 'g9-momentum-conservation', null, 33, 'placeholder', 'placeholder', 'intermediate', false, 'KTZ 9'),
(9, (select id from public.learning_sections where grade=9 and slug='g9-oscillations-waves'), 'Тербелістер және толқындар', lower('Тербелістер және толқындар'), 'g9-oscillations-waves-topic', null, 45, 'placeholder', 'placeholder', 'intermediate', false, 'KTZ 9'),
(9, (select id from public.learning_sections where grade=9 and slug='g9-atomic-nuclear'), 'Радиоактивтілік және жартылай ыдырау периоды', lower('Радиоактивтілік және жартылай ыдырау периоды'), 'g9-radioactivity-half-life', null, 60, 'placeholder', 'placeholder', 'intermediate', false, 'KTZ 9'),

-- 10 grade topics
(10, (select id from public.learning_sections where grade=10 and slug='g10-intro-measurements'), 'Қазіргі замандағы физиканың рөлі', lower('Қазіргі замандағы физиканың рөлі'), 'g10-role-of-physics', null, 1, 'lesson', 'ready', 'advanced', false, 'KTZ 10'),
(10, (select id from public.learning_sections where grade=10 and slug='g10-intro-measurements'), 'Физикалық шамалардың қателіктері. Өлшеулер нәтижесін өңдеу', lower('Физикалық шамалардың қателіктері. Өлшеулер нәтижесін өңдеу'), 'g10-measurement-errors', null, 2, 'lesson', 'ready', 'advanced', false, 'KTZ 10'),
(10, (select id from public.learning_sections where grade=10 and slug='g10-kinematics'), 'Теңүдемелі қозғалыс кинематикасының негізгі теңдеулері мен ұғымдары', lower('Теңүдемелі қозғалыс кинематикасының негізгі теңдеулері мен ұғымдары'), 'g10-accelerated-motion-equations', null, 3, 'lesson', 'ready', 'advanced', false, 'KTZ 10'),
(10, (select id from public.learning_sections where grade=10 and slug='g10-kinematics'), 'Галилейдің салыстырмалылық принципі', lower('Галилейдің салыстырмалылық принципі'), 'g10-galileo-relativity', null, 4, 'lesson', 'ready', 'advanced', false, 'KTZ 10'),
(10, (select id from public.learning_sections where grade=10 and slug='g10-dynamics'), 'Күштер. Күштерді қосу. Ньютон заңдары', lower('Күштер. Күштерді қосу. Ньютон заңдары'), 'g10-forces-newton-laws', null, 8, 'lesson', 'ready', 'advanced', false, 'KTZ 10 duplicate merged'),
(10, (select id from public.learning_sections where grade=10 and slug='g10-dynamics'), 'Бүкіләлемдік тартылыс заңы', lower('Бүкіләлемдік тартылыс заңы'), 'g10-gravitation-law', null, 11, 'placeholder', 'placeholder', 'advanced', false, 'KTZ 10'),
(10, (select id from public.learning_sections where grade=10 and slug='g10-fluid-mechanics'), 'Бернулли теңдеуі және көтергіш күш', lower('Бернулли теңдеуі және көтергіш күш'), 'g10-bernoulli-lift-force', null, 20, 'placeholder', 'placeholder', 'advanced', false, 'KTZ 10'),
(10, (select id from public.learning_sections where grade=10 and slug='g10-mkt'), 'Газдардың молекулалық-кинетикалық теориясының негізгі қағидалары', lower('Газдардың молекулалық-кинетикалық теориясының негізгі қағидалары'), 'g10-mkt-basic-principles', null, 25, 'placeholder', 'placeholder', 'advanced', false, 'KTZ 10'),
(10, (select id from public.learning_sections where grade=10 and slug='g10-gas-laws-thermodynamics'), 'Идеал газ күйінің теңдеуі', lower('Идеал газ күйінің теңдеуі'), 'g10-ideal-gas-equation', null, 30, 'placeholder', 'placeholder', 'advanced', false, 'KTZ 10'),
(10, (select id from public.learning_sections where grade=10 and slug='g10-electrostatics'), 'Электр өрісінің кернеулігі. Электр өрісінің потенциалы', lower('Электр өрісінің кернеулігі. Электр өрісінің потенциалы'), 'g10-electric-field-potential', null, 55, 'placeholder', 'placeholder', 'advanced', false, 'KTZ 10'),
(10, (select id from public.learning_sections where grade=10 and slug='g10-direct-current'), 'Толық тізбек үшін Ом заңы', lower('Толық тізбек үшін Ом заңы'), 'g10-full-circuit-ohm-law', null, 65, 'placeholder', 'placeholder', 'advanced', false, 'KTZ 10'),
(10, (select id from public.learning_sections where grade=10 and slug='g10-magnetism-induction'), 'Магнит өрісі және Ампер күші', lower('Магнит өрісі және Ампер күші'), 'g10-magnetic-field-ampere-force', null, 79, 'placeholder', 'placeholder', 'advanced', false, 'KTZ 10'),
(10, (select id from public.learning_sections where grade=10 and slug='g10-magnetism-induction'), 'Электромагниттік индукция құбылысы', lower('Электромагниттік индукция құбылысы'), 'g10-electromagnetic-induction', null, 90, 'placeholder', 'placeholder', 'advanced', false, 'KTZ 10'),

-- 11 grade topics
(11, (select id from public.learning_sections where grade=11 and slug='g11-mechanical-oscillations'), 'Гармоникалық тербелістердің теңдеулері мен графиктері', lower('Гармоникалық тербелістердің теңдеулері мен графиктері'), 'g11-harmonic-oscillation-equations', null, 1, 'lesson', 'ready', 'advanced', false, 'KTZ 11 duplicate merged'),
(11, (select id from public.learning_sections where grade=11 and slug='g11-em-oscillations'), 'Еркін және еріксіз электромагниттік тербелістер', lower('Еркін және еріксіз электромагниттік тербелістер'), 'g11-free-forced-em-oscillations', null, 3, 'lesson', 'ready', 'advanced', false, 'KTZ 11 duplicate merged'),
(11, (select id from public.learning_sections where grade=11 and slug='g11-ac-current'), 'Айнымалы ток генераторы', lower('Айнымалы ток генераторы'), 'g11-ac-generator', null, 7, 'lesson', 'ready', 'advanced', false, 'KTZ 11'),
(11, (select id from public.learning_sections where grade=11 and slug='g11-ac-current'), 'Айнымалы ток тізбегінде активті және реактивті кедергі', lower('Айнымалы ток тізбегінде активті және реактивті кедергі'), 'g11-active-reactive-resistance', null, 10, 'lesson', 'ready', 'advanced', false, 'KTZ 11 duplicate merged'),
(11, (select id from public.learning_sections where grade=11 and slug='g11-ac-current'), 'Электр тізбегіндегі кернеу резонансы', lower('Электр тізбегіндегі кернеу резонансы'), 'g11-voltage-resonance', null, 16, 'placeholder', 'placeholder', 'advanced', false, 'KTZ 11 duplicate merged'),
(11, (select id from public.learning_sections where grade=11 and slug='g11-wave-motion'), 'Серпімді механикалық толқындар', lower('Серпімді механикалық толқындар'), 'g11-elastic-mechanical-waves', null, 25, 'placeholder', 'placeholder', 'advanced', false, 'KTZ 11 duplicate merged'),
(11, (select id from public.learning_sections where grade=11 and slug='g11-em-waves'), 'Радиобайланыс. Детекторлы радиоқабылдағыш', lower('Радиобайланыс. Детекторлы радиоқабылдағыш'), 'g11-radio-communication-detector', null, 32, 'placeholder', 'placeholder', 'advanced', false, 'KTZ 11 duplicate merged'),
(11, (select id from public.learning_sections where grade=11 and slug='g11-wave-optics'), 'Жарықтың дисперсиясы. Жарықтың интерференциясы', lower('Жарықтың дисперсиясы. Жарықтың интерференциясы'), 'g11-light-dispersion-interference', null, 41, 'placeholder', 'placeholder', 'advanced', false, 'KTZ 11 duplicate merged'),
(11, (select id from public.learning_sections where grade=11 and slug='g11-wave-optics'), 'Жарықтың дифракциясы. Дифракциялық торлар', lower('Жарықтың дифракциясы. Дифракциялық торлар'), 'g11-diffraction-grating', null, 44, 'placeholder', 'placeholder', 'advanced', false, 'KTZ 11'),
(11, (select id from public.learning_sections where grade=11 and slug='g11-geometrical-optics'), 'Гюйгенс принципі. Жарықтың шағылу заңы', lower('Гюйгенс принципі. Жарықтың шағылу заңы'), 'g11-huygens-reflection', null, 49, 'placeholder', 'placeholder', 'advanced', false, 'KTZ 11'),
(11, (select id from public.learning_sections where grade=11 and slug='g11-relativity'), 'Салыстырмалы теорияның постулаттары', lower('Салыстырмалы теорияның постулаттары'), 'g11-relativity-postulates', null, 54, 'placeholder', 'placeholder', 'advanced', false, 'KTZ 11'),
(11, (select id from public.learning_sections where grade=11 and slug='g11-atomic-quantum'), 'Сәулеленудің түрлері. Спектрлер', lower('Сәулеленудің түрлері. Спектрлер'), 'g11-radiation-types-spectra', null, 58, 'placeholder', 'placeholder', 'advanced', false, 'KTZ 11'),
(11, (select id from public.learning_sections where grade=11 and slug='g11-atomic-quantum'), 'Фотоэффект және фотондар', lower('Фотоэффект және фотондар'), 'g11-photoeffect-photons', null, 64, 'placeholder', 'placeholder', 'advanced', false, 'KTZ 11'),
(11, (select id from public.learning_sections where grade=11 and slug='g11-nuclear-physics'), 'Радиоактивтілік және ядролық реакциялар', lower('Радиоактивтілік және ядролық реакциялар'), 'g11-radioactivity-nuclear-reactions', null, 72, 'placeholder', 'placeholder', 'advanced', false, 'KTZ 11')
on conflict (grade, normalized_title) do update set
  section_id = excluded.section_id,
  title = excluded.title,
  slug = excluded.slug,
  description = excluded.description,
  ktz_order = excluded.ktz_order,
  content_type = excluded.content_type,
  content_status = excluded.content_status,
  level = excluded.level,
  has_bjb = excluded.has_bjb,
  source_note = excluded.source_note,
  updated_at = now();

-- =========================================================
-- 3. Labs skeleton
-- =========================================================

insert into public.labs (
  grade, topic_id, title, normalized_title, slug, description, instruction,
  content_status, order_index
)
values
-- 7
(7, null, 'Физикалық шамаларды өлшеу', lower('Физикалық шамаларды өлшеу'), 'g7-lab-measuring-physical-quantities', 'Ұзындық, көлем, температура және уақытты өлшеу.', 'Өлшеу құралын таңдаңыз, шкала бөлік құнын анықтаңыз, нәтижені кестеге енгізіңіз, қорытынды жазыңыз.', 'ready', 1),
(7, null, 'Кішкентай денелердің өлшемін анықтау', lower('Кішкентай денелердің өлшемін анықтау'), 'g7-lab-small-body-size', 'Қатарлау әдісі арқылы кішкентай дененің өлшемін анықтау.', null, 'placeholder', 2),
(7, null, 'Сұйықтар мен қатты денелердің тығыздығын анықтау', lower('Сұйықтар мен қатты денелердің тығыздығын анықтау'), 'g7-lab-density-liquid-solid', 'Масса мен көлем арқылы тығыздықты анықтау.', null, 'placeholder', 3),
(7, null, 'Серпімді деформацияларды зерделеу', lower('Серпімді деформацияларды зерделеу'), 'g7-lab-elastic-deformation', 'Серіппе ұзаруы мен серпімділік күшінің байланысын зерттеу.', null, 'placeholder', 4),
(7, null, 'Архимед заңын зерделеу', lower('Архимед заңын зерделеу'), 'g7-lab-archimedes-law', 'Кері итеруші күштің көлемге тәуелділігін зерттеу.', null, 'placeholder', 5),

-- 8
(8, null, 'Температуралары әр түрлі суды араластырғандағы жылу мөлшерлерін салыстыру', lower('Температуралары әр түрлі суды араластырғандағы жылу мөлшерлерін салыстыру'), 'g8-lab-mixing-water-heat', 'Жылу алмасуда энергия сақталуын зерттеу.', null, 'placeholder', 1),
(8, null, 'Мұздың меншікті балқу жылуын анықтау', lower('Мұздың меншікті балқу жылуын анықтау'), 'g8-lab-ice-melting-heat', 'Мұздың балқу жылуын тәжірибе арқылы анықтау.', null, 'placeholder', 2),
(8, null, 'Электр тізбегін құрастыру және ток күші мен кернеуді өлшеу', lower('Электр тізбегін құрастыру және ток күші мен кернеуді өлшеу'), 'g8-lab-electric-circuit-current-voltage', 'Тізбек құрып, амперметр және вольтметрмен өлшеу.', null, 'ready', 3),
(8, null, 'Ток күшінің кернеуге және кедергіге тәуелділігін зерттеу', lower('Ток күшінің кернеуге және кедергіге тәуелділігін зерттеу'), 'g8-lab-ohm-law-dependence', 'Ом заңын график арқылы зерттеу.', null, 'ready', 4),
(8, null, 'Жұқа линзаның фокустық қашықтығын және оптикалық күшін анықтау', lower('Жұқа линзаның фокустық қашықтығын және оптикалық күшін анықтау'), 'g8-lab-thin-lens-focus', 'Жұқа линзаның фокусын тәжірибе арқылы анықтау.', null, 'ready', 11),

-- 9
(9, null, 'Теңүдемелі қозғалыс кезіндегі дененің үдеуін анықтау', lower('Теңүдемелі қозғалыс кезіндегі дененің үдеуін анықтау'), 'g9-lab-acceleration-uniform-motion', 'Теңүдемелі қозғалыста үдеуді эксперименттік анықтау.', null, 'ready', 1),
(9, null, 'Горизонталь лақтырылған дененің қозғалысын зерделеу', lower('Горизонталь лақтырылған дененің қозғалысын зерделеу'), 'g9-lab-horizontal-projectile', 'Горизонталь лақтырылған дене траекториясын зерттеу.', null, 'placeholder', 2),
(9, null, 'Математикалық маятниктің көмегімен еркін түсу үдеуін анықтау', lower('Математикалық маятниктің көмегімен еркін түсу үдеуін анықтау'), 'g9-lab-pendulum-free-fall', 'Маятник периоды арқылы g мәнін анықтау.', null, 'ready', 3),
(9, null, 'Беттік толқындардың таралу жылдамдығын анықтау', lower('Беттік толқындардың таралу жылдамдығын анықтау'), 'g9-lab-surface-wave-speed', 'Толқын ұзындығы мен жиілік арқылы жылдамдықты анықтау.', null, 'placeholder', 4),

-- 10
(10, null, 'Көлбеу жазықтық бойымен қозғалатын дененің үдеуін анықтау', lower('Көлбеу жазықтық бойымен қозғалатын дененің үдеуін анықтау'), 'g10-lab-inclined-plane-acceleration', 'Көлбеу жазықтықтағы қозғалыс үдеуін өлшеу.', null, 'ready', 1),
(10, null, 'Бір-біріне бұрыш жасай бағытталған күштерді қосу', lower('Бір-біріне бұрыш жасай бағытталған күштерді қосу'), 'g10-lab-force-addition-angle', 'Күштерді векторлық қосу заңдылығын тексеру.', null, 'placeholder', 2),
(10, null, 'Тұтқыр сұйықта қозғалатын кішкентай шардың жылдамдығының радиусқа тәуелділігін зерттеу', lower('Тұтқыр сұйықта қозғалатын кішкентай шардың жылдамдығының радиусқа тәуелділігін зерттеу'), 'g10-lab-viscous-liquid-ball', 'Стокс заңы және тұтқыр ортадағы қозғалыс.', null, 'placeholder', 3),
(10, null, 'Өткізгіштерді аралас жалғауды оқып үйрену', lower('Өткізгіштерді аралас жалғауды оқып үйрену'), 'g10-lab-mixed-resistor-connection', 'Аралас жалғанған өткізгіштер тізбегін зерттеу.', null, 'ready', 4),

-- 11
(11, null, 'Ауадағы дыбыстың жылдамдығын анықтау', lower('Ауадағы дыбыстың жылдамдығын анықтау'), 'g11-lab-sound-speed-air', 'Ауадағы дыбыс жылдамдығын тәжірибелік анықтау.', null, 'ready', 1),
(11, null, 'Жарықтың интерференциясын, дифракциясын және поляризациясын бақылау', lower('Жарықтың интерференциясын, дифракциясын және поляризациясын бақылау'), 'g11-lab-wave-optics-observation', 'Жарықтың толқындық қасиеттерін бақылау.', null, 'ready', 2),
(11, null, 'Шынының сыну көрсеткішін анықтау', lower('Шынының сыну көрсеткішін анықтау'), 'g11-lab-glass-refractive-index', 'Сыну заңы арқылы шынының сыну көрсеткішін анықтау.', null, 'ready', 3),
(11, null, 'Сәулеленудің тұтас және сызықтық спектрлерін бақылау', lower('Сәулеленудің тұтас және сызықтық спектрлерін бақылау'), 'g11-lab-spectra-observation', 'Спектрлерді бақылау және салыстыру.', null, 'placeholder', 4)
on conflict (grade, normalized_title) do update set
  title = excluded.title,
  slug = excluded.slug,
  description = excluded.description,
  instruction = excluded.instruction,
  content_status = excluded.content_status,
  order_index = excluded.order_index,
  updated_at = now();

-- =========================================================
-- 4. Project tasks skeleton
-- Практикалық жұмыстар project/creative task ретінде беріледі
-- =========================================================

insert into public.project_tasks (
  grade, topic_id, title, normalized_title, slug, description, instruction,
  submission_type, content_status, max_score, order_index
)
values
(7, null, 'Аспап шкаласындағы бөліктің құнын анықтау', lower('Аспап шкаласындағы бөліктің құнын анықтау'), 'g7-project-scale-division', 'Өлшеу аспабының шкаласын талдау және бөлік құнын есептеу.', 'Аспап шкаласының суретін немесе моделін қарап, бөлік құнын анықтаңыз. Жауапты есептеу жолымен бірге жазыңыз.', 'mixed', 'ready', 20, 1),
(7, null, 'Координатаның уақытқа тәуелділік графигін зерттеу', lower('Координатаның уақытқа тәуелділік графигін зерттеу'), 'g7-project-coordinate-time-graph', 'Қозғалыс графигін оқып, қозғалыс түрін сипаттау.', null, 'mixed', 'placeholder', 20, 2),
(8, null, 'Фазалық ауысу графигін зерттеу', lower('Фазалық ауысу графигін зерттеу'), 'g8-project-phase-transition-graph', 'Заттың агрегаттық күйі өзгергендегі температура-уақыт графигін талдау.', null, 'mixed', 'placeholder', 20, 1),
(8, null, 'Қарапайым перископ жасау', lower('Қарапайым перископ жасау'), 'g8-project-simple-periscope', 'Оптика заңдарын қолданып, қарапайым перископ моделін жасау.', null, 'file', 'placeholder', 20, 2),
(9, null, 'Маятник тербелісінің периодын зерттеу', lower('Маятник тербелісінің периодын зерттеу'), 'g9-project-pendulum-period', 'Маятник ұзындығы мен период арасындағы байланысты зерттеу.', null, 'mixed', 'ready', 20, 1),
(9, null, 'Радиоактивті элементтердің жартылай ыдырау периодын есептеу', lower('Радиоактивті элементтердің жартылай ыдырау периодын есептеу'), 'g9-project-half-life-calculation', 'Жартылай ыдырау графигін талдау және есептеу.', null, 'mixed', 'placeholder', 20, 2),
(10, null, 'Көкжиекке бұрыш жасай лақтырылған дененің қозғалысын модельдеу', lower('Көкжиекке бұрыш жасай лақтырылған дененің қозғалысын модельдеу'), 'g10-project-projectile-motion', 'Бастапқы жылдамдық пен бұрышты өзгертіп, траекторияны талдау.', null, 'mixed', 'ready', 20, 1),
(10, null, 'Газ заңдарын графиктік есептерде қолдану', lower('Газ заңдарын графиктік есептерде қолдану'), 'g10-project-gas-laws-graphs', 'Изопроцестер графиктерін талдау және есептер шығару.', null, 'mixed', 'placeholder', 20, 2),
(11, null, 'Айнымалы ток графигін компьютерлік модельдеу', lower('Айнымалы ток графигін компьютерлік модельдеу'), 'g11-project-ac-graph-modeling', 'Ток пен кернеудің уақытқа тәуелді графигін модельдеу.', null, 'mixed', 'ready', 20, 1),
(11, null, 'Радиоқабылдағыш моделін жинау', lower('Радиоқабылдағыш моделін жинау'), 'g11-project-radio-receiver', 'Детекторлы радиоқабылдағыштың жұмыс принципін жобалық түрде түсіндіру.', null, 'file', 'placeholder', 20, 2)
on conflict (grade, normalized_title) do update set
  title = excluded.title,
  slug = excluded.slug,
  description = excluded.description,
  instruction = excluded.instruction,
  submission_type = excluded.submission_type,
  content_status = excluded.content_status,
  max_score = excluded.max_score,
  order_index = excluded.order_index,
  updated_at = now();

-- =========================================================
-- 5. Assessments skeleton
-- =========================================================

create unique index if not exists assessments_grade_type_title_idx
on public.assessments (grade, assessment_type, title);

insert into public.assessments (
  grade, topic_id, assessment_type, title, term, description,
  max_score, content_status, order_index
)
values
(7, null, 'bjb', 'БЖБ: Физикалық шамалар мен өлшеулер', 1, '7-сынып 1-тоқсан бөлімдік бағалау.', 20, 'placeholder', 1),
(7, null, 'tjb', 'ТЖБ: 1-тоқсан', 1, '7-сынып 1-тоқсан жиынтық бағалау.', 30, 'placeholder', 2),
(8, null, 'bjb', 'БЖБ: Жылу құбылыстары', 1, '8-сынып жылу құбылыстары бойынша БЖБ.', 20, 'placeholder', 1),
(8, null, 'tjb', 'ТЖБ: 1-тоқсан', 1, '8-сынып 1-тоқсан жиынтық бағалау.', 30, 'placeholder', 2),
(9, null, 'bjb', 'БЖБ: Кинематика негіздері', 1, '9-сынып кинематика бойынша БЖБ.', 20, 'placeholder', 1),
(9, null, 'tjb', 'ТЖБ: 1-тоқсан', 1, '9-сынып 1-тоқсан жиынтық бағалау.', 30, 'placeholder', 2),
(10, null, 'bjb', 'БЖБ: Кинематика және динамика', 1, '10-сынып механика бөлімдері бойынша БЖБ.', 20, 'placeholder', 1),
(10, null, 'tjb', 'ТЖБ: 1-тоқсан', 1, '10-сынып 1-тоқсан жиынтық бағалау.', 30, 'placeholder', 2),
(11, null, 'bjb', 'БЖБ: Айнымалы ток', 1, '11-сынып айнымалы ток бөлімі бойынша БЖБ.', 20, 'placeholder', 1),
(11, null, 'tjb', 'ТЖБ: 1-тоқсан', 1, '11-сынып 1-тоқсан жиынтық бағалау.', 30, 'placeholder', 2)
on conflict (grade, assessment_type, title) do update set
  term = excluded.term,
  description = excluded.description,
  max_score = excluded.max_score,
  content_status = excluded.content_status,
  order_index = excluded.order_index,
  updated_at = now();