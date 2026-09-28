# BioControl — AI Facial Biomarker Health Screening

Программно-аппаратный комплекс предварительного AI-скрининга биомаркеров состояния здоровья по изображению лица в дизайне **Futuristic MedTech / Bento Grid**.

---

## Архитектура системы

* **`client/`**: Next.js 14+ (App Router), React, TypeScript, Tailwind CSS, Lucide Icons, Framer Motion. Включает плавающий темный Pill Dock-бар, интерактивный холст лица с пульсирующими неоновыми пинами (`#D4F938`) и модульную аналитическую панель Bento Grid.
* **`server/`**: NestJS backend API Gateway (TypeScript, Prisma ORM, PostgreSQL, Redis BullMQ, S3/MinIO presigned transfer).
* **`ai-service/`**: FastAPI (Python 3.12+), Face Quality Gate (Laplacian blur variance, MediaPipe landmarks, head pose orientation) и ONNX Runtime инференс.

---

## Быстрый запуск через Docker Compose

Запуск всего стека (Postgres, Redis, MinIO, NestJS, FastAPI, Next.js) одной командой:

```bash
docker-compose up --build
```

Сервисы будут доступны по адресам:
* **Web UI (Next.js):** [http://localhost:3000](http://localhost:3000)
* **API Gateway (NestJS):** [http://localhost:4000/api/v1/screening/recent](http://localhost:4000/api/v1/screening/recent)
* **AI Vision Engine (FastAPI Swagger):** [http://localhost:8000/docs](http://localhost:8000/docs)
* **MinIO Console (S3):** [http://localhost:9001](http://localhost:9001)

---

## Локальный запуск для разработки

### 1. Frontend (`client`)
```bash
cd client
npm install
npm run dev
```
Откройте [http://localhost:3000](http://localhost:3000) в браузере.

### 2. Backend Gateway (`server`)
```bash
cd server
npm install
npm run start:dev
```

### 3. AI Service (`ai-service`)
```bash
cd ai-service
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
