# SMS Dashboard - Integration Hub

Dashboard for monitoring AI-generated results and evaluation metrics.

## 📋 Project Structure

```
sms_dashboard/
├── sms_integration_hub/          # Backend (Node.js/Express)
│   ├── src/
│   │   ├── config/               # Database configuration
│   │   ├── controllers/          # Request handlers
│   │   ├── models/               # Data models
│   │   ├── routes/               # API routes
│   │   ├── services/             # Business logic
│   │   └── middleware/           # Express middleware
│   └── package.json
│
└── sms-integration-hub-frontend/ # Frontend (React + Vite)
    ├── src/
    │   ├── components/           # React components
    │   ├── services/             # API service layer
    │   └── App.jsx               # Main app component
    └── package.json
```

## 🚀 Quick Start

### Backend Setup

```bash
cd sms_integration_hub
npm install
cp .env.example .env  # Configure your environment variables
npm run dev
```

### Frontend Setup

```bash
cd sms-integration-hub-frontend
npm install
npm run dev
```

## 🔧 Environment Variables

Create a `.env` file in `sms_integration_hub/` directory:

```env
PORT=3000
CORS_ORIGIN=http://localhost:5173

MYSQL_HOST=your_host
MYSQL_PORT=3306
MYSQL_USERNAME=your_username
MYSQL_PASSWORD=your_password

DB_NAME_AI=bl_venture_ai
DB_NAME_MATTER=bl_venture_matter

NODE_ENV=development
```

## 📊 Features

- **Overview Panel**: Dashboard metrics with accuracy and flag rate visualization
- **Backoffice Panel**: Detailed record management with filtering and pagination
- **Real-time Charts**: Pie charts and line charts using Recharts
- **Modal Details**: Detailed view of individual records
- **Date Filtering**: Filter data by custom date ranges

## 🛠️ Tech Stack

**Backend:**
- Node.js + Express
- MySQL (mysql2)
- CORS

**Frontend:**
- React 19
- Vite
- Recharts (Data visualization)
- Lucide React (Icons)
- Axios (HTTP client)

## 📝 API Endpoints

### Overview
- `GET /api/overview/metrics` - Get dashboard metrics

### Backoffice
- `GET /api/backoffice/records` - Get paginated records
- `GET /api/backoffice/record/:id` - Get single record details

## 🔒 Security Notes

- Environment variables should never be committed
- API endpoints currently have no authentication (add before production)
- CORS is configured for development

## 📄 License

ISC

