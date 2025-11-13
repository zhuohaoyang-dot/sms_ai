# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SMS Dashboard is a full-stack monitoring application for AI-generated SMS results and evaluation metrics. It consists of a Node.js/Express backend and a React/Vite frontend that visualizes data from two MySQL databases: `bl_venture_ai` (AI results) and `bl_venture_matter` (matter information).

## Architecture

### Backend (sms_integration_hub/)
- **Entry Point**: `src/app.js` - Express server with middleware setup and route registration
- **Database Layer**:
  - `src/config/database.js` - MySQL2 connection pool with helpers (`query`, `queryAI`, `queryMatter`)
  - Two-database architecture: AI results database and Matter database
  - Cross-database JOINs link AI results to matter metadata via `matter_id`
- **Data Models**:
  - `src/models/aiGenerateResult.js` - Core model handling AI result queries, metrics aggregation, and time-series data
  - `src/models/matter.js` - Matter lookup and search functionality
- **Services Layer**:
  - `src/services/metricsService.js` - Calculates accuracy/flag rates and aggregates period-specific metrics
  - `src/services/chartService.js` - Formats data for Recharts visualization
- **Routes**:
  - `/api/overview/*` - Dashboard metrics and time-series data
  - `/api/backoffice/*` - Paginated records and individual record details
- **Middleware**: Error handling and validation in `src/middleware/`

### Frontend (sms-integration-hub-frontend/)
- **Component Structure**:
  - `App.jsx` - Main container managing panel state (Overview/Backoffice)
  - `components/Overview.jsx` - Dashboard with pie charts and line charts
  - `components/Backoffice.jsx` - Data table with filtering, pagination, and modal details
  - `components/RecordModal.jsx` - Detailed view of individual AI results
  - `components/Sidebar.jsx` & `components/RightBar.jsx` - Navigation
- **API Layer**: `src/services/api.js` - Axios-based API client with typed endpoints
- **Data Visualization**: Uses Recharts library for pie charts (accuracy/flag rates) and line charts (trends)

### Data Flow
1. Backend queries aggregate AI results from `bl_ai_generate_result` table
2. JOINs with `bl_matter` table to enrich records with matter names and IDs
3. JSON fields (`result_data`, `evaluate_result`) are parsed in models
4. Services calculate rates: Accuracy = (sent without modification / total sendable), Flag = (flagged / total records)
5. Frontend displays metrics with visual charts and filterable tables

## Key Business Logic

### Send Status Values
- `1` = Sent without modification
- `2` = Sent with modification
- Combined (1, 2) = Total sendable records

### Metrics Calculations
- **Accuracy Rate**: `sent_without_modification / total_sendable * 100`
- **Flag Rate**: `flagged_count / total_sendable * 100`
- Time-series data grouped by day/month/year for trend visualization

### JSON Field Structure
- `result_data`: Contains `text`, `replyAction`, `scheduleAtUTC`, `desc`, `action`
- `evaluate_result`: Contains `approved` (boolean), `flag`, `reason`
- `modified_data`: May be JSON or plain text (handled with try/catch)

## Development Commands

### Backend
```bash
cd sms_integration_hub
npm install
npm run dev          # Start with nodemon (auto-reload)
npm start            # Production start
npm run test:db      # Test database connection and queries
```

### Frontend
```bash
cd sms-integration-hub-frontend
npm install
npm run dev          # Start Vite dev server (port 5173)
npm run build        # Production build
npm run lint         # Run ESLint
npm run preview      # Preview production build
```

## Environment Configuration

Create `.env` in `sms_integration_hub/`:
```
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

## Important Patterns

### Database Queries
- Always use `query(database, sql, params)` with parameterized queries to prevent SQL injection
- For cross-database queries, explicitly specify database in FROM/JOIN: `bl_venture_ai.table JOIN bl_venture_matter.table`
- Connection pooling is configured with 10 connections max
- Always release connections in try/finally blocks

### Error Handling
- Backend uses centralized error handler in `middleware/errorHandler.js`
- Models catch and log errors before re-throwing
- Frontend API calls wrap errors with context in catch blocks

### JSON Parsing
- Use defensive parsing with try/catch for all JSON fields from database
- Check for both string and object types before parsing
- Provide fallback empty objects/arrays on parse failure

### API Query Parameters
- Overview metrics: `?period=daily|monthly|yearly&startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`
- Backoffice records: `?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&page=1&limit=50`

## Testing

Database connection and queries can be tested with:
```bash
npm run test:db
```

This runs `testCrawler.js` which validates:
1. MySQL connection
2. Queries to both databases
3. JOIN operations
4. Aggregate metrics calculations
5. JSON parsing logic

## Matter Links

Records include matter links formatted as: `app.bridgify.com/v2/matter/id/{matter_digital_id}/overview`

Note: `matter_digital_id` comes from `bl_matter.id`, while `matter_id` is the linking field.
