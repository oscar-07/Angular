FROM php:8.0-apache

#RUN docker-php-ext-install mysqli pdo pdo_mysql

RUN docker-php-ext-install pdo pdo_mysql

RUN apt-get update && apt-get install -y \
    zlib1g-dev \
    libzip-dev \
    unzip \
    nodejs build-essential \
    npm

RUN docker-php-ext-install zip


RUN apt-get install nodejs

RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer
