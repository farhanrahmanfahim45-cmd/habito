# Moderation and verification — internal note

Not for the i2i application. This is the working record of how Habito handles
trust without access to identity verification, so the reasoning isn't lost.

## The constraint

Bangladesh's official NID verification service is licensed to Bangladesh
Bank-regulated entities and approved payment service operators. A student
project cannot obtain access, and there is no legitimate workaround.

So Habito does not verify identity. What it does instead is a set of soft
checks, each cheap, each honest about the little it proves. Several weak
signals stacked together stop the low-effort spam that makes up most of the
problem — and that is what a Facebook to-let group has none of.

## What is built

**Trust tiers** (`profiles.trust`), deliberately named for what was checked:

| Tier | What it actually means |
|---|---|
| `unverified` | Signed up. Nothing checked |
| `phone-verified` | An OTP reached a working number. Not an identity |
| `reviewed` | A person looked at the listing and the ownership claim |
| `id-verified` | Reserved. Only if formal eKYC ever becomes available |

Never display a bare "Verified" badge. The tier name is the honest claim, and
saying the smaller true thing is both safer legally and more credible.

**Completeness gate.** `listing_completeness()` scores a listing out of 100:
full cost breakdown 30, address 20, neighbourhood 10, two photos 20, a real
description 10, availability date 10. Below 50 it cannot be published. This
blocks the vague-area / no-cost / one-blurry-photo pattern structurally,
without anyone having to judge who the poster is.

**Rate limits.** An account under 48 hours old may list 3 spaces a day; any
account is capped at 20. Three rather than one deliberately: the landlord with
a building full of flats is exactly the user Habito is for, and a limit of one
would turn away the best kind of new owner on their first evening.

**Duplicate detection.** Identical descriptions across *different* owners set
`flagged_duplicate`. Scam listings are copy-pasted at scale; this is the
cheapest signal available and needs no image work.

**Report threshold.** Three *distinct* reporters hide a listing pending review.
One person filing three reports achieves nothing, which matters because the
first people to use a report button are often annoyed rather than right.

## What is not built yet

**Phone OTP.** The tier exists and the column is there; sending the SMS needs a
provider. In Bangladesh that means a bulk SMS vendor and, for most, a trade
licence. Until then nobody reaches `phone-verified`.

**The manual review itself** is now built — `/admin`, admins only. The check is
deliberately light, because it has to survive one person doing it in a few
minutes a day, and the wording is in the review dialog itself:

1. Do the photographs look like the same space, and not like a stock image or
   a screenshot of another listing?
2. Is the price plausible for that area and type?
3. Does the location resolve to a real road or block?
4. Ownership claim: the owner uploads **one** of — a utility bill in their
   name at that address, a municipal holding tax receipt, or the first page of
   the ownership document. The reviewer checks that the name matches the
   account and the address matches the listing, records `reviewed`, and
   **deletes the file**. No document is stored, and none is ever shown to a
   renter.
5. Anything doubtful stays unreviewed rather than being rejected — an
   unreviewed listing still appears, it simply carries no tier.

Every action writes a row to `moderation_actions` naming who did it and what
they said they checked. That table has no update or delete policy for anyone,
including admins: a moderation record that can be tidied afterwards is worth
nothing in the argument it exists to settle.

`id-verified` cannot be set by hand. The database refuses it, because a tier
that says an identity was verified when it wasn't is the one failure the whole
scheme exists to prevent.

**Image hashing** for duplicate photographs, which is more robust than text
matching. Worth doing once there are real photographs to hash.

## The line to hold

Habito should never imply an identity has been verified when it has not. The
whole value of the tiers is that each one states exactly what was checked. If
that discipline slips, the badges become the same decoration that makes
existing listing sites untrustworthy, and the one honest thing Habito has to
offer is gone.
