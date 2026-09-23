h# OWASP NodeGoat – STRIDE Threat Model and Risk Assessment

**Module:** IE3142 – DevOps Security  
**Project:** Building and Securing a DevSecOps Pipeline  
**Selected Application:** OWASP NodeGoat  
**Technology Stack:** Node.js, Express.js, MongoDB, Docker, Docker Compose  
**Assessment Stage:** Vulnerable Baseline – Before Security Remediation  
**Date:** 2026-09-19  

---

## 1. Purpose

This document presents the STRIDE threat model and risk assessment for the
OWASP NodeGoat application used in the IE3142 DevOps Security project.

The purpose of this assessment is to:

- identify realistic security threats that apply to the actual NodeGoat architecture;
- connect each threat to a specific component, data flow, trust boundary, or data store;
- determine the likelihood and impact of each threat;
- prioritise security risks before implementing remediation;
- identify the code location where each security control should be implemented;
- provide traceability from architecture to threat, vulnerability, remediation, testing,
  and CI/CD security controls.

This assessment is based on the vulnerable baseline of the NodeGoat source code
used by the project. The mitigations listed in this document are therefore
classified as **Planned / Proposed Controls** until the corresponding secure
coding changes have been implemented and verified.

All vulnerability testing associated with this threat model must be performed
only against the authorised local NodeGoat educational environment.

---

# 2. System Architecture Reference

The NodeGoat deployment consists of a user interacting with a Node.js/Express
web application that communicates with MongoDB.

The NodeGoat application and MongoDB operate as separate Docker services managed
using Docker Compose.

The web application is exposed to the local host through port `4000`, while the
MongoDB service communicates with the application through the internal Docker
network using port `27017`.

## 2.1 Architecture Elements

| ID | Type | Description |
|---|---|---|
| **E1** | External Entity | User / Web Browser |
| **P1** | Process | NodeGoat Node.js / Express Web Application |
| **D1** | Data Store | MongoDB Database |
| **DF1** | Data Flow | Browser → NodeGoat HTTP Request |
| **DF2** | Data Flow | NodeGoat → Browser HTTP Response |
| **DF3** | Data Flow | NodeGoat → MongoDB Query / Write |
| **DF4** | Data Flow | MongoDB → NodeGoat Query Result |
| **TB1** | Trust Boundary | External User / Browser ↔ NodeGoat Application |
| **TB2** | Trust Boundary | NodeGoat Application ↔ MongoDB Database |

---

# 3. Main Data Flows

## DF1 – Browser to NodeGoat

The browser sends user-controlled information to the NodeGoat application.

Examples include:

- usernames and passwords;
- registration details;
- profile information;
- contribution values;
- allocation parameters;
- URL parameters;
- query-string parameters;
- memo content;
- HTTP headers;
- session cookies.

Because most of this information originates from an external user, DF1 crosses
the main external trust boundary, **TB1**.

---

## DF2 – NodeGoat to Browser

NodeGoat sends HTTP responses back to the browser.

These responses may contain:

- rendered HTML pages;
- authentication results;
- user profile information;
- allocation information;
- benefit information;
- memo content;
- application errors;
- redirects;
- session-related responses.

---

## DF3 – NodeGoat to MongoDB

The application sends database operations to MongoDB.

Examples include:

- user lookups;
- authentication-related lookups;
- profile updates;
- allocation queries;
- contribution updates;
- memo inserts;
- benefit updates.

This data flow crosses **TB2**, the application-to-database trust boundary.

---

## DF4 – MongoDB to NodeGoat

MongoDB returns stored application information to NodeGoat.

Examples include:

- user records;
- profile information;
- contribution records;
- allocation records;
- benefit records;
- memo data;
- authentication-related user information.

---

# 4. STRIDE Methodology

STRIDE is used to classify security threats into six major categories.

| STRIDE Category | Security Property Affected | Meaning |
|---|---|---|
| **S – Spoofing** | Authentication | Pretending to be another user or identity |
| **T – Tampering** | Integrity | Unauthorized modification of data or application behaviour |
| **R – Repudiation** | Accountability | Performing an action while preventing reliable attribution |
| **I – Information Disclosure** | Confidentiality | Exposure of information to unauthorized parties |
| **D – Denial of Service** | Availability | Preventing or degrading legitimate use of the system |
| **E – Elevation of Privilege** | Authorization | Gaining permissions beyond those legitimately assigned |

Threats in this document were derived from the actual NodeGoat architecture and
source code rather than being created only from a generic STRIDE checklist.

---

# 5. Risk Assessment Method

A qualitative **3 × 3 Likelihood–Impact Risk Matrix** is used.

