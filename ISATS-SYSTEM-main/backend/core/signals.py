# core/signals.py
from django.db.models.signals import post_migrate
from django.dispatch import receiver
from django.apps import apps

@receiver(post_migrate)
def create_default_categories(sender, **kwargs):
    if sender.name == 'core':
        Category = apps.get_model('core', 'Category')
        default_categories = [
            {'name': 'Laptop', 'description': 'Portable computers for employees and field work.'},
            {'name': 'Desktop', 'description': 'Stationary workstations for office use.'},
            {'name': 'Monitor', 'description': 'Display screens for computers.'},
            {'name': 'Printer', 'description': 'Printing devices (laser, inkjet, multifunction).'},
            {'name': 'Server', 'description': 'Rack-mounted or tower servers for data processing.'},
            {'name': 'Mobile Phone', 'description': 'Smartphones for field staff and executives.'},
            {'name': 'Networking Equipment', 'description': 'Switches, routers, access points, and firewalls.'},
            {'name': 'AV Equipment', 'description': 'Audio/video equipment for meeting rooms (projectors, speakers).'},
        ]
        for cat in default_categories:
            Category.objects.get_or_create(
                name=cat['name'],
                defaults={**cat, 'is_default': True}
            )