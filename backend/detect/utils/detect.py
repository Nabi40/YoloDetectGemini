# import json
# import os
# from ultralytics import YOLO
# from PIL import Image

# def detect_objects(image_path):
#     # Load YOLO11 model
#     model = YOLO("yolo11n.pt")  # change if needed

#     # Run detection with save=True to save output
#     results = model(image_path, save=True)  

#     # YOLO automatically saves image with boxes in: runs/detect/predict/
#     saved_image_path = results[0].save_dir + "/" + os.path.basename(image_path)

#     # Prepare JSON result list
#     detections = []

#     for result in results:
#         for box in result.boxes:
#             cls = int(box.cls[0])                       
#             label = result.names[cls]                  
#             confidence = float(box.conf[0])             
#             xyxy = box.xyxy[0].tolist()                 

#             detections.append({
#                 "class": label,
#                 "confidence": round(confidence, 4),
#                 "bbox_xyxy": xyxy
#             })

#     return detections, saved_image_path


# if __name__ == "__main__":
#     # Ask user to upload or enter image path
#     image_path = input("Enter the image file path: ")

#     # Run detection
#     result, saved_path = detect_objects(image_path)

#     # Print result as JSON
#     print(json.dumps({"detections": result, "saved_image": saved_path}, indent=4))





import os
import json
from ultralytics import YOLO
from PIL import Image

model = YOLO("yolo11n.pt")  # load once for speed


def detect_objects(image_path):
    import io
    import sys
    # Capture stdout
    old_stdout = sys.stdout
    sys.stdout = mystdout = io.StringIO()
    try:
        results = model(image_path, save=True)
        yolo_output = mystdout.getvalue()
    finally:
        sys.stdout = old_stdout

    # YOLO saves image automatically here:
    saved_image_path = results[0].save_dir + "/" + os.path.basename(image_path)

    detections = []

    # Annotate image with class and accuracy
    from PIL import ImageDraw, ImageFont
    im = Image.open(saved_image_path).convert("RGB")
    draw = ImageDraw.Draw(im)
    try:
        font = ImageFont.truetype("arial.ttf", 18)
    except:
        font = ImageFont.load_default()

    for result in results:
        for box in result.boxes:
            cls = int(box.cls[0])
            label = result.names[cls]
            confidence = float(box.conf[0])
            xyxy = box.xyxy[0].tolist()

            detections.append({
                "class": label,
                "confidence": round(confidence, 4),
                "bbox_xyxy": xyxy
            })

            # Draw box and label
            x1, y1, x2, y2 = xyxy
            draw.rectangle([x1, y1, x2, y2], outline="red", width=2)
            text = f"{label} {confidence:.2f}"
            # Use draw.textbbox for text size (Pillow >=8.0.0)
            bbox = draw.textbbox((x1, y1), text, font=font)
            text_width = bbox[2] - bbox[0]
            text_height = bbox[3] - bbox[1]
            draw.rectangle([x1, y1 - text_height, x1 + text_width, y1], fill="red")
            draw.text((x1, y1 - text_height), text, fill="white", font=font)

    # Save annotated image as file_name_annotate.jpg
    base, ext = os.path.splitext(saved_image_path)
    annotated_path = base + "_annotate" + ext
    im.save(annotated_path)

    # Copy both images to media/detect_output/
    import shutil
    from django.conf import settings
    media_output_dir = os.path.join(settings.MEDIA_ROOT, "detect_output")
    os.makedirs(media_output_dir, exist_ok=True)
    # Copy YOLO output image
    yolo_output_filename = os.path.basename(saved_image_path)
    yolo_output_dest = os.path.join(media_output_dir, yolo_output_filename)
    shutil.copy2(saved_image_path, yolo_output_dest)
    # Copy annotated image
    annotated_filename = os.path.basename(annotated_path)
    annotated_dest = os.path.join(media_output_dir, annotated_filename)
    shutil.copy2(annotated_path, annotated_dest)

    return detections, yolo_output_dest, yolo_output, annotated_dest
