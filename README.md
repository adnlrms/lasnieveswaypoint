# WayPoint System — Las Nieves District

**Personnel whereabouts board for DepEd Las Nieves District**
*WayPoint developed by Learning Resource Management Section*

WayPoint shows who is in the office, out on official travel, on leave, or visiting schools: today, this week, this month and across the year. Administrators log activities and Travel Authorities. Everyone else sees the board.

The frontend is a single web page. The backend is Google Apps Script, with Google Sheets as the database and Google Drive for files.

---

## Contents

1. [Features](#features)
2. [Files](#files)
3. [Setting it up](#setting-it-up)
4. [Using a different Google Drive folder](#using-a-different-google-drive-folder)
5. [First sign-in and security](#first-sign-in-and-security)
6. [Everyday use](#everyday-use)
7. [Privacy](#privacy)
8. [Updating the app](#updating-the-app)
9. [Testing](#testing)
10. [Troubleshooting](#troubleshooting)
11. [Technical reference](#technical-reference)

---

## Features

**The board**
- **Week, Month, Year** views of every person's status: in office, out of office, on leave, weekend. Tiles or list layout, filter by school.
- **Schools** view: a map with a pin for every school assignment. Point at a pin to see the School Head (with photo), then the AO, PDO and other staff, with each person's status today.
- **Insights**: travel days per person, grouped by school or position, for a month, quarter or school year.
- **Upcoming** district activities and calendar events.
- **Alerts**: double-booked personnel, people tagged in an event while away, and too many of a school's personnel away on the same day.
- **Smart search** (press `/`):
  - plain-language dates: *today, next week, Nov 12, November*
  - statuses: *out, on leave, in office*
  - activity types: *TA, monitoring, LAC*
  - positions, School IDs and TA numbers
  - names and schools, even misspelled
  - Chips show how the search was read; tap one to ignore it.
- Lists show 25 entries per page.
- Works on phones, can be installed as an app, and opens offline with the last loaded week.

**Administration**
- **Log activity:** for one or many personnel at once.
  - **Skipped dates:** a TA for Nov 11 and 13 leaves out the 12th, and the 12th is excluded from every count, alert and report.
  - Scan or upload the TA with a phone camera or PDF; pages can be merged into one PDF.
- **Personnel:** fields are position, name, employee no., **School ID Number** (6 digits), **school assignment**, **school coordinates**, contact no., photo and notes.
  - Positions offered: PSDS, School Head, AO II, PDO II. Admins can type any other position.
  - Typing a known school fills in its School ID and coordinates.
- **Calendar** of district events, with personnel tagging.
- **Branding:** app logo, footer lines, privacy contact, print letterhead.
- **Reports:** Excel spreadsheet built in Google Sheets, a printable visual summary, and printable activity logs with QR codes.
- **Settings:** passcode, viewer PIN, alert threshold, Monday email digest, board arrangement, audit log.

**Fixed text (cannot be changed in the app)**
- Office name: **LAS NIEVES DISTRICT**
- Sub-title: **WayPoint System**
- Footer credit: **WayPoint developed by Learning Resource Management Section**

---

## Files

| File | What it is |
|---|---|
| `index.html` | The whole board and admin console (one page). Includes a demo backend with sample data. |
| `sw.js` | Service worker: offline support and caching. |
| `manifest.webmanifest` | Lets the board be installed as an app. |
| `icon-192.png`, `icon-512.png`, `icon-maskable-512.png` | App icons. |
| `leaflet/` | The map library (Leaflet 1.9.4), bundled so the map works even where outside websites are blocked. **Upload it with `index.html`.** |
| `test.html` | Systems check: tests a live backend for connection, security, writing and load. |
| `Code.gs` | Backend (Google Apps Script). |
| `appsscript.json` | Apps Script settings: time zone, permissions, web-app access. |
| `README.md` | This file. |

---

## Setting it up

You need a Google account (preferably the district's official DepEd account) and any website host that serves files over **HTTPS**, such as GitHub Pages.

### 1. Backend (Apps Script)

1. Go to <https://script.google.com> → **New project**. Name it *WayPoint — Las Nieves District*.
2. Replace the contents of `Code.gs` with the `Code.gs` from this package.
3. **Project Settings** → tick **Show "appsscript.json" manifest file in editor**. Open `appsscript.json` and replace its contents with the one from this package.
4. Choose the function **`setup`** in the toolbar and click **Run**. Approve the permissions it asks for. This creates:
   - the **Las Nieves District Board** folder in your Drive, and inside it the **Las Nieves District Board — Database** spreadsheet
   - the folders for logos, photos, templates, exports and the current month
   - three automatic jobs: a month rollover on the 1st, housekeeping every 10 minutes, and the Monday 7:00 AM email digest
5. **Deploy → New deployment → Web app**
   - *Execute as:* **Me**
   - *Who has access:* **Anyone**
6. Copy the **Web app URL** (it ends in `/exec`).

`setup()` is safe to run again at any time. It adds anything missing and never deletes your data.

### 2. Frontend (the board)

1. Open `index.html` in a text editor and find this line near the top:
   ```html
   <meta name="cid-api" content="">
   ```
2. Paste the `/exec` URL between the quotes:
   ```html
   <meta name="cid-api" content="https://script.google.com/macros/s/XXXXXXXX/exec">
   ```
   Only edit this meta tag. Editing the page's `<script>` breaks its security check; see [Updating the app](#updating-the-app).
3. Upload **all** the files, including the `leaflet` folder, to your website host. Keep them in the same folder.
4. Open the site. The **DEMO** badge beside the district name disappears once the board is connected to your backend.

> With the meta tag left empty, the board runs in **demo mode** with sample data that lives only in that browser. This is useful for training.

---

## Using a different Google Drive folder

To keep everything in a folder of your choice (for example, a Shared Drive folder):

1. Open the folder in Google Drive and copy the ID from its link: `https://drive.google.com/drive/folders/`**`1AbCd…xyz`**.
2. In `Code.gs`, paste it into `MOTHER_ID` near the top:
   ```js
   MOTHER_ID: '1AbCd…xyz',
   ```
3. Optionally, paste an existing spreadsheet's ID into `SHEET_ID`. Leave it empty and `setup()` creates the database inside your folder.
4. Run `setup()`.

The account running the script needs **edit** access to that folder.

**If `setup()` has already run with another folder:**
1. Open **Project Settings → Script properties**.
2. Delete `MOTHER_ID`, `SHEET_ID`, `LOGOS_ID`, `PHOTOS_ID`, `TEMPLATES_ID`, `EXPORTS_ID` and `STAGING_ID`.
3. Run `setup()` again.

Files already uploaded stay where they are.

---

## First sign-in and security

- **Default admin passcode: `LND2026`.** The board asks you to change it on first sign-in. Do that immediately.
- **Forgot the passcode?** Use either method:
  - In the database spreadsheet's **Settings** tab, type a new passcode into the value of `NEW_ADMIN_PASSCODE`. It is scrambled (hashed) and the cell is cleared on the next request.
  - In Apps Script, run `resetPasscodeToDefault`, then sign in with `LND2026` and change it.
- **Viewer PIN** (**Admin → Settings → Save PIN**): require a PIN to see the board at all. Recommended if the link could reach people outside DepEd.
- **How the backend protects the data:**
  - Passcodes are stored only as salted SHA-256 hashes.
  - Admin sessions expire after 2 hours of inactivity.
  - 5 wrong passcodes lock that device for 5 minutes.
  - Uploads are checked by file type *and* content.
  - Travel Authority files stay private in Drive and are served only through the backend.
  - Every admin action is written to the **Audit** tab.

---

## Everyday use

| Task | Where |
|---|---|
| Log a TA, monitoring visit, training or leave | **Admin → Log activity**. Pick personnel, type and dates. For a TA that skips days, tap those days under *Days covered by the TA*. |
| Add or edit personnel | **Admin → Personnel**. Enter School ID Number (6 digits) and school coordinates. |
| Get school coordinates | In Google Maps, right-click the school and click the numbers at the top to copy them, e.g. `8.7353, 125.6012`. |
| Order schools and people on the board | **Admin → Settings → Board arrangement** |
| Add a district event | **Admin → Calendar → Add activity** |
| Reports for a month, quarter or year | **Admin → Reports** |
| Weekly "who is out" email | **Admin → Settings**: add recipients, then *Send test email now* |
| Find anything | Press **/** or tap **Search** |

**Positions:** the form suggests PSDS, School Head, AO II and PDO II. Type any other position and it is offered next time. In the Schools view the School Head is shown first. The PSDS takes that place for the District Office. AO and PDO follow below.

---

## Privacy

WayPoint handles personal information under the **Data Privacy Act of 2012 (RA 10173)**.

- **Where people see the notice:**
  - The full **Privacy Notice** is linked in the footer of every page.
  - Each device sees a short notice the first time it opens the board.
- **Set the contact person** in **Admin → Branding → Privacy notice**, usually the district's Data Protection Officer or focal person. If left empty, the notice names the *Noted by* signatory.
- **"For official use only" line:** printouts, the Excel export and the Monday email all carry it.
- **Data minimisation:**
  - Do not record reasons for leave.
  - School coordinates are the school's location, never a home address.
  - Contact numbers and notes are visible to admins only.

> The notice is a starting template. Have the district's Data Protection Officer or legal focal person review it before use. If anything changes (for example, a viewer PIN is added), the *Who can see it* section updates itself.

---

## Updating the app

### Changing `Code.gs`
1. Paste the new code into Apps Script and save.
2. If the update adds new database columns or settings, run `setup()`.
3. **Deploy → Manage deployments → ✏️ Edit → Version: New version → Deploy.** The `/exec` URL stays the same.

### Changing `index.html`
The page has a **Content Security Policy** that only allows the exact script it shipped with, identified by a `sha256-…` fingerprint. If you change **anything** inside `<script>…</script>`, even one character, recompute the fingerprint or the page will not run:

```bash
python3 - <<'EOF'
import re, hashlib, base64
p = 'index.html'; s = open(p, encoding='utf-8').read()
js = re.search(r'<script>(.*?)</script>', s, re.S).group(1)
h = base64.b64encode(hashlib.sha256(js.encode('utf-8')).digest()).decode()
s = re.sub(r"script-src 'self' 'sha256-[^']+'", f"script-src 'self' 'sha256-{h}'", s)
open(p, 'w', encoding='utf-8').write(s); print('updated', h)
EOF
```

Editing the `cid-api` meta tag, styles or text outside the script does not need this.

### Making sure everyone gets the new version
Raise the cache name in `sw.js`, for example `lnd-waypoint-v4` → `lnd-waypoint-v5`, whenever you upload new files. Installed copies then update on their next visit.

---

## Testing

- **Demo mode:** leave the `cid-api` meta tag empty. Sign in with `LND2026` and try everything with sample data.
- **Systems check:** open `test.html` on your site, paste the `/exec` URL and the admin passcode (and the viewer PIN, if one is set), and click **Run all checks**. It checks:
  - the connection
  - the security rules: wrong passcodes, bad School IDs and coordinates, fake files
  - a full write-and-clean-up round trip, including a TA with a skipped day
  - search and load

  It cleans up the test records it creates.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| **DEMO** badge still shows | The `cid-api` meta tag is empty or wrong. Paste the full `/exec` URL. |
| "Backend not set up. Run setup()" | Run `setup()` in Apps Script, then try again. |
| Page is blank, or the browser console mentions *Content Security Policy* | The script was edited without updating its fingerprint. See [Changing index.html](#changing-indexhtml). |
| "The map could not start" | The `leaflet` folder is missing or not next to `index.html`. Upload it. |
| Map pins show but the background is grey | The map background comes from OpenStreetMap and Esri over the internet. Check the connection, or try **Satellite**. |
| A school is not on the map | None of its personnel has school coordinates. Add them in **Personnel**. |
| Changes made directly in the spreadsheet don't appear | They are picked up within about 10 minutes, or immediately with **Settings → Reload sheet**. |
| Old version keeps showing after an update | Raise the cache name in `sw.js` (see above), or reload the page twice. |
| Combining scanned pages into one PDF, or reading an uploaded PDF, doesn't work | These load jsPDF and pdf.js from cdnjs.cloudflare.com. Make sure that site isn't blocked on the network. |
| "Admin session expired" | Sessions end after 2 hours of inactivity. Sign in again. |
| No Monday email | Check recipients in **Settings**. The `weeklyDigest` trigger must exist (run `setup()` to recreate it). |

---

## Technical reference

**Database tabs (Google Sheets):** Personnel, Activities, Events, Logos, Settings, Audit, plus Schools and Districts (left over from the division version and no longer used by the board). Columns are read by position. Row 1 only labels them, so don't reorder columns.

| Personnel column | Shown as |
|---|---|
| `assignment` | School assignment (header `schoolAssignment`) |
| `unit` | School coordinates (header `schoolCoordinates`) |
| `schoolIdNo` | School ID Number (header `schoolIdNumber`) |

Activities have a `skipDates` column: a JSON list of days inside the date range that the Travel Authority does not cover. Those days are excluded everywhere.

**Drive layout**
```
Las Nieves District Board/
  Las Nieves District Board — Database
  Logos/  Personnel Photos/  Templates/  Exports/
  2026-11 November/
    Teresita A. Lumibao, School Head [P…]/   ← that month's TAs
```

**Automatic jobs:** `monthlyRollover` (1st of the month, 1 AM), `housekeeping` (every 10 minutes), `weeklyDigest` (Mondays, 7 AM). All times are Asia/Manila.

**Third-party code**
- [Leaflet](https://leafletjs.com) 1.9.4 (BSD-2-Clause), bundled in `leaflet/`
- qrcode-generator (MIT), inline
- jsPDF and pdf.js, loaded on demand from cdnjs
- Map data © OpenStreetMap contributors; imagery © Esri

---

*LAS NIEVES DISTRICT · WayPoint System · WayPoint developed by Learning Resource Management Section*
