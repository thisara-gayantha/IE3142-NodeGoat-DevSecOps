# T9 — SSRF Write-up Only

## Location

Potential SSRF risk exists in:

`app/routes/research.js`

The research feature accepts a user-controlled URL query parameter and uses the server-side application to request that URL.

## Vulnerability Summary

Server-Side Request Forgery happens when an attacker can make the server send requests to a destination chosen by the attacker. In this case, if the research feature fetches a URL directly from user input, the application server can be abused as a proxy.

## Why It Is Dangerous

An attacker may try to point the server at internal services that are reachable from the NodeGoat container but not directly reachable by the external user. In a Docker deployment, this could include internal container names, internal service ports, metadata endpoints, or other private network resources.

## Impact

Possible impact includes:

- Internal network probing
- Access to internal-only services
- Exposure of service banners or internal responses
- Abuse of the application as a proxy
- Increased risk if sensitive internal endpoints exist

## Recommended Control

The safest control is to avoid fetching arbitrary user-supplied URLs. If the feature is required, the application should validate the destination using an allowlist.

Recommended controls:

- Allow only approved hostnames
- Reject private IP ranges and localhost
- Reject Docker internal service names unless explicitly required
- Enforce `https://` where possible
- Set request timeout limits
- Do not return raw internal error details to users
- Log rejected SSRF attempts for monitoring

## Why This Was Not Exploited

This item is included as a write-up only. A safe SSRF demonstration needs careful local network isolation to guarantee that no request leaves the authorised environment. For this assignment, the group selected cleaner vulnerabilities for full exploit-fix-retest cycles, while documenting SSRF as a future security improvement.

## Classification

- CWE: CWE-918 — Server-Side Request Forgery
- OWASP: A10:2021 — Server-Side Request Forgery
