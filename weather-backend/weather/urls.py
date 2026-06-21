from django.urls import path
from . import views

urlpatterns = [
    path("weather/", views.get_weather),
    path("city/", views.get_city),
    path("cities-weather/", views.get_cities_weather),
]
