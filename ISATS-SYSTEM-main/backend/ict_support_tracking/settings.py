import os
import sys
from pathlib import Path
from decouple import config

# ==================================================
# BASE DIRECTORY
# ==================================================
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

# ==================================================
# SECURITY
# ==================================================
SECRET_KEY = config(
    'SECRET_KEY',
    default='django-insecure-change-me-in-production!!!'
)

DEBUG = True  # ❗ Set False in production

ALLOWED_HOSTS = [
    'localhost',
    '127.0.0.1',
    'your-production-domain.com',
]

# ==================================================
# APPLICATION DEFINITION
# ==================================================
INSTALLED_APPS = [
    # Django core apps
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third-party apps
    'rest_framework',
    'crispy_forms',
    'crispy_bootstrap5',
    'corsheaders',
    'graphene_django',
    'django_filters',

    # Local apps
    'core',
    'organizations',
]

# ==================================================
# MIDDLEWARE
# ==================================================
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# ==================================================
# CORS (Development only)
# ==================================================
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:8000',
    'http://127.0.0.1:8000',
]
CORS_ALLOW_CREDENTIALS = True

# ==================================================
# URL CONFIGURATION
# ==================================================
ROOT_URLCONF = 'ict_support_tracking.urls'

WSGI_APPLICATION = 'ict_support_tracking.wsgi.application'

# ==================================================
# TEMPLATES
# ==================================================
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],  
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

# ==================================================
# DATABASE CONFIGURATION
# ==================================================
USE_SQLITE = config('USE_SQLITE', default='False').lower() in ('true', '1', 'yes')

if USE_SQLITE:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': config('DB_NAME', default='ISATS_DB'),
            'USER': config('DB_USER', default='ISATS_DATABASE'),
            'PASSWORD': config('DB_PASSWORD', default='ISATS123!@#'),
            'HOST': config('DB_HOST', default='localhost'),
            'PORT': config('DB_PORT', default='5432'),
        }
    }




# ==================================================
# PASSWORD VALIDATION
# ==================================================
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
        'OPTIONS': {'min_length': 8},
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# ==================================================
# INTERNATIONALIZATION
# ==================================================
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Africa/Dar_es_Salaam'
USE_I18N = True
USE_TZ = True

# ==================================================
# STATIC FILES
# ==================================================
STATIC_URL = '/static/'
STATICFILES_DIRS = [BASE_DIR / 'static']
STATIC_ROOT = BASE_DIR / 'staticfiles'

# ==================================================
# MEDIA FILES
# ==================================================
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# ==================================================
# DEFAULT PRIMARY KEY
# ==================================================
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ==================================================
# CRISPY FORMS
# ==================================================
CRISPY_ALLOWED_TEMPLATE_PACKS = "bootstrap5"
CRISPY_TEMPLATE_PACK = "bootstrap5"

# ==================================================
# AUTH / LOGIN SETTINGS
# ==================================================

LOGIN_URL = 'core:login'
LOGOUT_REDIRECT_URL = 'core:login'
LOGIN_REDIRECT_URL = 'core:dashboard'

# ==================================================
# EMAIL (DEVELOPMENT)
# ==================================================
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

EMAIL_HOST = config('EMAIL_HOST', default='smtp.gmail.com')
EMAIL_PORT = config('EMAIL_PORT', default=587, cast=int)
EMAIL_USE_TLS = True
EMAIL_HOST_USER = config('EMAIL_HOST_USER', default='')
EMAIL_HOST_PASSWORD = config('EMAIL_HOST_PASSWORD', default='')
DEFAULT_FROM_EMAIL = config(
    'DEFAULT_FROM_EMAIL',
    default='noreply@yourdomain.com'
)

# ==================================================
# GRAPHENE / GRAPHQL
# ==================================================
GRAPHENE = {
    'SCHEMA': 'core.schema.schema',
    'MIDDLEWARE': [],
}

AUTHENTICATION_BACKENDS = [
    'django.contrib.auth.backends.ModelBackend',
]

# ==================================================
# DJANGO REST FRAMEWORK
# ==================================================
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
}

# ==================================================
# SECURITY (DEV SAFE)
# ==================================================
SECURE_BROWSER_XSS_FILTER = False
SECURE_CONTENT_TYPE_NOSNIFF = False
SESSION_COOKIE_SECURE = False
CSRF_COOKIE_SECURE = False
X_FRAME_OPTIONS = 'SAMEORIGIN'
