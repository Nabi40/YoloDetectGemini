# YoloDetectGemini  
## Advanced Object Detection System with AI-Powered Chatbot

An intelligent image analysis platform combining real-time **object detection using YOLO** with conversational AI capabilities powered by **Google Gemini**.

---

## 🌟 Features

### 🔍 Object Detection
- **YOLO11n Integration** – Real-time object detection with industry-leading accuracy  
- **Visual Annotations** – Automatic bounding box drawing with confidence scores  
- **Interactive Results** – Sortable detections table with detailed metrics  
- **Batch Processing** – Efficient handling of multiple image uploads  

---

### 💬 AI Chatbot
- **Gemini 2.5 Flash** – Advanced natural language understanding  
- **Context-Aware Q&A** – Ask questions about detected objects  
- **Multi-turn Conversations** – Maintains conversation history  
- **Visual Intelligence** – Combines detection results with Gemini AI  

---

### 🔐 Authentication & Security
- **JWT Authentication** – Secure token-based login  
- **Password Hashing** – Using Django PBKDF2 algorithm  
- **Remember Me Feature** – Extends session lifespan to **30 days**  
- **Session Management** – Access + Refresh token system  
- **OTP-Based Password Reset** – Email verification workflow  

---

### 🎨 Modern UI/UX
- **Responsive Design** – Built with Next.js + Tailwind CSS  
- **Live Preview** – Real-time image preview and detection visualization  
- **Interactive Dashboard** – Sortable detection console  
- **Drag & Drop** – Smooth file upload interface  

---

## 🛠️ Tech Stack

### Backend (Django REST Framework)
- Python 3.x  
- Django 4.x  
- Django REST Framework  
- `djangorestframework-simplejwt` – JWT Authentication  
- Ultralytics YOLO – Object detection (`yolo11n.pt`)  
- Google Generative AI – Gemini integration  
- Pillow – Image processing and annotation  
- SQLite / PostgreSQL database  

---

### Frontend (Next.js)
- Next.js 14 (App Router)  
- React 18  
- Tailwind CSS  
- JavaScript ES6+  

---

## 🔒 Authentication System

### **JWT Implementation**
The system uses **JSON Web Tokens** for secure, stateless authentication.

- **Access Tokens** – Short-lived (stored in `sessionStorage`)  
- **Refresh Tokens** – Long-lived for renewing access tokens  
- **Token Generation** – Created automatically using `RefreshToken.for_user()`  

---

### **Password Security**
- Hashing Algorithm: Django **PBKDF2 + SHA256**  
- Stored securely via `user.set_password()`  
- Verified via `user.check_password()`  

---

## configure and run
add the url and the other credentials in .env.local for frontend and .env for backend
then run docker compose up --build (be in the root dir)


### **Remember Me Feature**
Extends Refresh Token lifetime:


```python
if remember_me:
    refresh.set_exp(lifetime=timedelta(days=30))  # Extended session
else:
    refresh.set_exp(lifetime=timedelta(days=1))   # Standard session



