.PHONY: help setup install dev dev-api dev-web-api clean lint gga format check check-static typecheck test test-shared test-coverage mobile mobile-mock mobile-api mobile-native mobile-clean mobile-web mobile-web-api mobile-android mobile-android-native mobile-ios mobile-ios-native mobile-dev mobile-expo-fix-deps mobile-expo-doctor backend seed db-up db-down db-push db-reset eas-login eas-whoami eas-init eas-build-configure eas-build-dev eas-build-android-dev eas-build-android-preview eas-build-android-production eas-build-ios-simulator eas-export-web eas-deploy-web eas-deploy-web-prod android-app-stop android-app-restart android-reset android-stop android-kill android-restart check-backend-alive

# ==========================================
# 📋 HELP
# ==========================================

help:
	@echo ""
	@echo "  🔧 SETUP"
	@echo "    make setup                        - Install dependencies"
	@echo "    make install                      - Same as setup"
	@echo "    make dev                          - Start all services (Backend + Mobile API)"
	@echo "    make dev-mock                     - Start mobile only with Mocks (no DB/API)"
	@echo "    make dev-web-api                  - Start all services (Backend + Mobile Web API)"
	@echo ""
	@echo "  🧪 TESTS"
	@echo "    make test                          - Run all tests (mobile + backend + shared)"
	@echo "    make test-mobile                   - Run mobile tests"
	@echo "    make test-backend                  - Run backend tests"
	@echo "    make test-shared                   - Run shared package tests"
	@echo "    make test-coverage                 - Run mobile tests with coverage report"
	@echo ""
	@echo "  📱 MOBILE"
	@echo "    make mobile                       - Start mobile with Expo (Mocks by default)"
	@echo "    make mobile-mock                  - Start mobile with Mocks"
	@echo "    make mobile-api                   - Start mobile connected to Backend API"
	@echo "    make mobile-native                - Start mobile native"
	@echo "    make mobile-clean                 - Start mobile clean"
	@echo "    make mobile-web                   - Start mobile web"
	@echo "    make mobile-web-api               - Start mobile web connected to Backend API"
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
	@echo "    make db-up                        - Start database container (Podman)"
	@echo "    make db-down                      - Stop database container"
	@echo "    make db-push                      - Push Drizzle schema to database"
	@echo ""
	@echo "  🔧 UTILS"
	@echo "    make clean                        - Clean node_modules"
	@echo "    make lint                         - Run ESLint"
	@echo "    make format                       - Format code"
	@echo "    make typecheck                    - Run TypeScript check"
	@echo "    make gga                          - Run Gentleman Guardian Angel"
	@echo "    make check                        - Run all checks (mobile + backend + gga)"
	@echo "    make db-reset                     - Full database reset and seed"
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
	@echo ""

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

mobile: mobile-mock

mobile-mock:
	cp $(MOBILE_DIR)/.env.mock $(MOBILE_DIR)/.env.local
	cd $(MOBILE_DIR) && bun run start

mobile-api: check-backend-alive
	cp $(MOBILE_DIR)/.env.api $(MOBILE_DIR)/.env.local
	cd $(MOBILE_DIR) && bun run start

mobile-native:
	cd $(MOBILE_DIR) && bun run start:native

mobile-dev:
	cd $(MOBILE_DIR) && bun run start:dev

mobile-clean:
	cd $(MOBILE_DIR) && bun run start:clean

mobile-web:
	cp $(MOBILE_DIR)/.env.mock $(MOBILE_DIR)/.env.local
	cd $(MOBILE_DIR) && bun run web

mobile-web-api: check-backend-alive
	cp $(MOBILE_DIR)/.env.api $(MOBILE_DIR)/.env.local
	cd $(MOBILE_DIR) && bun run web -- --clear

mobile-android:
	cd $(MOBILE_DIR) && EXPO_PUBLIC_USE_MOCKS=true bun run android

mobile-android-native:
	cd $(MOBILE_DIR) && bun run android:native

mobile-ios:
	cd $(MOBILE_DIR) && EXPO_PUBLIC_USE_MOCKS=true bun run ios

mobile-ios-native:
	cd $(MOBILE_DIR) && bun run ios:native

mobile-expo-fix-deps:
	cd $(MOBILE_DIR) && bun run expo:fix:deps

mobile-expo-doctor:
	cd $(MOBILE_DIR) && bunx --bun expo-doctor

check-backend-alive:
	@echo "⏳ Waiting for Backend API to be ready..."
	@for i in $$(seq 1 15); do \
		if curl -s http://localhost:3000/health > /dev/null; then \
			echo "✅ Backend is ready!"; \
			exit 0; \
		fi; \
		echo "🕒 Backend not ready yet, retrying in 2s ($$i/15)..."; \
		sleep 2; \
	done; \
	echo "❌ Error: Backend API is not running at http://localhost:3000."; \
	echo "👉 Run 'make backend' in another terminal or use 'make dev-api'."; \
	exit 1