## 5.1 Likelihood

### Low

The attack requires unusual privileges, uncommon system conditions, or
significant additional access.

### Medium

The attack is realistically possible but requires authentication, a specific
input condition, another prerequisite, or knowledge of application behaviour.

### High

The vulnerable functionality is directly reachable through ordinary
application functionality and exploitation requires little additional access.

---

## 5.2 Impact

### Low

Successful exploitation produces only a small security effect and does not
significantly affect important application assets.

### Medium

Successful exploitation may affect integrity, availability, logging, or a
limited amount of application information.

### High

Successful exploitation could result in consequences such as:

- unauthorized account access;
- unauthorized execution of server-side logic;
- privilege escalation;
- access to another user's information;
- modification of protected data;
- disclosure of sensitive information;
- serious compromise of application integrity.

---

## 5.3 Risk Matrix

| Likelihood ↓ / Impact → | Low | Medium | High |
|---|---|---|---|
| **High** | Medium | High | High |
| **Medium** | Low | Medium | High |
| **Low** | Low | Low | Medium |

The final risk value is determined from the intersection of likelihood and
impact.

---

# 6. Completed STRIDE Threat Model

## T1 – Weak Authentication and Password Protection

| Field | Assessment |
|---|---|
| **Threat ID** | T1 |
| **STRIDE Category** | Spoofing |
| **Threat Scenario** | An attacker may impersonate a legitimate NodeGoat user if credentials are compromised. The baseline application stores passwords without the active password-hashing remediation and compares submitted passwords directly. Different authentication error messages can also reveal whether a username exists. The login process assigns the authenticated user to the existing session without first regenerating the session identifier. |
| **Architecture Elements** | E1, P1, D1, DF1, DF3, DF4, TB1, TB2 |
| **Affected Assets** | User credentials, user accounts, authenticated sessions |
| **Relevant Code** | `app/data/user-dao.js`, `app/routes/session.js` |
| **Likelihood** | Medium |
| **Likelihood Justification** | Authentication is directly accessible to users. Credential compromise requires additional conditions, but the baseline authentication implementation increases the consequences of database exposure, credential guessing, or session-related attacks. |
| **Impact** | High |
| **Impact Justification** | Successful account impersonation could provide unauthorized access to user functions and private application data. |
| **Overall Risk** | **High** |
| **Baseline Weakness** | Passwords are stored directly in the user document and compared using direct equality. bcrypt remediation exists only as commented guidance. Login errors differentiate invalid usernames from invalid passwords, and session regeneration is not active during login. |
| **Planned Control** | Hash passwords using a strong adaptive password hashing algorithm such as bcrypt; use the same generic authentication error message for invalid credentials; regenerate the session identifier after successful authentication. |
| **Implementation Location** | `app/data/user-dao.js`, `app/routes/session.js` |
| **Verification Method** | Inspect MongoDB to confirm passwords are no longer stored in plaintext; verify both incorrect usernames and passwords generate equivalent responses; confirm login creates a new session identifier. |
| **Reference Mapping** | CWE-256 – Plaintext Storage of a Password; CWE-384 – Session Fixation; OWASP Password Storage guidance; OWASP Authentication guidance |

---

## T2 – Server-Side JavaScript Injection through `eval()`

| Field | Assessment |
|---|---|
| **Threat ID** | T2 |
| **STRIDE Category** | Tampering / Elevation of Privilege |
| **Threat Scenario** | A malicious authenticated user may submit a JavaScript expression instead of a normal numeric contribution value. The application evaluates the submitted `preTax`, `afterTax`, and `roth` values using JavaScript `eval()`, causing untrusted user input to be interpreted as executable server-side JavaScript. |
| **Architecture Elements** | E1 → DF1 → P1, TB1 |
| **Affected Assets** | Application integrity, server-side execution environment, contribution-processing logic |
| **Relevant Code** | `app/routes/contributions.js` |
| **Likelihood** | High |
| **Likelihood Justification** | The vulnerable contribution functionality is reachable through normal authenticated application usage, and user-controlled input is passed directly to `eval()`. |
| **Impact** | High |
| **Impact Justification** | Executing attacker-controlled JavaScript on the server could alter application behaviour, bypass intended processing, or affect application confidentiality and integrity. |
| **Overall Risk** | **High** |
| **Baseline Weakness** | `eval(req.body.preTax)`, `eval(req.body.afterTax)`, and `eval(req.body.roth)` process user-controlled input. |
| **Planned Control** | Remove all uses of `eval()` for contribution values. Parse values as numeric data only, validate type and allowed range, reject unexpected formats, and add regression tests preventing executable expressions from being accepted. |
| **Implementation Location** | `app/routes/contributions.js`; related automated tests; Semgrep CI security gate |
| **Verification Method** | Execute the baseline test using a controlled expression, record the result, apply the fix, and repeat the exact same test to verify the expression is rejected. Confirm normal numeric contribution values continue to work. |
| **Reference Mapping** | CWE-95 – Improper Neutralization of Directives in Dynamically Evaluated Code / Eval Injection |
| **Exploit-and-Fix Candidate** | **V1 – Selected** |

