from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import PasswordReplaceSerializer, SignupSerializer, LoginSerializer, SendOTPSerializer, VerifyOTPOnlySerializer
from rest_framework import status
from user.models import User
from django.core.mail import send_mail
import random


class SignupView(APIView):
    def post(self, request):
        serializer = SignupSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.save()
            return Response(data, status=status.HTTP_201_CREATED)
        return Response({"success": False, "errors": serializer.errors}, status=400)


class LoginView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            return Response(serializer.validated_data, status=200)
        return Response({"success": False, "errors": serializer.errors}, status=400)




class SendOTPView(APIView):
    def post(self, request):
        serializer = SendOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"success": False, "message": "User not found"}, status=404)

        # generate OTP
        code = str(random.randint(100000, 999999))
        user.temp = code  # store in temp
        user.save(update_fields=['temp'])

        # send email
        send_mail(
            subject="Your OTP Code",
            message=f"Your OTP code is {code}. It is valid for 10 minutes.",
            from_email=None,
            recipient_list=[email],
        )

        return Response({"success": True, "message": "OTP sent to email"}, status=200)


class VerifyOTPView(APIView):  # ✅ Correct class name
    def post(self, request):
        serializer = VerifyOTPOnlySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email']
        otp_code = serializer.validated_data['otp']

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"success": False, "message": "User not found"}, status=404)

        if user.temp and user.temp == otp_code:
            return Response({"success": True, "message": "OTP verified"}, status=200)
        else:
            return Response({"success": False, "message": "Invalid OTP"}, status=400)


class PasswordReplaceView(APIView):
    def post(self, request):
        serializer = PasswordReplaceSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data['user']
        new_password = serializer.validated_data['new_password']

        user.set_password(new_password)
        user.temp = None
        user.save(update_fields=['password', 'temp'])

        return Response({"success": True, "message": "Password reset successful"}, status=200)