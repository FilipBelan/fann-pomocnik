FROM node:20-alpine AS frontend-build
WORKDIR /build
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --omit=dev
COPY backend/ ./backend/
COPY data/ ./data-init/
COPY --from=frontend-build /build/dist ./backend/public
RUN chmod +x /app/backend/entrypoint.sh
EXPOSE 3001
CMD ["/app/backend/entrypoint.sh"]
