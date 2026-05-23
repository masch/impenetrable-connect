# Specification: Secure CI/CD Workflows

## Scope

Remediation of mutable action references across three GitHub Actions workflows in `.github/workflows/`.

## Specifications

### 1. deploy-backend.yml

- Location: `.github/workflows/deploy-backend.yml`
- Line 40: `uses: actions/checkout@v6` must be replaced with `uses: actions/checkout@de0fac2e4500dabe0009e67214ff5f5447ce83dd` (v6.0.2).
- Line 54: `uses: actions/setup-node@v4` must be replaced with `uses: actions/setup-node@1d0ff469b7ec7b3cb9d8673fde0c81c44821de2a` (v4.2.0).
- Line 59: `uses: oven-sh/setup-bun@v2` must be replaced with `uses: oven-sh/setup-bun@0c5077e51419868618aeaa5fe8019c62421857d6` (v2.2.0).

### 2. deploy-web.yml

- Location: `.github/workflows/deploy-web.yml`
- Line 30: `uses: actions/checkout@v6` must be replaced with `uses: actions/checkout@de0fac2e4500dabe0009e67214ff5f5447ce83dd` (v6.0.2).
- Line 33: `uses: oven-sh/setup-bun@v2` must be replaced with `uses: oven-sh/setup-bun@0c5077e51419868618aeaa5fe8019c62421857d6` (v2.2.0).
- Line 49: `uses: actions/checkout@v6` must be replaced with `uses: actions/checkout@de0fac2e4500dabe0009e67214ff5f5447ce83dd` (v6.0.2).
- Line 52: `uses: oven-sh/setup-bun@v2` must be replaced with `uses: oven-sh/setup-bun@0c5077e51419868618aeaa5fe8019c62421857d6` (v2.2.0).

### 3. react-doctor.yml

- Location: `.github/workflows/react-doctor.yml`
- Line 14: `uses: actions/checkout@v5` must be replaced with `uses: actions/checkout@de0fac2e4500dabe0009e67214ff5f5447ce83dd` (v6.0.2).
- Line 18: `uses: millionco/react-doctor@main` must be replaced with `uses: millionco/react-doctor@241444d35287f1b4551cca921a65fb2fa67949b6`.
