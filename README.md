# Real Estate Agent RAG System (No LLM / No Embeddings)

A production-ready Real Estate Agent backend & React analytics system built using pure SQL, deterministic scoring formulas, financial algorithms, and interactive Recharts data visualizers.

---

## 📌 Features

1. **SQL Keyword RAG Search**: Ranks properties by address matches (weight 3), description matches (weight 1), and exact filter bonus matches (+2 per criteria).
2. **Deterministic Client Matcher**: Preference scoring formula evaluating budget proximity, minimum bed/bath thresholds, location preference, and specific amenities.
3. **Market Intelligence Analytics**: Neighborhood metrics including price trends, crime indices, school ratings, and area demographic classifications.
4. **Financial Investment Analyzer**: Real-time calculations for ROI, Cap Rate, Gross Rental Yield, 5-Year Price Appreciation, and Break-Even timeline.
5. **Report Generator**: Automated text-formatted summaries for property profiles, investment models, market analysis, and top 10 client matches.
6. **React + Recharts Dashboard**: Responsive UI with search filters, interactive charts, property details, client matching engine, and favorites list.

---

## 🚀 Prerequisites

- **Python**: 3.9+
- **Node.js**: 18+
- **npm**: 9+

---

## 📂 Data Sources

- `backend/data/properties.csv`: 15 initial properties with full specification attributes (address, price, beds, baths, sqft, location, amenities, description).
- `backend/data/neighborhoods.csv`: Neighborhood market data (avg_price, price_trend, crime_rate, school_rating, demographics).

---

## 💻 Manual Setup & Installation

### 1. Backend Setup (FastAPI + SQLite)

```bash
# Navigate to backend folder
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run FastAPI server
uvicorn app:app --reload --port 8000
```

The API docs will be available at `http://localhost:8000/docs`.

### 2. Frontend Setup (React + Vite)

```bash
# From project root
npm install

# Start React app on port 3000
npm run dev
```

Visit the application UI at `http://localhost:3000`.

---

## 🛠️ Unified Execution Script

You can start both backend and frontend concurrently using:

```bash
chmod +x run_*.sh
./run_all.sh
```

---

## 📡 API Endpoints Summary

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/search` | Search & rank properties by keywords and filters |
| `GET` | `/api/property/{id}` | Get property details + neighborhood stats |
| `POST` | `/api/match` | Rank top property matches for client buyer profile |
| `GET` | `/api/neighborhood/{area}` | Get neighborhood statistics and active listings |
| `POST` | `/api/investment` | Perform ROI, Cap Rate & Appreciation calculation |
| `GET` | `/api/reports/property/{id}` | Formatted text property summary report |
| `GET` | `/api/reports/investment/{id}` | Formatted text investment analysis report |
| `GET` | `/api/reports/market/{area}` | Formatted text market analysis report |
| `POST` | `/api/favorites` | Save property to user's favorites list |
| `GET` | `/api/user/favorites` | Retrieve user saved favorite properties |
| `GET` | `/health` | Server health check |
