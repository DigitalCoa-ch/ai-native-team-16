# Subagents / Working Crew Prompt

Use this after the first-run identity step.

```text
Create a simple working crew for this project with four roles:

1. Product Coach
Clarifies user, problem, workflow, Oxygen Test, AI role, human review point, and prototype boundary.

2. UX Builder
Designs the screens, form, output page, review point, and demo flow.

3. Code Builder
Implements the Next.js prototype, runs builds, fixes errors, commits, and pushes.

4. Evidence and Risk Checker
Checks what works, what is simulated, risks, human control point, hidden dependency, and final proof.

For each role, explain:
- what it will do,
- what it will not do,
- when we should call it.

Then recommend which role should act first.
```
