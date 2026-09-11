# Отчёт: сброс дефолтных шкал Tailwind в theme.css

Ветка `feat/tokens-theme-reset`, worktree `scratchpad/wt-theme-reset`, от `main` (`091190c`).
Два коммита, не запушены, `main` не трогал.

```
af2074a fix(registry): forbid Tailwind's own duration scale in lint:tokens
6127b3d feat(tokens): reset Tailwind's default scales before declaring Cubby UI tokens
```

## 1. Что изменено в генераторе

Правил `packages/tokens/src/build.ts` (не `dist` — он пересобран `pnpm tokens:build` и закоммичен
отдельно внутри того же коммита). Добавлен отдельный `@theme` (без `inline`), перед существующим
`@theme inline`, со сбросом части дефолтных шкал Tailwind:

```diff
+@theme {
+  --color-*: initial;
+  --radius-*: initial;
+  --shadow-*: initial;
+  --text-*: initial;
+  --font-*: initial;
+  --spacing: initial;
+  --ease-*: initial;
+  --blur-*: initial;
+  --tracking-*: initial;
+  --leading-*: initial;
+  --perspective-*: initial;
+}
+
 @theme inline {
   /* Colours — a var() reference so the utility follows the active theme. */
   --color-bg-app: var(--bg-app);
   ...
```

Полный диф генерируемого файла — 33 строки, только добавление (см.
`git show 6127b3d -- packages/tokens/dist/theme.css`). `tokens.css`/`tokens.ts`/`tokens.paper.json`
не изменились.

**Порядок блоков — не стиль, а то, от чего зависит результат**, и это не предположение, а
измеренный факт (см. §2). `NAMESPACE-*: initial` стирает всё, что в этом неймспейсе объявлено
*к этому моменту сборки темы*. До `@theme inline` в этом неймспейсе есть только дефолты самого
Tailwind (они всегда обрабатываются раньше любого импортированного файла) — их реcет и убирает,
а объявленный ниже токен с тем же именем (`--radius-xl`, `--ease-linear`) переживает сброс, потому
что он ещё не существовал в момент сброса и добавляется уже после. Я специально собрал ту же тему
с блоком сброса **после** `@theme inline` и проверил обе версии живой сборкой Tailwind:

| Порядок сброса | `p-9/text-lg/shadow-md/bg-red-500` | Свои 254 кандидата из тем-файла |
|---|---|---|
| **до** `@theme inline` (выбранный) | все 4 пропадают | **254/254** собираются |
| после `@theme inline` | все 4 пропадают | только **131/254** собираются |

«254 кандидата» — это одна представительная утилита на каждую запись `theme.css` (напр.
`--color-bg-app` → `bg-bg-app`, `--radius-role-card` → `rounded-role-card`, `--leading-display-lg`
→ `leading-display-lg`), сгенерированная скриптом разбора файла, не из памяти — он же подтвердил
свою правильность, показав 254/254 на **исходном**, ещё не сброшенном `theme.css`, до того как я
вообще начал менять генератор.

## 2. Доказательство 1 — класс без токена не даёт CSS

Тест-файл с утилитами из задания, собран Tailwind CLI 4.3.3 (`node_modules/.bin/tailwindcss`) с
`tokens.css` + `theme.css` после сброса:

```html
<div class="p-9 text-lg rounded-xl shadow-md bg-red-500 duration-300 opacity-50 z-50"></div>
```

```
$ tailwindcss -i input.css -o out.css   # @import "tailwindcss" source(none); @source "<этот файл>";
                                         # @import ".../tokens.css"; @import ".../theme.css";
$ grep -n '\.p-9\b\|\.text-lg\b\|\.shadow-md\b\|\.bg-red-500\b' out.css
(пусто — ни одного совпадения)
```

Полный прогон (скрипт `run-probe.ts` из сессионного scratchpad, не в репозитории):

```
absent   p-9
absent   text-lg
COMPILES  rounded-xl
absent   shadow-md
absent   bg-red-500
COMPILES  duration-300
COMPILES  opacity-50
COMPILES  z-50
```