# ==========================================
# 🖥️ BACKEND
# ==========================================

backend:
	cd $(BACKEND_DIR) && bun --env-file=../../.env run dev

seed:
	cd $(BACKEND_DIR) && bun --env-file=../../.env run db:seed

db-up:
	podman-compose up -d

db-down:
	podman-compose down

db-push:
	cd $(BACKEND_DIR) && bun --env-file=../../.env run db:push

db-shell:
	podman exec -it impenetrable-db psql -U impenetrable -d impenetrable_db

db-wait:
	@echo "⏳ Waiting for database to be ready..."
	@for i in $$(seq 1 30); do \
		if podman exec impenetrable-db pg_isready -U impenetrable -d impenetrable_db > /dev/null 2>&1; then \
			echo "✅ Database is ready!"; \
			exit 0; \
		fi; \
		echo "🕒 DB not ready yet, retrying in 2s ($$i/30)..."; \
		sleep 2; \
	done; \
	echo "❌ Error: Database timeout after 60 seconds"; \
	exit 1

# ==========================================
# 🚀 FULL MONOREPO
# ==========================================

dev: db-up db-wait
	@bunx concurrently \
		--kill-others \
		--prefix "[{name}]" \
		--names "BACKEND,MOBILE" \
		--prefix-colors "blue,magenta" \
		"make backend" \
		"make mobile-api"

dev-mock:
	make mobile-mock

dev-web-api: db-up db-wait
	@bunx concurrently \
		--kill-others \
		--prefix "[{name}]" \
		--names "BACKEND,MOBILE" \
		--prefix-colors "blue,magenta" \
		"make backend" \
		"make mobile-web-api"

# Determine if we are in CI to skip podman/provisioning steps.
# In GitHub Actions, $(CI) is usually set to 'true'.
# Local: SKIP_DB_PROVISIONING is empty -> runs 'db-up' and 'db-wait' automatically.
# CI: SKIP_DB_PROVISIONING is true -> skips local DB setup (uses CI services instead).
SKIP_DB_PROVISIONING ?= $(CI)

test: test-mobile test-backend test-shared

# Conditional dependency: only runs db-up/wait if NOT in CI (determined by SKIP_DB_PROVISIONING)
test-backend: $(if $(SKIP_DB_PROVISIONING),,db-up db-wait)
	cd $(BACKEND_DIR) && bun --env-file=../../.env run test

test-mobile:
	cd $(MOBILE_DIR) && EXPO_PUBLIC_USE_MOCKS=true bun run test

test-mobile-api:
	cp $(MOBILE_DIR)/.env.api $(MOBILE_DIR)/.env.local
	cd $(MOBILE_DIR) && bun run test

test-shared:
	cd packages/shared && bun test

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

gga:
	gga run

check: check-static gga

check-static: check-static-mobile check-static-backend

check-mobile: check-static-mobile gga

check-backend: check-static-backend

check-static-mobile: typecheck-mobile lint-mobile

check-static-backend: typecheck-backend lint-backend

db-reset: db-down db-up db-wait db-push seed
	@echo "🔄 Database reset and seeded!"

# ==========================================
# 🤖 EAS
# ==========================================

eas-login:
	cd $(MOBILE_DIR) && bunx eas-cli login -b

eas-whoami:
	cd $(MOBILE_DIR) && bunx eas-cli whoami

eas-init:
	cd $(MOBILE_DIR) && bunx eas-cli init

eas-build-configure:
	cd $(MOBILE_DIR) && bunx eas-cli build:configure

eas-build-dev:
	cd $(MOBILE_DIR) && bunx eas-cli build --profile development

eas-build-android-dev:
	cd $(MOBILE_DIR) && bunx eas-cli build --profile development --platform android

eas-build-android-preview:
	cd $(MOBILE_DIR) && bunx eas-cli build --profile preview --platform android

eas-build-android-production:
	cd $(MOBILE_DIR) && bunx eas-cli build --profile production --platform android

eas-build-ios-simulator:
	cd $(MOBILE_DIR) && bunx eas-cli build --profile development --platform ios --simulator

eas-export-web:
	cd $(MOBILE_DIR) && bunx expo export:web

eas-deploy-web: eas-export-web
	cd $(MOBILE_DIR) && bunx eas-cli deploy

eas-deploy-web-prod: eas-export-web
		cd $(MOBILE_DIR) && bunx eas-cli deploy --prod

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