---

## T3 – MongoDB / NoSQL Injection through `$where`

| Field | Assessment |
|---|---|
| **Threat ID** | T3 |
| **STRIDE Category** | Tampering / Denial of Service |
| **Threat Scenario** | A malicious user may manipulate the allocation `threshold` query parameter because its value is inserted into a dynamically constructed MongoDB `$where` JavaScript expression. Crafted input may change database query behaviour or cause computationally expensive JavaScript execution inside the database. |
| **Architecture Elements** | E1 → DF1 → P1 → DF3 → D1, TB1, TB2 |
| **Affected Assets** | Allocation records, database query integrity, MongoDB availability |
| **Relevant Code** | `app/data/allocations-dao.js` |
| **Likelihood** | High |
| **Likelihood Justification** | The threshold parameter is user controlled and is directly incorporated into a MongoDB `$where` expression without strict numeric validation. |
| **Impact** | High |
| **Impact Justification** | Successful manipulation can change intended query behaviour and may consume database resources, affecting both integrity and availability. |
| **Overall Risk** | **High** |
| **Baseline Weakness** | The `threshold` parameter becomes part of a JavaScript expression inside MongoDB `$where`. |
| **Planned Control** | Remove the dynamically constructed `$where` expression. Parse the threshold as an integer, apply strict range validation, and use normal MongoDB query operators such as `$gt`. |
| **Implementation Location** | `app/data/allocations-dao.js` |
| **Verification Method** | Record baseline behaviour using the controlled injection input. Apply the safe query implementation and repeat the exact same input. Confirm the malicious expression no longer changes query behaviour while valid threshold searches remain functional. |
| **Reference Mapping** | CWE-943 – Improper Neutralization of Special Elements in Data Query Logic; OWASP Injection guidance |
| **Exploit-and-Fix Candidate** | **V2 – Selected** |

---

## T4 – Log Injection / Log Forging

| Field | Assessment |
|---|---|
| **Threat ID** | T4 |
| **STRIDE Category** | Repudiation |
| **Threat Scenario** | An attacker may submit specially crafted username input containing newline or control characters during a failed login attempt. Because the username is written directly into an application log message, malicious input could create misleading or forged-looking log entries and reduce the reliability of audit information. |
| **Architecture Elements** | E1 → DF1 → P1, TB1 |
| **Affected Assets** | Application logs, security audit trail, incident investigation records |
| **Relevant Code** | `app/routes/session.js` |
| **Likelihood** | Medium |
| **Likelihood Justification** | Login is externally reachable and does not require authentication, but successful abuse requires carefully constructed input and access to a logging context where forged lines have value. |
| **Impact** | Medium |
| **Impact Justification** | The primary consequence is reduced integrity and trustworthiness of logs rather than direct access to sensitive application records. |
| **Overall Risk** | **Medium** |
| **Baseline Weakness** | Failed usernames are written directly to console logging without explicit CR/LF neutralization. |
| **Planned Control** | Remove or encode control characters before logging user-controlled values. Prefer structured logging where untrusted values are stored as separate fields rather than concatenated into free-form log messages. |
| **Implementation Location** | `app/routes/session.js`; application logging configuration |
| **Verification Method** | Submit a username containing newline/control characters and inspect the resulting baseline log. After remediation, repeat the test and confirm the input cannot create an additional forged-looking log entry. |
| **Reference Mapping** | CWE-117 – Improper Output Neutralization for Logs |

---

## T5 – Exposure of Sensitive Profile Information