Четыре чистых дыры из задания (`p-9`, `text-lg`, `shadow-md`, `bg-red-500`) закрыты. Три
оставшихся — не баг, разобраны ниже по отдельности:

- **`rounded-xl` всё ещё собирается — это не дыра.** Cubby сам называет один из шагов своей шкалы
  радиусов «xl» (`--radius-xl: 16px`, из Figma), тем же именем, что дефолтная шкала Tailwind.
  Правило `.rounded-xl { border-radius: var(--radius-xl); }` **байт-в-байт одинаково до и после
  сброса** — проверено (`grep -A2 '\.rounded-xl' out-before.css out-after.css`) — то есть это
  всегда было обращение к токену, а не к дефолту Tailwind, сброс здесь ничего не поменял. Менять
  имя токена ради этого теста — отдельное решение про дизайн-систему, не в рамках этой задачи.
- **`duration-300` и `opacity-50`/`z-50` — у них нет темы, которую можно сбросить.** Разобрано в
  §5 (отчёт 05, раздел о дефолтных шкалах) и подтверждено мной: Tailwind v4 вычисляет числовые
  `duration-<n>`, `opacity-<n>`, `z-<n>` прямо в движке (никакого `var()` в выводе, в отличие от
  `rounded-*`/`bg-*`/`text-*`/`shadow-*`). `opacity-50`/`z-50` это уже ловит
  `packages/registry/scripts/lint-tokens.ts` (правила `opacity-literal`/`z-index-literal`,
  смержены в `main` до этой ветки); `duration-<n>` до этой ветки не ловил никто — добавил правило
  `duration-literal`, см. §7.

## 3. Доказательство 2 — всё нужное осталось живым

Тот же CLI, но на реальных файлах — `packages/registry/src/**` (`ui`, `lib` **и** `demos`,
шире, чем штатный `classes.test.ts`, который смотрит только на `ui`+`lib`) и
`apps/playground/src/**`. Экстрактор классов — тот же самый `classCandidates` из
`packages/registry/scripts/class-strings.ts`, которым пользуется штатный гейт, не отдельная
реализация.

```
files with classes: 31
class candidates (with dupes): 899, distinct: 269
distinct compiled rule selectors in output: 279 (было 280 до сброса)
CSS size: 47205 bytes, 1745 lines (было 47671 до сброса)

missing: 0
```

**Полный список исчезнувших правил — ровно одна строка:**

```diff
-.shadow\/popover
```

Это не класс, а артефакт того, как Tailwind ищет кандидатов: он сканирует весь текст файла, не
только JSX-атрибуты. В `select.tsx:126` есть комментарий-спека:
`* 04 S-02: fill \`bg/raised\`, stroke \`border/film-strong\`, \`shadow/popover\`, ...` — слово
`shadow/popover` внутри обратных кавычек Tailwind прочитал как утилиту `shadow` с модификатором
`/popover` и до сброса собирал из дефолтного `shadow-sm` (`0 1px 3px 0 ...`, проверено —
`grep -A3 'shadow\\/popover' real-before.css`). Классом этот текст никогда не был — он не
применяется ни в одном JSX, не учитывается `classCandidates`, не попадает в `classes.test.ts`.
После сброса дефолтного `shadow` у Tailwind нет, из чего собрать эту случайную находку, и строка
пропала сама — безопасный побочный эффект, не регрессия.

0 пропавших среди классов, которые реально используются (899 вхождений, 269 уникальных) — **в
коде `registry/src` и `playground/src` ни один компонент и ни одно демо не обращались к
дефолтной шкале Tailwind в обход токена.** Ни демо, ни витрину не потребовалось чинить (п.3
задания) — разбор ложных тревог из первого прохода grep’ом — в §4.

## 4. Что показалось находкой при грепе, но не было ею

Первый проход (`grep` по `src/ui`+`src/demos`+`playground/src` на `text-<size>`, `rounded-`,
`shadow`, `container`, и т.д.) дал три кандидата, которые при ближайшем рассмотрении не были
обращением к дефолтной шкале:

