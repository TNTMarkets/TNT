#!/bin/sh
# Local HTTPS: a self-signed certificate made once and kept in the certs volume, so the browser warns only once.
set -eu
dir=/etc/nginx/certs
mkdir -p "$dir"
if [ ! -s "$dir/cert.pem" ] || ! openssl x509 -checkend 86400 -noout -in "$dir/cert.pem" >/dev/null; then
  openssl req -x509 -newkey rsa:2048 -nodes -days 365 \
    -subj "/CN=localhost" \
    -addext "subjectAltName=DNS:localhost,IP:127.0.0.1" \
    -keyout "$dir/key.pem" -out "$dir/cert.pem" 2>/dev/null
  echo "$0: created a self-signed certificate for localhost"
fi
