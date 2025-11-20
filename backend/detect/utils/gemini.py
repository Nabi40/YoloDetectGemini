import requests
import google.generativeai as genai
from django.conf import settings


def ask_gemini(question, image_url):
    """
    Sends question + image to Gemini and returns the model response.
    """

    if not question or not image_url:
        return {"success": False, "answer": None, "message": "question and image_url are required"}

    try:
        # Configure API key
        genai.configure(api_key=settings.GEMINI_API_KEY)

        # Download image bytes
        img_request = requests.get(image_url)
        if img_request.status_code != 200:
            return {"success": False, "answer": None, "message": "Invalid image URL"}

        image_bytes = img_request.content

        # Create model
        model = genai.GenerativeModel("gemini-2.5-flash")

        # Multimodal input
        response = model.generate_content([
            {"mime_type": "image/jpeg", "data": image_bytes},
            question
        ])

        return {"success": True, "answer": response.text}

    except Exception as e:
        return {"success": False, "answer": None, "message": str(e)}
