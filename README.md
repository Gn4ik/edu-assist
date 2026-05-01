# Учебный ассистент на базе ИИ

Интеллектуальный ассистент для генерации учебных материалов: конспектов, карточек для запоминания и тестов. 
Использует локальную LLM (Ollama + Llama 3.2) для работы полностью офлайн.

## Функциональность

- 📝 Генерация конспектов из текста или по теме
- 🃏 Создание карточек для запоминания (вопрос-ответ)
- ✅ Генерация тестов с вариантами ответов
- 📄 Поддержка файлов: TXT, PDF, DOCX
- 💾 Кэширование результатов
- 📑 Экспорт конспектов в PDF

## Технологии

- **Backend**: FastAPI (Python 3.13)
- **LLM**: Ollama + Llama 3.2 3B (или Gemma 2 2B)
- **Парсинг файлов**: PyPDF2, python-docx
- **Кэширование**: diskcache
- **PDF экспорт**: reportlab

## Требования

- Windows 10/11 + WSL2 (рекомендуется) или Linux
- 8+ ГБ RAM (рекомендуется 12 ГБ для WSL)
- 5+ ГБ свободного места на диске
- Установленный Docker/WSL (для Windows)

## Установка и запуск бэкенда

### 1. Клонирование репозитория

```bash
git clone https://github.com/yourusername/edu-assistant.git
cd edu-assistant
```

### 2. Установка Ollama

**Linux / WSL:**

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

**Windows:** Скачайте с ollama.com/download

### 3. Загрузка модели

```bash
ollama pull <model>
```

- Можно использовать любую доступную модель. Например: `llama3.2:3b`, `gemma2:2b`, ...

### 4. Запуск Ollama сервера

```bash
ollama serve
```

### 5. Настройка бэкенда

Перейдите в папку бэкенда:

```bash
cd backend
```

Создайте виртуальное окружение и установите зависимости:

```bash
python3 -m venv venv
source venv/bin/activate
venv\Scripts\activate

pip install --upgrade pip
pip install -r requirements.txt
```

### 6. Переменные окружения

Скопируйте файл `.env_example`

```bash
cp .env_example .env
```

Заполните `.env` файл:

```text
OLLAMA_HOST="адрес ollama сервера"
OLLAMA_MODEL="название модели"
OLLAMA_TIMEOUT=время ожидания ответа от сервера ollama
```

### 7. Запуск бэкенда

```bash
python3 run.py
```
