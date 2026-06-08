-- =========================================================
-- Plan.Teach_kz
-- 019_enriched_task_pack_content.sql
-- Enrich the generated task-pack bank with varied, evidence-based
-- prompts. The public view still excludes every correct_answer value.
-- =========================================================

do $$
declare
  p record;
  i int;
  prompts text[];
  titles text[];
  option_sets jsonb[];
  correct_ids text[];
  calc_prompts text[];
begin
  titles := array[
    'Модельді таңдау',
    'Графикті дәлелмен талдау',
    'Бақыланатын параметр',
    'SI жүйесін тексеру',
    'Эксперимент дәлелі',
    'Қате нәтижені диагностикалау',
    'Тәуелділікті анықтау',
    'Модель шекарасы',
    'Зерттеу жоспары',
    'Ғылыми қорытынды'
  ];

  prompts := array[
    '%1$s тақырыбында %2$s моделін қолданар алдында қандай тексеріс бірінші орындалуы керек?',
    '%1$s бойынша тәжірибеде график нүктелері теориялық сызықтан аздап ауытқыды. Ең ғылыми әрекетті таңдаңыз.',
    '%1$s заңындағы бір шаманың әсерін жеке анықтау үшін эксперимент қалай ұйымдастырылады?',
    '%1$s есебінде %2$s формуласын қолданғанда жасырын өлшем бірлігі қатесін болдырмайтын дұрыс тәсілді таңдаңыз.',
    '%1$s заңын тәжірибемен растауға қай дерек ең сенімді дәлел болады?',
    '%1$s есебінің жауабы күтілген шамадан 1000 есе артық шықты. Тексеруді неден бастаған дұрыс?',
    '%1$s бойынша тәуелділікті анықтау үшін графикпен жұмыс істеудің дұрыс ретін таңдаңыз.',
    '%1$s моделін кез келген жағдайда тікелей қолдануға болмайды. Неге?',
    '%1$s бойынша қысқа зерттеу жүргізу үшін қандай өлшеу жоспары жеткілікті дәлел береді?',
    '%1$s бойынша ғылыми қорытынды қандай түрде жазылуы керек?'
  ];

  option_sets := array[
    jsonb_build_array(
      jsonb_build_object('id','a','text','Тек формуланы жатқа жазу'),
      jsonb_build_object('id','b','text','Шамалардың физикалық мағынасын, SI бірлігін және модельдің қолданылу шартын тексеру'),
      jsonb_build_object('id','c','text','Бір ғана кездейсоқ өлшеуді пайдалану'),
      jsonb_build_object('id','d','text','График құрмай нәтижені дөңгелектеу')
    ),
    jsonb_build_array(
      jsonb_build_object('id','a','text','Ауытқуды жасырып, тек теориялық сызықты қалдыру'),
      jsonb_build_object('id','b','text','Бір нүктені өшіріп, қалғанын есептемеу'),
      jsonb_build_object('id','c','text','Өлшеуді қайталап, қателікті бағалап, ауытқудың себебін түсіндіру'),
      jsonb_build_object('id','d','text','Формула жарамсыз деп бірден қорытынды жасау')
    ),
    jsonb_build_array(
      jsonb_build_object('id','a','text','Бір параметрді өзгертіп, қалған маңызды параметрлерді тұрақты ұстау'),
      jsonb_build_object('id','b','text','Барлық параметрді бір уақытта өзгерту'),
      jsonb_build_object('id','c','text','Тек соңғы өлшеуді сақтау'),
      jsonb_build_object('id','d','text','Өлшеусіз тек теориялық тұжырым жазу')
    ),
    jsonb_build_array(
      jsonb_build_object('id','a','text','Сандарды бірден калькуляторға енгізу'),
      jsonb_build_object('id','b','text','Жауап шыққаннан кейін ғана бірліктерді қосу'),
      jsonb_build_object('id','c','text','Тек үлкен сандарды SI жүйесіне ауыстыру'),
      jsonb_build_object('id','d','text','Берілгендерді жазып, әр шаманы SI жүйесіне түрлендіріп, содан кейін формуланы қолдану')
    ),
    jsonb_build_array(
      jsonb_build_object('id','a','text','Бір рет алынған кез келген сан'),
      jsonb_build_object('id','b','text','Кемінде үш өлшеуден алынған кесте, сәйкес график және модельмен салыстырылған қорытынды'),
      jsonb_build_object('id','c','text','Тек формуланың атауы'),
      jsonb_build_object('id','d','text','Өлшем бірлігі көрсетілмеген нәтиже')
    ),
    jsonb_build_array(
      jsonb_build_object('id','a','text','Формуланың түсін өзгерту'),
      jsonb_build_object('id','b','text','График атауын өшіру'),
      jsonb_build_object('id','c','text','SI түрлендіруін және 10, 100, 1000 коэффициенттерін қайта тексеру'),
      jsonb_build_object('id','d','text','Қатені елемей жауапты дөңгелектеу')
    ),
    jsonb_build_array(
      jsonb_build_object('id','a','text','Осьтерді бірлікпен белгілеу, бірнеше нүкте енгізу, трендті талдау және формуламен салыстыру'),
      jsonb_build_object('id','b','text','Осьтерді атамай екі нүктені қосу'),
      jsonb_build_object('id','c','text','Тек ең үлкен нүктені көрсету'),
      jsonb_build_object('id','d','text','График орнына формуланы қайта көшіру')
    ),
    jsonb_build_array(
      jsonb_build_object('id','a','text','Барлық заң тек бір ғана санға арналған'),
      jsonb_build_object('id','b','text','Өлшем бірлігі физикада маңызды емес'),
      jsonb_build_object('id','c','text','Кез келген формула тек графиксіз жұмыс істейді'),
      jsonb_build_object('id','d','text','Әр модель нақты шарттар мен жуықтауларға сүйенеді; олар бұзылса нәтижені қайта бағалау керек')
    ),
    jsonb_build_array(
      jsonb_build_object('id','a','text','Бір өлшеу және дайын жауап'),
      jsonb_build_object('id','b','text','Кемінде үш түрлі параметр мәні, өлшеу кестесі, график және қателік туралы қысқа түсіндірме'),
      jsonb_build_object('id','c','text','Тек формула жазылған парақ'),
      jsonb_build_object('id','d','text','Бір параметрді өлшем бірлігінсіз көрсету')
    ),
    jsonb_build_array(
      jsonb_build_object('id','a','text','Тек соңғы санды жазу'),
      jsonb_build_object('id','b','text','Нәтижені дәлелсіз дұрыс деп атау'),
      jsonb_build_object('id','c','text','Дерекке сүйеніп заңдылықты сипаттау, модельмен салыстыру және ауытқудың ықтимал себебін көрсету'),
      jsonb_build_object('id','d','text','Графикті түсіндірмей көшіру')
    )
  ];

  correct_ids := array['b','c','a','d','b','c','a','d','b','c'];

  calc_prompts := array[
    '%1$s бойынша тура есеп құрыңыз: %2$s моделіндегі шамаларды физикалық мағынасына сай атаңыз, үш реалистік SI мәнін таңдаңыз және белгісіз шаманы толық шешу жолымен есептеңіз.',
    '%1$s бойынша кері есеп орындаңыз: %2$s формуласындағы нәтиже алдын ала берілді деп алып, қажетті параметрдің мәнін шығарыңыз. Формуланы түрлендіру қадамын бөлек көрсетіңіз.',
    '%1$s бойынша қате талдауын жасаңыз: оқушы SI түрлендіруінде бір коэффициентті қате қолданды деп есептеңіз. Қате жауаптың қалай өзгеретінін сандық мысалмен дәлелдеңіз.',
    '%1$s бойынша графиктік есеп орындаңыз: кемінде төрт мәннен тұратын деректер кестесін құрып, осьтерді бірлікпен белгілеңіз және график көлбеулігінің физикалық мағынасын түсіндіріңіз.',
    '%1$s бойынша инженерлік шешім ұсыныңыз: %2$s моделін қолданып, берілген нәтижеге жету үшін қай параметрді өзгерту тиімді екенін есеппен және қысқа негіздемемен көрсетіңіз.'
  ];

  for p in select id, title, formula from public.task_packs loop
    for i in 1..10 loop
      update public.task_pack_items
      set
        title = titles[i],
        prompt = format(prompts[i], p.title, coalesce(p.formula, 'негізгі физикалық заң')),
        instruction = 'Бір дұрыс жауапты таңдаңыз. Жауап формула жаттауды емес, физикалық пайымдауды тексереді.',
        options = option_sets[i],
        correct_answer = to_jsonb(correct_ids[i]),
        explanation = 'Физикалық модельді қолдануда формула, SI жүйесі, бақыланатын параметр, өлшеу дәлдігі және дерекке сүйенген қорытынды бірге қарастырылады.',
        skill_codes = case
          when i in (2,7,10) then array['graph_analysis','data_analysis','reasoning']
          when i in (4,6) then array['unit_conversion','calculation','reasoning']
          when i in (3,5,9) then array['experiment_setup','measurement','data_analysis']
          else array['concept_understanding','formula_application','reasoning']
        end
      where pack_id = p.id and kind = 'test' and order_index = i;
    end loop;

    for i in 1..5 loop
      update public.task_pack_items
      set
        title = case i
          when 1 then 'Тура есеп және SI жүйесі'
          when 2 then 'Кері есеп және формуланы түрлендіру'
          when 3 then 'Қате шешімді диагностикалау'
          when 4 then 'Кесте мен график арқылы талдау'
          else 'Инженерлік параметрді таңдау'
        end,
        prompt = format(calc_prompts[i], p.title, coalesce(p.formula, 'негізгі физикалық заң')),
        instruction = 'Формула, берілгендер, SI түрлендіруі, аралық есептеулер және қорытынды міндетті. Жұмысты мұғалім тексереді.',
        explanation = 'Ашық есепте тек соңғы сан емес, модельді таңдау, түрлендіру, дәлел және қорытынды бағаланады.',
        skill_codes = case i
          when 1 then array['formula_application','unit_conversion','calculation']
          when 2 then array['formula_application','calculation','reasoning']
          when 3 then array['unit_conversion','calculation','reasoning']
          when 4 then array['graph_analysis','data_analysis','calculation']
          else array['real_life_application','reasoning','calculation']
        end
      where pack_id = p.id and kind = 'calculation' and order_index = 10 + i;
    end loop;

    update public.task_pack_items
    set
      title = 'Зертханалық / практикалық зерттеу',
      prompt = format('%s тақырыбы бойынша виртуалды немесе қолжетімді құралдармен зерттеу жүргізіңіз. Бір тәуелсіз параметрді кемінде үш рет өзгертіңіз, қалған маңызды параметрлерді тұрақты ұстаңыз, өлшеу кестесін жасаңыз, графикті сипаттаңыз, қателік көзін атаңыз және дерекке сүйенген қорытынды жазыңыз.', p.title),
      instruction = 'Төмендегі 2D зертханаға өтуге болады. Жауапта құралдар, тұрақты және өзгеретін параметрлер, кемінде 3 өлшеу, график сипаттамасы, қателік көзі және қорытынды болуы керек.',
      explanation = 'Зертханалық жұмыс мұғалім тексеруіне жіберіледі және experiment, measurement, graph_analysis, data_analysis, conclusion дағдыларына әсер етеді.',
      skill_codes = array['experiment_setup','measurement','graph_analysis','data_analysis','conclusion']
    where pack_id = p.id and kind = 'lab' and order_index = 16;
  end loop;
end $$;
