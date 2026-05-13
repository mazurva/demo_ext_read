# План: MVP тренажера чтения на HTML CSS JavaScript

Created: 2026-05-12
Mode: full
Branch: none (git disabled)
Plan file: `.ai-factory/plans/mvp-reading-trainer-html-css-javascript.md`

## Settings

- Testing: yes
- Logging: verbose
- Docs: yes
- Roadmap Linkage: none (roadmap artifact is absent)
- Stack: vanilla HTML, CSS, JavaScript
- Build system: none for MVP
- Runtime target: static browser page

## Goal

Создать первый рабочий MVP тренажера чтения и памяти. Пользователь должен вводить короткий текст, видеть его в тренировочном виде, переключать режимы, управлять уровнем сложности, ставить анимацию на паузу и временно показывать оригинал.

## Scope

Входит в MVP:

- статическая страница `index.html`;
- модульная структура `src/` и `styles/`;
- режим вращающихся букв;
- режим перемешивания букв внутри слов;
- управление скоростью, уровнем сложности и типом вращения;
- пауза и временный показ оригинала;
- базовые тесты чистой логики преобразования текста;
- обновление README после реализации.

Не входит в MVP:

- сохранение текстов;
- авторизация;
- база данных;
- backend API;
- Electron/Tauri упаковка;
- сложная статистика тренировок.

## Architecture Notes

Следовать `.ai-factory/ARCHITECTURE.md`:

- чистые функции преобразования текста держать отдельно от DOM;
- пользовательский текст не вставлять через небезопасный `innerHTML`;
- состояние приложения хранить централизованно;
- анимацию управлять через CSS-классы и CSS custom properties;
- не добавлять frontend-фреймворк до появления реальной необходимости.

## Tasks

### Phase 1: Project Skeleton

#### [x] Task 1: Create static app structure

Deliverable: создать минимальную структуру приложения и точку входа.

Files to create:

- `index.html`
- `src/app.js`
- `src/state.js`
- `src/text-transformer.js`
- `src/renderer.js`
- `src/animation.js`
- `src/controls.js`
- `styles/base.css`
- `styles/layout.css`
- `styles/training.css`
- `package.json`

Expected behavior:

- `index.html` подключает CSS и JavaScript modules.
- На странице есть рабочий интерфейс: поле ввода, область тренировки, панель настроек и кнопки управления.
- `package.json` задает `"type": "module"` и скрипт `"test": "node --test"`.

Logging requirements:

- В `app.js` добавить `console.debug("[app] initialized")` при запуске.
- Логи должны быть сгруппированы по понятным префиксам: `[app]`, `[state]`, `[controls]`, `[renderer]`.

Dependencies:

- Нет.

#### [x] Task 2: Implement application state

Deliverable: реализовать централизованное состояние приложения и функции обновления.

Files to change:

- `src/state.js`
- `src/app.js`
- `src/controls.js`

Expected behavior:

- Состояние хранит `sourceText`, `mode`, `rotationType`, `level`, `speed`, `isPaused`, `isOriginalVisible`, `originalRevealDuration`.
- Уровень сложности ограничен диапазоном 1-5.
- Скорость ограничена безопасным диапазоном, чтобы нулевые и отрицательные значения не ломали анимацию.
- Все изменения состояния проходят через явные функции.

Logging requirements:

- `console.debug("[state] updated", nextState)` при изменении пользовательских настроек.
- `console.warn("[state] invalid value", details)` при попытке выставить значение вне диапазона.

Dependencies:

- Блокируется Task 1.

### Phase 2: Text Transformation

#### [x] Task 3: Implement tokenizer and text-preserving transformations

Deliverable: реализовать чистые функции разбиения и преобразования текста.

Files to change:

- `src/text-transformer.js`
- `tests/text-transformer.test.js`

Expected behavior:

- Текст разбирается на токены с сохранением слов, пробелов, переносов строк и пунктуации.
- Для режима вращения формируется структура символов без потери исходных позиций.
- Для режима перемешивания порядок слов не меняется.
- Первая буква слова остается на месте, остальные буквы перемешиваются.
- Слова длиной 1-2 символа не ломаются.
- Пунктуация в конце слова не должна исчезать.

Logging requirements:

- Чистые функции не пишут в `console`.
- Отладочную информацию по количеству токенов логировать на уровне вызывающего слоя, не внутри алгоритмов.

Tests:

- Пустая строка.
- Один абзац.
- Несколько абзацев с переносами.
- Слова из 1-2 букв.
- Слова с пунктуацией.
- Кириллица и латиница.

Dependencies:

- Блокируется Task 1.

#### [x] Task 4: Implement renderer for safe text display

Deliverable: создать DOM-рендеринг тренировочного текста без небезопасного `innerHTML`.

Files to change:

- `src/renderer.js`
- `src/app.js`
- `styles/training.css`

Expected behavior:

- Для каждой буквы в режиме вращения создается отдельный `span`.
- Пробелы и переносы сохраняются визуально.
- Абзацы остаются читаемо разделенными.
- Пользовательский текст вставляется через `textContent` или `createTextNode`.
- Для режима оригинала отображается исходный текст без искажений.

Logging requirements:

- `console.debug("[renderer] render", { mode, tokenCount })` после обновления области тренировки.
- `console.warn("[renderer] empty source text")` при пустом вводе.

Dependencies:

- Блокируется Task 2 и Task 3.

### Phase 3: Training Modes and Controls

#### [x] Task 5: Implement rotating letters mode

Deliverable: реализовать режим независимого вращения букв.

Files to change:

