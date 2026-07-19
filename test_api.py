import requests
import json

url = "https://integrate.api.nvidia.com/v1/chat/completions"
headers = {
    "Authorization": "Bearer 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",
    "Content-Type": "application/json"
}
payload = {
    "model": "nvidia/llama-3.3-nemotron-super-49b-v1",
    "messages": [
        {"role": "system", "content": "You are StadiumNexus AI, the official FIFA World Cup 2026 stadium assistant. This is a demo app with simulated data — you do not have real restaurant names, addresses, or transit schedules. Keep every response under 3 sentences. Never invent specific restaurant names, street addresses, or bus/train numbers — instead give general, confident guidance using the app's own simulated features (e.g. 'Check the Stadium Services section for Food Court locations' or 'Use the Transport Planner tab for real-time options'). Be direct and helpful, never ask clarifying questions — just answer using what's simulated in this app."},
        {"role": "user", "content": "Where is the nearest halal food?"}
    ],
    "temperature": 0.6,
    "top_p": 0.95,
    "max_tokens": 1024,
    "stream": False
}

response = requests.post(url, headers=headers, json=payload)
data = response.json()
print(data['choices'][0]['message']['content'])
