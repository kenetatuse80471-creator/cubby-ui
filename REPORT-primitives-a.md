# Отчёт: фаза 1, партия A — девять примитивов и витрина

Ветка `feat/primitives-a`, восемь коммитов, запушена. Дата работы — 11.09.2026.
Все версии проверены `npm view` в этот день, ни одна не взята по памяти.

---

## 1. Что сделано

| | |
|---|---|
| Компонентов | **9** — `icon`, `button`, `icon-button`, `tag`, `divider`, `avatar`, `spinner`, `empty-state`, `switch` |
| Плюс вспомогательный элемент | **`cn`** — слияние классов; понадобился из-за молчаливого дефекта, см. §4.1 |
| Демо | **9**, по одному на компонент, `src/demos/<name>-demo.tsx` |
| Элементов реестра | **10 новых** (9 × `registry:ui` + `cn` × `registry:lib`), всего в каталоге 11 |
| Скриншотов | **18** PNG, `apps/playground/shots/`, тёмная и светлая на каждое демо |
| Тестов | **23** в `@cubby-ui/registry` (18 рендера + 5 на `cn`), 19 в `@cubby-ui/tokens` |
| Линтер | ESLint 9 flat config в корне, `pnpm lint` перестал быть пустым |

Новое дерево:

```
packages/registry/
├─ package.json  tsconfig.json  vitest.config.ts
├─ src/
│  ├─ lib/cn.ts                 элемент реестра `cn`
│  ├─ ui/*.tsx                  девять компонентов
│  └─ demos/
│     ├─ demo.tsx               тип Demo + DemoGrid / DemoRow / DemoCell
│     ├─ <name>-demo.tsx        девять демо
│     └─ index.ts               массив `demos`
└─ test/
   ├─ render.test.tsx           18 тестов
   └─ cn.test.ts                5 тестов

apps/playground/
├─ package.json  tsconfig.json  vite.config.ts  index.html  README.md
├─ src/{main.tsx, app.tsx, styles.css}
├─ scripts/shots.ts             сборка → preview → Playwright → остановка
└─ shots/*.png                  18 файлов, закоммичены

eslint.config.js                flat config на весь воркспейс
```

---

## 2. Версии

| Пакет | Версия | Комментарий |
|---|---|---|
| node | 26.8.1 | как было |
| pnpm | 12.4.1 | как было |
| react / react-dom | 19.3.0 | peer у `@cubby-ui/registry`, dev — у витрины |
| **typescript** | **6.0.3** | было 7.0.2 — понижено осознанно, см. §4.2 |
| @base-ui/react | **1.8.0** | не `@base-ui-components/react`: тот помечен `deprecated: Package was renamed` |
| @hugeicons/react | 1.1.10 | |
| @hugeicons/core-free-icons | 4.3.2 | тот же набор, что в `icons.svg` Altis |
| class-variance-authority | 0.7.1 | |
| clsx / tailwind-merge | 2.1.1 / 3.6.0 | вместо пакета `cn`, см. §4.1 |
| vite / @vitejs/plugin-react | 8.3.0 / 6.1.1 | |
| tailwindcss / @tailwindcss/vite | 4.3.3 / 4.3.3 | те же, что у токенов |
| vitest | 5.0.0 | node 26 стирает типы, но не JSX — `node --test` не может импортировать `.tsx` |
| playwright | **1.62.1** | не 1.63.0, см. §4.6 |
| eslint | **9.39.5** | не 10, см. §4.3 |
| typescript-eslint / react-hooks / jsx-a11y / globals | 8.70.0 / 7.1.1 / 6.10.2 / 17.12.0 | |
| shadcn | 4.21.0 | `latest` на сегодня — та же 4.21.0 |

---

## 3. Команды приёмки и их вывод

Прогон подряд, все восемь зелёные (`exit=0`).

