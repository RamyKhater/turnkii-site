#!/usr/bin/env python3
"""Tiny build helper: serves dist/ and accepts the rendered #dc-root snapshot
back via POST /__capture?name=<slug>, writing it to prerender/<slug>.html.
Used to pre-render the client-rendered pages for SEO. Not part of the deployed
site."""
import os, http.server, socketserver, urllib.parse

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIST = os.path.join(ROOT, "dist")
PRE = os.path.join(ROOT, "prerender")
os.makedirs(PRE, exist_ok=True)


class H(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=DIST, **k)

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == "/__capture":
            qs = urllib.parse.parse_qs(parsed.query)
            name = (qs.get("name") or ["page"])[0]
            name = os.path.basename(name)  # no path traversal
            n = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(n)
            with open(os.path.join(PRE, name + ".html"), "wb") as f:
                f.write(body)
            self.send_response(200)
            self.send_header("Content-Type", "text/plain")
            self.end_headers()
            self.wfile.write(b"ok " + str(len(body)).encode())
        else:
            self.send_error(404)

    def log_message(self, *a):
        pass


if __name__ == "__main__":
    with socketserver.ThreadingTCPServer(("127.0.0.1", 4173), H) as httpd:
        print("capture server on http://127.0.0.1:4173")
        httpd.serve_forever()
