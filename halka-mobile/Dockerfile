# -------------------------------------------------------------
# Aşama 1: Expo Web Derleme
# -------------------------------------------------------------
FROM node:22-alpine AS builder

WORKDIR /app

# Bağımlılıkları kur
COPY package*.json ./
RUN npm ci

# Kaynak kodları ve varlıkları kopyala
COPY . ./

# İsteğe bağlı API URL (varsayılan: http://localhost:3000)
ARG EXPO_PUBLIC_API_URL
ENV EXPO_PUBLIC_API_URL=${EXPO_PUBLIC_API_URL}

# Statik web derlemesi üret (dist klasörüne çıkartır)
RUN npx expo export -p web

# -------------------------------------------------------------
# Aşama 2: Hafif Nginx Web Sunucusu
# -------------------------------------------------------------
FROM nginx:alpine AS runner

# Derlenmiş statik dosyaları Nginx dizinine kopyala
COPY --from=builder /app/dist /usr/share/nginx/html

# Özel Nginx yapılandırmasını kopyala (SPA yönlendirmesi + gzip)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
