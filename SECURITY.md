# Security Policy

## Supported versions

This repository is under active open-source preparation. Security fixes are
applied on the default development branch.

## Reporting a vulnerability

Please report security issues privately. Do **not** open a public issue for
vulnerabilities that could expose credentials, customer data, or remote
exploitation paths.

Preferred contact:

- Email: security@softteco.com (or the address designated by SoftTeco Sp. z o.o.)
- Linear / internal: create a private security issue in the Synqevra project and
  mark it as Security / Risk

Include:

- affected component (backend, frontend, CI, containers)
- reproduction steps or proof-of-concept description
- impact assessment
- whether credentials or personal data are involved

We aim to acknowledge reports within 5 business days.

## Secrets and credentials

- Never commit `.env`, Kubernetes `Secret` manifests with real values, private
  keys, access tokens, or production connection strings.
- Use `.env.example` with empty or clearly fake placeholders only.
- Historical findings are tracked in `docs/security/` and remediated via
  credential rotation (SYN-8). Cleaning Git history alone is not remediation.

## Dependency and secret scanning

- Local / CI secret scanning uses Gitleaks (see `.gitleaks.toml`).
- Dependency license review is documented under `docs/security/`.
- Pre-commit and pipeline checks should fail on new secret findings.