| Находка grep | Где | Почему не баг |
|---|---|---|
| `text-sm` | `empty-state.tsx:68` | Подстрока внутри `max-w-comp-empty-text-sm` (токен), не класс `text-sm`. `\b` в regex не видит дефис. |
| `shadow` (без суффикса) | `select.tsx:126` | Слово внутри JSDoc-комментария (см. §3), не класс. |
| `container` × 19 | `select.tsx`, `modal.tsx`, `snackbar.tsx`, `context-action-menu.tsx`, `select-demo.tsx` | Пропс портала Base UI (`container?: Portal.Props["container"]`), не утилита Tailwind. |

Отсюда и 0 правок в §3 — после трёх ложных тревог реальных нарушений не осталось ни одного.

## 5. Что сбрасывается и почему каждое — безопасно (проверено живой сборкой)

| Неймспейс | Что у Tailwind отваливается | Пересекается с именами Cubby? | Используется ли дефолт в коде сейчас |
|---|---|---|---|
| `--color-*` | `red-500`, `gray-900`, … вся палитра | Нет (`border-transparent`/`bg-transparent` — ключевые слова CSS, не тема, живут отдельно — проверено, не задеты) | Нет |
| `--radius-*` | `2xl`, `3xl`, `none`, … | Да, частично — `sm/md/lg/xl/full` это **собственные** шаги шкалы Cubby (2/6/10/14 + названные), не коллизия | Нет |
| `--shadow-*` | `sm/md/lg/xl/2xl/inner/none` | Нет (`shadow-raised/popover/overlay`) | Нет |
| `--text-*` | `xs/sm/base/lg/xl/2xl…9xl` | Нет (`text-display-lg`, `text-heading-h1`, …) | Нет |
| `--font-*` (family) | `sans/serif/mono` (шрифтовые стеки) | Да — `--font-sans` переопределён на `var(--font)` | Нет. Preflight-правило для `<code>/<kbd>/<pre>` (`font-family: var(--default-mono-font-family, ui-monospace, …)`) не ломается — у Tailwind там всегда есть литеральный fallback после запятой, независимый от темы — проверено сборкой с `<code>` в разметке. |
| `--spacing` (не `--spacing-*`!) | динамический множитель для «голых» чисел (`p-8`, `p-9`, `p-12`, …) | Нет — свои `--spacing-0…7/28/40/48/64/icon-sm/…` объявлены явно именованными ключами, это другой механизм | Нет — grep по `src/ui`+`src/lib`+`src/demos`+`playground/src` на все числовые `p-/m-/gap-/w-/h-/inset-/top-/…` нашёл только числа 0–7 (именованная шкала) |
| `--ease-*` | `in/out/in-out` | Да — `ease-linear` это тоже имя Cubby (своя линейная кривая) | Нет |
| `--blur-*` | `sm/md/lg/xl/2xl/3xl` | Нет (токенов blur у Cubby не существует) | Нет |
| `--tracking-*` | `tighter/tight/normal/wide/wider/widest` | Да — `tracking-display-lg` и т.п. (сопутствующие ключи текстовых стилей) | Нет, ни один `tracking-*` не используется отдельно от `text-*` |
| `--leading-*` | не даёт эффекта вообще, см. ниже | Да — `leading-display-lg` и т.п. | Нет, отдельно не используется |
| `--perspective-*` | `dramatic`, `near`, `midrange`, `distant` | Нет | Нет |

**`--leading-*: initial` — честно: он почти ничего не убирает.** `leading-none/tight/snug/
normal/relaxed/loose` у Tailwind v4 не завязаны на тему — `.leading-none { line-height: 1; }`
(проверено: литерал, без единого `var()`). Сброс неймспейса их не трогает в принципе, убирать их
может только линт-правило, как `duration-<n>`. Оставил в сбросе ради симметрии с `--tracking-*`
(у них общие сопутствующие ключи в каждом текстовом стиле) и потому что он не ломает ничего — но
реального эффекта от этой строчки, кроме как на случай будущих именованных значений, нет.
Отдельное правило под это не заводил — не входило в задание, а ни один ключевой `leading-<слово>`
сейчас не встречается в коде.