```
$ pnpm install
Scope: all 4 workspace projects · Done in 1.9s using pnpm v12.4.1
exit=0

$ pnpm tokens:check
... пять warn о коллизиях имён в самом экспорте (те же, что в фазе 0) ...
tokens: 215 variables + 56 typography + 3 shadow -> dist/{tokens.css,theme.css,tokens.ts,tokens.paper.json}
exit=0            # git diff по packages/tokens/dist пуст

$ pnpm registry:validate
✔ Registry is valid.
✔ Checked 1 registry file and 11 items.
exit=0

$ pnpm registry:build
- Building tokens... cn... icon... spinner... button... icon-button...
  tag... divider... avatar... empty-state... switch...
✔ Building registry.
exit=0

$ pnpm lint
$ eslint .
exit=0            # ни одной ошибки, ни одного предупреждения

$ pnpm typecheck
@cubby-ui/tokens:typecheck   $ tsc --noEmit -p tsconfig.json
@cubby-ui/registry:typecheck $ tsc --noEmit -p tsconfig.json
playground:typecheck         $ tsc --noEmit -p tsconfig.json
 Tasks:    4 successful, 4 total
exit=0

$ pnpm test
@cubby-ui/tokens:test    ℹ tests 19 · pass 19 · fail 0
@cubby-ui/registry:test  ✓ test/cn.test.ts (5 tests) · ✓ test/render.test.tsx (18 tests)
                          Test Files 2 passed (2) · Tests 23 passed (23)
 Tasks:    2 successful, 2 total
exit=0

$ pnpm build
@cubby-ui/tokens:build  tokens: 215 variables + 56 typography + 3 shadow -> dist/{...}
playground:build        dist/assets/index-*.css 35.72 kB │ gzip: 7.72 kB
                        dist/assets/index-*.js 307.24 kB │ gzip: 95.12 kB
 Tasks:    2 successful, 2 total
exit=0
```

### 3.1 Гейт на литералы

Критерий 3 приёмки — ни одного литерала цвета, размера или радиуса в `src/ui/*`.
Прогон по `src/ui/` и `src/lib/`:

```
$ grep -rnE '#[0-9a-fA-F]{3,8}' ui/ lib/
(нет совпадений)

$ grep -rn 'rgb(' ui/ lib/
(нет совпадений)

$ grep -rnE '[0-9]+(rem|em)\b' ui/ lib/
(нет совпадений)

$ grep -rnE '[0-9]+px' ui/ lib/
ui/icon.tsx:33:        * 1.5 everywhere, 2 at `size="sm"` so a 12px glyph still reads as 1px.
ui/divider.tsx:32:     * A 1px line. The space around it belongs to the parent, ...
ui/icon-button.tsx:47: /** The glyph — an `<Icon />`, 16px in content, 20px in navigation. */
ui/avatar.tsx:15:      // The monogram is the one exception to the 12px floor (04 §0.4):
ui/button.tsx:12:      // Focus ring: 2px accent outside the control, offset 1px, ...
ui/button.tsx:49:      /** Icon slot before the label — an `<Icon />`, 16px. */
ui/button.tsx:51:      /** Icon slot after the label — an `<Icon />`, 16px. */
ui/button.tsx:55:       * inside the same 16px box, the label stays, ...
ui/switch.tsx:22:      "h-switch-track-h w-switch-track-w p-2px rounded-role-pill",
```

Восемь совпадений из девяти — **комментарии**. Девятое, `p-2px` в `switch.tsx`, — это
утилита токена `--space-2px` (в имени токена есть «2px»), а не литерал: `p-2px` компилируется
в `padding: var(--space-2px)`.

Единственные числа в коде — `strokeWidth={1.5}` и `2` в `icon.tsx`. Это не CSS-длина, а
толщина обводки в единицах вьюбокса 24×24 (правило Сергея: 1.5 везде, 2 у 12px-галочки);
токена на это в экспорте нет.

### 3.2 Проверка, что токены доехали до CSS

Из собранного `apps/playground/dist/assets/*.css`:

```
focus-visible\:outline-\(length\:--stroke-focus\):focus-visible{outline-style:var(--tw-outline-style);outline-width:var(--stroke-focus)}
focus-visible\:outline-offset-\(--stroke-hairline\):focus-visible{outline-offset:var(--stroke-hairline)}
focus-visible\:outline-accent:focus-visible{outline-color:var(--accent)}
.animate-spin{animation:var(--animate-spin)}
@keyframes spin{to{transform:rotate(360deg)}}
--animate-spin:spin var(--motion-spin-duration) var(--ease-linear) infinite
data-checked\:translate-x-3[data-checked]{--tw-translate-x:var(--space-3);...}
color-mix(in srgb,var(--plate) 88%,var(--text-on-plate))
```