| Field | Assessment |
|---|---|
| **Threat ID** | T5 |
| **STRIDE Category** | Information Disclosure |
| **Threat Scenario** | Sensitive profile information such as SSN, date of birth, bank account information, and bank routing information may be exposed in readable form if MongoDB records are obtained through another application vulnerability, unauthorized database access, a backup, or compromised application process. |
| **Architecture Elements** | P1, D1, DF1, DF3, DF4, TB1, TB2 |
| **Affected Assets** | Personal information, financial information, profile records |
| **Relevant Code** | `app/data/profile-dao.js`, `server.js` |
| **Likelihood** | Medium |
| **Likelihood Justification** | Direct database access normally requires another weakness or access path, but several sensitive values are stored without the inactive encryption remediation. |
| **Impact** | High |
| **Impact Justification** | Disclosure could expose highly sensitive personal and financial information belonging to application users. |
| **Overall Risk** | **High** |
| **Baseline Weakness** | Sensitive fields are stored directly in MongoDB. Encryption-related remediation code exists only as commented guidance. The current educational deployment also runs through HTTP rather than HTTPS. |
| **Planned Control** | Minimize storage of unnecessary sensitive information; encrypt highly sensitive fields at rest using appropriate authenticated encryption; keep encryption keys outside source code using secure configuration/secrets management; use HTTPS and appropriately secured cookies in production-equivalent deployment. |
| **Implementation Location** | `app/data/profile-dao.js`, `server.js`, environment/secrets configuration |
| **Verification Method** | Inspect the stored database representation before and after remediation. Verify sensitive fields are no longer readable directly and that required application functionality continues to work. |
| **Reference Mapping** | CWE-312 – Cleartext Storage of Sensitive Information; CWE-319 – Cleartext Transmission of Sensitive Information |

---

## T6 – Regular Expression Denial of Service (ReDoS)

| Field | Assessment |
|---|---|
| **Threat ID** | T6 |
| **STRIDE Category** | Denial of Service |
| **Threat Scenario** | An authenticated user may submit a specially crafted and sufficiently long bank-routing value that causes excessive backtracking in the vulnerable regular expression. Because Node.js processes JavaScript on its event loop, excessive regex processing may reduce application responsiveness. |
| **Architecture Elements** | E1 → DF1 → P1, TB1 |
| **Affected Assets** | Application availability, Node.js CPU/event-loop processing |
| **Relevant Code** | `app/routes/profile.js` |
| **Likelihood** | Medium |
| **Likelihood Justification** | The profile input is reachable by authenticated users, but effective exploitation requires a deliberately crafted input designed to trigger pathological regex behaviour. |
| **Impact** | Medium |
| **Impact Justification** | The main consequence is temporary degradation or loss of application availability rather than direct compromise of confidential records. |
| **Overall Risk** | **Medium** |
| **Baseline Weakness** | The bank-routing validation uses the nested-quantifier regular expression `/([0-9]+)+\#/`. |
| **Planned Control** | Replace the vulnerable nested expression with a simpler bounded or anchored expression and enforce a maximum acceptable input length before regex evaluation. |
| **Implementation Location** | `app/routes/profile.js` |
| **Verification Method** | Measure application response behaviour using the controlled baseline input. Apply remediation and repeat the same input, confirming it is rejected or processed without excessive delay. |
| **Reference Mapping** | CWE-1333 – Inefficient Regular Expression Complexity |

---

## T7 – Missing Function-Level Authorization on Administrative Benefits Functions

| Field | Assessment |
|---|---|
| **Threat ID** | T7 |
| **STRIDE Category** | Elevation of Privilege |
| **Threat Scenario** | A normal authenticated user may access administrative Benefits functionality because both the GET and POST `/benefits` routes currently require only authentication. NodeGoat already contains an administrator-check middleware, but that middleware is not active on the Benefits routes in the vulnerable baseline. |
| **Architecture Elements** | E1 → DF1 → P1 → DF3 → D1, TB1, TB2 |
| **Affected Assets** | Administrative functions, benefit records, authorization model |
| **Relevant Code** | `app/routes/index.js`, `app/routes/session.js`, `app/routes/benefits.js` |
| **Likelihood** | High |
| **Likelihood Justification** | Any normal authenticated user can potentially request the administrative route because login status rather than administrative role is currently enforced. |
| **Impact** | High |
| **Impact Justification** | A non-administrator could access administrative information or modify benefit-related information belonging to other users. |
| **Overall Risk** | **High** |
| **Baseline Weakness** | `/benefits` GET and POST routes use `isLoggedIn` but do not actively apply the existing `isAdmin` middleware. The secure route definitions are present only as commented remediation guidance. |
| **Planned Control** | Apply administrator authorization middleware to every administrative Benefits operation. Enforce server-side authorization regardless of whether the UI displays administrative links. Add tests confirming normal users are denied while administrator users are permitted. |
| **Implementation Location** | `app/routes/index.js`, `app/routes/session.js`, authorization tests |
| **Verification Method** | Log in as a normal user and record baseline access to the Benefits endpoint. Apply authorization middleware and repeat the exact request. Confirm the normal user is denied while the administrator account can still access the function. |
| **Reference Mapping** | CWE-862 – Missing Authorization; OWASP Broken Access Control guidance |
| **Exploit-and-Fix Candidate** | **V3 – Selected** |

