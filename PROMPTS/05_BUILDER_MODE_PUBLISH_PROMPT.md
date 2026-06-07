# Builder Mode and Publish Prompt

Use this when the team wants OpenClaw to implement and publish.

```text
Switch to Builder Mode.

Work only inside our assigned repository.

Before editing, summarize:
- the change you will make,
- why it matters,
- which files you expect to modify,
- what result we should check afterward.

Then implement the smallest useful change.

After implementation:
1. Run npm install if dependencies changed.
2. Run npm run build when possible.
3. Fix build errors if feasible.
4. Update OPENCLAW_BUILD_LOG.md.
5. Update DEPLOYMENT_STATUS.md.
6. Commit the changes.
7. Push to main.
8. Tell us the commit message and the public URL to check.

Use:

cd /workspace/ai-native-team-XX
git status
npm install
npm run build
git add .
git commit -m "Team XX: describe the change"
git push origin main
```
