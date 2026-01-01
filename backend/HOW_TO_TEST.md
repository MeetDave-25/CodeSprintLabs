# 🧪 How to Test Your Backend API

Your Laravel server is running at: **http://localhost:8000**

## ✅ Step 1: Test in Your Browser

Open your web browser and go to:
```
http://localhost:8000/api/health
```

You should see:
```json
{"status":"ok","message":"CodeSprint Labs API is running"}
```

## ✅ Step 2: Test with PowerShell (Windows)

Open a **NEW** PowerShell terminal (not the one running the server) and run:

```powershell
Invoke-WebRequest -Uri "http://localhost:8000/api/health" | Select-Object -ExpandProperty Content
```

## ✅ Step 3: Test Registration

In PowerShell:
```powershell
$body = @{
    name = "Test Student"
    email = "student@test.com"
    password = "password123"
    password_confirmation = "password123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/api/auth/register" -Method Post -Body $body -ContentType "application/json"
```

## ✅ Step 4: Test Login

```powershell
$loginBody = @{
    email = "student@test.com"
    password = "password123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
```

This will return a **token** - save it!

## ✅ Step 5: Use Postman (Recommended)

1. **Download Postman**: https://www.postman.com/downloads/
2. **Create a new request**
3. **Set URL**: `http://localhost:8000/api/health`
4. **Click Send**

### Test Registration in Postman:
- **Method**: POST
- **URL**: `http://localhost:8000/api/auth/register`
- **Body** → **raw** → **JSON**:
```json
{
    "name": "Test Student",
    "email": "student@test.com",
    "password": "password123",
    "password_confirmation": "password123"
}
```

### Test Login in Postman:
- **Method**: POST
- **URL**: `http://localhost:8000/api/auth/login`
- **Body** → **raw** → **JSON**:
```json
{
    "email": "student@test.com",
    "password": "password123"
}
```

## 📝 All Available Endpoints

### Public (No Auth Required)
- `GET http://localhost:8000/api/health`
- `POST http://localhost:8000/api/auth/register`
- `POST http://localhost:8000/api/auth/login`

### Student (Requires Token)
- `GET http://localhost:8000/api/student/profile`
- `PUT http://localhost:8000/api/student/profile`
- `GET http://localhost:8000/api/student/tasks`

### Admin (Requires Admin Token)
- `GET http://localhost:8000/api/admin/students`
- `GET http://localhost:8000/api/admin/submissions`

## 🔑 Using Tokens (Protected Routes)

After login, you get a token. Use it like this:

**In Postman:**
- Go to **Headers** tab
- Add: `Authorization` = `Bearer YOUR_TOKEN_HERE`

**In PowerShell:**
```powershell
$token = "YOUR_TOKEN_HERE"
$headers = @{
    "Authorization" = "Bearer $token"
}
Invoke-RestMethod -Uri "http://localhost:8000/api/student/profile" -Headers $headers
```

---

**Easiest way: Just open your browser and go to `http://localhost:8000/api/health`** ✅
