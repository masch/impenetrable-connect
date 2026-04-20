.PHONY: help setup install dev clean lint gga format check check-static typecheck test test-coverage mobile mobile-native mobile-clean mobile-web mobile-android mobile-android-native mobile-ios mobile-ios-native mobile-dev mobile-expo-fix-deps mobile-expo-doctor backend seed eas-login eas-whoami eas-init eas-build-configure eas-build-dev eas-build-android-dev eas-build-android-preview eas-build-android-production eas-build-ios-simulator eas-export-web eas-deploy-web eas-deploy-web-prod android-app-stop android-app-restart android-reset android-stop android-kill android-restart

# ==========================================
# 📋 HELP
# ==========================================

help:
	@echo ""
	@echo "  🔧 SETUP"
	@echo "    make setup                        - Install dependencies"
	@echo "    make install                      - Same as setup"
	@echo "    make dev                          - Start full monorepo"
	@echo ""
	@echo "  🧪 TESTS"
	@echo "    make test                          - Run all tests (mobile + backend)"
	@echo "    make test-mobile                   - Run mobile tests"
	@echo "    make test-backend                  - Run backend tests"
	@echo "    make test-coverage                 - Run mobile tests with coverage report"
	@echo ""
	@echo "  📱 MOBILE"
	@echo "    make mobile                       - Start mobile with Expo"
	@echo "    make mobile-native                - Start mobile native"
	@echo "    make mobile-clean                 - Start mobile clean"
	@echo "    make mobile-web                   - Start mobile web"
	@echo "    make mobile-android 	             - Start mobile Android"
	@echo "    make mobile-android-native        - Start mobile Android native"
	@echo "    make mobile-ios                   - Start mobile iOS"
	@echo "    make mobile-ios-native            - Start mobile iOS native"
	@echo "    make mobile-dev                   - Start mobile dev"
	@echo "    make mobile-expo-fix-deps         - Fix mobile dependencies"
	@echo "    make mobile-expo-doctor           - Doctor mobile dependencies"
	@echo ""
	@echo "  🖥️ BACKEND"
	@echo "    make backend                      - Start backend API"
	@echo "    make seed                         - Seed database"
	@echo ""
	@echo "  🔧 UTILS"
	@echo "    make clean                        - Clean node_modules"
	@echo "    make lint                         - Run ESLint"
	@echo "    make format                       - Format code"
	@echo "    make typecheck                    - Run TypeScript check"
	@echo "    make gga                          - Run Gentleman Guardian Angel"
	@echo "    make check                        - All checks (mobile + backend + gga)"
	@echo "    make check-mobile                 - Full check for mobile (static + gga)"
	@echo "    make check-backend                - Full check for backend"
	@echo "    make check-static                 - Static checks for all packages"
	@echo "    make check-static-mobile          - Static checks for mobile only"
	@echo "    make check-static-backend         - Static checks for backend only"
	@echo ""
	@echo "  🤖 ANDROID EMULATOR"
	@echo "    make android-app-stop             - Stop app"
	@echo "    make android-app-restart          - Restart app"
	@echo "    make android-reset                - Reset emulator (wipe data)"
	@echo "    make android-stop                 - Stop emulator (graceful)"
	@echo "    make android-kill                 - Kill emulator (force)"
	@echo "    make android-restart              - Restart emulator"
	@echo ""
	@echo "  🤖 EAS"
	@echo "    make eas-login                    - Login to EAS"
	@echo "    make eas-whoami                   - Whoami in EAS"
	@echo "    make eas-init                     - Init EAS"
	@echo "    make eas-build-configure          - Configure EAS"
	@echo "    make eas-build-dev                - Build dev"
	@echo "    make eas-build-android-dev        - Build Android dev"
	@echo "    make eas-build-android-preview    - Build Android preview"
	@echo "    make eas-build-android-production - Build Android production"
	@echo "    make eas-build-ios-simulator      - Build iOS simulator"
	@echo "    make eas-export-web               - Export web build"
	@echo "    make eas-deploy-web               - Deploy web (preview)"
	@echo "    make eas-deploy-web-prod          - Deploy web (production)"

# ==========================================
# 🔧 CONFIG
# ==========================================

ANDROID_HOME ?= $(HOME)/dev/android/sdk
ANDROID_EMULATOR = $(ANDROID_HOME)/emulator/emulator
MOBILE_BUNDLE_ID = org.impenetrable.connect
ANDROID_FIRST_AVD = $(shell $(ANDROID_EMULATOR) -list-avds | head -n 1)
MOBILE_DIR = apps/mobile
BACKEND_DIR = apps/backend

# ==========================================
# 🚀 SETUP
# ==========================================

setup:
	bun install

install: setup

# ==========================================
# 📱 MOBILE APP
# ==========================================

mobile:
	cd $(MOBILE_DIR) && bun run start

mobile-native:
	cd $(MOBILE_DIR) && bun run start:native

mobile-dev:
	cd $(MOBILE_DIR) && bun run start:dev

mobile-clean:
	cd $(MOBILE_DIR) && bun run start:clean