## 6. Что НЕ сбрасывается — и почему

| Неймспейс/класс | Решение | Почему |
|---|---|---|
| `--breakpoint-*` | Не сбрасывать | `sm:`/`md:`/`lg:`/`xl:` — реальные варианты в `avatar.tsx`, `empty-state.tsx`, `icon.tsx`, `modal.tsx`. Сброс убьёт точки перелома, которые нужны прямо сейчас. |
| `--container-*` | Не сбрасывать | Не используется нигде сейчас (все 19 находок `container` — пропс портала, см. §4), но: (а) голая утилита `container` у Tailwind уже использует шаги **наших** `--breakpoint-*` (`@media (width >= 600px) { max-width: 600px }` — не дефолт, а наш токен), то есть это не чистый обход; (б) сброс заранее закроет `@sm:`/`@container`-варианты компонентных контейнерных запросов, о которых никто пока не просил. |
| `--animate-*` | Не сбрасывать | Проверил эмпирически: `animate-spin` (используется в `spinner.tsx`) собирается **только** через дефолтную запись Tailwind `--animate-spin: spin 1s linear infinite`. Spinner переопределяет не утилиту, а только *значение* переменной — `[--animate-spin:spin_var(--motion-spin-duration)_var(--ease-linear)_infinite]` — если убрать дефолт, у Tailwind не останется ключа «spin» в принципе, и класс `.animate-spin` перестанет генерироваться вовсе, вместе с анимацией спиннера. Без `--animate-*: initial` это не нужно — никакого обхода токенов тут нет, собственного именованного `--animate-*` у Cubby не существует. |
| `duration-<n>`, `opacity-<n>`, `z-<n>` | Не адресуется из `theme.css` вообще | Нет теневого неймспейса — Tailwind считает их в движке. `opacity-literal`/`z-index-literal` уже были в `lint-tokens.ts` (коммит `091190c`, до этой ветки); `duration-literal` добавлен в этой ветке, см. §7. |

## 7. Остаток: `duration-<n>` закрыт гейтом, не темой

В `packages/registry/scripts/lint-tokens.ts` добавлено правило `duration-literal`
(`/^duration-\d+$/` на `baseUtility()`, та же функция, что уже режет варианты-префиксы для
`z-index-literal`/`opacity-literal`): `duration-300` — находка, `duration-(--motion-fast)` —
чисто. Тест в `test/lint-tokens.test.ts` (прогон — ниже). На текущих `src/ui`+`src/lib` — ни
одной находки: все длительности и так идут через `--motion-*`.

```
$ pnpm --filter @cubby-ui/registry lint:tokens
lint:tokens — 16 files, no literals.
```

## 8. `pnpm run ci`

```
$ pnpm run ci
✔ tokens:check        (dist пересобран и идентичен закоммиченному)
✔ registry:validate   (17 items)
✔ lint:tokens          16 files, no literals.
✔ lint                 eslint .
✔ typecheck            registry + tokens + playground
✔ test                 registry: 6 files / 73 tests; tokens: 20 tests
EXIT: 0
```

73 теста в `registry` (было 72 на момент `091190c` — +1 за `duration-literal`). 20 тестов в
`tokens` (было 19 — +1, «сброс стоит перед `@theme inline` и сбрасывает только проверенные
неймспейсы», плюс расширенный пробник в «Tailwind v4 compiles theme.css…» с тем же набором
классов из задания).

Пока писал тест на упорядочивание блоков, поймал и починил собственную накладку: тест «theme.css
only maps into namespaces Tailwind v4 actually has» искал `@theme inline` простым `indexOf` —
мой же новый комментарий над блоком сброса трижды упоминает `` `@theme inline` `` по имени, и
`indexOf` находил эту фразу в комментарии раньше настоящего правила. Поправил тест, чтобы искать
правило по началу строки (`/^@theme inline \{/m`), а не первое текстовое совпадение — иначе
любой будущий комментарий с этими словами снова сломал бы проверку.

