import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
import weather.routing

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "weather_project.settings")

application = ProtocolTypeRouter(
    {
        "http": get_asgi_application(),
        "websocket": AuthMiddlewareStack(
            URLRouter(weather.routing.websocket_urlpatterns)
        ),
    }
)
