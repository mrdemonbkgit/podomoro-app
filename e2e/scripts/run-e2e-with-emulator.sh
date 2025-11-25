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
    # Kill entire process group
    pkill -P $DEV_SERVER_PID 2>/dev/null || true
  fi

  if [ -n "$EMULATOR_PID" ]; then
    echo -e "Stopping Firebase emulator (PID: $EMULATOR_PID)..."
    kill $EMULATOR_PID 2>/dev/null || true
    # Kill entire process group (Java processes)
    pkill -P $EMULATOR_PID 2>/dev/null || true
  fi

  # Kill any remaining processes on the ports (use ss for faster check in WSL)
  for port in 5173 8080 9099 4000; do
    pid=$(ss -tlnp 2>/dev/null | grep ":$port " | grep -oP 'pid=\K[0-9]+' | head -1)
    if [ -n "$pid" ]; then
      kill -9 $pid 2>/dev/null || true
    fi
  done

  # Restore production rules if needed
  npm run emulator:restore 2>/dev/null || true

  echo -e "${GREEN}Cleanup complete${NC}"
}

# Set trap for cleanup on exit
trap cleanup EXIT INT TERM

# Fast port check using ss (much faster than lsof in WSL)
check_port_available() {
  if ss -tln 2>/dev/null | grep -q ":$1 "; then
    echo -e "${RED}Error: Port $1 is already in use${NC}"
    return 1
  fi
  return 0
}

# Fast port ready check using nc (netcat)
check_port_ready() {
  nc -z localhost $1 2>/dev/null
  return $?
}

echo -e "\n${YELLOW}Step 1: Checking ports...${NC}"
check_port_available 5173 || exit 1  # Vite dev server
check_port_available 8080 || exit 1  # Firestore emulator
check_port_available 9099 || exit 1  # Auth emulator

echo -e "${GREEN}All ports available${NC}"

# Swap to dev rules
echo -e "\n${YELLOW}Step 2: Swapping to dev Firestore rules...${NC}"
npm run emulator:swap

# Start Firebase emulator in background (without UI for faster startup)
echo -e "\n${YELLOW}Step 3: Starting Firebase emulator...${NC}"
firebase emulators:start --only firestore,auth --ui=false &
EMULATOR_PID=$!

# Wait for emulator to be ready by checking the ports with nc (faster than lsof)
echo -e "Waiting for emulator to start..."
MAX_WAIT=60
WAITED=0
AUTH_READY=false
FIRESTORE_READY=false

while [ $WAITED -lt $MAX_WAIT ]; do
  # Check auth port (9099)
  if [ "$AUTH_READY" = false ] && check_port_ready 9099; then
    echo -e "${GREEN}  ✓ Auth emulator ready (port 9099)${NC}"
    AUTH_READY=true
  fi

  # Check firestore port (8080)
  if [ "$FIRESTORE_READY" = false ] && check_port_ready 8080; then
    echo -e "${GREEN}  ✓ Firestore emulator ready (port 8080)${NC}"
    FIRESTORE_READY=true
  fi

  # Both ready
  if [ "$AUTH_READY" = true ] && [ "$FIRESTORE_READY" = true ]; then
    break
  fi

  # Check if emulator process is still running
  if ! kill -0 $EMULATOR_PID 2>/dev/null; then
    echo -e "${RED}Error: Firebase emulator process died${NC}"
    exit 1
  fi

  sleep 1
  WAITED=$((WAITED + 1))

  # Only print every 5 seconds to reduce noise
  if [ $((WAITED % 5)) -eq 0 ]; then
    echo -e "  Still waiting... (${WAITED}s)"
  fi
done

if [ $WAITED -ge $MAX_WAIT ]; then
  echo -e "${RED}Error: Firebase emulator failed to start within ${MAX_WAIT}s${NC}"
  exit 1
fi

# Brief pause for emulator to fully initialize
sleep 2

echo -e "${GREEN}Firebase emulator started in ${WAITED}s${NC}"

# Start dev server with emulator flag
echo -e "\n${YELLOW}Step 4: Starting dev server with emulator...${NC}"
VITE_USE_FIREBASE_EMULATOR=true npm run dev &
DEV_SERVER_PID=$!

# Wait for dev server to be ready
echo -e "Waiting for dev server to start..."
MAX_WAIT=30
WAITED=0
while [ $WAITED -lt $MAX_WAIT ]; do
  if check_port_ready 5173; then
    echo -e "${GREEN}  ✓ Dev server ready (port 5173)${NC}"
    break
  fi

  # Check if dev server is still running
  if ! kill -0 $DEV_SERVER_PID 2>/dev/null; then
    echo -e "${RED}Error: Dev server failed to start${NC}"
    exit 1
  fi

  sleep 1
  WAITED=$((WAITED + 1))
done

if [ $WAITED -ge $MAX_WAIT ]; then
  echo -e "${RED}Error: Dev server failed to start within ${MAX_WAIT}s${NC}"
  exit 1
fi

echo -e "${GREEN}Dev server started in ${WAITED}s${NC}"

# Brief stabilization pause
sleep 2

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