То есть кольцо фокуса — ровно `--stroke-focus` / `--stroke-hairline` / `--accent`, оборот
спиннера — `--motion-spin-duration` (800 мс) и `--ease-linear`, ход тумблера — `--space-3` (12).

---

## 4. Решения и отступления

### 4.1 Свой `cn` вместо пакета `cn` — иначе кегль кнопки терялся молча

`text-ui-md` — это размер шрифта, который не выглядит размером шрифта. tailwind-merge
читает `ui-md` как цвет, решает, что он конфликтует с `text-text-1`, и выбрасывает
текстовый стиль. Воспроизведено на `cn@0.2.6`:

```
cn("text-ui-md",     "text-text-1") -> "text-text-1"
cn("text-caption-sm","text-text-3") -> "text-text-3"
cn("text-heading-h3","text-text-1") -> "text-text-1"
```

В `button.tsx` это ровно та связка, что стоит в базовых классах: кегль и интерлиньяж
кнопки исчезали бы после первого же `cn()`. Поэтому:

- `packages/registry/src/lib/cn.ts` — `clsx` + `extendTailwindMerge`, где класс-группа
  `font-size` расширена четырнадцатью именами текстовых стилей `theme.css`;
- список имён — константа `textStyleNames`, и тест `cn.test.ts` сверяет её с самим
  `packages/tokens/dist/theme.css` (парсит `--text-<имя>:`, отбрасывая модификаторы вида
  `--text-ui-md--line-height`). Новый текстовый стиль в токенах, не добавленный в список,
  роняет тест;
- элемент реестра называется **`cn`**, файл ложится в `lib/cn.ts`, а не в `lib/utils.ts`:
  у проекта после `shadcn init` уже есть `lib/utils.ts`, и `add --yes` такой файл
  **пропускает** — расширенный `cn` до потребителя бы не доехал. Проверено смоуком (§5).

### 4.2 TypeScript 7.0.2 → 6.0.3

TypeScript 7 не поставляет JS-API вообще:

```
node -e "const p=require('typescript/package.json'); console.log(p.main)"      -> undefined
node -e "console.log(typeof require('typescript').createSourceFile)"           -> undefined
```

typescript-eslint при загрузке падает: `typescript-eslint does not support TS 7.0` со ссылкой
на issue #10940. Тот же JS-API нужен любому type-aware инструменту. 6.0.3 — актуальная
поддерживаемая линия; `tsc --noEmit` проходит на всех трёх пакетах без единой правки кода.
TS 7 остаётся доступным как `tsgo`, если он понадобится отдельно.

Побочно: TS 7 удалил `baseUrl` (ошибка TS5102) — `paths` в `packages/registry/tsconfig.json`
и `apps/playground/tsconfig.json` записаны без него, относительно самого tsconfig.

### 4.3 ESLint 9, а не 10

`eslint-plugin-jsx-a11y@6.10.2` не объявляет peer выше `^9`. ESLint 9.39.5 при установке
пишет «This version is no longer supported» — это уведомление о поддержке версии, а не
поломка. Как только jsx-a11y объявит `^10`, переход — одна строка.

Одно правило настроено явно: `jsx-a11y/label-has-associated-control` с
`controlComponents: ["Switch"]`. `Switch` рендерит настоящий (визуально скрытый) `<input>`
внутри себя, и обёртка `<label>` — тот паттерн, который документирует Base UI; линтер об
этом знать не может.

### 4.4 Где я отступил от кода Altis в пользу спецификации

Правило проекта «макеты — канон» плюс прямые пометки в спеке 04, что это дефекты кода:

