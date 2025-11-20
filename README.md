# YoloDetectGemini  
## Facial Attendance App 🧑‍💼 Attendance System

A real-time facial attendance system built with **Vite React (Next.js)** on the frontend and **Django Rest Framework + OpenCV + YOLOv8 + FaceNet** on the backend.  
It captures a live **RTSP webcam feed**, detects faces using **YOLO**, recognizes them via **FaceNet embeddings**, and logs attendance into the database.

---

## 📹 Live Stream & Face Recognition

- Backend fetches frames from an **RTSP IP camera**  
- **YOLOv8** detects faces from video frames  
- **FaceNet** verifies identities using pre-stored embeddings  
- Attendance is recorded **only if the person hasn’t already been logged** in the last second  

---

## 🛠 Tech Stack

### **Frontend (Vite + React + Next.js)** 🌐  
- Built with **Next.js** for a modern React development experience  
- Displays live webcam feed from the backend  

**Authentication Flow:**  
- Manages user sessions using **Access Token** from backend  
- **"Remember Me" Feature:**  
  - Extends Refresh Token lifetime to **30 days**  
  - Defaults to **1 day** if disabled  

**Components:**
- `dashboard.js` — Main logic for YOLO detection + Gemini Q&A  
- `login.js`, `signup.js` — User authentication  
- `sendotp.js`, `resetpass.js` — Password recovery flow  

---

### **Backend (Django + DRF)** 🐘  
**Core Technology:**  
- Django Rest Framework (DRF) handles API layer  

**Computer Vision:**  
- **YOLOv8** (`yolo11n.pt`) for efficient face detection  
- **FaceNet** to generate accurate face embeddings  
- **OpenCV** for RTSP video processing  

**Security & Authentication:**  
- **JWT** via `rest_framework_simplejwt` for stateless authentication  
- **Password Hashing:**  
  - Passwords securely hashed using Django's `set_password()`  
- Provides both **access** and **refresh** tokens on login/signup  

**Backend Features:**  
- RTSP camera integration  
- Background thread for continuous recognition  
- REST API for user auth & attendance logs  
- OTP-based password reset (stored in `User.temp`)  

---

## ✅ Features

- Real-time RTSP live feed processing  
- Non-blocking background recognition thread  
- Skips duplicate attendance logs within **1 second**  
- Embedded face recognition + attendance logging  
- Webcam feed as a streaming endpoint  
- JWT authentication for secure API access  
- “Remember Me” token lifetime control (30 days / 1 day)  
- Secure password hashing  
- Email-based OTP password recovery  

---

## ❌ Limitations

- No face registration UI yet (images added manually)  
- RTSP credentials currently hardcoded  
- No frontend dashboard for attendance list (backend API only)  
- OTP has no expiration timer (validated only via `User.temp`)  

---

# 📘 Backend Implementation Details

### **User & Authentication**

| Feature | Backend Implementation | Details |
|--------|------------------------|---------|
| **User Model** | `user/models.py` (User class) | Custom model using `AbstractBaseUser` and `CustomUserManager`; handles hashing and custom fields (fullname, email). |
| **Password Security** | `create_user`, `create_superuser` | Passwords securely hashed using `user.set_password(password)` before saving. |
| **Login/Signup** | `user/serializers.py` (SignupSerializer, LoginSerializer) | Returns **access** and **refresh** JWT tokens on successful authentication. |
| **Token Lifespan** | `LoginSerializer` | If `remember_me=True`, Refresh Token = **30 days**; else **1 day**. |
| **Password Recovery** | `SendOTPView`, `VerifyOTPView`, `PasswordReplaceView` | Generates OTP (random integer), stores in `User.temp`, verifies before allowing password change. |

---

# 📘 Computer Vision Components

| Component | Backend Implementation | Role |
|----------|-------------------------|------|
| **Face Detection** | `detect/utils/detect.py` | Uses **Ultralytics YOLO (yolo11n.pt)** to detect faces in frames. |
| **Face Recognition** | Integrated logic (internal) | Matches detected faces using precomputed **FaceNet embeddings**. |
| **AI Q&A (Gemini)** | `detect/utils/gemini.py`, `detect/views.py` | Sends image URL + question to **Gemini 2.5 Flash API** to generate contextual answers. |

---

