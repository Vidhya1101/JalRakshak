# JalRakshak 🌧️

### Predictive Urban Flood Risk Intelligence for Jammu

JalRakshak is an AI-powered Smart City prototype designed to help identify locations in Jammu that may be vulnerable to waterlogging and drainage-related flooding.

Instead of responding only after waterlogging occurs, JalRakshak combines **historical incidents, current weather conditions, upcoming rainfall forecasts, drainage vulnerability, waste hotspots, and terrain factors** to estimate location-level flood risk and prioritize preventive action.

## 🚨 Problem

Jammu experiences waterlogging and drainage-related problems during heavy rainfall. Blocked drains, waste accumulation, drainage limitations and vulnerable locations can increase the impact of rainfall.

The key challenge is:

> **How can Jammu identify vulnerable locations before rainfall causes severe waterlogging and prioritize preventive action?**

## 💡 Solution

JalRakshak follows:

**Past + Present + Forecast → Risk Prediction → Preventive Action**

The system:

- Analyzes historical waterlogging and drainage incidents
- Retrieves current weather conditions
- Uses rainfall forecasts
- Evaluates drainage and waste-related risks
- Calculates a location-level Flood Risk Score
- Visualizes risk on an interactive Jammu map
- Recommends preventive actions for high-risk locations

## 🗺️ Key Features

- Interactive Jammu risk map
- Historical incident visualization
- Current weather and precipitation data
- Rainfall forecast analysis
- Location-level flood risk scoring
- Past / Now / Forecast map views
- Risk levels: Low, Moderate, High and Critical
- Historical incident timeline
- What-if rainfall simulation
- Preventive action recommendations
- Live data refresh
- Demo mode for unavailable data sources

## ⚙️ Risk Model

The prototype combines:

| Factor | Weight |
|---|---:|
| Historical Vulnerability | 25% |
| Current Rainfall | 20% |
| Forecast Rainfall | 25% |
| Drainage Risk | 15% |
| Waste Risk | 10% |
| Terrain Risk | 5% |

**Note:** These are prototype weights intended for demonstration. They should be calibrated and validated using official municipal and historical datasets before real-world deployment.

## 🌦️ Data

The system is designed to use:

- Weather and precipitation data
- Historical civic incidents
- Drainage information
- Waste hotspot information
- Terrain/geographic information

Where official datasets are unavailable, the prototype uses clearly labelled demonstration/simulated data.

## 🛠️ Technology

- React
- Vite
- Tailwind CSS
- Leaflet
- OpenStreetMap
- Recharts
- Weather API
- JavaScript
- Python/FastAPI (planned/optional backend)
- Machine Learning (future enhancement)

## 🤖 Future AI/ML Enhancement

The current prototype uses a transparent risk-scoring engine.

With sufficient historical municipal data, the system can be enhanced using machine learning models such as:

- Random Forest
- XGBoost

These models could learn relationships between rainfall, drainage conditions, historical incidents, terrain and actual waterlogging events.

## 🎯 Impact

JalRakshak aims to help municipal authorities move from:

**Reactive Response**

Problem → Detection → Response

to:

**Predictive Prevention**

Data → Risk Prediction → Priority Action → Prevention

## ⚠️ Prototype Disclaimer

JalRakshak is a hackathon prototype and is not an official Jammu municipal flood-warning system.

Live weather information may be obtained through external weather services, while some civic and historical information may use demonstration data where official datasets are unavailable.

## 📌 Hackathon

Developed for the **Jammu Smart City Hackathon (JSCH)**.

### Core Idea

> **Predict before the rain. Prevent before the flood.**