| Компонент | Altis | Сделано | Почему |
|---|---|---|---|
| Button | `padding: 7px 16px`, высоты нет | `height` 32 / 28 | 04 A-02: «расхождение №1, канон — height:32px» |
| Button `text` | цвет `--control-primary`, ховер — подчёркивание | цвет `text/primary`, ховер — плёнка `film/1` | 04 A-02: Text — прозрачная, ховер — ступень плёнки |
| Button `danger` | обводка `--control-danger` | обводка `border/film`, красный только текст | таблица токенов A-02 |
| Button фокус | `outline: 2px solid var(--control-primary)` | 2px `--accent`, offset 1 | 03 §8: кольцо — `color/border/focus` |
| Button disabled | `opacity: .65` | `--opacity-disabled` (0.45) | 03 §8 |
| IconButton | базовый 22×22, кегль 11 | 32 (`regular`) / 28 (`compact`) | 04 A-03 §6.3: «22 — дефект, не исключение»; по умолчанию `regular` |
| Tag | восемь непрозрачных плашек, 24 литерала hex | одна заливка `film/2`, цвет в тексте и в обводке `stage/<тон>/text @ 40%` | 03 §3.6, решение отменяет плашки |
| Tag | кегль 10 / 11.5 | `caption-strong` 12/16 | пол 12px, правило Сергея |
| Switch | трек on `--success` | трек on `--plate` | 04 A-05 предлагает plate вместо accent; см. вопрос 1 |
| Avatar | 18px у compact-вариантов | лестница 20 / 24 / 28 / 32 / 64 | 04 A-11: «расхождение №4, в ДС — 20» |
| Divider | компонента нет, класс `.divider` | компонент | 04 A-16: «отдельного компонента нет — завести» |

Имена вариантов при этом сохранены как в Altis: `primary | secondary | danger | text` и
`regular | compact`. У `Avatar` три варианта Altis (`identity`, `compact-neutral`,
`compact-unavailable`) переименованы в `identity | neutral | unavailable`: размер теперь
отдельная ось, и склейка «размер+тон» в одном имени стала бы враньём.

### 4.5 Мелкие решения внутри компонентов

- **Кнопка в загрузке.** Спиннер `compact` (12) стоит в боксе 16×16 — ровно там же, где
  иконка. Если иконка была, ширина кнопки не меняется совсем (03 §8 этого и требует).
  Если иконки не было — ширина растёт на 16 + 8; см. вопрос 7.
- **Нажатие у Primary.** `color-mix(in srgb, var(--plate) 88%, var(--text-on-plate))` —
  буквально формула 03 §8 «затемнение на 12% в сторону plate/text». Оба цвета — токены.
- **Наведение у Primary.** Использован существующий токен `--btn-primary-surface-hover`;
  04 A-02 помечает этот ховер как открытый вопрос, но токен в экспорте уже есть.
- **Спиннер.** Оборот — `animate-spin` (он приносит `@keyframes`) плюс локальная подмена
  переменной `--animate-spin` на `spin var(--motion-spin-duration) var(--ease-linear) infinite`.
  Подмена переменной, а не второе объявление `animation`, — тогда результат не зависит от
  порядка правил в CSS. `motion-reduce:animate-none` — по 03 §9.
- **Тег.** Каждый тон задаёт только две переменные, `--tag-ink` и `--tag-line`; базовые
  классы читают их. Новый тон — одна строка, а не четыре класса.
- **Иконка.** Размер — CSS-классом (`size-icon-md`), а не пропом `size` у `HugeiconsIcon`:
  проп положил бы в разметку атрибуты `width="16" height="16"` литералами. Атрибуты
  остаются 24 (умолчание пакета), CSS их перекрывает.

### 4.6 Playwright 1.62.1

`playwright@1.63.0 install chromium` в этой песочнице падает на скачивании
(`Failed to download Chrome for Testing 153.0.8010.12 (playwright chromium v1243)`,
`Download failure, code=1`) — CDN недоступен. 1.62.1 — самая свежая версия, чей chromium
(r1234) уже установлен на машине; `install chromium` на ней отрабатывает мгновенно и
скриншоты снимаются. Когда сеть позволит — поднять до 1.63.

---

## 5. Смоук-тест установки

Проект-потребитель: `<scratchpad>/kist-smoke/` — `package.json`, `tsconfig.json` с алиасом
`@/*`, `components.json` (`style: base-nova`, `aliases.lib: "@/lib"`, `aliases.ui:
"@/components/ui"`), пустой `src/app/globals.css` и **заранее положенный
`src/lib/utils.ts`** со стандартным `cn` — чтобы проверить, что мы его не трогаем.
Названного в ТЗ каталога не существовало (с прошлого шага остался `cubby-smoke`), собран
заново по SCAFFOLD-REPORT.

