from rest_framework import serializers
from .models import User
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from datetime import timedelta



class SignupSerializer(serializers.ModelSerializer):
    access = serializers.CharField(read_only=True)
    refresh = serializers.CharField(read_only=True)

    class Meta:
        model = User
        fields = ['fullname', 'email', 'password', 'access', 'refresh']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        fullname = validated_data['fullname']
        email = validated_data['email']
        password = validated_data['password']

        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError({"email": ["User already exists"]})

        # USE MANAGER
        user = User.objects.create_user(
            email=email,
            fullname=fullname,
            password=password
        )

        refresh = RefreshToken.for_user(user)

        return {
            "success": True,
            "access": str(refresh.access_token),
            "refresh": str(refresh)
        }
    


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    remember_me = serializers.BooleanField(default=False)

    def validate(self, data):
        email = data.get("email")
        password = data.get("password")
        remember_me = data.get("remember_me", False)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError("Invalid email or password")

        if not user.check_password(password):
            raise serializers.ValidationError("Invalid email or password")

        refresh = RefreshToken.for_user(user)
        if remember_me:
            refresh.set_exp(lifetime=timedelta(days=30))
        else:
            refresh.set_exp(lifetime=timedelta(days=1))

        return {
            "success": True,
            "access": str(refresh.access_token),
            "refresh": str(refresh)
        }



class SendOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()

class VerifyOTPOnlySerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6)




class PasswordReplaceSerializer(serializers.Serializer):
    email = serializers.EmailField()
    new_password = serializers.CharField(write_only=True)

    def validate(self, data):
        email = data.get("email")
        new_password = data.get("new_password")

        if not new_password:
            raise serializers.ValidationError({"message": "New password is required"})

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError({"message": "User not found"})

        if not user.temp:
            raise serializers.ValidationError({"message": "OTP not verified yet"})

        data['user'] = user
        return data