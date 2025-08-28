FROM python:3.12.1

WORKDIR /code


RUN pip install --upgrade pip 

COPY ./src/requirements.txt /code/

RUN pip install -r requirements.txt

COPY ./src/. /code/

EXPOSE 8080

ENTRYPOINT ["bash", "script.sh"]
# ENTRYPOINT ["python", "manage.py", "runserver", "0.0.0.0:8080"]