# Отчёт: фаза 0 «Каркас» + начало фазы 1 (токены)

Дата: 11.09.2026. Репозиторий: `~/Documents/GitHub/cubby-ui`.
Исходное имя в ТЗ было «Kist UI»; переименовано в **Cubby UI** по решению Сергея по ходу работы,
в репозитории не осталось ни одного упоминания старого имени (`grep -ri kist` — пусто).

Что сделано: монорепо, конвейер токенов из `tokens.json` в четыре артефакта, реестр shadcn с одним
рабочим элементом, CI, документы. Компонентов нет — это следующая задача.

---

## 1. Дерево

```
cubby-ui/
├─ .changeset/            config.json (schema 4.0.0) + README
├─ .github/workflows/     ci.yml
├─ .editorconfig  .gitignore  .nvmrc (26)
├─ AGENTS.md              правила для контрибьюторов и агентов
├─ LICENSE                MIT, Copyright (c) 2026 Sergey Orshak
├─ README.md              по-английски: что это, установка, credits
├─ SCAFFOLD-REPORT.md     этот файл
├─ THIRD-PARTY-NOTICES.md раздел beUI с пометкой TODO
├─ package.json           private, scripts: build/test/typecheck/lint/
│                         tokens:build/tokens:check/registry:build/registry:validate
├─ pnpm-workspace.yaml    apps/*, packages/*, allowBuilds
├─ registry.json          каталог реестра — в КОРНЕ (требование GitHub-реестра)
├─ tsconfig.base.json     общий строгий конфиг
├─ turbo.json
├─ apps/
│  └─ www/README.md       фаза 2 (форк оболочки beUI) — только описание
└─ packages/
   ├─ tokens/             @cubby-ui/tokens (private)
   │  ├─ SOURCE.md        откуда tokens.json, дата, sha256, что это источник правды
   │  ├─ README.md        правило имён, единицы, каскад, Tailwind-неймспейсы
   │  ├─ package.json  tsconfig.json
   │  ├─ src/
   │  │  ├─ tokens.json   копия экспорта Figma (не менялась, sha256 сходится)
   │  │  ├─ schema.ts     типы экспорта
   │  │  ├─ resolve.ts    резолвер алиасов + правило имён
   │  │  ├─ format.ts     единицы, шрифтовые веса, тени
   │  │  └─ build.ts      генератор
   │  ├─ test/
   │  │  ├─ resolve.test.ts    12 тестов резолвера
   │  │  └─ artifacts.test.ts  7 тестов артефактов, включая живую сборку Tailwind
   │  └─ dist/            КОММИТИТСЯ
   │     ├─ tokens.css        321 объявление, 275 уникальных имён
   │     ├─ theme.css         @theme inline
   │     ├─ tokens.ts         типизированный объект для RN
   │     └─ tokens.paper.json 275 токенов, плоская карта имя → {dark, light}
   ├─ registry/           @cubby-ui/registry
   │  ├─ README.md        обоснование типа элемента и целевых путей
   │  └─ src/{ui,lib,demos}/  пока пустые
   └─ native/README.md    фаза 4 (NativeWind + @rn-primitives) — только описание

public/r/                 сборка реестра, в .gitignore
```

`packages/core` не создавался: пакет `cn` (0.2.6) из npm заменяет `lib/utils.ts` — с сентября 2026
это официальный путь shadcn, `cn` объявляется обычной зависимостью элемента реестра.

## 2. Версии

Всё проверено `npm view <pkg> version` 11.09.2026, ничего не взято по памяти.

| Пакет | Версия | Где |
|---|---|---|
| node | 26.8.1 | `~/.local/bin/node`, `.nvmrc` = 26, `engines.node` ≥ 22.18 |
| npm | 11.19.0 | — |
| pnpm | **12.4.1** | поставлен `npm i -g pnpm@latest` в пользовательский префикс, глобальная установка удалась, `npx pnpm` не понадобился |
| turbo | 2.10.12 | devDependency |
| typescript | 7.0.2 | devDependency, только `tsc --noEmit` |
| @changesets/cli | 3.0.2 | devDependency |
| @types/node | 22.20.2 | devDependency |
| shadcn | 4.21.0 | devDependency + `npx` в смоук-тесте |
| tailwindcss / @tailwindcss/cli | 4.3.3 | devDependency `packages/tokens`, только для теста валидности `theme.css` |
| cn | 0.2.6 | пока не установлен, понадобится с первым компонентом |

**Node 26 исполняет TypeScript напрямую** (type stripping включён по умолчанию), поэтому ни `tsx`,
ни флага `--experimental-strip-types` не нужно: `node src/build.ts` и `node --test test/` работают
как есть. Это на одну зависимость меньше.

## 3. Команды приёмки и их вывод

