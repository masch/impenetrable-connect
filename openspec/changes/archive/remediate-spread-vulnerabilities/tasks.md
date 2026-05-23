# Task List: Remediate React Props Spreading Vulnerabilities

## Phase 1: Implementation

- [ ] **1.1** Modify `apps/mobile/src/app/admin/project/[id].tsx` to pass `AppAlert` props explicitly
- [ ] **1.2** Modify `apps/mobile/src/app/tourist/orders.tsx` to pass `AppAlert` props explicitly
- [ ] **1.3** Modify `apps/mobile/src/components/FormInput.tsx` to redefine props interface and pass text input props explicitly
- [ ] **1.4** Modify `apps/mobile/src/components/Profile/ProfileView.tsx` to pass `ProfileActionButton` props explicitly
- [ ] **1.5** Suppress false-positive object injection warnings via the local API endpoint (`POST /ignore`)

## Phase 2: Verification

- [ ] **2.1** Run `make check` to verify type safety and eslint rules
- [ ] **2.2** Run `make test` to verify all mobile tests pass
- [ ] **2.3** Run SecureCoder scan on the modified files to verify findings are gone
- [ ] **2.4** Call SecureCoder `POST /fix_completed` API to record successful remediation
