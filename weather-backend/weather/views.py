from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.core.cache import cache
from .models import WeatherRecord
import urllib.request
import json


@api_view(["GET"])
def get_weather(request):
    lat = request.GET.get("lat")
    lon = request.GET.get("lon")

    try:
        lat_f = float(lat)
        lon_f = float(lon)
        if not (-90 <= lat_f <= 90) or not (-180 <= lon_f <= 180):
            return Response({"error": "Invalid coordinates"}, status=400)
    except (TypeError, ValueError):
        return Response({"error": "Invalid coordinates"}, status=400)

    cache_key = f"weather_{lat}_{lon}"
    cached_data = cache.get(cache_key)

    if cached_data:
        return Response(cached_data)

    url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&hourly=temperature_2m,weathercode,precipitation_probability,windspeed_10m,winddirection_10m,uv_index&daily=sunrise,sunset&timezone=auto"

    try:
        with urllib.request.urlopen(url) as response:
            data = json.loads(response.read())
    except Exception:
        return Response(None, status=503)

    cache.set(cache_key, data, timeout=600)

    return Response(data)


@api_view(["GET"])
def get_city(request):
    lat = request.GET.get("lat")
    lon = request.GET.get("lon")

    cache_key = f"city_{lat}_{lon}"
    cached_data = cache.get(cache_key)
    if cached_data:
        return Response(cached_data)

    url = f"https://nominatim.openstreetmap.org/reverse?lat={lat}&lon={lon}&format=json"
    req = urllib.request.Request(url, headers={"User-Agent": "weather-app/1.0"})
    try:
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read())
        cache.set(cache_key, data, timeout=86400)
        return Response(data)
    except Exception:
        return Response({"address": {"city": "Nieznana lokalizacja"}})


@api_view(["GET"])
def get_cities_weather(request):
    records = WeatherRecord.objects.filter(city__gt="").order_by("city")
    data = [
        {
            "city": r.city,
            "temperature": r.temperature,
            "weathercode": r.weathercode,
        }
        for r in records
    ]
    return Response(data)
