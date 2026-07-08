import json
import urllib.request
import urllib.error

for path in ["/health", "/api/dev/login/student", "/api/dev/login/alumni"]:
    req = urllib.request.Request(f"http://127.0.0.1:8000{path}", method="POST" if "/login/" in path else "GET")
    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            body = response.read().decode()
            print(path, response.status)
            print(body)
    except urllib.error.HTTPError as exc:
        print(path, exc.code)
        print(exc.read().decode())
    except Exception as exc:
        print(path, type(exc).__name__, exc)
