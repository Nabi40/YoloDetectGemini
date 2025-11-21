# YoloDetectGemini  
## Advanced Object Detection System with AI-Powered Chatbot

An intelligent image analysis platform combining real-time **object detection using YOLO** with conversational AI capabilities powered by **Google Gemini**.

---

## 🌟 Features

### 🔍 Object Detection
- **YOLO11n Integration** – Object detection from Image
- **Visual Annotations** – Automatic bounding box drawing with confidence scores  
- **Interactive Results** – Sortable detections table with detailed metrics   

---


## 🛠️ Tech Stack

### Backend (Django REST Framework)
- Python 3.10  
- Django 5.1.6
- Django REST Framework  
- `djangorestframework-simplejwt` – JWT Authentication  
- Ultralytics YOLO – Object detection (`yolo11n.pt`)  
- Google Generative AI – Gemini integration  
- Pillow – Image processing and annotation  
- PostgreSQL database  


---


### 💬 AI Chatbot
- **Gemini 2.5 Flash** – Q&A Based on annotated image  

---

### 🔐 Authentication & Security
- **JWT Authentication** – Secure token-based login  
- **Password Hashing** – Using Django PBKDF2 algorithm
- Hashing Algorithm: Django **PBKDF2 + SHA256**  
- Stored securely via `user.set_password()`  
- Verified via `user.check_password()`

- **Session Management** – Access + Refresh token system
- **Token Generation** – Created automatically using `RefreshToken.for_user()`
- **Access Tokens** – Short-lived (stored in `sessionStorage`)  
- **Refresh Tokens** – Long-lived for renewing access tokens

- **Remember Me Feature** – Extends session lifespan to **30 days**

```python
if remember_me:
    refresh.set_exp(lifetime=timedelta(days=30))  # Extended session
else:
    refresh.set_exp(lifetime=timedelta(days=1))   # Standard session
```
  
- **OTP-Based Password Reset** – Email verification workflow (tasted on mailtrap) 

---

### 🎨 Modern UI/UX
- **Responsive Design** – Built with Next.js + Tailwind CSS  
- **Live Preview** – Real-time image preview and detection visualization  
- **Interactive Dashboard** – Sortable detection console  
- **Drag & Drop** – Smooth file upload interface  


---


### Frontend (Next.js)
- Next.js 14 (App Router)  
- React 18  
- Tailwind CSS  
- JavaScript ES6+  


---


## configure and run
- **Git Clone** - clone the project and stay in root dir 
- **configure .env and .env.local** - add credentials for frontend and backend
- **wait-fot-it.sh** - wait-fot-it.sh is only for windows not for linux
- **docker compose** me in the root dir and run ``` docker compose up --build ```







