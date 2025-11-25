#!/bin/bash

# E2E Tests with Firebase Emulator
# This script starts the Firebase emulator, runs E2E tests, and cleans up

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  E2E Tests with Firebase Emulator${NC}"
echo -e "${BLUE}========================================${NC}"

# Check for Java (required for Firebase emulator)
echo -e "\n${YELLOW}Checking prerequisites...${NC}"
if ! command -v java &> /dev/null; then
  echo -e "${RED}Error: Java is not installed. Firebase emulator requires Java.${NC}"
  echo -e "${YELLOW}Please install Java (e.g., sudo apt install default-jre) and try again.${NC}"
  echo -e "${YELLOW}Running tests without emulator instead...${NC}"
  npm run test:e2e
  exit $?
fi
echo -e "${GREEN}Java found: $(java -version 2>&1 | head -n 1)${NC}"

# Store PIDs for cleanup
EMULATOR_PID=""
DEV_SERVER_PID=""

# Cleanup function
cleanup() {
  echo -e "\n${YELLOW}Cleaning up...${NC}"

  if [ -n "$DEV_SERVER_PID" ]; then
    echo -e "Stopping dev server (PID: $DEV_SERVER_PID)..."
    kill $DEV_SERVER_PID 2>/dev/null || true
  fi

  if [ -n "$EMULATOR_PID" ]; then
    echo -e "Stopping Firebase emulator (PID: $EMULATOR_PID)..."
    kill $EMULATOR_PID 2>/dev/null || true
  fi

  # Kill any remaining processes on the ports
  lsof -ti:5173 | xargs kill -9 2>/dev/null || true
  lsof -ti:8080 | xargs kill -9 2>/dev/null || true
  lsof -ti:9099 | xargs kill -9 2>/dev/null || true

  # Restore production rules if needed
  npm run emulator:restore 2>/dev/null || true

  echo -e "${GREEN}Cleanup complete${NC}"
}

# Set trap for cleanup on exit
trap cleanup EXIT INT TERM

# Check if ports are available
check_port() {
  if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${RED}Error: Port $1 is already in use${NC}"
    exit 1
  fi
}

echo -e "\n${YELLOW}Step 1: Checking ports...${NC}"
check_port 5173  # Vite dev server
check_port 8080  # Firestore emulator
check_port 9099  # Auth emulator

echo -e "${GREEN}All ports available${NC}"

# Swap to dev rules
echo -e "\n${YELLOW}Step 2: Swapping to dev Firestore rules...${NC}"
npm run emulator:swap

# Start Firebase emulator in background
echo -e "\n${YELLOW}Step 3: Starting Firebase emulator...${NC}"
firebase emulators:start --only firestore,auth &
EMULATOR_PID=$!

# Wait for emulator to be ready by checking the ports
echo -e "Waiting for emulator to start..."
MAX_WAIT=120
WAITED=0
while [ $WAITED -lt $MAX_WAIT ]; do
  # Check if both auth (9099) and firestore (8080) ports are listening
  if lsof -Pi :9099 -sTCP:LISTEN -t >/dev/null 2>&1 && lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${GREEN}Firebase emulator ports are ready${NC}"
    break
  fi

  # Check if emulator process is still running
  if ! kill -0 $EMULATOR_PID 2>/dev/null; then
    echo -e "${RED}Error: Firebase emulator process died${NC}"
    exit 1
  fi

  sleep 2
  WAITED=$((WAITED + 2))
  echo -e "  Still waiting... (${WAITED}s)"
done

if [ $WAITED -ge $MAX_WAIT ]; then
  echo -e "${RED}Error: Firebase emulator failed to start within ${MAX_WAIT}s${NC}"
  exit 1
fi

# Give emulator a few more seconds to fully initialize
echo -e "Emulator ports ready, waiting for full initialization..."
sleep 5

echo -e "${GREEN}Firebase emulator started${NC}"

# Start dev server with emulator flag
echo -e "\n${YELLOW}Step 4: Starting dev server with emulator...${NC}"
VITE_USE_FIREBASE_EMULATOR=true npm run dev &
DEV_SERVER_PID=$!

# Wait for dev server to be ready
echo -e "Waiting for dev server to start..."
sleep 5

# Check if dev server is running
if ! kill -0 $DEV_SERVER_PID 2>/dev/null; then
  echo -e "${RED}Error: Dev server failed to start${NC}"
  exit 1
fi

echo -e "${GREEN}Dev server started${NC}"

# Wait a bit more for everything to stabilize
sleep 3

# Run E2E tests
echo -e "\n${YELLOW}Step 5: Running E2E tests...${NC}"
echo -e "${BLUE}========================================${NC}"

FIREBASE_EMULATOR=true npx playwright test --reporter=list

TEST_EXIT_CODE=$?

echo -e "${BLUE}========================================${NC}"

if [ $TEST_EXIT_CODE -eq 0 ]; then
  echo -e "\n${GREEN}✅ All E2E tests passed!${NC}"
else
  echo -e "\n${RED}❌ Some E2E tests failed${NC}"
fi

exit $TEST_EXIT_CODE
