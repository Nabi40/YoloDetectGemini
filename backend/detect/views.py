import os
import json
from django.conf import settings
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status

from .serializers import DetectionSerializer
from .utils.detect import detect_objects
from .utils.gemini import ask_gemini


class DetectView(APIView):
    def post(self, request):
        serializer = DetectionSerializer(data=request.data)

        if serializer.is_valid():
            image = serializer.validated_data['image']

            # Save uploaded image to /media
            original_path = os.path.join(settings.MEDIA_ROOT, image.name)
            # Ensure the media directory exists
            os.makedirs(os.path.dirname(original_path), exist_ok=True)
            with open(original_path, 'wb+') as destination:
                for chunk in image.chunks():
                    destination.write(chunk)


            # Run YOLO detection (now returns log output and annotated image path)
            detections, output_image_path, yolo_log, annotated_path = detect_objects(original_path)

            # Convert to URL for frontend
            output_image_url = request.build_absolute_uri(
                settings.MEDIA_URL + "detect_output/" + os.path.basename(output_image_path)
            )
            # Annotated image URL (served from same dir as output_image)
            annotated_image_url = request.build_absolute_uri(
                settings.MEDIA_URL + "detect_output/" + os.path.basename(annotated_path)
            )

            response_data = {
                "detections": detections,
                "output_image": output_image_url,
                "annotated_image": annotated_image_url,
                "yolo_log": yolo_log
            }
            print("Detection response:", json.dumps(response_data, indent=2))
            return Response(response_data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



class GeminiAskView(APIView):
    def post(self, request):
        question = request.data.get("question")
        image_url = request.data.get("image_url")

        result = ask_gemini(question, image_url)

        if not result["success"]:
            return Response(result, status=status.HTTP_400_BAD_REQUEST)

        return Response(result, status=status.HTTP_200_OK)