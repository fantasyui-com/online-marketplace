# online-marketplace
Simple online marketplace for selling files.

## Security

### Theory

- No valuable information on the server.
- Validate HTTP request and data via key-whitelist and string-validation.
- Validate HTML variable output via simple-template-engine and pre-declared XSS-filtered output.
- Secure whitelisted-input forms via hash key in the form.
- Autorotate any needed secret-keys to prevent 'put your secret key here' secrets.

### Threat Review

#### 1. Injection

All input values are validated. Only pre-configured values are allowed. Stray input is not allowed and results in request being denied.

Areas for Improvement:
- Use multiple data validators to lower the risk of letting through malicious input due to third-party bugs.

#### 2. Broken/Misconfigured Authentication/Session

The authentication cookie is encrypted and tamper-proof. The forms use csrf protection.

Areas for Improvement:
- Use multiple csrf validators to lower the risk of letting through malicious input due to third-party bugs.
- Create a security configuration tester report.
  - verify that all forms use csrf.
  - verify that secret encryption keys are rotated frequently (black list old keys).

#### 3. XSS Attacks

Template engine (views) have been downgraded to a simple HTML renderer. The renderer uses context sensitive
(inHTMLData, inSingleQuotedAttr, inDoubleQuotedAttr, inUnQuotedAttr) string filters in all instances.

Areas for Improvement:
- Create a security configuration tester report.
  - verify that all templates use XSS filters when printing values.

#### 4. Reference Switching Attack

Only one reference is kept, in one place.

User id/username is the only piece of information that is kept between requests. It is stored in an encrypted and tamper proof cookie on the client side.

Areas for Improvement:
- Use multiple data validators to lower the risk of letting through malicious input due to third-party bugs. In this instance use a mechanism that will specifically monitor for a switched reference. This is only a backup measure (Belt and Suspenders kind of thing.)

#### 5. Security Misconfiguration

The server configuration file is easy to read, but the system will eventually have a secondary measure in the form of a security configuration tester and report tool. dr.security.js in addition to test.js (or hack.js as it should correctly be refered to)

#### 6. Limited Data Exposure

The only ```required``` piece of information is password which is encrypted.

The ```optional``` sensitive data kept on the server is email, first name, last name.

Data that can be exposed during a compromised user account:

- username
- email
- first name
- last name
- list of purchased fi  les
- list of account activity

Areas for Improvement:

- Remove the following from information being asked:
  - first name
  - last name
- Show the following only upon a request, limit number of requests, of introduce a wait period:
  - email: user can only change but not see the email address that is on file.
  - list of account activity: delay by 10 minutes, a large increase in requests for account activity will result in DEFCON 2/3
  - list of purchases, show only recent, delay full list.

#### 7. Access Control Monitoring

There are only two levels. Guest User and Logged In User. Guest user cannot send data to POST end-points as each is protected via authentication.

Areas for Improvement:
- Create a security configuration report that shows what functions are available to guest users and which functions require authentication.

#### 8. Cross-Site Request Forgery Attack

All forms use CSRF tokens.

#### 9. Underlying Library Vulnerability Monitoring

Security report includes monitoring of Node Security Platform [advisories](https://nodesecurity.io/advisories/)

Areas for Improvement:
- Daily security reports sent from each server.


#### 10. Redirect Attack

All Redirects and Forwards are local urls are set in the configuration file and are referenced by id/name. All redirects and forwards are validated.

### Detail

Credit Cards via Stripe Checkout pattern, this means ```only``` the user's "email" and "productName" will touch the server.

The email/productName pair is used to keep track of purchases in order to allow purchase-history and re-downloads feature.

Overall the security model aims for allowing paid-membership-format via patterns established by Stripe.
The enabled account with list of re-downloads is a useful side-effect of this system.

Even without any valuable information stored on the server, user accounts place a fair amount of stress on the security side.

To lower risks, we code an special purpose, HTTPS server from scratch. This gives us the power to monitor all HTTP requests and incoming data.

We pre-validate the data based on simple/reasonable schema files long before they trigger the actual function payload.

### HTTP input must be whitelisted, and values must pass through a validator.

A stray GET request with arbitrary query data is instantly flagged as error.

Only pre-set data is allowed, only the validated values will pass through.

Server will drop requests that contain invalid information.

Data pre-validation means no stray input. A "GET" request to the "/" page with ```?admin=true``` will fail at the validator because "admin" is not whitelisted.

A post request to /login with username: "@bob" will fail at the validator prior to reaching the actual authentication function because while the "username" key is whitelisted the username may not contain the "@" sign.

### XSS

Similar to HTTP input validation, the printing of data via server-rendered HTML must be pre-configured and data-typed.
In this situation the data types directly related to where they may appear in the server rendered response.
(inHTMLData, inSingleQuotedAttr, inDoubleQuotedAttr, inUnQuotedAttr). This will escape/normalize/clean the output.

### Minimal client-side JavaScript.

Pages are rendered on the server via simple, primitive templates.

### Feature Poor or "User Hacked"

It may still be possible for an attacker to simply guess a password, or access the user's own password manager via another hack and just login. They will gain access to the user's list of downloads. See their email-address and, name if the user cared to share that. The best kind of security at this point is to gather/keep/present as little information as possible.

This means that while there are many convenient features such as support-chat-logs or support-request-history,
they will not feature in this system precisely because we want to minimize the data footprint that can be exposed
during a break-in. The term I use for this is ```Feature Poor``` this is what I want to see in a review. One star for Features,
Five Stars for security.

### User Signup Optional (in non-membership mode)

When running in "keep track of your downloads" mode user-signup is OPTIONAL, the Stripe-Checkout pattern makes it
so that user will get their file, without signing up via the site.

### Membership Mode

This allows the user to purchase a monthly/yearly membership and gain access to all member-files on the site. This is the true
nature of this application. In this situation we employ the Stripe Membership pattern, we still keep information down
to minimum. In membership mode the user only shares their email address and list of downloads becomes "your favorites".

### Security Testing

The test.js test harness will revolve around hacking scenarios, we already know it will fail to inject arbitrary data, or data that is not of specific format. But Input validation and XSS testing is still important, as to eliminate and check for bugs in underlying data validation libraries. The test.js might as well be called hack.js becasue that is
how the testing will progress.

## Key Points and Features

Multiprocess Safe (pm2 will spawn one server.js process per CPU core)

Keep Database needs to minimum, allow rollbacks.

Client-side session data with auto-rotating encryption keys.

## UI Theory

Responsive User Interface.

Mobile first, desktop second; what works on small mobile screens must spread out to fill a large desktop.

## Deployment

  npm start
  # or use pm2 on server.js

## Developers

Clone/Fork this repo, install supervisor ```npm install supervisor -g```
and run ```supervisor --extensions 'node,js,ejs' server.js```


## Supplemental

- Replaced the lovely EJS with the less flexible, more strict, and wooden HBS.
- Added XSS protection to every instance of variable use.
- Removed target="_blank", from everywhere due to security issues with window.opener.