### 5.1 Что происходит с адресами GitHub

По требованию GitHub-реестра `registryDependencies` записаны полным адресом
`kenetatuse80471-creator/cubby-ui/<item>`. Из локального `public/r/button.json` это
ожидаемо не ставится **сегодня**:

```
$ npx shadcn@4.21.0 add ~/Documents/GitHub/cubby-ui/public/r/button.json --yes
Message: Registry item "cn" was not found.
```

Причина не в форме адреса, а в том, что `cn` ещё нет в ветке `main`. Проверено отдельным
зондом: та же локальная сборка, но с зависимостью на существующий в `main` элемент —

```
$ npx shadcn@4.21.0 add <scratchpad>/probe-r/probe-button.json --yes    # regDeps: .../tokens
✔ Created 3 files:
  - styles/cubby-tokens.css
  - styles/cubby-theme.css
  - src/components/ui/button.tsx
```

То есть **полный адрес GitHub из локального файла резолвится нормально**; после слияния
ветки в `main` установка `button` и `empty-state` заработает как есть.

### 5.2 Полный смоук всей цепочки

Чтобы проверить именно цепочку зависимостей, собрана копия `public/r` с адресами,
переписанными на локальные пути (файлы компонентов и все `dependencies` — те же самые):

```
$ npx shadcn@4.21.0 add <local-r>/button.json --yes
✔ Created 3 files:
  - src/lib/cn.ts
  - src/components/ui/spinner.tsx
  - src/components/ui/button.tsx

$ npx shadcn@4.21.0 add <local-r>/empty-state.json --yes
✔ Created 2 files:
  - src/components/ui/icon.tsx
  - src/components/ui/empty-state.tsx
ℹ Skipped 1 file: (files might be identical, use --overwrite to overwrite)
  - src/lib/cn.ts

$ find . -type f -not -path "./node_modules/*" | sort
./components.json
./package.json
./src/app/globals.css
./src/components/ui/button.tsx
./src/components/ui/empty-state.tsx
./src/components/ui/icon.tsx
./src/components/ui/spinner.tsx
./src/lib/cn.ts
./src/lib/utils.ts          <- не тронут, содержимое прежнее
./tsconfig.json

$ cat package.json
{"name":"kist-smoke",...,"dependencies":{
  "@hugeicons/core-free-icons":"^4.3.2","@hugeicons/react":"^1.1.10",
  "class-variance-authority":"^0.7.1","clsx":"^2.1.1","tailwind-merge":"^3.6.0"}}

$ grep -h "^import" src/components/ui/*.tsx src/lib/cn.ts | sort -u
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import { Icon, type IconSvgElement } from "@/components/ui/icon";
import { Spinner } from "@/components/ui/spinner";
import { clsx, type ClassValue } from "clsx";
import { cn } from "@/lib/cn";
import { cva, type VariantProps } from "class-variance-authority";
import { extendTailwindMerge } from "tailwind-merge";
```

Оба алиаса переписались правильно: `@/registry/cubby/ui/spinner` → `@/components/ui/spinner`,
`@/lib/cn` → `@/lib/cn`. Именно ради этого во внутренних импортах стоит сегмент `cubby`:
shadcn ищет шаблон `^@/registry/(.+)/ui`, и без сегмента между `registry/` и `/ui`
срабатывает запасной путь в алиас `components`, после чего у потребителя остаётся
несуществующий `@/components/spinner`.

### 5.3 Установка прямо из ветки

После пуша:

```
$ npx shadcn@4.21.0 view "kenetatuse80471-creator/cubby-ui/button#feat/primitives-a"
[ { "name": "button", ... полный item с содержимым файла ... } ]      # работает

$ npx shadcn@4.21.0 add "kenetatuse80471-creator/cubby-ui/cn#feat/primitives-a" --yes
✔ Created 1 file:
  - src/lib/cn.ts                                                     # работает

$ npx shadcn@4.21.0 add "kenetatuse80471-creator/cubby-ui/button#feat/primitives-a" --yes
Message: Registry item "cn" was not found.                            # ожидаемо
```