---

## T8 – IDOR / Broken Object-Level Authorization in Allocations

| Field | Assessment |
|---|---|
| **Threat ID** | T8 |
| **STRIDE Category** | Elevation of Privilege / Information Disclosure |
| **Threat Scenario** | An authenticated user may modify the `userId` in `/allocations/:userId` and request another user's allocation information because the application uses the URL parameter to determine which user's record should be queried rather than deriving the identity from the authenticated session or performing an explicit ownership authorization check. |
| **Architecture Elements** | E1 → DF1 → P1 → DF3 → D1 → DF4 → P1 → DF2 → E1, TB1, TB2 |
| **Affected Assets** | Other users' allocation information, user privacy, authorization boundaries |
| **Relevant Code** | `app/routes/allocations.js`, `app/data/allocations-dao.js` |
| **Likelihood** | High |
| **Likelihood Justification** | The URL contains a direct user identifier and the route is available to authenticated users. Changing the identifier requires little technical effort. |
| **Impact** | High |
| **Impact Justification** | Successful exploitation can expose information belonging to a different authenticated user and breaks object-level authorization. |
| **Overall Risk** | **High** |
| **Baseline Weakness** | `req.params.userId` is used as the identity passed to the allocation data-access function. The secure alternative using `req.session.userId` exists only as commented remediation guidance. |
| **Planned Control** | Derive the current user's identifier from the authenticated session for user-owned resources or explicitly compare the requested object with the authenticated user's authorization. Return an appropriate access-denied response for unauthorized requests. |
| **Implementation Location** | `app/routes/allocations.js`; authorization regression tests |
| **Verification Method** | Authenticate as User A and request User B's allocation identifier. Record baseline access. Apply the authorization control and repeat the exact request. Confirm User A can no longer obtain User B's data while access to User A's own record continues to work. |
| **Reference Mapping** | CWE-639 – Authorization Bypass Through User-Controlled Key; OWASP IDOR / Broken Access Control guidance |
| **Exploit-and-Fix Candidate** | **V4 – Selected** |

---

## T9 – Server-Side Request Forgery through the Research Function

| Field | Assessment |
|---|---|
| **Threat ID** | T9 |
| **STRIDE Category** | Information Disclosure / Tampering |
| **Threat Scenario** | An authenticated user can influence the destination of a server-side HTTP request through the Research endpoint. The application concatenates the user-controlled `url` and `symbol` query parameters and passes the resulting value to `needle.get()`. A malicious user may therefore attempt to cause the NodeGoat server to send requests to destinations chosen by the user, including services that may not normally be directly reachable from the user's browser. |
| **Architecture Elements** | E1 → DF1 → P1 → outbound server-side request, TB1 |
| **Affected Assets** | Internal network services, application network identity, information returned from reachable services |
| **Relevant Code** | `app/routes/research.js` |
| **Likelihood** | Medium |
| **Likelihood Justification** | The endpoint requires authentication, but the destination URL is substantially influenced by request parameters without an explicit destination allowlist. |
| **Impact** | High |
| **Impact Justification** | In a broader deployment, SSRF can allow interaction with internal-only services or expose information available from trusted network locations. The actual accessible targets depend on the local deployment environment. |
| **Overall Risk** | **High** |
| **Baseline Weakness** | `req.query.url` and `req.query.symbol` are combined into a URL and passed to `needle.get()` without an explicit protocol/hostname allowlist. |
| **Planned Control** | Do not permit arbitrary user-controlled destinations. Use a fixed trusted service base URL where possible. Otherwise parse the destination safely, allow only approved protocols and hostnames, reject loopback/private/internal destinations where appropriate, disable unnecessary redirects, and enforce request timeouts. |
| **Implementation Location** | `app/routes/research.js`; outbound-network configuration |
| **Verification Method** | In the authorised local environment, record whether the baseline server attempts a request to a controlled local destination. After remediation, repeat the same request and verify that non-approved destinations are rejected. |
| **Reference Mapping** | CWE-918 – Server-Side Request Forgery (SSRF); OWASP SSRF Prevention guidance |
| **Exploit-and-Fix Candidate** | Additional candidate if a fifth vulnerability is required |

---

## T10 – Unvalidated Redirect

