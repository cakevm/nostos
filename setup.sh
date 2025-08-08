#!/bin/bash
npx create-next-app@latest webapp \
  --typescript \
  --tailwind \
  --app \
  --no-src-dir \
  --import-alias "@/*" \
  --no-git \
  --eslint \
  --no-turbopack