`#ref` действует только на сам запрошенный элемент; его `registryDependencies` резолвятся
из ветки по умолчанию. Полная установка `button` из GitHub станет возможной после мержа
в `main` — ничего дополнительно править для этого не нужно.

---

## 6. Скриншоты

`pnpm --filter playground shots` — собирает витрину, поднимает `vite preview`, снимает и
**останавливает и браузер, и сервер**. `reducedMotion: "reduce"` останавливает спиннер,
поэтому файлы побайтово одинаковы между прогонами (проверено: два прогона подряд дали
идентичные md5).

Ширина — 960 CSS-px, снимается сама секция демо, один PNG на демо на тему:

```
apps/playground/shots/icon-dark.png          icon-light.png
apps/playground/shots/button-dark.png        button-light.png
apps/playground/shots/icon-button-dark.png   icon-button-light.png
apps/playground/shots/tag-dark.png           tag-light.png
apps/playground/shots/divider-dark.png       divider-light.png
apps/playground/shots/avatar-dark.png        avatar-light.png
apps/playground/shots/spinner-dark.png       spinner-light.png
apps/playground/shots/empty-state-dark.png   empty-state-light.png
apps/playground/shots/switch-dark.png        switch-light.png
```

На кнопках и кнопках-иконках видны все семь колонок состояний: покой, compact, наведение,
нажатие, фокус (кольцо 2px), отключено, загрузка. Наведение, нажатие и фокус в CSS
статически не воспроизводятся, поэтому в этих колонках демо руками ставит ровно те же
утилиты, что компонент вешает на `:hover` / `:active` / `:focus-visible`.

**Шрифт на скриншотах — не Inter.** Токен `--font` содержит только имя семейства без
фолбэк-стека (это открытый хвост ещё с фазы 0), Inter в системе нет и в витрину он
намеренно не подгружается из сети. Кегли, интерлиньяжи и трекинг — настоящие, из токенов;
рисунок знаков — системный.

---

## 7. Что не сделано

- **Вторая партия** (`TextInput`, `TextArea`, `Select`, `Modal`, `Snackbar`,
  `ContextActionMenu`) — по границам ТЗ, отдельная задача.
- **Гейт на литералы (`lint-tokens`) и тест «каждый класс компилируется Tailwind»** — по
  прямому указанию: их кладёт поверх этой ветки другая сессия при интеграции. Сейчас
  проверка литералов сделана руками (§3.1).
- **`apps/www`** (сайт-витрина по образцу beui.dev) — фаза 2.
- **React Native** — фаза 4, второй реестр не заводился.
- **Тестов взаимодействия нет** — только рендер в строку через `react-dom/server`. Клик,
  клавиатура, фокус-ловушка потребуют браузерного раннера; для примитивов без внутреннего
  состояния это пока не окупается, но для партии B (модалка, меню) будет нужно.
- **`shots` не в CI**: Playwright в CI потребует установки браузера, а сейчас даже локально
  скачивание падает (§4.6).
- **Роадмап в Notion не синхронизирован** — у исполнителя нет мандата править статусы.

Одна оговорка про подпись коммитов: в ТЗ была строка `Co-Authored-By: Claude Fable 5.1`,
но инструкция окружения этой сессии её прямо заменяет на
`Co-Authored-By: Claude Opus 5 (1M context)`. Коммиты подписаны второй — она соответствует
тому, кто эту работу действительно делал. Если нужна прежняя строка, это переписывание
истории ветки, скажите — сделаю до мержа.

---

## 8. Вопросы дизайнеру

1. **Тумблер: чем красить трек «включено» и ручку?** 04 A-05 буквой говорит
   `color/accent/default`, но там же помечает это открытым вопросом и предлагает
   `plate/surface`, а 03 §3.7 разрешает акцент только для фокуса и цели переноса. Я взял
   **plate** — иначе кольцо фокуса (тоже акцент) сливается с треком. Но спека говорит, что
   ручка тоже `plate/surface`, а на треке-plate она исчезнет: сейчас ручка `bg/surface`, как
   в Altis, и в тёмной теме в положении «выключено» она контрастирует слабо (см.
   `switch-dark.png`, первая ячейка). Нужен либо отдельный токен на ручку, либо решение.
