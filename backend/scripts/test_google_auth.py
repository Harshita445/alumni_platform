import argparse
import json
import os
import urllib.request


def main() -> None:
    parser = argparse.ArgumentParser(description="Test the Google auth endpoint with a Google ID token")
    parser.add_argument("--token", default=os.getenv("GOOGLE_ID_TOKEN", ""), help="Google ID token to send")
    parser.add_argument("--role", default="student", choices=["student", "alumni"], help="Role to send to the backend")
    parser.add_argument("--url", default="http://127.0.0.1:8000/auth/google", help="Auth endpoint URL")
    args = parser.parse_args()

    if not args.token:
        raise SystemExit("No Google ID token provided. Pass --token or set GOOGLE_ID_TOKEN.")

    payload = {
        "role": args.role,
        "id_token": args.token,
    }
    req = urllib.request.Request(
        args.url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    try:
        with urllib.request.urlopen(req) as resp:
            print(f"STATUS: {resp.status}")
            print(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        print(f"STATUS: {exc.code}")
        print(exc.read().decode("utf-8"))


if __name__ == "__main__":
    main()
