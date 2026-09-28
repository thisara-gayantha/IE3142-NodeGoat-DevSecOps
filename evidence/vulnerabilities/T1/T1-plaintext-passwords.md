# T1 — Plaintext Password Storage (Secondary Finding, Documented Only)

**Status:** Analysed and documented. Not selected for full exploit-and-fix demonstration.
**CWE:** CWE-256 (Plaintext Storage of a Password), CWE-257 (Recoverable Password Storage)
**OWASP:** A02:2021 – Cryptographic Failures

## Location
- `app/data/user-dao.js`
  - `addUser()` stores the password exactly as received, with no hashing.
  - `validateLogin()` compares stored and supplied passwords with a plain string equality check.
- `artifacts/db-reset.js` seeds the initial users with plaintext passwords; bcrypt-hashed versions exist in the file but are commented out.

## Evidence
Querying the users collection on the running local instance returns each user
document with a readable `password` field (admin: Admin_123, user1: User1_123,
user2: User2_123). See `passwords-in-db.png`. These are the fake seeded test
accounts shipped with OWASP NodeGoat, not real credentials.

## Why this is a risk
Passwords are stored in directly readable form. Anyone able to read the database —
through the NoSQL injection weakness (V2), a backup or log leak, or direct access —
obtains every user's actual password immediately. Because people reuse passwords
across services, the impact extends beyond this application.

## Correct control
Hash passwords with a slow, salted algorithm (bcrypt) before storing, and verify
at login with `bcrypt.compareSync`. Hashing is one-way, so even the server cannot
recover the original. The fix is already present in `user-dao.js` as commented-out code.

## Why not selected for full demonstration
Enabling bcrypt breaks login for the three pre-seeded users until
`artifacts/db-reset.js` is migrated to hashed seed values. With the available time
the group prioritised four cleaner exploit-and-fix cycles (V1–V4). This is carried
into the report's future-work section as the top remaining hardening item.
