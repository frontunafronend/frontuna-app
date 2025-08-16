#!/bin/bash

# Frontuna.ai Setup Script
# This script sets up the development environment

set -e

echo "🚀 Setting up Frontuna.ai development environment..."

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
check_node() {
    print_status "Checking Node.js installation..."
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_success "Node.js is installed: $NODE_VERSION"
        
        # Check if version is 18 or higher
        NODE_MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
        if [ "$NODE_MAJOR_VERSION" -lt 18 ]; then
            print_warning "Node.js version 18+ is recommended. Current version: $NODE_VERSION"
        fi
    else
        print_error "Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
        exit 1
    fi
}

# Check if npm is installed
check_npm() {
    print_status "Checking npm installation..."
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        print_success "npm is installed: $NPM_VERSION"
    else
        print_error "npm is not installed. Please install npm."
        exit 1
    fi
}

# Check if Angular CLI is installed
check_angular_cli() {
    print_status "Checking Angular CLI..."
    if command -v ng &> /dev/null; then
        NG_VERSION=$(ng version --json 2>/dev/null | jq -r '.["@angular/cli"]' 2>/dev/null || echo "unknown")
        print_success "Angular CLI is installed: $NG_VERSION"
    else
        print_warning "Angular CLI is not installed globally. Installing..."
        npm install -g @angular/cli
        print_success "Angular CLI installed successfully"
    fi
}

# Install root dependencies
install_root_dependencies() {
    print_status "Installing root dependencies..."
    npm install
    print_success "Root dependencies installed"
}

# Install frontend dependencies
install_frontend_dependencies() {
    print_status "Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
    print_success "Frontend dependencies installed"
}

# Install backend dependencies
install_backend_dependencies() {
    print_status "Installing backend dependencies..."
    cd backend
    npm install
    cd ..
    print_success "Backend dependencies installed"
}

# Create environment files
create_env_files() {
    print_status "Creating environment files..."
    
    # Backend environment file
    if [ ! -f "backend/.env" ]; then
        print_status "Creating backend/.env from template..."
        cp backend/.env.example backend/.env
        print_warning "Please edit backend/.env with your configuration (especially OPENAI_API_KEY)"
    else
        print_success "backend/.env already exists"
    fi
}

# Create necessary directories
create_directories() {
    print_status "Creating necessary directories..."
    
    mkdir -p backend/logs
    mkdir -p backend/uploads
    mkdir -p frontend/src/assets/images/logo
    mkdir -p frontend/src/assets/images/frameworks
    mkdir -p frontend/src/assets/images/team
    mkdir -p frontend/src/assets/images/testimonials
    mkdir -p frontend/src/assets/images/badges
    mkdir -p frontend/src/assets/images/social
    
    print_success "Directories created"
}

# Check if Docker is available
check_docker() {
    print_status "Checking Docker availability..."
    if command -v docker &> /dev/null; then
        print_success "Docker is available"
        if command -v docker-compose &> /dev/null; then
            print_success "Docker Compose is available"
        else
            print_warning "Docker Compose is not available. Install it for containerized development."
        fi
    else
        print_warning "Docker is not available. Install Docker for containerized development."
    fi
}

# Display setup completion message
show_completion_message() {
    echo ""
    print_success "🎉 Setup completed successfully!"
    echo ""
    echo -e "${BLUE}Next steps:${NC}"
    echo "1. Edit backend/.env with your configuration"
    echo "   - Add your OpenAI API key: OPENAI_API_KEY=your_key_here"
    echo "   - Configure email settings (optional)"
    echo "   - Set up MongoDB connection (or use Docker)"
    echo ""
    echo "2. Start the development servers:"
    echo "   ${GREEN}npm run dev${NC}          # Start both frontend and backend"
    echo "   ${GREEN}npm run dev:frontend${NC} # Start only frontend (port 4200)"
    echo "   ${GREEN}npm run dev:backend${NC}  # Start only backend (port 3000)"
    echo ""
    echo "3. Or use Docker:"
    echo "   ${GREEN}docker-compose up -d${NC} # Start all services with Docker"
    echo ""
    echo "4. Open your browser:"
    echo "   Frontend: ${GREEN}http://localhost:4200${NC}"
    echo "   Backend API: ${GREEN}http://localhost:3000/api/health${NC}"
    echo ""
    echo -e "${YELLOW}Important:${NC}"
    echo "- Make sure to add your OpenAI API key to backend/.env"
    echo "- For production deployment, update all environment variables"
    echo "- Check the README.md for detailed documentation"
    echo ""
}

# Main setup process
main() {
    echo "🔧 Starting Frontuna.ai setup process..."
    echo ""
    
    check_node
    check_npm
    check_angular_cli
    create_directories
    install_root_dependencies
    install_frontend_dependencies
    install_backend_dependencies
    create_env_files
    check_docker
    
    show_completion_message
}

# Run main function
main