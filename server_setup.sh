#!/bin/bash

# Script to set up Docker, Docker Compose, Git, clone a project and run it

echo "Starting setup..."

# Update and Upgrade
echo "Updating package database..."
sudo apt update
sudo apt upgrade -y

# Install Docker
echo "Installing Docker..."
sudo apt install apt-transport-https ca-certificates curl gnupg software-properties-common -y
curl -fsSL https://download.docker.com/linux/debian/gpg | sudo apt-key add -
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/debian $(lsb_release -cs) stable"
sudo apt update
sudo apt install docker-ce -y

# Install Docker Compose
echo "Installing Docker Compose..."
DOCKER_COMPOSE_VERSION="1.29.2" # Replace with the desired version
sudo curl -L "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

echo "Docker Compose Version: $(docker-compose --version)"

# Install Git
echo "Installing Git..."
sudo apt install git -y
echo "Git Version: $(git --version)"

# Clone the project
echo "Cloning the project..."
# Replace with your actual repository URL and directory path
GIT_REPO_URL="http://github.com/granawkins/latent-dictionary" 
CLONE_DIR="latent-dictionary"
git clone $GIT_REPO_URL $CLONE_DIR

# Navigate to the project directory
cd $CLONE_DIR

# Run Docker Compose
echo "Setup Complete! Launch project with `docker-compose -f docker-compose.prod.yaml up --build -d`"