## 9. Скриншоты витрины

`pnpm --filter playground build` → `pnpm --filter playground shots` (Vite + Playwright,
`apps/playground/scripts/shots.ts`), 30 PNG, сравнены с закоммиченными в `main` **попиксельно**
(Python/Pillow, `ImageChops.difference`, не только по размеру файла — размеры байт совпадали не
все, см. ниже, почему это не значит «другая картинка»):

```
avatar-{dark,light}, button-{dark,light}, context-action-menu-{dark,light}, divider-{dark,light},
empty-state-{dark,light}, icon-button-{dark,light}, modal-{dark,light}, select-{dark,light},
snackbar-{dark,light}, spinner-{dark,light}, switch-{dark,light}, tag-{dark,light},
text-area-{dark,light}, text-input-{dark,light}:  pixel-identical (28 файлов)

icon-{dark,light}: SIZE DIFFERS (960, 382) vs (960, 486)
```

28 из 30 — **побитово разные файлы (другой SHA-256), но попиксельно идентичные** — PNG-кодировщик
Playwright не даёт byte-stable вывод между запусками (метаданные/сжатие), сами пиксели не
отличаются ни на один. Эти 28 файлов **не закоммичены заново** — `git checkout -- \
apps/playground/shots` вернул их к виду в `main`, коммитить идентичную картинку не было смысла.

`icon-{dark,light}.png` реально другого размера — но это не регрессия этой ветки. Причина:
`packages/registry/src/demos/icon-demo.tsx` получил в коммите `681cab3` («let Icon draw a
consumer's own SVG via children», уже в `main`) новую строку демо «Произвольный SVG» — два новых
`DemoCell`, оба без единого класса мимо токенов (только `text-text-*`, уже проверенные). Высота
выросла на 104px из-за добавленного содержимого, а `icon-dark.png`/`icon-light.png` в `main` были
закоммичены коммитом `dcbf94f` — **раньше** `681cab3` — и с тех пор не обновлялись; сам отчёт 05
(§9.5) уже фиксировал этот разрыв как известный, не мой. Подтверждено: все остальные 28
демо-скриншотов из той же сборки — пиксель-в-пиксель как в `main`, значит сброс темы ничего не
сдвинул; разница только там, где раньше менялся сам контент демо, а не стили. Не стал чинить
(не моя ветка/тема) — завёл отдельную фоновую задачу на обновление этих двух файлов
(`task_6dc8f814`).

## 10. Итог

- Генератор (`packages/tokens/src/build.ts`) добавляет в `theme.css` блок `@theme { ...: initial; }`
  перед `@theme inline`, закрывая `--color-*`, `--radius-*`, `--shadow-*`, `--text-*`, `--font-*`,
  `--spacing`, `--ease-*`, `--blur-*`, `--tracking-*`, `--leading-*`, `--perspective-*`.
- `--breakpoint-*`, `--container-*`, `--animate-*` — сознательно не тронуты, с проверенной
  причиной на каждый.
- `duration-<n>` у Tailwind не в теме — закрыт новым правилом `lint-tokens.ts`
  (`duration-literal`); `opacity-<n>`/`z-<n>` были закрыты раньше, до этой ветки.
- Ни один компонент, демо или файл витрины не чинился — в реальном коде не было ни одного
  обращения к дефолтным шкалам Tailwind в обход токена (три находки grep’а оказались ложными,
  см. §4).
- `pnpm run ci` — зелёный целиком (73 + 20 тестов).
- Витрина визуально не изменилась — 28/30 скриншотов пиксель-в-пиксель как в `main`, 2
  (`icon-*`) расходятся по причине, не связанной с этой веткой (заведена отдельная задача).
- Жертв нет: ни один нужный класс не сломан, ни один компонент не переписан.