| Field | Assessment |
|---|---|
| **Threat ID** | T10 |
| **STRIDE Category** | Spoofing / Tampering |
| **Threat Scenario** | An authenticated user can provide a destination through the `url` query parameter of the `/learn` route. The application passes this value directly to `res.redirect()`. An attacker could construct a NodeGoat link that redirects a victim to an attacker-controlled destination, which could support phishing or credential-stealing scenarios. |
| **Architecture Elements** | E1 → DF1 → P1 → DF2 → E1, TB1 |
| **Affected Assets** | User trust, navigation integrity, authentication credentials if combined with phishing |
| **Relevant Code** | `app/routes/index.js` |
| **Likelihood** | Medium |
| **Likelihood Justification** | Constructing a malicious redirect link is simple, but successful abuse normally requires convincing a user to follow the crafted URL. |
| **Impact** | Medium |
| **Impact Justification** | The redirect does not itself compromise the server but can redirect trusted NodeGoat users to malicious content or phishing pages. |
| **Overall Risk** | **Medium** |
| **Baseline Weakness** | `/learn` executes `res.redirect(req.query.url)` using a user-controlled destination without an allowlist. |
| **Planned Control** | Avoid accepting complete redirect destinations from users. Use server-side identifiers mapped to trusted destinations, or strictly validate redirects against an allowlist of approved relative paths or trusted origins. |
| **Implementation Location** | `app/routes/index.js` |
| **Verification Method** | Record the baseline redirect to a controlled test destination. Apply validation and repeat the exact request. Confirm external or unapproved destinations are rejected while legitimate learning-resource navigation continues to function. |
| **Reference Mapping** | CWE-601 – URL Redirection to Untrusted Site |
| **Exploit-and-Fix Candidate** | Additional candidate |

---

# 7. Risk Summary

The NodeGoat baseline assessment identified **10 application-specific threats**.

## 7.1 Risk Distribution

| Risk Level | Threats | Count |
|---|---|---:|
| **High** | T1, T2, T3, T5, T7, T8, T9 | **7** |
| **Medium** | T4, T6, T10 | **3** |
| **Low** | None identified in the selected threat set | **0** |

The concentration of High-risk threats is expected because NodeGoat is an
intentionally vulnerable educational application designed to demonstrate
common web-application security weaknesses.

---

# 8. Risk Prioritisation

The highest-priority threats for secure coding are **T2, T3, T7, and T8**.

These threats were prioritised because they satisfy several important criteria:

1. the vulnerable functionality is clearly identifiable in the current source code;
2. the attack surface is reachable through normal application functionality;
3. the security consequence can be demonstrated in a controlled local environment;
4. the weakness can be repaired through a clear source-code change;
5. the exact same test can be repeated after remediation;
6. the result can be documented clearly using before-and-after evidence;
7. the vulnerabilities map directly to the architecture and STRIDE analysis.

T2 allows user-controlled contribution values to reach JavaScript `eval()`,
creating a direct server-side code-evaluation risk.

T3 places user-controlled threshold data into a MongoDB `$where` expression,
creating a NoSQL injection and database-resource risk.

T7 fails to apply the application's existing administrator middleware to the
Benefits routes, allowing normal authenticated users to reach functionality
intended for administrators.

T8 trusts the `userId` supplied in the allocations URL without ensuring that the
requested user corresponds to the authenticated session, creating an object-level
authorization failure.

T1, T5, and T9 remain High-risk issues and should be considered during wider
hardening of the application, even though they are not currently selected as the
four primary exploit-and-fix demonstrations.

---

# 9. Threat-to-Control Traceability

| Threat | Planned Security Control | Primary Implementation Location | Planned Verification |
|---|---|---|---|
| **T1** | Password hashing, generic authentication errors, session regeneration | `app/data/user-dao.js`, `app/routes/session.js` | Password-storage inspection + authentication/session test |
| **T2** | Remove `eval()` and strictly validate numeric contribution values | `app/routes/contributions.js` | Exact injection re-test + SAST |
| **T3** | Remove unsafe `$where`, validate threshold, use safe MongoDB operators | `app/data/allocations-dao.js` | Exact NoSQL injection re-test + SAST |
| **T4** | Sanitize log data and use structured logging | `app/routes/session.js` | CR/LF log-forging test |
| **T5** | Protect sensitive fields, secure key handling, secure transport | `app/data/profile-dao.js`, `server.js` | Stored-data/configuration inspection |
| **T6** | Safe regex and input-length restriction | `app/routes/profile.js` | Performance/rejection regression test |
| **T7** | Apply administrator authorization middleware | `app/routes/index.js`, `app/routes/session.js` | Normal-user vs admin authorization test |
| **T8** | Enforce authenticated-user/object ownership | `app/routes/allocations.js` | Cross-user request re-test |
| **T9** | Destination allowlist and safe URL validation | `app/routes/research.js` | Controlled local SSRF re-test |
| **T10** | Redirect destination allowlist / relative-path mapping | `app/routes/index.js` | External redirect re-test |

