# Todo Web App — Test Plan

See full test plan artifact `Todo_Test_Plan_v1.md` / `.docx` in the QA stage outputs for the complete document (test strategy, coverage matrix, 46 functional test cases, 8 edge/negative tests, 10 API test cases, 9 NFR test cases, regression suite, environment requirements, and summary metrics).

## Quick Reference

- **Total test cases:** 73 (46 functional, 8 edge/negative, 10 API, 9 NFR)
- **Priority breakdown:** P0=19, P1=29, P2=21, P3=4
- **Type breakdown:** Unit=12, Integration=24, E2E=28, NFR=9
- **Story coverage:** 18/18 (100%)
- **Frameworks:** Jest, React Testing Library, Supertest, Cypress/Playwright-style E2E, Lighthouse/k6/axe-core for NFR
- **Regression suite:** 15 core happy paths (see §7 of full plan) must pass before every release

Implemented scope validated against `src/App.jsx` (React + Vite, localStorage-backed CRUD, filters, `data-testid` hooks). Extended scope (auth, due dates/reminders, priority, tags, search) reflects planned backend per the estimation package (8 epics / 52 tasks).