- `src/animation.js`
- `src/renderer.js`
- `styles/training.css`
- `src/state.js`

Expected behavior:

- Каждая буква получает случайное направление вращения.
- Каждая буква получает небольшую индивидуальную фазу или задержку.
- Поддерживаются типы вращения `smooth` и `discrete`.
- Уровень сложности влияет на скорость.
- Ручная скорость комбинируется с уровнем предсказуемо.

Logging requirements:

- `console.debug("[animation] settings", { rotationType, level, speed })` при изменении анимационных параметров.
- Не логировать каждую букву отдельно, чтобы не засорять консоль.

Dependencies:

- Блокируется Task 4.

#### [x] Task 6: Implement shuffled words mode

Deliverable: подключить режим перемешивания букв внутри слов к UI.

Files to change:

- `src/text-transformer.js`
- `src/renderer.js`
- `src/controls.js`
- `styles/training.css`
- `tests/text-transformer.test.js`

Expected behavior:

- Переключатель режима меняет отображение без потери исходного текста.
- В режиме shuffled words слова остаются на своих местах.
- Первая буква каждого слова остается на месте.
- Остальные буквы перемешиваются один раз при генерации режима, а не на каждом кадре.
- При изменении исходного текста перемешанный вариант пересчитывается.

Logging requirements:

- `console.debug("[controls] mode changed", mode)` при переключении режима.
- `console.debug("[renderer] shuffled text rendered", { wordCount })` после рендера.

Dependencies:

- Блокируется Task 3 и Task 4.

#### [x] Task 7: Implement pause and temporary original reveal

Deliverable: реализовать управление тренировкой.

Files to change:

- `src/controls.js`
- `src/state.js`
- `src/animation.js`
- `src/renderer.js`
- `styles/training.css`

Expected behavior:

- Кнопка паузы останавливает CSS-анимацию.
- Повторное нажатие или отдельная кнопка продолжения возобновляет анимацию.
- Кнопка `Показать оригинал` временно показывает исходный текст.
- После истечения заданной длительности приложение возвращается к активному режиму.
- Если пользователь меняет текст или режим во время показа оригинала, таймер не должен ломать состояние.

Logging requirements:

- `console.debug("[controls] pause toggled", isPaused)`.
- `console.debug("[controls] original reveal started", durationMs)`.
- `console.debug("[controls] original reveal ended")`.
- `console.warn("[controls] reveal timer reset")` при сбросе активного таймера.

Dependencies:

- Блокируется Task 5 и Task 6.

### Phase 4: UX, Accessibility, and Documentation

#### [x] Task 8: Polish responsive UI and accessibility

Deliverable: привести интерфейс к удобному рабочему виду.

Files to change:

- `index.html`
- `styles/base.css`
- `styles/layout.css`
- `styles/training.css`
- `src/controls.js`

Expected behavior:

- Первый экран сразу показывает рабочий интерфейс, без landing page.
- Desktop layout использует две рабочие зоны: ввод и тренировка.
- Mobile layout складывает зоны вертикально.
- Поле ввода удобно для 3-4 абзацев.
- Кнопки и настройки имеют понятные подписи.
- Управление работает с клавиатуры.
- Текст не перекрывает элементы управления.

Logging requirements:

- Логи UI-событий оставлять только для действий, которые меняют состояние.
- Не логировать каждое нажатие клавиши в поле ввода, кроме debounced события обновления текста.

Dependencies:

- Блокируется Task 7.

#### [x] Task 9: Final verification and docs update

Deliverable: проверить MVP и обновить документацию.

Files to change:

- `README.md`
- `AGENTS.md` if project structure changed beyond the current map
- optionally `docs/` if documentation is split later through `/aif-docs`

Expected behavior:

- README отражает фактический запуск приложения.
- README содержит краткую структуру проекта и сценарий проверки.
- Ручная проверка покрывает оба режима, паузу, показ оригинала, скорость и уровни.
- `npm test` проходит, если тестовый скрипт был добавлен.

Logging requirements:

- Перед финалом убедиться, что verbose-логи не раскрывают пользовательский текст целиком.
- Допустимо логировать длину текста и количество токенов, но не весь введенный текст.

Dependencies:

- Блокируется Task 8.

## Test Plan

- Run: `npm test`
- Проверить чистые функции `text-transformer.js` через Node test runner.
- Открыть `index.html` в браузере и вручную проверить:
  - ввод текста из 3-4 абзацев;
  - вращение букв;
  - плавный и дискретный тип вращения;
  - уровни сложности 1-5;
  - паузу и продолжение;
  - временный показ оригинала;
  - режим перемешивания букв внутри слов;
  - кириллицу, латиницу, пунктуацию и пустой ввод.

## Risk Notes

- CSS-анимация большого количества отдельных `span` может быть тяжелой на слабых устройствах.
- Неаккуратное разбиение слов может сломать пунктуацию или кириллицу.
- Случайное перемешивание не должно пересчитываться слишком часто.
- Нельзя использовать `innerHTML` для пользовательского текста без экранирования.
- При временном показе оригинала возможны гонки таймеров, если пользователь быстро меняет режимы.

## Commit Plan

Так как в плане больше пяти задач, рекомендуется делать контрольные коммиты:

1. `chore: scaffold static reading trainer app`
   - Task 1
   - Task 2

2. `feat: add text transformation and rendering`
   - Task 3
   - Task 4

3. `feat: add training modes and controls`
   - Task 5
   - Task 6
   - Task 7

4. `test: verify reading trainer mvp`
   - Task 8
   - Task 9

## Next Step

После просмотра плана запустить реализацию:

```text
$aif-implement
```
