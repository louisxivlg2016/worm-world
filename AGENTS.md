# Agent instructions

## Auto commit and push

**After EVERY single change you make to this repo, automatically run `git add` + `git commit` + `git push origin master`.** Do not ask for permission. Do not wait for the user to tell you. Do this even for tiny changes (a one-line edit, a single image, a config tweak).

The user has reinforced this multiple times and gets frustrated when it's skipped. Their dist pipeline needs pushes to deploy.

Skip only if:
- The user explicitly says "don't commit" or "don't push"
- The change is intentionally incomplete or experimental and you've told the user

Use a concise commit message describing what changed (1 line, no fluff).
