# backend/Dockerfile
FROM node:18

# Установка рабочей директории
WORKDIR /usr/src/app

# Копирование package.json и package-lock.json
COPY package*.json ./

# Установка зависимостей
RUN npm install

# Копирование остального кода
COPY . .

# Экспонирование порта
EXPOSE 5000

# Команда запуска
CMD ["npm", "run", "dev"]