mobile-web:
	cd $(MOBILE_DIR) && bun run web

mobile-android:
	cd $(MOBILE_DIR) && bun run android

mobile-android-native:
	cd $(MOBILE_DIR) && bun run android:native

mobile-ios:
	cd $(MOBILE_DIR) && bun run ios

mobile-ios-native:
	cd $(MOBILE_DIR) && bun run ios:native

mobile-expo-fix-deps:
	cd $(MOBILE_DIR) && bun run expo:fix:deps

mobile-expo-doctor:
	cd $(MOBILE_DIR) && bunx --bun expo-doctor

# ==========================================
# 🖥️ BACKEND
# ==========================================

backend:
	cd $(BACKEND_DIR) && bun run dev

seed:
	cd $(BACKEND_DIR) && bun run db:seed

# ==========================================
# 🚀 FULL MONOREPO
# ==========================================

dev:
	bun run dev

# ==========================================
# 🧪 TESTS
# ==========================================

test: test-mobile test-backend

test-backend:
	cd $(BACKEND_DIR) && bun run test

test-mobile:
	cd $(MOBILE_DIR) && bun run test

test-coverage:
	cd $(MOBILE_DIR) && bun run test --coverage

# ==========================================
# 🧹 UTILS
# ==========================================

clean:
	rm -rf $(MOBILE_DIR)/.expo
	rm -rf node_modules apps/*/node_modules packages/*/node_modules
	bun pm cache rm
	@echo "🧼 All clean. Run 'make setup' again."

lint:
	bun run lint

format:
	bun run format

typecheck: typecheck-mobile typecheck-backend

typecheck-mobile:
	cd $(MOBILE_DIR) && bun run typecheck

typecheck-backend:
	cd $(BACKEND_DIR) && bun run typecheck

lint: lint-mobile lint-backend

lint-mobile:
	cd $(MOBILE_DIR) && bun run lint

lint-backend:
	cd $(BACKEND_DIR) && bun run lint

format: format-mobile format-backend

format-mobile:
	bunx prettier --write "$(MOBILE_DIR)/**/*.ts*"

format-backend:
	bunx prettier --write "$(BACKEND_DIR)/**/*.ts*"

gga:
	gga run

check-static: check-static-mobile check-static-backend

check-static-mobile: typecheck-mobile lint-mobile format-mobile
check-static-backend: typecheck-backend lint-backend format-backend

check: check-static gga

check-mobile: check-static-mobile gga
check-backend: check-static-backend

# ==========================================
# 🤖 EAS
# ==========================================

eas-login:
	cd $(MOBILE_DIR) && eas login -b

eas-whoami:
	cd $(MOBILE_DIR) && eas whoami

eas-init:
	cd $(MOBILE_DIR) && eas init

eas-build-configure:
	cd $(MOBILE_DIR) && eas build:configure

eas-build-dev:
	cd $(MOBILE_DIR) && eas build --profile development

eas-build-android-dev:
	cd $(MOBILE_DIR) && eas build --platform android --profile development

eas-build-android-preview:
	cd $(MOBILE_DIR) && eas build --platform android --profile preview

eas-build-android-production:
	cd $(MOBILE_DIR) && eas build --platform android --profile production

eas-build-ios-simulator:
	cd $(MOBILE_DIR) && eas build --platform ios --profile ios-simulator

eas-export-web:
	cd $(MOBILE_DIR) && bunx expo export --platform web

eas-deploy-web:
	cd $(MOBILE_DIR) && eas deploy

eas-deploy-web-prod:
	cd $(MOBILE_DIR) && bunx --package eas-cli@18.6.0 eas deploy --prod
	
# ==========================================
# 🤖 ANDROID EMULATOR
# ==========================================

android-app-stop:
	@echo "🛑 Stopping app ($(MOBILE_BUNDLE_ID))..."
	adb shell am force-stop $(MOBILE_BUNDLE_ID)

android-app-restart: android-app-stop
	@echo "🚀 Starting app again..."
	adb shell am start -n $(MOBILE_BUNDLE_ID)/.MainActivity

android-reset:
	@echo "🚀 Resetting the emulator: $(ANDROID_FIRST_AVD)..."
	$(ANDROID_EMULATOR) @$(ANDROID_FIRST_AVD) -wipe-data &

android-stop:
	@echo "🛑 Stopping the emulator (graceful): $(ANDROID_FIRST_AVD)..."
	-pkill -TERM -f "emulator.*$(ANDROID_FIRST_AVD)" || true
	-pkill -TERM -f "qemu-system.*$(ANDROID_FIRST_AVD)" || true

android-kill:
	@echo "💀 Killing the emulator (force): $(ANDROID_FIRST_AVD)..."
	-pkill -9 emulator || true
	-pkill -9 qemu-system || true

android-restart: android-stop
	@echo "🔄 Restarting the emulator: $(ANDROID_FIRST_AVD)..."
	@sleep 1
	$(ANDROID_EMULATOR) @$(ANDROID_FIRST_AVD) &