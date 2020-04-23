FROM python:3.7-slim

ENV PYTHONUNBUFFERED 1

RUN mkdir /code

WORKDIR /code
EXPOSE 8000

RUN BUILD_DEPS=" \
        build-essential \
        libpcre3-dev \
        libpq-dev \
        gdal-bin \
        wget \
        git \
        libsqlite3-dev \
        zlib1g-dev \
    " \
    && apt-get update && apt-get install -y --no-install-recommends $BUILD_DEPS

RUN git clone https://github.com/mapbox/tippecanoe.git && cd tippecanoe && make -j && make install

# RUN pip install --upgrade pip

# COPY requirements.txt /code/
# RUN pip install -r /code/requirements.txt 
COPY . /code/
RUN set -ex \
    pip install --upgrade pip \
    && pip install -r requirements.txt
    # && pip install virtualenv --user \
    # && virtualenv venv \
    # && . venv/bin/activate \
    # && pip install -r requirements.txt


