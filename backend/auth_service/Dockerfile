FROM python:3.11-slim

WORKDIR /code

COPY requirements.txt /code/
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# HEALTHCHECK --interval=10s --timeout=120s CMD curl -f http://transcendence:8300/v1/sys/health || exit 1

COPY . /code/
CMD [ "python", "manage.py", "runserver", "127.0.0.1:8000" ]