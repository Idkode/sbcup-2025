from fastapi import FastAPI, File, UploadFile, HTTPException
from PIL import Image
from ultralytics import YOLO
import os


model = YOLO(str(os.environ.get("MODEL", "./models/best.pt")))
conf = os.environ.get("CONF_THRESHOLD", 0.3)
iou = os.environ.get("IOU_THRESHOLD", None)
device = os.environ.get("DEVICE", 'cpu')

app = FastAPI()


@app.post("/detect")
async def analyze_image(file: UploadFile = File(...)) -> dict:
    """
    Receives an image file and returns information about it.
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Invalid file type." +
                            " Only images are allowed.")

    try:
        image = Image.open(file.file).convert('RGB')
        detections = []
        results = model.predict(image,
                                conf=conf,
                                device=device)

        if results:
            for result in results:
                boxes = result.boxes
                for box in boxes:
                    x1, y1, x2, y2 = map(float, box.xyxy[0])
                    class_id = int(box.cls[0])
                    pred_conf = float(box.conf[0])
                    detections.append(
                        {
                            "confidence": pred_conf,
                            "label": class_id,
                            "x1": x1,
                            "x2": x2,
                            "y1": y1,
                            "y2": y2
                        }
                    )
            print(detections)        
        return {
            "detections": detections
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing image: {e}")


if __name__ == '__main__':
    import uvicorn
    host = os.environ.get("UVICORN_HOST", "127.0.0.1")
    port = int(os.environ.get("UVICORN_PORT", 8000))
    uvicorn.run(app, host=host, port=port, reload=True)
