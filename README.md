# BaggageLens - Smart Luggage Identification System

A comprehensive AI-powered system for matching lost and found luggage using CNN and Siamese neural networks.

## 🏗️ Architecture Overview

```
Web App (Unified)  ─┐
                   │
Passenger Mobile ───→ Node.js API → MongoDB
                   │            │
                   │            ↓
                   │      FastAPI AI Model
                   │            ↓
                   └─→ Image Similarity
```

## 📂 Project Structure

```
smart-luggage-system/
├── backend-api/          ← Node.js + Express API
├── ai-model/             ← Python + TensorFlow CNN + Siamese
├── web/                  ← React Web App (Unified)
│   ├── Passenger Pages   ← Shown based on login role
│   └── Staff Dashboard   ← Shown based on login role
├── mobile-app/           ← Flutter mobile app
└── docker-compose.yml    ← Orchestration
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- Python 3.8+
- Docker & Docker Compose
- Flutter SDK (for mobile)

### Setup

1. **Backend API**
   ```bash
   cd backend-api
   npm install
   npm start
   ```

2. **AI Model Service**
   ```bash
   cd ai-model
   pip install -r requirements.txt
   python api.py
   ```

3. **Unified Web App** (Passenger & Staff)
   ```bash
   cd web
   npm install
   npm start
   # Role-based UI displays based on login
   ```
   ```bash
   cd mobile-app
   flutter pub get
   flutter run
   ```

### Using Docker Compose
```bash
docker-compose up -d
```

## 🧠 AI Model

### Training
```bash
cd ai-model
python train.py
```

### Model Architecture
- **CNN** for feature extraction from luggage images
- **Siamese Network** for similarity comparison between lost and found bags
- **Output** similarity score (0-1)

## 🔐 Authentication

- JWT tokens for API authentication
- OTP for passenger verification
- Role-based access control (Passenger, Staff, Admin)

## 📊 Key Endpoints

### Backend API
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/luggage/report` - Report lost luggage
- `POST /api/luggage/find` - Record found luggage
- `POST /ai/match` - Match luggage images
- `GET /api/matches/:id` - Get matches for a case

### AI API
- `POST /compare` - Compare two luggage images
- `POST /match-batch` - Find matches in batch

## 📱 Platforms

| Platform | Framework | Features |
|----------|-----------|----------|
| Web (Unified) | React | Role-based UI for Passengers & Staff |
|  |  | Image upload, case tracking, dashboard |
|  |  | Case management, analytics |
| Mobile | Flutter | Cross-platform (iOS/Android) app |

## 🗄️ Database

- **MongoDB Atlas** for storing:
  - User profiles
  - Lost luggage cases
  - Found luggage records
  - Match results
  - Notifications

## 💾 Storage

- **AWS S3** or **Firebase Storage** for luggage images

## 📈 Scalability

- Microservices architecture
- Containerized services (Docker)
- Load balancing ready
- Cloud deployment ready (AWS, GCP, Azure)


