"""
Django settings for quAnGisWeb project.

Generated by 'django-admin startproject' using Django 4.0.2.

For more information on this file, see
https://docs.djangoproject.com/en/4.0/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/4.0/ref/settings/
"""

from pathlib import Path
import os

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/4.0/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ['DJANGO_KEY']

TDB_URL = os.environ['TDB_URL']
TDB_USER = os.environ['TDB_USER']
TDB_PASS = os.environ['TDB_PASS']

# [SC][TODO] validate values before assigning
# [SC] address of question parser service (e.g., localhost, 127.0.0.1, etc)
QPARSE_IP=os.environ['QPARSE_IP']
# [SC] port of question parser service
QPARSE_PORT=os.environ['QPARSE_PORT']
# [SC] how long to wait for a response from the question parser service (in milliseconds)
QPARSE_WAIT=int(os.environ['QPARSE_WAIT'])

# [SC][TODO] make sure to set DEBUG=False for the production server!!!!
DEBUG = True

ALLOWED_HOSTS = ['*']


# Application definition

INSTALLED_APPS = [
    'blocklyUI.apps.BlocklyuiConfig',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'customMiddlewares.customLogs.RequestLogMiddleware', # [SC] custom middleware for logging
]

SESSION_ENGINE = "django.contrib.sessions.backends.signed_cookies"

# [SC] custom logging settings
# Log file configuration
LOGGING = {
    'version': 1,
    'disable_existing_loggers': True,    # Whether to disable the existing logger
    'formatters': {                      # The format of log information display
        'verbose': {'format': '[%(asctime)s %(levelname)s [%(module)s:%(lineno)d] [%(process)d:%(threadName)s] %(message)s'},
        'simple':  {'format': '%(asctime)s %(levelname)s [%(module)s:%(lineno)d] %(message)s'},
        'complex': {'format': '[%(hostname)s source_ip:%(source_ip)s] [%(asctime)s %(levelname)s [%(module)s:%(lineno)d] [%(process)d:%(threadName)s] %(message)s'},
    },
    'filters': {
        'new_add': {
            '()': 'customMiddlewares.customLogs.RequestLogFilter',
        },
    },
    'handlers': {          # Log processing method
        'console': {      # Output logs to the terminal
            'level': 'INFO',
            'filters': ['new_add'],
            'class': 'logging.StreamHandler',
            'formatter': 'complex'
        },
    },
    'loggers': {
        'django': {      # Defines a name django A new logger
            'handlers': ['console'],              # It can output log to terminal and file at the same time
            'level': 'INFO',                      # The lowest log level that the logger receives
            'propagate': False,                   # Whether to inherit the log Information ,0: no 1: yes
        },
    }
}


ROOT_URLCONF = 'quAnGisWeb.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'quAnGisWeb.wsgi.application'


# Database
# https://docs.djangoproject.com/en/4.0/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}


# Password validation
# https://docs.djangoproject.com/en/4.0/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/4.0/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'CET'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/4.0/howto/static-files/

STATIC_URL = 'static/'

# [SC][TODO] For the production server, uncomment this variable and 
# set to an absolute path of folder containing all aggregated static files!!!!
# STATIC_ROOT = "allStatics/"

# Default primary key field type
# https://docs.djangoproject.com/en/4.0/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
