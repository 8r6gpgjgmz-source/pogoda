import json
import urllib.request
import urllib.parse
from channels.generic.websocket import AsyncWebsocketConsumer


class WeatherConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()
        await self.send_weather()

    async def disconnect(self, close_code):
        pass

    async def send_weather(self):
        params = urllib.parse.parse_qs(self.scope["query_string"].decode())
        lat = params["lat"][0]
        lon = params["lon"][0]
        url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&hourly=temperature_2m,weathercode,precipitation_probability,windspeed_10m,winddirection_10m,uv_index&daily=sunrise,sunset&timezone=auto"
        with urllib.request.urlopen(url) as response:
            data = json.loads(response.read())
        await self.send(text_data=json.dumps(data))
