# frontend/Dockerfile
FROM node:18

# Установка рабочей директории
WORKDIR /usr/src/app

# Копирование package.json и package-lock.json
COPY package*.json ./

# Установка зависимостей
RUN npm install

# Копирование остального кода
COPY . .

# Сборка приложения
RUN npm run build

# Установка сервера для статических файлов
RUN npm install -g serve

# Экспонирование порта
EXPOSE 3000

# Команда запуска
CMD ["serve", "-s", "build", "-l", "3000"]
