FROM python:3.11-slim
ENV PYTHONUNBUFFERED=1
WORKDIR /code

COPY requirements.txt /code/
COPY ./tools/entryscript.sh /usr/local/bin/entryscript.sh
RUN chmod +x /usr/local/bin/entryscript.sh
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

COPY . /code/
CMD ["/bin/sh", "/usr/local/bin/entryscript.sh"]