---

# 10. Vulnerabilities Selected for Secure Coding Demonstration

The following four threats are selected for the assignment's required
vulnerability demonstration, remediation, and exact re-testing process.

| Vulnerability ID | Related Threat | Vulnerability | Primary File |
|---|---|---|---|
| **V1** | T2 | Server-Side JavaScript Injection through `eval()` | `app/routes/contributions.js` |
| **V2** | T3 | MongoDB / NoSQL Injection through `$where` | `app/data/allocations-dao.js` |
| **V3** | T7 | Missing Function-Level Authorization | `app/routes/index.js` |
| **V4** | T8 | IDOR / Broken Object-Level Authorization | `app/routes/allocations.js` |

---

# 11. Planned Evidence Structure

Evidence for each selected vulnerability should demonstrate the complete
before-and-after security lifecycle.

Recommended repository structure:

    evidence/
    ├── V1-eval-injection/
    │   ├── before/
    │   └── after/
    │
    ├── V2-nosql-injection/
    │   ├── before/
    │   └── after/
    │
    ├── V3-admin-authorization/
    │   ├── before/
    │   └── after/
    │
    └── V4-idor/
        ├── before/
        └── after/

For each vulnerability, evidence should include:

- vulnerable baseline behaviour;
- relevant vulnerable code;
- controlled test input;
- screenshot or captured output;
- source-code remediation;
- exact same test after remediation;
- evidence that the attack is blocked;
- evidence that legitimate application functionality still works;
- relevant automated test where practical;
- Git commit reference;
- SAST before/after evidence where applicable.

---

# 12. Planned Vulnerability-to-Control Mapping

## V1 – Server-Side JavaScript Injection

**Threat:** T2  
**Current weakness:** User input reaches `eval()`.  
**Planned remediation:** Remove `eval()` and strictly parse/validate numeric input.  
**Primary code:** `app/routes/contributions.js`  
**Expected result after remediation:** JavaScript expressions are rejected while
valid numeric contribution values continue to function.

---

## V2 – NoSQL Injection

**Threat:** T3  
**Current weakness:** User-controlled threshold data is inserted into a MongoDB
`$where` expression.  
**Planned remediation:** Validate the threshold as numeric data and replace the
dynamic `$where` expression with standard MongoDB operators.  
**Primary code:** `app/data/allocations-dao.js`  
**Expected result after remediation:** Injection input can no longer alter query
logic while valid threshold filtering remains functional.

---

## V3 – Missing Administrator Authorization

**Threat:** T7  
**Current weakness:** `/benefits` requires authentication but does not enforce
the available administrator-role middleware.  
**Planned remediation:** Apply administrator authorization to both GET and POST
Benefits operations.  
**Primary code:** `app/routes/index.js`  
**Expected result after remediation:** A normal user is denied access while an
administrator retains legitimate access.

---

## V4 – IDOR / Broken Object-Level Authorization

**Threat:** T8  
**Current weakness:** The allocations route trusts the `userId` from the URL.  
**Planned remediation:** Use the authenticated session identity or explicitly
enforce ownership before returning allocation data.  
**Primary code:** `app/routes/allocations.js`  
**Expected result after remediation:** A user cannot access another user's
allocation information but can still access their own records.

---

# 13. Relationship to the DevSecOps Pipeline

Threat modelling is used to determine which security controls should be added
to both the source code and CI/CD process.

The planned DevSecOps pipeline will later include:

- Static Application Security Testing (SAST);
- Software Composition Analysis / dependency scanning;
- secret scanning;
- container image vulnerability scanning;
- automated tests;
- build and Docker validation.

Security findings associated with the threat model should be used to define
security gates where appropriate.

For example, SAST should detect or prevent dangerous code patterns such as the
use of `eval()`, while automated authorization tests should prevent regression
of T7 and T8.

---

# 14. Threat Model Status

| Area | Status |
|---|---|
| Application selected | Completed |
| Docker deployment | Completed |
| Architecture diagram | Completed |
| Data flows identified | Completed |
| Trust boundaries identified | Completed |
| STRIDE threat identification | Completed |
| Risk assessment | Completed |
| Threat prioritisation | Completed |
| Four vulnerabilities selected | Completed |
| Baseline SAST | Pending |
| Baseline vulnerability demonstrations | Pending |
| Secure coding fixes | Pending |
| Exact re-testing | Pending |
| CI/CD security gates | Pending |
| Final control verification | Pending |

