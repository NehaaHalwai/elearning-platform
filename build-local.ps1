# Build the Docker image locally
docker build -t phn-elearning:local .

# Run the container locally
docker run -d -p 8080:80 --name phn-elearning-local phn-elearning:local

Write-Host "Web app is running locally at http://localhost:8080"