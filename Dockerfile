FROM nginx:latest

# Copy the HTML content
COPY ./webapp /usr/share/nginx/html

# Copy the nginx configuration
COPY ./k8s/nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