---

# 15. Post-Remediation Update Requirement

This threat model represents the **vulnerable baseline**.

After V1–V4 are remediated, this file must be updated so that the
**Planned / Proposed Control** for each remediated vulnerability becomes an
**Implemented Control**.

The final entries should include:

    Implemented Control:
    <description of implemented security control>

    Implementation Location:
    <file and relevant function>

    Commit:
    <Git commit hash>

    Evidence:
    <path to before/after evidence>

    Verification:
    <result of exact re-test>

This will provide traceability through the complete security lifecycle:

    Architecture
        ↓
    Trust Boundary / Data Flow
        ↓
    STRIDE Threat
        ↓
    Vulnerability
        ↓
    Risk Assessment
        ↓
    Planned Control
        ↓
    Secure Code Change
        ↓
    Git Commit
        ↓
    Exact Re-Test
        ↓
    CI/CD Security Validation
        ↓
    Evidence

---

# 16. Important Verification Notes

The threats in this document are based on the current NodeGoat baseline source
used by this project.

The following weaknesses were directly identified in the project source:

- server-side use of `eval()` in `app/routes/contributions.js`;
- MongoDB `$where` construction using the threshold parameter in
  `app/data/allocations-dao.js`;
- vulnerable nested regex in `app/routes/profile.js`;
- plaintext-style password storage/comparison behaviour in
  `app/data/user-dao.js`;
- authentication and session weaknesses in `app/routes/session.js`;
- inactive sensitive-data encryption guidance in `app/data/profile-dao.js`;
- Benefits routes missing the available administrator middleware in
  `app/routes/index.js`;
- user-controlled allocation identifier usage in `app/routes/allocations.js`;
- user-controlled outbound request destination construction in
  `app/routes/research.js`;
- user-controlled redirect destination handling in `app/routes/index.js`.

Actual exploit behaviour must still be verified against the authorised local
Docker deployment before screenshots or results are presented as evidence.

No claim should be made that a proposed mitigation has been implemented until
the relevant code has been changed, tested, committed, and verified.

---

# 17. Security Reference Mapping

The following security references are relevant to this threat model:

1. **OWASP NodeGoat** – intentionally vulnerable Node.js web application.
2. **OWASP Threat Modeling guidance** – architecture and trust-boundary-driven
   threat identification.
3. **OWASP Password Storage Cheat Sheet** – secure password hashing practices.
4. **OWASP Session Management Cheat Sheet** – session identifier and cookie
   security.
5. **OWASP Authorization Cheat Sheet** – server-side authorization controls.
6. **OWASP Insecure Direct Object Reference Prevention guidance** – object-level
   authorization.
7. **OWASP Server-Side Request Forgery Prevention Cheat Sheet** – outbound
   destination validation.
8. **OWASP Injection Prevention guidance** – prevention of untrusted-data
   interpretation.
9. **CWE-95** – Improper Neutralization of Directives in Dynamically Evaluated
   Code.
10. **CWE-117** – Improper Output Neutralization for Logs.
11. **CWE-256** – Plaintext Storage of a Password.
12. **CWE-312** – Cleartext Storage of Sensitive Information.
13. **CWE-319** – Cleartext Transmission of Sensitive Information.
14. **CWE-384** – Session Fixation.
15. **CWE-601** – URL Redirection to Untrusted Site.
16. **CWE-639** – Authorization Bypass Through User-Controlled Key.
17. **CWE-862** – Missing Authorization.
18. **CWE-918** – Server-Side Request Forgery.
19. **CWE-943** – Improper Neutralization of Special Elements in Data Query
    Logic.
20. **CWE-1333** – Inefficient Regular Expression Complexity.

---

# 18. Conclusion

The STRIDE assessment identified security weaknesses across authentication,
authorization, input processing, database interaction, sensitive-data
protection, logging, availability, redirect handling, and server-side network
requests.

Seven of the ten analysed threats were rated High risk and three were rated
Medium risk.

Four threats have been prioritised for the assignment's secure coding
demonstrations:

- V1 – Server-Side JavaScript Injection;
- V2 – MongoDB / NoSQL Injection;
- V3 – Missing Function-Level Authorization;
- V4 – IDOR / Broken Object-Level Authorization.

These vulnerabilities provide a clear relationship between the architecture,
STRIDE model, source-code weakness, remediation control, exact re-test, and
DevSecOps pipeline evidence.

The next project stage is to preserve the vulnerable baseline, perform the
baseline SAST and dependency-security scans, and then collect the authorised
BEFORE evidence for V1–V4 before modifying the vulnerable source code.