.PHONY: setup install dev mobile mobile-android mobile-ios mobile-web backend clean lint format check

# Install all dependencies and setup monorepo symlinks
setup:
	bun install

install: setup

# ===========================================
# 🧹 UTILS
# ===========================================

# Run ESLint on mobile app
lint:
	cd apps/mobile && bun run lint

# Format the entire monorepo
format:
	bun run format

# Run linter and then format
check: lint format


# ==========================================
# 📱 MOBILE APP (Expo)
# ==========================================

# Start Expo and display QR code
mobile:
	cd apps/mobile && bun run start

# Start Expo directly in the browser
mobile-web:
	cd apps/mobile && bun run web

# Start Expo directly in the Android / iOS Emulator
mobile-android:
	cd apps/mobile && bun run android

mobile-ios:
	cd apps/mobile && bun run ios

# ==========================================
# 🖥️ BACKEND (Hono API)
# ==========================================

backend:
	cd apps/backend && bun run dev

seed:
	cd apps/backend && bun run db:seed

# ==========================================
# 🚀 FULL MONOREPO
# ==========================================

# Start everything (if configured in root package.json)
dev:
	bun run dev

# ==========================================
# 🧹 UTILS
# ==========================================

# Clean node_modules in case Metro bundler breaks with symlink cache
clean:
	rm -rf apps/mobile/.expo
	rm -rf node_modules apps/*/node_modules packages/*/node_modules
	bun pm cache rm
	@echo "🧼 All clean. Run 'make setup' again."
