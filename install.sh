#!/bin/bash

# Exit on error
set -e

check_dependencies() {
  local dir=$1
  echo "==================================="
  echo "Checking dependencies for $dir..."
  cd "$dir"

  # npm ls checks if the current node_modules match package.json
  # It returns a non-zero exit code if packages are missing
  if npm ls --depth=0 > /dev/null 2>&1; then
    echo "✅ Everything is already installed in $dir!"
  else
    echo "⏳ Dependencies missing or outdated. Installing..."
    npm install
  fi
  
  # Go back to the original directory quietly
  cd - > /dev/null
}

check_dependencies "backend"
check_dependencies "frontend"

echo "==================================="
echo "Install sequence complete! 🎉"
echo "To start the development servers, run the dev script in backend and frontend."
echo "==================================="
