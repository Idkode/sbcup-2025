FROM continuumio/miniconda3

WORKDIR /app

RUN mkdir cameras

COPY environment.yml .

RUN conda env create -f environment.yml

SHELL ["conda", "env", "run", "-n", "monitoring", "/bin/bash", "-c"]

COPY . .

ENV PYTHONUNBUFFERED=1

LABEL image.name="monitoring-python"

CMD ["conda", "run", "--no-capture-output", "-n", "monitoring", "python", "main.py"]