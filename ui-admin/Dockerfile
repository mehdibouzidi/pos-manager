# Use the official Node.js image as the base image
FROM node:18 as build

# Set the working directory
WORKDIR /app

# Copy the package.json and package-lock.json files to the working directory
COPY package*.json ./


# Install the dependencies
RUN npm cache clean --force && \
    rm -rf node_modules package-lock.json && \
    npm install

# Copy the rest of the application code to the working directory
COPY . .

# Build the Angular application
RUN npm run build

# Stage 2: Use the official NGINX image to serve the application
FROM nginx:alpine

# Copy the built Angular app from the previous stage
COPY --from=build /app/dist/vex /usr/share/nginx/html

# Copy the custom NGINX configuration
COPY nginxconf/default.conf /etc/nginx/conf.d/default.conf

# Expose port 90
EXPOSE 90

# Start NGINX server
CMD ["nginx", "-g", "daemon off;"]