```
$ pnpm install
Scope: all 3 workspace projects
Done in 555ms using pnpm v12.4.1

$ pnpm build
@cubby-ui/tokens:build: $ node src/build.ts
@cubby-ui/tokens:build: warn  --film-border: declared by both Color/color/film/border and Color/color/border/film (identical values, emitted once)
@cubby-ui/tokens:build: warn  --film-border-strong: declared by both Color/color/film/border-strong and Color/color/border/film-strong (identical values, emitted once)
@cubby-ui/tokens:build: warn  --accent: declared by both Color/color/border/focus and Color/color/accent/default (identical values, emitted once)
@cubby-ui/tokens:build: warn  --text-on-plate: declared by both Color/color/text/on-plate and Color/color/plate/text (identical values, emitted once)
@cubby-ui/tokens:build: warn  --opacity-disabled: declared by both Size/size/opacity/disabled and Size/size/opacity/disabled-pct with DIFFERENT values — the first one wins
@cubby-ui/tokens:build: tokens: 215 variables + 56 typography + 3 shadow -> dist/{tokens.css,theme.css,tokens.ts,tokens.paper.json}
 Tasks:    1 successful, 1 total

$ pnpm test
ℹ tests 19
ℹ pass 19
ℹ fail 0
 Tasks:    1 successful, 1 total

$ pnpm typecheck
@cubby-ui/tokens:typecheck: $ tsc --noEmit -p tsconfig.json
 Tasks:    1 successful, 1 total

$ pnpm tokens:check
... те же five warn ...
tokens: 215 variables + 56 typography + 3 shadow -> dist/{...}
exit=0            # git diff --exit-code packages/tokens/dist — пусто

$ pnpm registry:validate
$ shadcn registry validate registry.json
- Validating registry.
✔ Registry is valid.
✔ Checked 1 registry file and 1 item.
  - registry.json

$ pnpm lint
 WARNING  No tasks were executed as part of this run.
 Tasks:    0 successful, 0 total
```

`pnpm lint` зелёный, но пустой: линтер ещё не подключён (см. «что не сделано»).

Пять предупреждений `warn` — это не поломка сборки, а честный отчёт о коллизиях имён в самом
экспорте (раздел 6).

## 4. Решения

### 4.1 Тип элемента реестра `tokens` — `registry:item`

Проверено на живом CLI shadcn 4.21.0: файлы кладёт **тип файла**, а не тип элемента. Схема
(`ui.shadcn.com/schema/registry-item.json`) требует `target` только для `registry:file` и
`registry:page` и только у них его учитывает. С одинаковым `files[]` типы элемента
`registry:item`, `registry:theme`, `registry:file` и `registry:style` кладут оба CSS одинаково —
проверено установкой всех четырёх вариантов. Значит выбор смысловой:

- `registry:theme` — тип для тем, на практике это `cssVars`, который CLI вмерживает в CSS
  потребителя. Мы **не** возим `cssVars` (гейт Altis валит сборку на переменной, объявленной вне
  сгенерированного региона), так что называть элемент темой — обещать поведение, которого нет.
- `registry:style` — тип для стилей `shadcn init` (`extends`, `baseColor`, `iconLibrary`); наш
  элемент ставится `add` в существующий проект.
- `registry:file` на уровне элемента читается как «один разный файл», а у нас два файла, которые
  имеют смысл только вместе.
- `registry:item` — универсальный тип из схемы, ровно то, чем элемент и является.

Тип каждого файла внутри — `registry:file` с обязательным `target`.

### 4.2 `target` — `~/styles/…`, а не `@/styles/…`

ТЗ предлагало `@/styles/cubby-tokens.css`. **Так нельзя**: документированные плейсхолдеры —
только `@components/`, `@ui/`, `@lib/`, `@hooks/`; `@styles/` не существует, а литеральный
`@/styles/…` shadcn 4.21.0 не разворачивает — он создаёт каталог с именем `@`
(`src/@/styles/cubby-tokens.css`, проверено установкой). Работающий вариант — `~/styles/…`,
он кладёт файлы в `styles/` в корне проекта потребителя.

### 4.3 Правило имён для `codeSyntax.WEB = null`

Имя берётся двумя способами, в этом порядке:

1. **`codeSyntax.WEB` буквально.** Принимается ровно форма `var(--name)`; всё остальное (голое
   `--name`, `var(--a, red)`) — ошибка сборки, а не догадка. Так названы 186 из 300 переменных.
2. **Путь без первого сегмента**, когда `WEB` = null. Первый сегмент дублирует роль коллекции,
   поэтому отбрасывается, остальное склеивается через `-`:

   | путь | имя |
   |---|---|
   | `color/accent/wash` | `--accent-wash` |
   | `size/comp/menu-item` | `--comp-menu-item` |
   | `size/layout/window-h` | `--layout-window-h` |
   | `size/opacity/dragging-pct` | `--opacity-dragging-pct` |

   Односегментный путь сохраняет свой единственный сегмент.

Правило срабатывает ровно 34 раза: все остальные 80 переменных без имени — это скрытые Primitives,
у которых имени не должно быть вовсе. Их значения **инлайнятся** в семантический токен, как и
сейчас в `tokens.css` Altis (двухъярусная модель схлопывается в один ярус).

### 4.4 Структура селекторов `dist/tokens.css`

