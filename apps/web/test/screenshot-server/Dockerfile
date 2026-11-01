FROM mcr.microsoft.com/playwright:v1.64.1-noble@sha256:47b510dd9230bf0b9bfc9b20102241e577ea7a99334ab4c3ca19f19770e9b8ea
RUN npm install --global playwright@1.64.1
USER pwuser
CMD ["playwright", "run-server", "--port", "3001", "--host", "0.0.0.0"]
