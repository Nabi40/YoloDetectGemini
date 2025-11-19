from rest_framework import serializers

class DetectionSerializer(serializers.Serializer):
    image = serializers.ImageField(required=True)
