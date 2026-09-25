# V1 - Server-Side JavaScript Injection

## Vulnerability

Server-Side JavaScript Injection through `eval()`.

## STRIDE Mapping

T2 - Tampering / Elevation of Privilege

## Risk

High

## Affected Component

NodeGoat Contributions functionality.

## Vulnerable File

`app/routes/contributions.js`

## Vulnerable Code

The application evaluates user-controlled contribution values using:

`eval(req.body.preTax)`
`eval(req.body.afterTax)`
`eval(req.body.roth)`

## Baseline Test

A harmless JavaScript arithmetic expression was submitted through the
Pre-Tax contribution field:

`7+8`

The remaining contribution values were set to zero.

## Expected Secure Behaviour

The application should accept only valid numeric input and reject expressions
or executable JavaScript.

## Observed Baseline Behaviour

The server interpreted the supplied expression as JavaScript and evaluated it
to the numeric result `15`.

This demonstrates that user-controlled request data reaches JavaScript `eval()`.

## Evidence

- `01-vulnerable-code.png`
- `02-normal-behaviour.png`
- `03-eval-test-input.png`
- `04-eval-vulnerability-success.png`

## Planned Remediation

Remove `eval()` and implement strict numeric parsing, validation, and allowed
range checking.

## Status

Vulnerable baseline confirmed. Fix not yet implemented.