Скопирована с `~/Documents/GitHub/altis/docs/design/tokens.css` дословно, чтобы подмена файла в
Altis однажды прошла без правки селекторов:

```css
:root { … }                                   /* литералы, не зависящие от темы */
:root, body.dark, [data-theme="dark"] { … }   /* тёмная — канон и дефолт :root */
body.light, [data-theme="light"] { … }        /* светлая */
:root, body { … }                             /* все var()-производные алиасы */
```

Причина двойных селекторов — контракт каскада, записанный в шапке файла Altis: веб-приложение
переключает тему атрибутом `data-theme` на `<html>`, прототип — классом на `<body>`, а
пользовательское свойство со значением `var()` резолвится на том элементе, где **объявлено**.
Отсюда правило, которое генератор соблюдает, а тест проверяет: литералы — в `:root` или в блоке
темы, каждый `var()`-алиас — в `:root, body`. Тест `tokens.css keeps the Altis cascade contract`
падает, если хоть один `var()` окажется вне четвёртого блока.

### 4.5 Прочее

- **Единицы** выводятся из коллекции и Figma-scopes, а не решаются по переменной: Space/Radius →
  px; Size → px, кроме scope `OPACITY` → без единиц; Motion (число) → ms, Motion (строка) → как
  есть; Layer → без единиц; Color → hex как в экспорте, с альфой.
- **Типографика**: `textStyles` дают четыре семейства — `--text-*`, `--leading-*`, `--tracking-*`
  и `--font-weight-*` (последнее добавлено сверх ТЗ: без него вес стиля терялся бы, а в Tailwind
  под него есть неймспейс), плюс одна `--font` на семейство.
