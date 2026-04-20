# Spec: Backend Health Check

**Change Name:** `backend-init-health-check`
**Related Proposal:** [proposal.md](./proposal.md)

## 1. Requirement: Health Monitoring

The backend must provide a public, non-authenticated endpoint to verify that the service is running and healthy.

## 2. API Specification

### GET `/health`

Returns the current health status of the application.

**Request:**

- Method: `GET`
- Path: `/health`
- Auth: None

**Successful Response:**

- Status: `200 OK`
- Content-Type: `application/json`
- Body:
  ```json
  {
    "status": "ok",
    "timestamp": "2026-04-20T12:50:00.000Z",
    "uptime": 12.34
  }
  ```

## 3. Test Scenarios

### Scenario 1: Health check returns success

- **Given** the backend server is running.
- **When** a `GET` request is made to `/health`.
- **Then** the status code should be `200`.
- **And** the response body should contain `status: "ok"`.
- **And** the response body should contain a valid ISO `timestamp`.
- **And** the response body should contain a numerical `uptime` in seconds.

## 4. Technical Constraints

- **Framework**: Hono.
- **Testing**: Must use `app.request()` for integration testing.
- **Response Time**: Should be < 50ms.
