# ОГЭ · Химия

Vite + React + TypeScript + Tailwind v4 + React Router + Framer Motion + KaTeX (mhchem).

Сайт: https://evgeshai.github.io/oge-chem/ — публикуется сам при отправке ветки `main` на GitHub.

## Запуск
    npm install
    npm run dev        # разработка (в шапке есть dev-переключатель платного доступа)
    npm test           # проверка логики и целостности контента
    npm run build      # продакшен-сборка в dist/

## Где что
- `src/content/catalog.ts` — список тем (free / платная, номера заданий КИМ)
- `src/content/topics/*.ts` — контент темы: уроки (блоки), тренировка, формат ОГЭ
- `src/content/types.ts` — типы блоков и заданий (fill, digits, match, open)
- `src/lib/check.ts` — проверка ответов; `src/lib/progress.ts` — прогресс (localStorage)
- `src/lib/access.ts`, `src/content/loader.ts` — доступ к темам (сейчас заглушка, под оплату)
- `e2e/solve_all.py` — сквозная проверка: решает каждое задание по ключу через интерфейс (нужен `npx vite preview --port 4173` и `npx vite-node scripts/dump.ts`)

Формулы: `$\ce{2H2 + O2 -> 2H2O}$` в любом тексте.

## Если `npm run dev` падает с «Cannot find native binding»
Удалите `node_modules` и `package-lock.json` (если есть), затем `npm install`.
Нужен Node.js 20.19+ или 22 LTS (`node -v`).
