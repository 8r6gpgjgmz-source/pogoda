from django.db import models


class WeatherRecord(models.Model):
    lat = models.FloatField()
    lon = models.FloatField()
    city = models.CharField(max_length=100)
    temperature = models.FloatField()
    weathercode = models.IntegerField()
    recorded_at = models.DateTimeField(auto_now_add=True)
