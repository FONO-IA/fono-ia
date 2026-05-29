FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

COPY . /app/

# Certifique-se de que a porta que o seu run.py expõe é a 8080
EXPOSE 8080

# Comando exato pedido, usando o interpretador do container
CMD ["python", "run.py"]