.DEFAULT_GOAL := help
SHELL := /bin/bash

PNPM ?= pnpm

.PHONY: help install dev build preview typecheck format clean api-up api-down api-status

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## ' $(MAKEFILE_LIST) | sort \
	  | awk 'BEGIN{FS=":.*?## "} {printf "  \033[36m%-14s\033[0m %s\n", $$1, $$2}'

install: ## Install dependencies (pnpm)
	$(PNPM) install

dev: ## Run Vite dev server (proxies /api -> $$VITE_API_URL or http://127.0.0.1:8080)
	$(PNPM) dev

build: ## Production build into dist/
	$(PNPM) build

preview: build ## Build + serve the production bundle on :4173
	$(PNPM) preview

typecheck: ## tsc --noEmit
	$(PNPM) typecheck

format: ## Prettier write
	$(PNPM) format

clean: ## Remove node_modules, dist, vite cache
	rm -rf node_modules dist .vite

# ---------------------------------------------------------------------------
# Convenience: drive the m4l-telemetry-api port-forward from the sibling repo
# so `make dev` "just works".  These are no-ops if the API repo is missing.
# ---------------------------------------------------------------------------
API_REPO := $(abspath ../m4lTelemetryAPI)

api-up: ## Start the API port-forward (8080 -> in-cluster service)
	@if [ -d "$(API_REPO)" ]; then \
	    $(MAKE) -C "$(API_REPO)" k8s-forward-bg; \
	else \
	    echo "API repo not found at $(API_REPO); start your backend manually."; \
	fi

api-down: ## Stop the API port-forward
	@if [ -d "$(API_REPO)" ]; then $(MAKE) -C "$(API_REPO)" k8s-forward-stop; fi

api-status: ## Check the API port-forward
	@if [ -d "$(API_REPO)" ]; then $(MAKE) -C "$(API_REPO)" k8s-forward-status; fi
