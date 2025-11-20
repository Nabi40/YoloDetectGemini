from django.urls import path
from .views import PasswordReplaceView, SendOTPView, SignupView, LoginView, VerifyOTPView


urlpatterns = [
    path('signup/', SignupView.as_view(), name='signup'),
    path('login/', LoginView.as_view(), name='login'),

    path("send-otp/", SendOTPView.as_view(), name="send_otp"),
    path('verify-otp/', VerifyOTPView.as_view(), name='verify_otp'),
    path("replace-password/", PasswordReplaceView.as_view(), name="replace_password"),
]
