# Atlas Admin Panel — Guide and Acceptance Walkthrough

For: whoever manages the Atlas website day-to-day
Staging site: `STAGING_URL` (admin panel at `STAGING_URL/admin`)

This guide covers every screen that exists in the admin panel today, in plain
language, followed by a step-by-step checklist to confirm it all works.

---

## Part A — Admin manual

### Logging in

Go to `STAGING_URL/admin` and enter the admin password (shared with you
separately — this guide doesn't repeat it). Once logged in, you'll stay
logged in for several hours before needing to sign in again.

Every screen in the admin panel shares the same left-hand menu:
**Dashboard**, **Content**, **Chats**, **Knowledge**, and **Log out** at the
bottom. On a phone, this becomes a menu button in the top bar instead of a
sidebar.

### Dashboard

The landing page after login. Three cards give a quick at-a-glance summary —
a shortcut into Content, how many conversations happened this week (Chats),
and how many pieces of content the assistant currently knows about plus the
status of the last knowledge update (Knowledge). Each card links straight to
its full page.

### Content

This is where you edit everything shown on the public website. Along the
top are tabs — click between them:

- **Showcase** — controls the rotating homepage section: whether it shows
  your most recent articles automatically, or a hand-picked mix of photos,
  feedback, and articles you choose yourself.
- **Photos** — the photo tiles used in that homepage section.
- **Feedback** — short testimonial-style cards (text only, no photo by
  design).
- **Articles** — your Insights articles: title, description, category, the
  full article text (plain text or simple Markdown formatting), and whether
  an article is featured.
- **FAQs** — the questions and answers shown on the FAQ page. These also
  feed the AI assistant's knowledge (see "The one rule to remember" below).
- **Advanced JSON** — a raw, technical view of all the content at once, for
  bulk edits or anything not covered by the tabs above. Only use this if
  you're comfortable editing structured text carefully — an invalid entry
  here pauses editing until it's fixed.
- **History** — every past save, with a **Restore** option (see below).

**Adding and removing items.** Each tab (except Showcase) has an **"Add…"**
button (e.g. "Add photo") that creates a new blank card at the top of the
list. Every existing item shows in its own card with:

- An **Enabled** checkbox — unticking this hides the item from the public
  site without deleting it. Good for temporarily pulling something down.
- A trash-can **Delete** button — removes the item entirely. There's no
  confirmation prompt, so double-check before clicking. Nothing is
  permanent until you press **Save** — and even after saving, you can bring
  a deleted item back using **History** (below).

**Uploading and cropping photos.** On the Photos and Articles tabs, the image
field has an **"Upload image"** button (it reads **"Change image"** once an
image is already set). Clicking it:

1. Opens your device's file picker — choose a JPEG, PNG, or WebP photo
   (up to 10MB).
2. Opens a crop window. Drag the photo to reposition it, and use the
   **Zoom** slider to zoom in or out. The crop shape is fixed to the right
   proportions automatically — square-ish for Photos, wide for Articles —
   so you can't pick the wrong shape by accident.
3. Click **"Use this crop"**. A progress bar shows while it uploads, then
   the new photo appears in the preview.

If you'd rather type an image location directly instead of uploading (for
example, to reuse an existing image), click the small **"Enter an image
path manually"** link below the upload button to reveal a plain text field.

**Saving.** A badge near the top-right of the Content page reads
**"● Unsaved changes"** whenever you've made edits, or **"All changes
saved"** once everything is saved. Nothing you do on the Content page
reaches the live website until you click the **Save** button. If someone
else saved changes while you were editing, Save will refuse and show a
banner asking you to reload first — so two people editing at once can't
silently overwrite each other.

**History and Restore.** The History tab lists every version ever saved —
version number, when it was saved, and an optional note (restores are
automatically noted, e.g. "Restored from v4"). Click **Restore** next to
any older version to bring it back — this doesn't delete anything; it saves
that older content again as a brand-new version, so your full history is
always kept.

### The one rule to remember: Save publishes to the website, Reindex publishes to the assistant

These are two separate, deliberate steps:

- **Save** (on the Content page) makes your changes appear on the public
  website immediately.
- **Reindex** (a button on the Knowledge page, described below) is what
  updates what the **AI assistant** knows. Saving a new FAQ does **not**
  automatically teach the assistant that FAQ — you need to press Reindex
  afterwards.

So: **edit content → Save → Reindex**, in that order, whenever you've
changed something a visitor might ask the assistant about.

### Chats

Shows every conversation visitors have had with the AI assistant.

**The four numbers at the top** (covering the last 7 days):

- **Sessions this week** — how many separate conversations were started.
- **% reaching CTA** — of those conversations, what share the assistant
  offered a "talk to us on WhatsApp" button in.
- **% clicking CTA** — what share of this week's conversations ended with
  the visitor actually tapping that WhatsApp button.
- **% hitting fallback** — what share of conversations the assistant
  couldn't find a good answer for in its current content, and honestly said
  so rather than guessing.

If there were no conversations this week, all four read 0% — that's
expected, not an error.

