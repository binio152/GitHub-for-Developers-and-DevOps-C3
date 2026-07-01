FROM python:alpine3.24

WORKDIR /app

COPY requirements.txt .

RUN python -V
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD [ "pyhton", "app/main.py" ]
