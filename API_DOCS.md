# FLMS API Documentation

This document provides a comprehensive list of available API endpoints in the FLMS Backend.

## Base URL
`http://<server-ip>:3000`

---

## 1. Authentication
Endpoints for user authentication and session management.

### Login
*   **Method:** `POST`
*   **Path:** `/api/auth/login`
*   **Description:** Authenticates a user and returns a JWT token.
*   **Body Parameters:**
    *   `username` (string, required)
    *   `password` (string, required)
*   **Response:**
    ```json
    {
      "message": "تم تسجيل الدخول بنجاح",
      "token": "JWT_TOKEN_HERE",
      "user": {
        "id": 1,
        "name": "User Name",
        "username": "username",
        "role": "Admin",
        "permissions": {}
      }
    }
    ```

---

## 2. Workers
Endpoints for managing worker records. All routes require a valid JWT token in the `Authorization` header.

### Get All Workers
*   **Method:** `GET`
*   **Path:** `/api/workers`
*   **Description:** Retrieves a list of all workers.
*   **Query Parameters:**
    *   `includeArchived` (boolean, optional) - If true, includes archived workers.
    *   `search` (string, optional) - Filters by Full_Name, Passport_Number, or NFC_UID.
*   **Response:** `Array<WorkerObject>`

### Get Worker by ID
*   **Method:** `GET`
*   **Path:** `/api/workers/:id`
*   **Description:** Retrieves detailed information for a specific worker.
*   **Response:** `WorkerObject`

### Create Worker
*   **Method:** `POST`
*   **Path:** `/api/workers`
*   **Description:** Creates a new worker record. Supports file uploads (multipart/form-data).
*   **Body Parameters:**
    *   `Full_Name` (string, required)
    *   `Passport_Number` (string, required)
    *   `Sponsor_ID` (number, optional)
    *   `NFC_UID` (string, optional)
    *   `Freelance` (boolean, optional)
    *   `Passport_Copy`, `Health_Cert_Copy`, `Residency_Copy`, `Personal_Photo_Copy` (Files)
    *   ... (other worker fields)
*   **Response:** `WorkerObject` (201 Created)

### Update Worker
*   **Method:** `PUT`
*   **Path:** `/api/workers/:id`
*   **Description:** Updates an existing worker record.
*   **Response:** `WorkerObject`

### Delete (Archive) Worker
*   **Method:** `DELETE`
*   **Path:** `/api/workers/:id`
*   **Description:** Archives a worker record instead of permanent deletion.
*   **Response:** `{"message": "تمت أرشفت السجل بنجاح"}`

---

## 3. Sponsors
Endpoints for managing sponsoring entities.

### Get All Sponsors
*   **Method:** `GET`
*   **Path:** `/api/sponsors`
*   **Query Parameters:** `includeArchived` (boolean)
*   **Response:** `Array<SponsorObject>`

### Get Sponsor by ID
*   **Method:** `GET`
*   **Path:** `/api/sponsors/:id`
*   **Response:** `SponsorObject`

### Create/Update/Delete Sponsor
*   Same patterns as Workers, using `/api/sponsors`.

---

## 4. Smart Cards
Endpoints for managing physical smart cards and linking them to workers.

### Get All Smart Cards
*   **Method:** `GET`
*   **Path:** `/api/smart-cards`
*   **Response:** `Array<SmartCardObject>`

### Check Duplicate NFC
*   **Method:** `GET`
*   **Path:** `/api/smart-cards/check-duplicate`
*   **Query Parameters:** `nfc_uid` (string)
*   **Response:** `{"isDuplicate": boolean}`

### Issue Smart Card
*   **Method:** `POST`
*   **Path:** `/api/smart-cards/issue`
*   **Body:** `{"nfc_uid": "string", "encryption_version": "string"}`
*   **Response:** `SmartCardObject`

### Link Card to Worker
*   **Method:** `POST`
*   **Path:** `/api/smart-cards/link`
*   **Body:** `{"card_id": number, "worker_id": number}`
*   **Response:** `{"message": "Card linked successfully", "card": CardObject}`

### Cancel Smart Card
*   **Method:** `POST`
*   **Path:** `/api/smart-cards/cancel/:id`
*   **Body:** `{"reason": "string"}`
*   **Response:** `{"message": "Card cancelled successfully"}`

---

## 5. Dashboard
Summary statistics for the system.

### Get Summary
*   **Method:** `GET`
*   **Path:** `/api/dashboard/summary`
*   **Response:**
    ```json
    {
      "totalWorkers": 100,
      "totalSponsors": 20,
      "activeCards": 80,
      "expiredHealthCerts": 5
    }
    ```

---

## 6. Biometrics
Endpoints for fingerprint operations.

### Enroll Fingerprint
*   **Method:** `POST`
*   **Path:** `/api/biometric/enroll`
*   **Description:** Starts the enrollment process for a worker.

### Identify Worker
*   **Method:** `POST`
*   **Path:** `/api/biometric/identify`
*   **Description:** Attempts to identify a worker via fingerprint.

### Get Status
*   **Method:** `GET`
*   **Path:** `/api/biometric/status`
*   **Description:** Checks the status of the biometric hardware bridge.

---

## 7. Users (Admin Only)
Endpoints for managing system users and roles.

### CRUD Operations
*   Routes at `/api/users` following standard REST patterns.

---

## 8. Audit Logs
### Get Audit Trails
*   **Method:** `GET`
*   **Path:** `/api/audit`
*   **Response:** `Array<AuditLogObject>`
