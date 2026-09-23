import json
from django.shortcuts import render
from django.middleware.csrf import get_token
from django.contrib.auth.models import User


def serialize_user(request) -> dict:
    """Return a JSON-serializable dict of the current user."""
    user = request.user
    if not user or not user.is_authenticated:
        return {}

    role = 'User'
    department = None
    phone = ''
    try:
        profile = user.userprofile
        role = profile.role
        phone = profile.phone_number or ''
        if profile.department:
            department = {'id': profile.department.id, 'name': profile.department.name, 'description': profile.department.description or ''}
    except Exception:
        pass

    return {
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'role': role,
        'is_staff': user.is_staff,
        'is_superuser': user.is_superuser,
        'department': department,
        'phone_number': phone,
        'date_joined': user.date_joined.isoformat() if user.date_joined else None,
        'last_login': user.last_login.isoformat() if user.last_login else None,
    }


def serialize_page_props(request, extra: dict = None) -> str:
    """Return JSON string of props to inject into the React shell."""
    props = {
        'user': serialize_user(request),
        'csrfToken': get_token(request),
    }
    if extra:
        props.update(extra)
    return json.dumps(props)


def render_react_page(request, page_name: str, extra_props: dict = None):
    """Render the React shell template for a given page name."""
    from django.conf import settings as django_settings
    context = {
        'page_name': page_name,
        'props_json': serialize_page_props(request, extra_props),
        'debug': django_settings.DEBUG,
    }
    return render(request, 'react/base.html', context)
