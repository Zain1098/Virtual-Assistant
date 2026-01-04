#!/bin/bash

# Shifra AI Assistant - Professional Setup Script
# This script sets up the complete development environment

echo "🚀 Setting up Shifra AI Assistant..."
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
check_nodejs() {
    print_status "Checking Node.js installation..."
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_success "Node.js $NODE_VERSION is installed"
    else
        print_error "Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
        exit 1
    fi
}

# Check if MongoDB is installed
check_mongodb() {
    print_status "Checking MongoDB installation..."
    if command -v mongod &> /dev/null; then
        print_success "MongoDB is installed"
    else
        print_warning "MongoDB is not installed. Installing via Docker..."
        docker run -d --name shifra-mongodb -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=admin -e MONGO_INITDB_ROOT_PASSWORD=password123 mongo:latest
    fi
}

# Install dependencies
install_dependencies() {
    print_status "Installing backend dependencies..."
    npm install
    
    print_status "Installing frontend dependencies..."
    cd client && npm install
    cd ..
    
    print_success "All dependencies installed successfully"
}

# Setup environment variables
setup_environment() {
    print_status "Setting up environment variables..."
    
    if [ ! -f .env ]; then
        cp .env.example .env
        print_success "Environment file created from template"
        print_warning "Please edit .env file with your API keys"
    else
        print_warning ".env file already exists"
    fi
}

# Create necessary directories
create_directories() {
    print_status "Creating necessary directories..."
    
    mkdir -p logs
    mkdir -p uploads
    mkdir -p client/public/icons
    mkdir -p client/public/screenshots
    mkdir -p ssl
    
    print_success "Directories created successfully"
}

# Setup database
setup_database() {
    print_status "Setting up database..."
    
    # Start MongoDB if not running
    if ! pgrep -x "mongod" > /dev/null; then
        print_status "Starting MongoDB..."
        mongod --fork --logpath /var/log/mongodb.log --dbpath /var/lib/mongodb
    fi
    
    print_success "Database setup completed"
}

# Build frontend
build_frontend() {
    print_status "Building frontend for production..."
    cd client
    npm run build
    cd ..
    print_success "Frontend built successfully"
}

# Setup PM2 for production
setup_pm2() {
    print_status "Setting up PM2 for production..."
    
    if ! command -v pm2 &> /dev/null; then
        npm install -g pm2
        print_success "PM2 installed globally"
    fi
    
    pm2 startup
    print_success "PM2 startup configured"
}

# Setup SSL certificates (self-signed for development)
setup_ssl() {
    print_status "Setting up SSL certificates..."
    
    if [ ! -f ssl/server.crt ]; then
        openssl req -x509 -newkey rsa:4096 -keyout ssl/server.key -out ssl/server.crt -days 365 -nodes -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
        print_success "Self-signed SSL certificates created"
    else
        print_warning "SSL certificates already exist"
    fi
}

# Run tests
run_tests() {
    print_status "Running tests..."
    npm test
    print_success "All tests passed"
}

# Main setup function
main() {
    echo "Starting Shifra AI Assistant setup..."
    
    check_nodejs
    check_mongodb
    install_dependencies
    setup_environment
    create_directories
    setup_database
    
    # Ask user for setup type
    echo ""
    echo "Choose setup type:"
    echo "1) Development setup"
    echo "2) Production setup"
    read -p "Enter your choice (1 or 2): " setup_type
    
    case $setup_type in
        1)
            print_status "Setting up for development..."
            print_success "Development setup completed!"
            echo ""
            echo "To start development server:"
            echo "npm run dev"
            ;;
        2)
            print_status "Setting up for production..."
            build_frontend
            setup_pm2
            setup_ssl
            print_success "Production setup completed!"
            echo ""
            echo "To start production server:"
            echo "pm2 start ecosystem.config.js --env production"
            ;;
        *)
            print_error "Invalid choice. Please run the script again."
            exit 1
            ;;
    esac
    
    echo ""
    print_success "🎉 Shifra AI Assistant setup completed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Edit .env file with your API keys"
    echo "2. Start the application"
    echo "3. Open http://localhost:3000 in your browser"
    echo ""
    echo "For more information, check the README.md file"
}

# Run main function
main