from celery import shared_task
from datetime import datetime, timedelta
import urllib.request
import json
from .models import WeatherRecord

POPULAR_CITIES = [
    {"name": "Warszawa", "lat": 52.23, "lon": 21.01},
    {"name": "Kraków", "lat": 50.06, "lon": 19.94},
    {"name": "Wrocław", "lat": 51.11, "lon": 17.04},
    {"name": "Gdańsk", "lat": 54.35, "lon": 18.65},
    {"name": "Poznań", "lat": 52.41, "lon": 16.93},
]


@shared_task
def refresh_popular_cities():
    for city in POPULAR_CITIES:
        fetch_weather_task.delay(city["name"], city["lat"], city["lon"])


@shared_task(max_retries=3, default_retry_delay=60)
def fetch_weather_task(name, lat, lon):
    url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&hourly=temperature_2m,weathercode&timezone=auto"
    try:
        with urllib.request.urlopen(url) as response:
            data = json.loads(response.read())
    except Exception as exc:
        raise fetch_weather_task.retry(exc=exc)

    utc_offset = data.get("utc_offset_seconds", 0)
    local_now = datetime.utcnow() + timedelta(seconds=utc_offset)
    current_time = local_now.strftime("%Y-%m-%dT%H:00")
    times = data["hourly"]["time"]
    index = times.index(current_time) if current_time in times else 0

    temp = data["hourly"]["temperature_2m"][index]
    code = data["hourly"]["weathercode"][index]

    WeatherRecord.objects.update_or_create(
        city=name,
        defaults={"lat": lat, "lon": lon, "temperature": temp, "weathercode": code},
    )