- **`theme.css`**: `--color-*` (Color), `--spacing-*` (Space числовыми ключами → `p-3`, `gap-2`;
  Size именованными → `h-control-h-md`), `--breakpoint-*` **литералами** (медиазапрос не читает
  переменную), `--radius-*`, `--text-*`/`--leading-*`/`--tracking-*`/`--font-weight-*`,
  `--font-sans`, `--shadow-*`, `--ease-*`. Длительности и z-index не мапятся: у Tailwind v4 нет
  неймспейсов `--duration-*` и `--z-index-*` (проверено по
  [tailwindcss.com/docs/theme](https://tailwindcss.com/docs/theme)) — их берут сырыми токенами.
- Там, где имя токена уже лежит в неймспейсе Tailwind (`--radius-md`, `--shadow-raised`,
  `--text-ui-md`), запись в теме получается самоссылочной — `--radius-md: var(--radius-md)`. Это
  ровно то, что показано в `03-architecture.md`, и это работает: Tailwind печатает свою тему
  внутри `@layer theme`, а нелейерный `:root` из `tokens.css` выигрывает по каскаду. Условие —
  **не оборачивать импорт `tokens.css` в `@layer`**; записано в README пакета и проверяется тестом,
  который реально собирает оба файла Tailwind'ом 4.3.3 и сверяет получившиеся утилиты.
- **`dist/` коммитится.** Генератор детерминированный: ни дат, ни хеш-зависимого порядка — только
  sha256 источника в шапке. `pnpm tokens:check` пересобирает и падает на любом diff.

## 5. Смоук-тест установки

Проект-потребитель: `<scratchpad>/cubby-smoke/` (package.json, tsconfig с алиасом `@/*`,
`components.json` со `style: "base-nova"` и `tailwind.css: "src/app/globals.css"`, пустой
`src/app/globals.css`).

```
$ npx shadcn@latest add ~/Documents/GitHub/cubby-ui/public/r/tokens.json --yes
- Checking registry.
✔ Checking registry.
- Updating files.
✔ Created 2 files:
  - styles/cubby-tokens.css
  - styles/cubby-theme.css
Import both files after Tailwind, in this order:

  @import "tailwindcss";
  @import "../styles/cubby-tokens.css";
  @import "../styles/cubby-theme.css";

cubby-tokens.css must stay unlayered: Tailwind emits its own theme inside @layer theme, and unlayered declarations win. Dark is the canon and the :root default; add data-theme="light" to switch.

$ find . -type f | sort
./components.json
./package.json
./src/app/globals.css
./styles/cubby-theme.css
./styles/cubby-tokens.css
./tsconfig.json

$ diff styles/cubby-tokens.css packages/tokens/dist/tokens.css   → идентичны
$ diff styles/cubby-theme.css  packages/tokens/dist/theme.css    → идентичны
```

Файлы легли ровно по `target`, содержимое дошло без изменений.

## 6. Сверка имён

### 6.1 Счёт

| | |
|---|---|
| Объявлений в `dist/tokens.css` | 321 (тёмная и светлая палитры повторяют имена) |
| Уникальных имён | **275** |
| Из них с именем из `codeSyntax.WEB` | 181 уникальное (186 записей, 5 коллизий) |
| Из них по правилу пути | 34 |
| Типографика + тени + `--font` | 56 + 3 + 1 |
| Скрытых Primitives не объявлено | 80 (проверяется тестом) |

Тест `every codeSyntax.WEB name in the export is declared in tokens.css` проверяет полное
покрытие; десять выборочных имён со значениями:

| имя | значение (dark) |
|---|---|
| `--bg-app` | `#17181A` |
| `--text-1` | `#E1E1E5` |
| `--accent` | `#0A84FF` |
| `--radius-md` | `8px` |
| `--space-3` | `12px` |
| `--icon-md` | `16px` |
| `--control-h-md` | `32px` |
| `--motion-fast` | `120ms` |
| `--z-modal` | `410` |
| `--stage-green` | `#30D158` |

### 6.2 Ответ на конкретные имена из критериев приёмки

| имя | Cubby UI | Altis `tokens.css` | вывод |
|---|---|---|---|
| `--bg-app` | есть, `#17181A` | есть, `#17181A` | совпадает |
| `--text-primary` | **нет** | **нет** | имени не существует ни там, ни там: канон называет цвет основного текста `--text-1` (`color/text/primary` → `codeSyntax.WEB = var(--text-1)`) |
| `--accent` | есть, `#0A84FF` | есть, `#0A84FF` | совпадает в тёмной; в светлой расходится (см. 6.4) |
| `--radius-md` | есть, `8px` | есть, `8px` | совпадает |
| `--space-*` | `--space-0/2px/1/6px/2/10px/3/4/5/6/28/7/40/48/64` | `--space-1…7` | у Altis 7 из 15; отсутствуют `--space-0`, `--space-2px`, `--space-6px`, `--space-10px`, `--space-28`, `--space-40`, `--space-48`, `--space-64` |
| `--row-h` | **нет** | есть, `36px` | канон разложил высоту строки по ролям: `--row-h-menu` 28, `--sidebar-board-row-h` 32, `--sidebar-row-h` 36, `--row-h-list` 40, `--row-h-snackbar` 44. Общего `--row-h` в `tokens.json` нет |

### 6.3 Коллизии имён внутри самого экспорта

Пять имён заявлены двумя переменными каждое. Генератор эмитит первую по порядку и печатает
предупреждение; список попадает в шапку `dist/tokens.css` и в `notes` внутри
`dist/tokens.paper.json`. Молча не чинится ничего — это правки в Figma.

| имя | переменные | значения |
|---|---|---|
| `--film-border` | `color/film/border`, `color/border/film` | одинаковые |
| `--film-border-strong` | `color/film/border-strong`, `color/border/film-strong` | одинаковые |
| `--accent` | `color/border/focus`, `color/accent/default` | одинаковые |
| `--text-on-plate` | `color/text/on-plate`, `color/plate/text` | одинаковые |
| `--opacity-disabled` | `size/opacity/disabled`, `size/opacity/disabled-pct` | **разные: 0.45 и 45** |

Последняя — единственная содержательная: два токена про одно и то же в разных единицах делят одно
имя. Эмитится `0.45` (первая по порядку, и она же корректна для CSS-свойства `opacity`), а `45`
из `size/opacity/disabled-pct` в CSS не попадает вовсе — своего имени у него нет. Сравните с
парой рядом: `size/opacity/dragging` и `size/opacity/dragging-pct` названы по-разному
(`--opacity-dragging` и `--opacity-dragging-pct`) и обе доезжают. **Требует решения Сергея в
Figma**: либо задать `disabled-pct` собственный `codeSyntax.WEB`, либо удалить переменную.

### 6.4 Полное расхождение с `~/Documents/GitHub/altis/docs/design/tokens.css`

Сверка сделана скриптом по обоим файлам, не по памяти. Ничего из перечисленного **не исправлено** —
это список для решений Сергея и владельца Altis.

| | |
|---|---|
| Уникальных имён в Cubby UI | 275 |
| Уникальных имён в Altis | 337 |
| Общих | 80 |
| Только в Altis | 257 |
| Только в Cubby UI | 195 |

Общая природа разрыва: `tokens.json` моделирует систему (роли, шкалы, режимы), а `tokens.css`
Altis накопил ещё и слой имён под конкретные компоненты и экраны, которого в Figma нет вовсе
(`--task-modal-*`, `--snackbar-*`, `--landing-*`, `--sidebar-*`, `--tag-*`, `--kanban-*` — это
большая часть из 257). В обратную сторону — то, что канон добавил, а код ещё не забрал:
роли радиусов, шкала z-index, длительности, типографическая шкала, шкала брейкпоинтов, часть
размеров.

#### Значения, которые расходятся при совпадающем имени — тёмная тема (20 из 65)

| имя | Cubby UI | Altis |
|---|---|---|
| `--border-control` | `#707376` | `#4A4C50` |
| `--ease` | `cubic-bezier(0.2, 0, 0, 1)` | `cubic-bezier(.2, 0, 0, 1)` |
| `--font` | `"Inter"` | `"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif` |
| `--icon-lg` | `20px` | `32px` |
| `--icon-sm` | `12px` | `14px` |
| `--icon-xl` | `32px` | `20px` |
| `--radius-full` | `9999px` | `50%` |
| `--scrim` | `#00000080` | `rgba(0, 0, 0, .5)` |
| `--shadow-overlay` | `0px 24px 64px rgba(0, 0, 0, 0.4)` | `0 24px 64px rgba(0, 0, 0, .4)` |
| `--shadow-raised` | `0px 1px 3px rgba(0, 0, 0, 0.349)` | `0 1px 3px rgba(0, 0, 0, .35)` |
| `--sidebar-board-row-h` | `32px` | `33px` |
| `--stage-blue` | `#0A84FF` | `#0a84ff` |
| `--stage-gray` | `#86868B` | `#86868b` |
| `--stage-green` | `#30D158` | `#30d158` |
| `--stage-orange` | `#FF9F0A` | `#ff9f0a` |
| `--stage-purple` | `#BF5AF2` | `#bf5af2` |
| `--stage-red` | `#FF453A` | `#ff453a` |
| `--stage-teal` | `#40C8E0` | `#40c8e0` |
| `--stage-yellow` | `#FFD60A` | `#ffd60a` |
| `--topbar-h` | `56px` | `48px` |

Из них по-настоящему содержательные, всё это — уже задокументированные расхождения из
`04-yashik-inventory.md` §1.4, и ни одно из них не чинилось здесь:

- **`--icon-sm` / `--icon-lg` / `--icon-xl`** — шкала иконок в коде сдвинута на позицию
  относительно канона (`sm` 12↔14, `lg` 20↔32, `xl` 32↔20), плюс в коде живёт лишний
  `--icon-xs: 12px`, которого канон не содержит. Подмена файла в Altis **сломает вёрстку иконок**,
  пока публичный API `Icon.ts` не переведут на каноническую шкалу.
- **`--radius-full`** — канон `9999px`, код `50%` (расхождение №19: на неквадратном элементе `50%`
  даёт эллипс вместо пилюли).
- **`--topbar-h`** — канон `56px`, код `48px` (расхождение №16).
- **`--border-control`** — канон `#707376`, код `#4A4C50`.
- **`--sidebar-board-row-h`** — канон `32px`, код `33px`.
- **`--font`** — канон знает только семейство `"Inter"`, а в коде это полный стек с фолбэками
  (`"Inter", system-ui, -apple-system, …`). **`tokens.json` фолбэк-стек не моделирует вовсе** —
  это дыра в источнике, и до подмены файла в Altis её надо закрыть новым токеном, иначе на машине
  без Inter текст поедет.

Остальное — косметика формата, не значения: регистр hex (`#30D158` против `#30d158`),
`0.35` против `.35`, `0px` против `0`, `#00000080` против `rgba(0, 0, 0, .5)`,
`cubic-bezier(0.2, …)` против `cubic-bezier(.2, …)`. Тени в `tokens.json` заданы одним набором на
обе темы, а в Altis у светлой темы свои значения — поэтому в светлой они и расходятся.

#### Значения, которые расходятся при совпадающем имени — светлая тема (23)

| имя | Cubby UI | Altis |
|---|---|---|
| `--accent` | `#0B66D0` | `#4353FF` |
| `--ease` | `cubic-bezier(0.2, 0, 0, 1)` | `cubic-bezier(.2, 0, 0, 1)` |
| `--font` | `"Inter"` | `"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif` |
| `--icon-lg` | `20px` | `32px` |
| `--icon-sm` | `12px` | `14px` |
| `--icon-xl` | `32px` | `20px` |
| `--radius-full` | `9999px` | `50%` |
| `--scrim` | `#17203673` | `rgba(23, 32, 54, .45)` |
| `--shadow-overlay` | `0px 24px 64px rgba(0, 0, 0, 0.4)` | `0 8px 24px rgba(9, 30, 66, .2)` |
| `--shadow-raised` | `0px 1px 3px rgba(0, 0, 0, 0.349)` | `0 1px 2px rgba(9, 30, 66, .12)` |
| `--sidebar-board-row-h` | `32px` | `33px` |
| `--stage-blue` | `#007AFF` | `#007aff` |
| `--stage-gray` | `#6E6E73` | `#6e6e73` |
| `--stage-green` | `#34C759` | `#34c759` |
| `--stage-orange` | `#FF9500` | `#ff9500` |
| `--stage-purple` | `#AF52DE` | `#af52de` |
| `--stage-red` | `#FF3B30` | `#ff3b30` |
| `--stage-teal` | `#30B0C7` | `#30b0c7` |
| `--stage-yellow` | `#FFCC00` | `#ffcc00` |
| `--success` | `#1B7E55` | `#22A06B` |
| `--success-text` | `#1B7E55` | `#1F845A` |
| `--topbar-h` | `56px` | `48px` |
| `--warning` | `#B3520C` | `#E56910` |

Здесь сверх косметики: `--accent`, `--success`, `--success-text`, `--warning` — в светлой теме
код и канон разошлись по палитре. Напомню, `meta.themeStatus.Light` в самом экспорте помечен
«черновик, не утверждён», при том что светлая тема в проде уже отгружается.

#### Имена, которые есть в Altis и которых нет в Cubby UI (257)

<details>
<summary>развернуть</summary>

`--accent-danger` `--accent-primary` `--accent-success`
`--auth-accent` `--auth-bg` `--auth-copy`
`--auth-danger` `--auth-ink` `--auth-line`
`--auth-on-accent` `--auth-overlay` `--auth-raised`
`--auth-shadow-overlay` `--auth-shadow-raised` `--auth-surface`
`--bg-subtle` `--border-default` `--check-canceled-surface`
`--check-ink` `--chip-h` `--content-pad-x`
`--context-menu-border` `--context-menu-hover` `--context-menu-item-destructive-hover`
`--context-menu-item-destructive-text` `--context-menu-item-focus-ring` `--context-menu-shadow`
`--context-menu-surface` `--context-menu-text` `--context-menu-width`
`--control-border` `--control-danger` `--control-h`
`--control-muted` `--control-raised` `--control-surface`
`--control-text` `--drop-slot-ink` `--film-1-strong`
`--film-border-heavy` `--icon-xs` `--kanban-card-gap`
`--kanban-card-pad` `--kanban-card-radius` `--kanban-card-title-line`
`--kanban-card-title-size` `--kanban-column-action` `--kanban-column-border`
`--kanban-column-card-border-hover` `--kanban-column-card-failed-border` `--kanban-column-count-surface`
`--kanban-column-count-text` `--kanban-column-gap` `--kanban-column-mark-h`
`--kanban-column-pad` `--kanban-column-radius` `--kanban-column-w`
`--kanban-drop-border` `--kanban-drop-ink` `--kanban-drop-slot-h`
`--kanban-drop-surface` `--kanban-failure-text` `--kanban-meta-line`
`--kanban-meta-size` `--kanban-progress-h` `--kanban-strip-pad-block`
`--landing-accent` `--landing-accent-strong` `--landing-avatar-muted`
`--landing-badge` `--landing-badge-muted` `--landing-badge-muted-ink`
`--landing-bg` `--landing-copy` `--landing-danger`
`--landing-danger-line` `--landing-danger-surface` `--landing-field`
`--landing-focus` `--landing-ghost` `--landing-ghost-line`
`--landing-ink` `--landing-line` `--landing-muted`
`--landing-nav-ink` `--landing-on-accent` `--landing-overlay`
`--landing-preview-selected` `--landing-raised` `--landing-surface`
`--leading-lg` `--leading-md` `--leading-sm`
`--leading-xl` `--leading-xs` `--list-group-gap`
`--list-lane-due` `--list-lane-progress` `--list-lane-tags`
`--list-lane-time` `--list-row-h` `--list-row-pad`
`--motion-shimmer` `--motion-spin` `--notif-drawer-loading-animation`
`--notif-drawer-loading-bg` `--notif-drawer-loading-radius` `--row-h`
`--select-bg-compact` `--select-bg-raised` `--select-bg-regular`
`--select-border` `--select-focus-ring` `--select-text-compact`
`--select-text-regular` `--shadow-snackbar` `--sidebar-account-pad-block`
`--sidebar-availability-action-padding-block` `--sidebar-availability-expired` `--sidebar-availability-surface`
`--sidebar-availability-text-size` `--sidebar-availability-unavailable` `--sidebar-avatar`
`--sidebar-avatar-surface` `--sidebar-avatar-text` `--sidebar-avatar-text-size`
`--sidebar-bell` `--sidebar-brand-h` `--sidebar-brand-w`
`--sidebar-count-line` `--sidebar-count-size` `--sidebar-email-line`
`--sidebar-email-size` `--sidebar-fade-stop` `--sidebar-icon`
`--sidebar-icon-muted` `--sidebar-indent-board` `--sidebar-indent-folder`
`--sidebar-indent-project` `--sidebar-line-height` `--sidebar-profile-menu-border`
`--sidebar-profile-menu-danger` `--sidebar-profile-menu-hover-text` `--sidebar-profile-menu-shadow`
`--sidebar-profile-menu-surface` `--sidebar-profile-menu-text` `--sidebar-profile-trigger-hover`
`--sidebar-row-dragging-opacity` `--sidebar-row-gap` `--sidebar-row-pad`
`--sidebar-row-radius` `--sidebar-row-rename-border` `--sidebar-row-selected-hover`
`--sidebar-section-gap` `--sidebar-surface` `--sidebar-text`
`--sidebar-text-muted` `--sidebar-text-size` `--sidebar-tracking`
`--sidebar-tree-gap` `--snackbar-action-pad` `--snackbar-action-surface`
`--snackbar-action-surface-hover` `--snackbar-border` `--snackbar-danger`
`--snackbar-dismiss` `--snackbar-error-bar-w` `--snackbar-error-line`
`--snackbar-h` `--snackbar-ink` `--snackbar-max-w`
`--snackbar-offset` `--snackbar-pad-end` `--snackbar-pad-end-quiet`
`--snackbar-pad-start` `--snackbar-radius` `--snackbar-shadow`
`--snackbar-success` `--snackbar-surface` `--snackbar-text`
`--spinner-accent-color` `--spinner-animation` `--spinner-border-color`
`--spinner-border-width` `--spinner-radius` `--stage-mark-w`
`--stage-well-blue` `--stage-well-gray` `--stage-well-green`
`--stage-well-orange` `--stage-well-purple` `--stage-well-red`
`--stage-well-teal` `--stage-well-yellow` `--status-done-ink`
`--tag-blue-ink` `--tag-blue-surface` `--tag-gray-ink`
`--tag-gray-surface` `--tag-green-ink` `--tag-green-surface`
`--tag-orange-ink` `--tag-orange-surface` `--tag-purple-ink`
`--tag-purple-surface` `--tag-red-ink` `--tag-red-surface`
`--tag-teal-ink` `--tag-teal-surface` `--tag-yellow-ink`
`--tag-yellow-surface` `--task-modal-action-h` `--task-modal-action-pad`
`--task-modal-aside-gap` `--task-modal-aside-pad-inline` `--task-modal-aside-w`
`--task-modal-attachment-h` `--task-modal-block-gap` `--task-modal-body-line`
`--task-modal-chip-h` `--task-modal-chip-radius` `--task-modal-dep-label-w`
`--task-modal-gap` `--task-modal-h` `--task-modal-header-pad-block`
`--task-modal-history-dot` `--task-modal-history-row-h` `--task-modal-label-tracking`
`--task-modal-mark-h` `--task-modal-mark-w` `--task-modal-meta-line`
`--task-modal-pad-block` `--task-modal-pad-inline` `--task-modal-progress-w`
`--task-modal-radius` `--task-modal-row-h` `--task-modal-step-check`
`--task-modal-step-line` `--task-modal-step-radius` `--task-modal-subhead-line`
`--task-modal-subhead-size` `--task-modal-title-line` `--task-modal-title-size`
`--task-modal-title-tracking` `--task-modal-toggle-h` `--task-modal-toggle-w`
`--task-modal-w` `--task-title-editor-error` `--task-title-editor-label`
`--text-lg` `--text-md` `--text-sm`
`--text-xl` `--text-xs` `--toolbar-h`
`--toolbar-search-w` `--tracking-tight`

</details>

#### Имена, которые есть в Cubby UI и которых нет в Altis (195)

<details>
<summary>развернуть</summary>

`--accent-line` `--accent-wash` `--avatar-lg`
`--avatar-md` `--avatar-overlap` `--avatar-ring`
`--avatar-sm` `--avatar-xl` `--avatar-xs`
`--badge-dot` `--bp-lg` `--bp-md`
`--bp-sm` `--bp-xl` `--btn-primary-surface-hover`
`--button-min-w` `--checkbox-size` `--comp-auth-card`
`--comp-auth-field-gap` `--comp-column-min` `--comp-empty-text`
`--comp-empty-text-sm` `--comp-filterbar` `--comp-group-header`
`--comp-history-icon` `--comp-kanban-card` `--comp-landing-card`
`--comp-landing-max` `--comp-menu-item` `--comp-popover-grid`
`--comp-popover-menu` `--comp-popover-panel` `--comp-project-card`
`--comp-property-col` `--comp-property-gap` `--comp-search-fixed`
`--comp-settings-nav` `--comp-sidebar-brand` `--comp-sidebar-row`
`--comp-snackbar-max` `--comp-snackbar-stripe` `--comp-stage-mark-h`
`--comp-stage-mark-tab` `--comp-stage-mark-w` `--comp-surface-header`
`--comp-table-col-md` `--comp-table-col-sm` `--comp-workspace-card`
`--comp-workspace-row` `--content-max` `--content-pad`
`--control-h-lg` `--control-h-md` `--control-h-sm`
`--control-h-xl` `--control-h-xs` `--control-secondary`
`--control-secondary-border` `--counter-size` `--due-lane-w`
`--ease-linear` `--font-weight-body-md` `--font-weight-body-md-strong`
`--font-weight-caption-sm` `--font-weight-caption-sm-strong` `--font-weight-caption-sm-tabular`
`--font-weight-display-lg` `--font-weight-heading-h1` `--font-weight-heading-h2`
`--font-weight-heading-h3` `--font-weight-label-sm` `--font-weight-mono-sm`
`--font-weight-ui-md` `--font-weight-ui-md-regular` `--font-weight-ui-md-tabular`
`--layout-window-h` `--leading-body-md` `--leading-body-md-strong`
`--leading-caption-sm` `--leading-caption-sm-strong` `--leading-caption-sm-tabular`
`--leading-display-lg` `--leading-heading-h1` `--leading-heading-h2`
`--leading-heading-h3` `--leading-label-sm` `--leading-mono-sm`
`--leading-ui-md` `--leading-ui-md-regular` `--leading-ui-md-tabular`
`--modal-w-2xl` `--modal-w-2xl-h` `--modal-w-lg`
`--modal-w-md` `--modal-w-sm` `--modal-w-xl`
`--motion-instant` `--motion-shimmer-duration` `--motion-slow`
`--motion-snackbar` `--motion-spin-duration` `--motion-splash`
`--notif-drawer-h` `--notif-drawer-w` `--opacity-disabled`
`--opacity-dragging` `--opacity-dragging-pct` `--progress-fixed-w`
`--progress-track-h` `--radius-10` `--radius-14`
`--radius-2` `--radius-6` `--radius-role-auth`
`--radius-role-card` `--radius-role-control` `--radius-role-mark`
`--radius-role-overlay` `--radius-role-pill` `--radius-role-row`
`--radius-role-surface` `--radius-role-tag` `--reading-max`
`--row-h-list` `--row-h-menu` `--row-h-snackbar`
`--shadow-popover` `--sidebar-rail-w` `--skeleton-block-h`
`--skeleton-line-h` `--space-0` `--space-10px`
`--space-28` `--space-2px` `--space-40`
`--space-48` `--space-64` `--space-6px`
`--stage-blue-text` `--stage-gray-text` `--stage-green-text`
`--stage-orange-text` `--stage-purple-text` `--stage-red-text`
`--stage-teal-text` `--stage-yellow-text` `--stroke-control`
`--stroke-focus` `--stroke-hairline` `--swatch-dot`
`--switch-knob` `--switch-track-h` `--switch-track-w`
`--tag-height` `--task-aside-w` `--task-lane-w`
`--text-body-md` `--text-body-md-strong` `--text-caption-sm`
`--text-caption-sm-strong` `--text-caption-sm-tabular` `--text-display-lg`
`--text-heading-h1` `--text-heading-h2` `--text-heading-h3`
`--text-label-sm` `--text-mono-sm` `--text-ui-md`
`--text-ui-md-regular` `--text-ui-md-tabular` `--textarea-min-h`
`--timer-lane-w` `--tracking-body-md` `--tracking-body-md-strong`
`--tracking-caption-sm` `--tracking-caption-sm-strong` `--tracking-caption-sm-tabular`
`--tracking-display-lg` `--tracking-heading-h1` `--tracking-heading-h2`
`--tracking-heading-h3` `--tracking-label-sm` `--tracking-mono-sm`
`--tracking-ui-md` `--tracking-ui-md-regular` `--tracking-ui-md-tabular`
`--z-base` `--z-drawer` `--z-dropdown`
`--z-modal` `--z-raised` `--z-scrim`
`--z-snackbar` `--z-sticky` `--z-tooltip`

</details>

## 7. Что не сделано

Сознательно, по границам ТЗ:

- **Компонентов нет.** Ни Button, ни остальных 14 примитивов v1 — это следующая задача.
  `packages/registry/src/{ui,lib,demos}` пустые.
- **`apps/www` и `packages/native` — только README** с описанием фазы и принятых решений.
- **`packages/core` не создан** — заменён пакетом `cn` из npm (см. раздел 1).
- **Ничего не публиковалось в npm**, репозиторий на GitHub не создавался.
- **Второй реестр для React Native** (`--output public/r/native`) не заведён: элементов нет.

Открытые хвосты, которые стоит закрыть отдельными задачами:

1. **Линтера нет.** `pnpm lint` есть в скриптах и в CI как задача Turbo, но ни один пакет её не
   реализует — прогон завершается «No tasks were executed». Нужно решить: ESLint или Biome (у beUI
   Biome — если оболочку форкаем, дешевле взять его хотя бы внутри `apps/www`).
2. **`@cubby-ui/tokens` пока `private: true`.** Публикация в npm — отдельное решение вместе с
   именем скоупа; сейчас доставка идёт только через реестр.
3. **`--font` без фолбэк-стека** (раздел 6.4). До подмены `docs/design/tokens.css` в Altis
   в `tokens.json` нужен токен на полный стек шрифтов, иначе подмена ухудшит вёрстку.
4. **Коллизия `--opacity-disabled`** (раздел 6.3) — правка в Figma.
5. **Тени одинаковы в обеих темах** — в `effectStyles` один набор, у Altis светлая тема имеет свои
   значения, и `--shadow-snackbar` в каноне отсутствует вовсе.
6. **CI не проверен в бою**: `.github/workflows/ci.yml` написан по актуальным версиям экшенов
   (`actions/checkout@v5`, `pnpm/action-setup@v4`, `actions/setup-node@v5`), но ни одного прогона на
   GitHub ещё не было — пока репозиторий локальный.
7. **Роадмап в Notion не синхронизирован** — это работа оркестратора, у исполнителя нет мандата
   править статусы.

## 8. Git

Четыре коммита в `main`, каждый заканчивается строкой
`Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`:

```
chore: scaffold the cubby-ui monorepo
feat(tokens): generate css, tailwind theme, ts and paper map from tokens.json
feat(registry): add the tokens item and the registry catalogue
ci: run tokens:check, registry:validate, typecheck and test on every push
docs: add the phase 0 scaffold report
```

Remote: `origin git@github.com:kenetatuse80471-creator/cubby-ui.git`.
