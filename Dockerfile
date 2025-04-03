FROM nginx:alpine

# Copy the HTML content from ConfigMap
COPY ./webapp /usr/share/nginx/html/

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
