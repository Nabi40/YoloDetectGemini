from django.urls import path
from .views import DetectView, GeminiAskView

urlpatterns = [
    path('detect/', DetectView.as_view(), name='detect'),
    path("ask-gemini/", GeminiAskView.as_view(), name="ask_gemini"),
]
