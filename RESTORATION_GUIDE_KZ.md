# Plan.Teach_kz толық реставрациясын енгізу нұсқаулығы

## 1. Не өзгерді

Бұл нұсқа бұрынғы ақпаратты және маршруттарды сақтай отырып, платформаның негізгі қабаттарын қайта құрады:

- басты бет: physics-grid, орбита, толқын және график анимациялары бар заманауи landing;
- өткірлеу блоктар: шағын radius, compact spacing, жинақы карточкалар;
- оқушы және мұғалім навигациясы өзгерген жоқ;
- 7–11 сыныптарға арналған тапсырмалар жүйесі: әр сыныпта 10 кешенді жұмыс;
- әр кешен ішінде: 10 тест, 5 есеп шығару тапсырмасы, 1 зертханалық немесе практикалық жұмыс;
- дұрыс жауаптар браузерге берілмейді, тек серверде тексеріледі;
- skill mastery, remediation, prerequisite, review queue және learning events дерекқорда сақталады;
- мұғалім ашық есептер мен зертханаларды қарап, әр тапсырмаға балл және пікір жаза алады;
- аналитика cinematic command-center стилінде қайта жасалды;
- 5 виртуалды 2D зертхана сақталды және олардың нәтижелері Supabase-ке жазылады.

## 2. Архивті жобаға енгізу

### 2.1. Архивті бөлек папкаға шығару

Мысалы, дайын ZIP файлын `Downloads` ішіне жүктедіңіз деп есептейміз:

```powershell
$ZipPath = "$env:USERPROFILE\Downloads\plan.teach-kz-restored.zip"
$ExtractPath = "$env:USERPROFILE\Downloads\plan.teach-kz-restored"

Remove-Item -LiteralPath $ExtractPath -Recurse -Force -ErrorAction SilentlyContinue
Expand-Archive -LiteralPath $ZipPath -DestinationPath $ExtractPath -Force
```

### 2.2. Автоматты енгізу скриптін іске қосу

```powershell
cd "$env:USERPROFILE\Downloads\plan.teach-kz-restored\plan.teach-kz-restored"

powershell.exe `
  -NoProfile `
  -ExecutionPolicy Bypass `
  -File ".\APPLY_RESTORATION.ps1" `
  -ProjectRoot "D:\Проекты\plan.teach-kz"
```

Скрипт:

1. бұрынғы жобаны уақыт белгісі бар backup папкасына көшіреді;
2. `D:\Проекты\plan.teach-kz\.git` және `.env.local` файлдарын сақтайды;
3. жаңа source файлдарын енгізеді;
4. `npm install`, `npm run lint`, `npm run build` командаларын іске қосады.

## 3. `.env.local` файлын толықтыру

`D:\Проекты\plan.teach-kz\.env.local` ішінде мына үш мән болуы керек:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
```

Маңызды:

- `SUPABASE_SERVICE_ROLE_KEY` тек серверде қолданылады;
- бұл кілтті `NEXT_PUBLIC_` префиксімен жазуға болмайды;
- GitHub-қа және браузерге жіберуге болмайды;
- `.env.local` архивке әдейі қосылған жоқ.

## 4. Supabase миграцияларын іске қосу

### Нұсқа A — Supabase CLI

```powershell
cd "D:\Проекты\plan.teach-kz"

npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

### Нұсқа B — Supabase SQL Editor

Supabase Dashboard ішіндегі SQL Editor-ге кіріп, мына файлды толық көшіріп іске қосыңыз:

```text
supabase\RESTORATION_MIGRATIONS_016_020.sql
```

Немесе миграцияларды жеке-жеке дәл осы ретпен орындаңыз:

```text
supabase\migrations\016_adaptive_skill_architecture.sql
supabase\migrations\017_task_packs_and_cinematic_analytics.sql
supabase\migrations\018_lab_catalog_seed.sql
supabase\migrations\019_enriched_task_pack_content.sql
supabase\migrations\020_server_write_only_rls.sql
```

## 5. Жобаны іске қосу

```powershell
cd "D:\Проекты\plan.teach-kz"
npm run dev
```

Браузерде ашыңыз:

```text
http://localhost:3000
```

## 6. Міндетті тексеру

```powershell
cd "D:\Проекты\plan.teach-kz"
npm run lint
npm run build
```

Тексерілетін негізгі беттер:

```text
/
/login
/register
/dashboard
/tasks
/labs
/results
/analytics
/teacher/dashboard
/teacher/students
/teacher/submissions
/teacher/analytics
```

## 7. Дерекқор арқылы жұмыс істейтін негізгі қабаттар

Миграциялар орындалғаннан кейін мына деректер Supabase арқылы жүреді:

- task packs және task-pack items;
- серверде тексерілетін дұрыс жауаптар;
- оқушы әрекеттері және idempotency key;
- skill mastery;
- adaptive recommendations;
- review queue;
- learning events;
- зертхана каталогы және зертхана нәтижелері;
- мұғалімнің бағасы мен пікірі.

Бұрынғы оқу контентінің локал fallback қабаты әдейі өшірілмеді. Оның міндеті — ескі ақпаратты жоғалтпау және миграция әлі іске қосылмаған кезде алдын ала көру режимін сақтау. Негізгі жаңа оқу ағыны миграциялар іске қосылғаннан кейін базаға сүйенеді.