**Finding a specific conversation.** Use the **"Search ref code"** box above
the conversation list and type the reference code a visitor gave you (for
example, from a WhatsApp message) — or leave it blank to see everything,
newest first. Click **Clear** to reset the search. The list shows, per
conversation: the reference code, when it started, when it was last active,
how many messages, a quick confidence summary, whether the WhatsApp button
was shown or clicked, and the visitor's name/country if they volunteered
either during the chat.

**Reading a transcript.** Click a reference code to open the full
conversation, oldest message first. Under each of the assistant's replies
you'll see a small badge showing how confident that answer was:

| Badge | Meaning |
|---|---|
| **strong** | Answered directly from your website content |
| **weak / escalated** | Only loosely related content was found — a cautious answer |
| **no context** | Nothing relevant was found — the assistant just chatted naturally and/or offered to connect a consultant |
| **error** | A technical hiccup — no answer was generated that turn |

You may also see small tags such as **cta_shown** (WhatsApp button offered
on that reply), **weak_context**, **fallback_served**, **session_capped**
(the conversation hit its length limit), or **provider_failure** /
**retrieval_degraded** (a temporary technical issue). Any content sources
the assistant used are shown as small linked labels underneath.

### Knowledge

This is where you tell the assistant to catch up on your latest content.

**The numbers** show the current state of the assistant's knowledge:
**Documents** (how many separate pieces of content it knows — services,
FAQs, articles), how many of those are currently **enabled**, **Chunks**
(those pieces broken into smaller, searchable sections), and **Embedded
chunks** (how many of those sections are fully ready for the assistant to
use — after a successful update, this should match the Chunks count).

**The "Reindex knowledge" button** rereads your current Services, FAQs, and
Articles, and rebuilds the assistant's search index so it can find and use
anything new or changed. Press it any time after saving content changes
that visitors might ask the assistant about. It takes a few seconds; a
**Last reindex** card below shows the outcome — a status (completed /
failed / running), when it ran, and how many documents/sections were
added or changed.

### What still needs a developer

Everything above is fully self-service. A few things intentionally are not,
and need a developer to change:

- **Adding a brand-new service** (a new type of pass or service beyond the
  existing list) — the list of services itself lives in the website's code,
  not the admin panel. You can edit wording for existing content freely;
  adding a genuinely new service category needs a developer.
- **Changing core business details** — the company name, phone number,
  email, or WhatsApp number are set in code, not editable in the admin.
- **Changing how the assistant is instructed to behave** — its tone, what
  topics it will and won't discuss, is written by a developer as part of
  the assistant's setup, not editable through any admin screen.
- **Adding brand-new admin sections** — anything beyond the tabs and pages
  described in this guide.

Uploading and cropping images for existing Photo and Article entries — the
concern that used to require a developer — is now fully self-service, as
described above.

---

## Part B — Admin acceptance walkthrough

Work through these in order. Each has an expected result — mark Pass or
Fail.

**1. Log in.**
Go to `STAGING_URL/admin` and enter the correct password.
Expected: the Dashboard loads with the sidebar menu.
- [ ] Pass
- [ ] Fail

**2. Wrong password is rejected.**
Log out, then try logging in with an incorrect password.
Expected: an error message appears and you are not let in.
- [ ] Pass
- [ ] Fail

**3. Edit content, Save, verify on the site.**
Go to Content → any tab (e.g. FAQs) → change some text in an existing item
→ click **Save** → wait for the "All changes saved" badge → open
`STAGING_URL` in a new tab and find that content.
Expected: your change appears on the live site.
- [ ] Pass
- [ ] Fail

**4. Add an FAQ, Reindex, ask the assistant about it.**
Content → FAQs → **Add FAQ** → fill in a distinctive question and answer →
**Save** → go to Knowledge → click **Reindex knowledge** → wait for
"completed" → open the site's chat button and start a **new** conversation
→ ask the exact question you added.
Expected: the assistant's answer reflects what you wrote.
- [ ] Pass
- [ ] Fail

**5. Upload and crop an image, Save, verify the tile.**
Content → Photos → open an existing photo (or add one) → **Upload image**
→ choose a photo → adjust the crop → **Use this crop** → wait for it to
finish uploading → **Save** → open the site's homepage and find that
photo tile.
Expected: the new, cropped image appears on the site.
- [ ] Pass
- [ ] Fail

**6. History restore.**
Content → make a small edit anywhere → **Save** → go to the **History**
tab → click **Restore** on the version from just before your edit.
Expected: a new version is created restoring the earlier content, and the
editor reflects it.
- [ ] Pass
- [ ] Fail

**7. Find a conversation by reference code and read it.**
Get a reference code from a real chat (yours or from the client walkthrough
document) → Chats → paste it into **Search ref code** → click **Search** →
click the matching reference code.
Expected: the full conversation opens, messages in order, with confidence
badges and any sources shown.
- [ ] Pass
- [ ] Fail

**8. Funnel numbers sanity check.**
On the Chats page, look at the four numbers at the top.
Expected: all four are between 0% and 100%, and **% clicking CTA** is never
higher than **% reaching CTA** (a visitor can only click a button they were
shown).
- [ ] Pass
- [ ] Fail

**9. Log out, then try a direct link.**
Click **Log out** → then type the Content page address directly into your
browser (`STAGING_URL/admin/content`) and press enter.
Expected: you see the login screen, not the content editor.
- [ ] Pass
- [ ] Fail
