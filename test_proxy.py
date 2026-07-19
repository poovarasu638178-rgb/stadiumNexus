import requests

url = "https://corsproxy.io/?https://integrate.api.nvidia.com/v1/chat/completions"
headers = {
    "Origin": "http://localhost:8080",
    "Access-Control-Request-Method": "POST",
    "Access-Control-Request-Headers": "authorization, content-type"
}

response = requests.options(url, headers=headers)
print(response.status_code)
print(response.headers)
