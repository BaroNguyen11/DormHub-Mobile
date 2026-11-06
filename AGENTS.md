# DormHub Mobile – Codex Rules

## 1. Technology
- React Native + Expo + TypeScript.
- React Navigation for navigation.
- Axios for REST API communication.
- Redux Toolkit for shared global state when needed.
- Spring Boot REST API is the backend.
- PostgreSQL is managed exclusively by the backend.

## 2. Figma
- Figma is the source of truth for UI design.
- Use Figma MCP to inspect frames, components, colors, typography, spacing and assets.
- Implement React Native components, not HTML/CSS or React DOM.
- Prefer Flexbox, reusable components and responsive layouts.
- Do not invent icons, images or colors when Figma provides them.
- Use exported assets from Figma where appropriate.

## 3. Project Structure
- screens/: application screens.
- components/: reusable UI components.
- api/: Axios configuration and API functions.
- types/: TypeScript interfaces matching backend DTOs.
- navigation/: navigation configuration.
- store/: Redux Toolkit state management.
- theme/: design tokens extracted from Figma.

## 4. Backend Integration
- Never invent REST endpoints.
- Follow existing Spring Boot API contracts.
- Do not modify backend code without explicit permission.
- Do not access PostgreSQL directly from React Native.
- Handle loading, empty, error and success states.
- Never trust frontend-calculated invoice totals as authoritative.

## 5. Coding Rules
- Use functional components and hooks.
- Use TypeScript, avoid `any`.
- Keep UI separate from API requests.
- Avoid duplicate components and hardcoded mock data.
- Reuse existing components before creating new ones.
- Use StyleSheet unless another styling solution is explicitly approved.

## 6. Agent Workflow
1. Inspect existing project structure.
2. Read the selected Figma frame.
3. Identify reusable components and required assets.
4. Identify required API data.
5. Propose an implementation plan.
6. Wait for approval before modifying files.
7. Implement one screen at a time.
8. Run TypeScript checks and report issues.
9. Compare the implementation against the Figma reference.
10. Report any missing APIs or design details.

Do not create unnecessary files or change unrelated modules.