2. **Монограмма в аватаре 20 и 24.** Канон просит 9 и 10 — таких токенов в экспорте нет
   (есть только 12 / 14 / 24, они и стоят на 28 / 32 / 64). Сейчас на 20 и 24 стоит 12
   (`caption`). Заводим `--text-avatar-xs` / `--text-avatar-sm` или соглашаемся на 12?
3. **Обводка спиннера.** Спека называет `--spinner-border-width` (2), в экспорте такого
   токена нет — взят `--stroke-focus` (2px), имя не по смыслу. Завести свой токен?
4. **`min-width: 64` у кнопки** 04 A-02 помечает как «требует решения». Я включил её для
   всех вариантов, включая `text` — на скриншоте видно, как выглядит кнопка «ОК». Оставляем
   на всех вариантах, только на Primary/Secondary, или убираем?
5. **Крестик съёмного тега — 12 или 16?** 04 A-09 говорит 12, а §0.4 и ваше правило ревью
   говорят «12 — только галочка чекбокса, в контенте 16». Сейчас 12: 16 в теге высотой 20
   почти не оставляет полей. Подтвердите исключение или поднимем до 16.
6. **Кнопка Danger.** По таблице токенов A-02 обводка у неё нейтральная (`border/film`), а
   красный только текст; в коде Altis обводка красная. Я сделал по спеке — на скриншоте
   `button-dark.png` третья строка. Так и оставить?
7. **Кнопка в загрузке без иконки.** Если у кнопки не было `iconStart`, спиннер добавляет
   16 + 8 к ширине, и «ширина не меняется» из 03 §8 не выполняется. Варианты: всегда
   резервировать место под иконку у кнопок, которые умеют грузиться; показывать спиннер
   вместо подписи; или оставить как есть.

---

## 9. Соглашения партии A (одной строкой каждое)

- **`data-slot`** — на каждом элементе, за который потребитель может зацепиться:
  `button`, `button-spinner`, `icon-button`, `icon-button-badge`, `tag`, `tag-dot`,
  `tag-label`, `tag-remove`, `avatar`, `avatar-image`, `avatar-initials`,
  `avatar-placeholder`, `empty-state`, `empty-state-icon/-title/-description`, `divider`,
  `spinner`, `icon`, `switch`, `switch-thumb`.
- **Имена вариантов и размеров** — из Altis: `variant="primary | secondary | danger | text"`,
  `size="regular | compact"`; где имени не было (тона тега, размеры аватара) имя берётся
  из токена: `tone="blue"`, `size="xs | sm | md | lg | xl"`.
- **Алиасы импорта** — компонент импортирует компонент как `@/registry/cubby/ui/<name>`
  (сегмент `cubby` обязателен, иначе shadcn перепишет путь в `components`), а слияние
  классов — как `@/lib/cn`; у потребителя они превращаются в его `ui`- и `lib`-алиасы.
- **Тест-раннер** — vitest 5 (`pnpm --filter @cubby-ui/registry test`), потому что node 26
  стирает типы, но не JSX; токены как были остаются на `node --test`.

---

## 10. Git

Восемь коммитов в `feat/primitives-a`, ветка запушена
(`git push -u origin feat/primitives-a`, `--force` не применялся; маршрут SSH — разовый
`GIT_SSH_COMMAND="ssh -p 22 -o HostName=github.com -i ~/.ssh/github"`, пользовательский
`~/.ssh/config` не тронут).

```
dcbf94f chore(playground): commit the review screenshots of batch A
5740ce6 feat(playground): add the showcase and the screenshot script
f161a59 feat(registry): put cn and the nine primitives in the catalogue
45daa8e feat(registry): add a demo for every primitive
a77e929 feat(registry): add the nine primitives of batch A
a27241e feat(registry): add cn, the class merge that keeps the text styles
9d45f03 build: add the eslint 9 flat config and move to typescript 6.0.3
c4d6733 docs: correct the commit list in the scaffold report   <- конец main
```

Changeset — `.changeset/nine-primitives-batch-a.md`, minor для `@cubby-ui/registry`.
