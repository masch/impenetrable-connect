# Spec: Backend API

## 1. Overview
The backend API is a Hono-based application running on Bun. It provides the core logic for the autonomous engine and services for both Tourists and Entrepreneurs.

## 2. Public Endpoints

### GET `/health`
Returns the current health status of the application.
- **Success Response**: `200 OK`
- **Body**: `{ "status": "ok", "timestamp": "ISO-STRING", "uptime": number }`
