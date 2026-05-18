# Google Sheets Web App (замена NoCodeAPI)

## 1. Скрипт в таблице

1. Откройте Google Таблицу с результатами игры.
2. **Расширения → Apps Script**.
3. Вставьте содержимое `Code.gs` (можно удалить пустой `function myFunction()`).
4. **Проект → Настройки проекта → Свойства скрипта** → добавьте:
   - Имя: `SUBMIT_SECRET`
   - Значение: длинная случайная строка (скопируйте в надёжное место).

## 2. Деплой Web App

1. **Развернуть → Новое развертывание**.
2. Тип: **Веб-приложение**.
3. **Выполнять от имени:** я.
4. **У кого есть доступ:** все (Anyone).
5. Web App URL для этого проекта:

`https://script.google.com/macros/s/AKfycbx3rbojthNJnK3wmELSrlHbm9TmxpEMB3Yvq4SAt7xx3DP38nuGMyUF4Zod7Nb-qkd8/exec`

При изменении кода создавайте **новую версию** развертывания (или «Управление развертываниями» → редактировать → новая версия).

**Проверка в браузере:** откройте [Web App URL](https://script.google.com/macros/s/AKfycbx3rbojthNJnK3wmELSrlHbm9TmxpEMB3Yvq4SAt7xx3DP38nuGMyUF4Zod7Nb-qkd8/exec) — должен быть JSON с `"ok":true` (это `doGet`). Ошибка `Script function not found: doGet` значит, что в Apps Script ещё старая версия без `doGet` — обновите `Code.gs` и сделайте новое развертывание.

Игра отправляет данные **POST**-запросом (`doPost`), не через открытие ссылки в браузере.

## 3. Переменные для игры

| Переменная | Значение |
|------------|----------|
| `VITE_SHEETS_WEB_APP_URL` | URL выше |
| `VITE_SHEETS_SECRET` | то же, что `SUBMIT_SECRET` в свойствах скрипта |

**Локально:** `game/.env` (не коммитить).

**Production (GitHub Pages):** Settings → Secrets → Actions:

- `VITE_SHEETS_WEB_APP_URL`
- `VITE_SHEETS_SECRET`

## 4. Проверка

```bash
curl -X POST "https://script.google.com/macros/s/AKfycbx3rbojthNJnK3wmELSrlHbm9TmxpEMB3Yvq4SAt7xx3DP38nuGMyUF4Zod7Nb-qkd8/exec?secret=ВАШ_СЕКРЕТ" \
  -H "Content-Type: application/json" \
  -d '{"rows":[["2026-01-01T00:00:00.000Z",1,2,3,4,"2en","Test","Desktop","macOS",0,1,0,1,0,1,0,1,0,1,0,1,1,2,3]]}'
```

Ответ: `{"ok":true,"appended":1}` — строка появится на листе **Results**.

## 5. Лист Results

24 колонки в том же порядке, что и раньше (timestamp, U, D, L, S, Lang, country, deviceType, os, trolley1…art).
