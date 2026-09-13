import json
import time
import urllib.request
import urllib.parse

BASE = "http://127.0.0.1:8787"

def get(path):
    with urllib.request.urlopen(BASE + path) as response:
        return json.loads(response.read())

health = get("/api/health")
assert health["ok"] is True

boundary = "----rhythmin-test"
body = bytearray()
body += f"--{boundary}\r\nContent-Disposition: form-data; name=\"file\"; filename=\"test-tone.wav\"\r\nContent-Type: audio/wav\r\n\r\n".encode()
body += open("test-tone.wav", "rb").read()
body += f"\r\n--{boundary}--\r\n".encode()
request = urllib.request.Request(BASE + "/api/upload", data=body, method="POST", headers={"Content-Type": f"multipart/form-data; boundary={boundary}"})
with urllib.request.urlopen(request) as response:
    uploaded = json.loads(response.read())
assert uploaded["fileId"] and uploaded["projectId"]

payload = json.dumps({"fileId": uploaded["fileId"], "projectId": uploaded["projectId"], "stems": ["vocals", "drums"], "format": "wav"}).encode()
request = urllib.request.Request(BASE + "/api/separate", data=payload, method="POST", headers={"Content-Type": "application/json"})
with urllib.request.urlopen(request) as response:
    created = json.loads(response.read())
job_id = created["jobId"]
for _ in range(30):
    job = get(f"/api/jobs/{job_id}")
    if job["status"] in {"completed", "failed", "cancelled"}:
        break
    time.sleep(.1)
assert job["status"] == "completed", job
stems = get(f"/api/stems/{uploaded['projectId']}")
assert len(stems) == 2
print(json.dumps({"health": health, "job": job, "stems": stems}, indent=2))
