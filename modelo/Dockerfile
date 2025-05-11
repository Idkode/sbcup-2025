FROM python:3.13.3-bookworm

WORKDIR /

COPY requirements.txt .

RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1-mesa-glx \
    libglib2.0-0

RUN pip install --upgrade pip

RUN pip install --no-cache-dir -r requirements.txt

COPY app /app

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
