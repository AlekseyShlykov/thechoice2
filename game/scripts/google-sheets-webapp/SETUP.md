# Google Sheets Web App (замена NoCodeAPI)

## 1. Скрипт в таблице

1. Откройте Google Таблицу с результатами игры.
2. **Расширения → Apps Script**.
3. Вставьте содержимое `Code.gs` (можно удалить пустой `function myFunction()`).
4. **Проект → Настройки проекта → Свойства скрипта** → добавьте:

   | Свойство | Значение |
   |----------|----------|
   | `SUBMIT_SECRET` | длинная случайная строка (= `VITE_SHEETS_SECRET` в GitHub) |
   | `SPREADSHEET_ID` | ID таблицы из URL: `https://docs.google.com/spreadsheets/d/**ЭТОТ_ID**/edit` |

   Скрипт нужно создавать через **Расширения → Apps Script** из **этой** таблицы. Если проект отдельный — `SPREADSHEET_ID` обязателен.

## 2. Деплой Web App

1. **Развернуть → Новое развертывание**.
2. Тип: **Веб-приложение**.
3. **Выполнять от имени:** я.
4. **У кого есть доступ:** все (Anyone).
5. Web App URL для этого проекта:

`https://script.google.com/macros/s/AKfycbwOKuiBHTQYEVMhczfc2kiWptLoDmcmKfqD54dGLNZA0pQnFd3Q3_6mCHhrlknM3ilP/exec`

При изменении кода создавайте **новую версию** развертывания (или «Управление развертываниями» → редактировать → новая версия).

**Проверка в браузере:** откройте [Web App URL](https://script.google.com/macros/s/AKfycbwOKuiBHTQYEVMhczfc2kiWptLoDmcmKfqD54dGLNZA0pQnFd3Q3_6mCHhrlknM3ilP/exec) — должен быть JSON с `"ok":true` (это `doGet`). Ошибка `Script function not found: doGet` значит, что в Apps Script ещё старая версия без `doGet` — обновите `Code.gs` и сделайте новое развертывание.

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
curl -X POST "https://script.google.com/macros/s/AKfycbwOKuiBHTQYEVMhczfc2kiWptLoDmcmKfqD54dGLNZA0pQnFd3Q3_6mCHhrlknM3ilP/exec?secret=ВАШ_СЕКРЕТ" \
  -H "Content-Type: application/json" \
  -d '{"rows":[["2026-01-01T00:00:00.000Z",1,2,3,4,"2en","Test","Desktop","macOS",0,1,0,1,0,1,0,1,0,1,0,1,1,2,3]]}'
```

Ответ: `{"ok":true,"appended":1}` — строка появится на листе **Results**.

## 5. Лист Results

24 колонки в том же порядке, что и раньше (timestamp, U, D, L, S, Lang, country, deviceType, os, trolley1…art).

## 6. Если данных в таблице нет

1. **Проверка Web App в браузере** — откройте URL `/exec`. Должен быть JSON `{"ok":true,...}`.  
   - «Page introuvable» / HTML-ошибка → развертывание сломано: новое развертывание, скопируйте **новый** URL в GitHub `VITE_SHEETS_WEB_APP_URL` и пересоберите сайт.  
   - `doGet not found` → вставьте актуальный `Code.gs` и снова **новая версия** развертывания.

2. **Когда пишется строка** — при входе на пассаж `endgame` (сразу после privacy), не на финальном экране с графиком.

3. **На сайте** — F12 → Console после `endgame`:  
   - `Sheets submission skipped` → пересоберите GitHub Pages после добавления secrets.  
   - `Sheets submit failed` → смотрите `error` в логе (unauthorized, sheet not found, …).

4. **Секрет в проде** попадает в JS-бандл (это нормально для статического сайта, но строку лучше не светить). После починки можно сменить `SUBMIT_SECRET` в Apps Script + GitHub и сделать redeploy.
