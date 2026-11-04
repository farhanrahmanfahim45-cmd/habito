# Habito i18n & Bangla Localization Audit

**Workspace:** `d:\I2I Project - Habito\App Folder\habito`  
**Scope:** Wave 1 read-only audit of `src/`, `scripts/`, `supabase/migrations/0009_bilingual.sql`, `src/data/seed.json`, and `supabase/seed.sql`.

---

## Executive Summary

1. **Key Parity (`en.ts` vs `bn.ts`):** `src/i18n/en.ts` and `src/i18n/bn.ts` both contain **681 unique keys** with **0 missing keys in either direction** (`bn.ts` is typed as `Record<keyof typeof en, string>`).
2. **UTF-8 Validity of `bn.ts`:** Byte-level inspection confirms `src/i18n/bn.ts` (62,172 bytes) is **100% valid UTF-8** with **13,574 Bengali Unicode characters** (`U+0980`–`U+09FF`), **0 `U+FFFD` replacement characters**, and **0 mojibake sequences**.
3. **Why Pages Still Render in English:** Although `en.ts` and `bn.ts` already define translations for `auth.*`, `search.*`, `filter.*`, `find.*`, `compare.*`, `saved.*`, `portfolio.*`, `requests.*`, `space.*`, `inquiry.*`, `messages.*`, `account.*`, `time.*`, `amenity.*`, `type.*`, `category.*`, `availability.*`, and `match.*`, many pages and helpers still render hardcoded English strings or read English catalog maps (`SPACE_TYPE_LABEL`, `CATEGORY_LABEL`, `CATEGORY_STYLE[c].label`, `AVAILABILITY_LABEL`, `AMENITIES[k].label`) instead of calling `t()`.
4. **Bilingual Seed & Supabase Bug:** `scripts/generate-habito-data.mjs` and `scripts/generate-seed-sql.mjs` already populate `nameBn`/`descriptionBn` (`name_bn`/`description_bn` in SQL) for all 235 spaces. However:
   - **`src/lib/supabase.ts` (`toSpace`, lines 174–232) drops `row.name_bn` and `row.description_bn`** when mapping database rows to `Space`.
   - Several components render `space.name` directly instead of calling `spaceName(space, language)`.
   - Seed sub-fields (`availability.note`, `property.nearby[].label`, `attributes.suitableFor`, `attributes.accessHours`, `attributes.landUse`, and image `label`s) are still English-only.

---

## (a) Every Hardcoded User-Facing String in `src/` (`file:line`)

### 1. `src/pages/Auth.tsx` (0 `t()` calls currently)
| File:Line | Hardcoded String / Expression | Existing Key in `en.ts`/`bn.ts` or Status |
|---|---|---|
| `src/pages/Auth.tsx:40` | `"Enter your email and a password of at least 6 characters."` | Has `auth.errorCredentials` |
| `src/pages/Auth.tsx:44` | `"Tell us your name so owners know who's asking."` | Has `auth.errorName` |
| `src/pages/Auth.tsx:63` | `"Check your email for a confirmation link, then sign in."` | Has `auth.checkEmail` |
| `src/pages/Auth.tsx:70` | `"Something went wrong. Try again."` | Has `auth.errorGeneric` |
| `src/pages/Auth.tsx:78` | `"Enter your email first, then tap reset."` | **Needs new key** (`auth.enterEmailFirst`) |
| `src/pages/Auth.tsx:83` | `"If that email has an account, a reset link is on its way."` | Has `auth.resetSent` |
| `src/pages/Auth.tsx:85` | `"Could not send the reset link."` | **Needs new key** (`auth.resetFailed`) |
| `src/pages/Auth.tsx:92` | `mode === "signin" ? "Welcome back." : "Create your account."` | Has `auth.welcomeBack`, `auth.createAccount` |
| `src/pages/Auth.tsx:96-97` | `"Sign in to reach your saved spaces, inquiries and listings."` / `"One account, whichever side of Habito you're on."` | Has `auth.signInLead`, `auth.signUpLead` |
| `src/pages/Auth.tsx:104-105` | `"Habito isn't connected to a database in this build — you can browse, filter, save and test every flow without signing in."` | Has `auth.noDatabase` |
| `src/pages/Auth.tsx:113` | `label="Your name"` | Has `auth.yourName` |
| `src/pages/Auth.tsx:118` | `placeholder="Md. Rafiqul Islam"` | Proper noun (keep or localize example) |
| `src/pages/Auth.tsx:123` | `label="What brings you here?"` | Has `auth.whatBrings` |
| `src/pages/Auth.tsx:129` | `title="I need a space"` | Has `auth.needSpace` |
| `src/pages/Auth.tsx:130` | `body="Search, save and enquire"` | Has `auth.needSpaceBody` |
| `src/pages/Auth.tsx:136` | `title="I have a space"` | Has `auth.haveSpace` |
| `src/pages/Auth.tsx:137` | `body="List and manage it"` | Has `auth.haveSpaceBody` |
| `src/pages/Auth.tsx:144` | `label="Email"` | Has `auth.email` |
| `src/pages/Auth.tsx:157` | `label="Phone"` | Has `auth.phone` |
| `src/pages/Auth.tsx:170` | `label="Password"` | Has `auth.password` |
| `src/pages/Auth.tsx:176` | `placeholder="At least 6 characters"` | Has `auth.passwordHint` |
| `src/pages/Auth.tsx:196` | `busy ? "Working…" : mode === "signin" ? "Sign in" : "Create account"` | Has `auth.working`, `action.signIn`, `auth.createAccount` |
| `src/pages/Auth.tsx:206` | `"Forgot your password?"` | Has `auth.forgot` |
| `src/pages/Auth.tsx:212` | `mode === "signin" ? "No account yet?" : "Already have an account?"` | Has `auth.noAccount`, `auth.haveAccount` |
| `src/pages/Auth.tsx:222` | `mode === "signin" ? "Create one" : "Sign in"` | Has `auth.createOne`, `action.signIn` |
| `src/pages/Auth.tsx:227` | `"Just looking?"` | Has `auth.justLooking` |
| `src/pages/Auth.tsx:229` | `"Browse without an account"` | Has `auth.browseWithout` |
| `src/pages/Auth.tsx:241` | `"optional"` | Has `auth.optional` |

### 2. `src/pages/Search.tsx`
| File:Line | Hardcoded String / Expression | Existing Key in `en.ts`/`bn.ts` or Status |
|---|---|---|
| `src/pages/Search.tsx:32` | `"Best match"` | Has `search.sortBestMatch` |
| `src/pages/Search.tsx:33` | `"Price: low to high"` | Has `search.sortPriceLow` |
| `src/pages/Search.tsx:34` | `"Price: high to low"` | Has `search.sortPriceHigh` |
| `src/pages/Search.tsx:35` | `"Recently updated"` | Has `search.sortRecent` |
| `src/pages/Search.tsx:36` | `"Largest first"` | Has `search.sortSize` |
| `src/pages/Search.tsx:138` | `CATEGORY_STYLE[filters.category].label` / `"Find a space"` | Has `category.${filters.category}`, `search.title` |
| `src/pages/Search.tsx:141-142` | `"Scored against your needs. Every card shows why it landed where it did."` / `"Browse everything on the platform, or tell us what you need so we can score each space for you."` | Has `search.scoredLead`, `search.lead` |
| `src/pages/Search.tsx:148` | `requirements.completed ? "Change needs" : "Tell us what you need"` | Has `search.changeNeeds`, `search.tellUsNeeds` |
| `src/pages/Search.tsx:165` | `` `${results.length} ${results.length === 1 ? "space" : "spaces"}` `` / `"Loading…"` | Has `search.results`, `search.resultsOne`, `search.loading` |
| `src/pages/Search.tsx:170` | `"Sort"` | Has `search.sort` |
| `src/pages/Search.tsx:214` | `aria-label="List and map view"` | **Needs new key** (`search.viewSwitchAria`) |
| `src/pages/Search.tsx:264` | `results.length === 0 ? "Nothing perfect yet." : "Also worth a look."` | Has `search.nothingPerfect`, `search.alsoWorth` |
| `src/pages/Search.tsx:267` | `"These sit just outside what you asked for. Here's how each one differs."` | Has `search.nearbyBody` |
| `src/pages/Search.tsx:284` | `{listing.space.name}` (bypasses `spaceName()`) | Use `spaceName(listing.space, language)` |
| `src/pages/Search.tsx:291` | `` `${score}% match` `` | Has `match.percent` |
| `src/pages/Search.tsx:306` | `title="Filters"` | Has `search.filters` |
| `src/pages/Search.tsx:310` | `"Reset"` | Has `action.reset` |
| `src/pages/Search.tsx:313` | `` `Show ${results.length}` `` | Has `filter.showCount` |
| `src/pages/Search.tsx:330` | `"Nothing matches those filters."` | Has `search.empty` |
| `src/pages/Search.tsx:332` | `"Widen the price, open it to more categories, or include areas further out."` | Has `search.emptyBody` |
| `src/pages/Search.tsx:335` | `"Clear all filters"` | Has `search.clearFilters` |
| `src/pages/Search.tsx:362` | `"Filters"` | Has `search.filters` |
| `src/pages/Search.tsx:368` | `"Reset"` | Has `action.reset` |
| `src/pages/Search.tsx:375` | `"All"` | Has `filter.all` |
| `src/pages/Search.tsx:379` | `CATEGORY_STYLE[c].label` | Has `category.${c}` |
| `src/pages/Search.tsx:393` | `g === "all" ? "Anywhere" : g` | Has `filter.anywhere`, `filter.urban`, `filter.suburban`, `filter.rural` |
| `src/pages/Search.tsx:399` | `` `Rent up to ${money(filters.priceMax)}` `` | Has `filter.rentUpTo` |
| `src/pages/Search.tsx:402` | `aria-label="Maximum monthly price"` | **Needs new key** (`filter.maxPriceAria`) |
| `src/pages/Search.tsx:410` | `"Sale listings aren't filtered by this."` | Has `filter.saleNote` |

### 3. `src/pages/Find.tsx`
| File:Line | Hardcoded String / Expression | Existing Key in `en.ts`/`bn.ts` or Status |
|---|---|---|
| `src/pages/Find.tsx:37` | `"Tell us what you need."` | Has `find.title` |
| `src/pages/Find.tsx:40` | `"A few answers, and every space afterwards arrives with a score and the reasons behind it."` | Has `find.lead` |
| `src/pages/Find.tsx:58` | `t === "rent" ? "Renting" : "Buying"` | Has `transaction.renting`, `transaction.buying` |
| `src/pages/Find.tsx:68` | `"Anything"` | Has `home.anything` |
| `src/pages/Find.tsx:77` | `CATEGORY_STYLE[c].label` | Has `category.${c}` |
| `src/pages/Find.tsx:86` | `label="Anything more specific?"` | Has `find.moreSpecific` |
| `src/pages/Find.tsx:90` | `` `Any ${CATEGORY_STYLE[draft.category].label.toLowerCase()} space` `` | **Needs new key** (`find.anyCategorySpace`) |
| `src/pages/Find.tsx:96` | `SPACE_TYPE_LABEL[t]` | Has `type.${t}` |
| `src/pages/Find.tsx:110` | `"Spaces nearby still appear, ranked by how far they are from here."` | Has `find.nearbyNote` |
| `src/pages/Find.tsx:114` | `draft.transaction === "rent" ? "Monthly budget" : "Price range"` | Has `find.monthlyBudget`, `find.priceRange` |
| `src/pages/Find.tsx:116-117` | `label="Minimum"`, `label="Maximum"` | Has `find.minimum`, `find.maximum` |
| `src/pages/Find.tsx:120` | `"Your maximum is below your minimum."` | Has `find.budgetInvalid` |
| `src/pages/Find.tsx:124-125` | `"Where an owner has listed every cost, we match against the full monthly figure — rent, service charge and utilities."` | Has `find.costNote` |
| `src/pages/Find.tsx:133` | `aria-label="Move-in date"` | Has `find.whenNeed` |
| `src/pages/Find.tsx:177` | `"Show my matches"` | Has `find.showMatches` |
| `src/pages/Find.tsx:219,229` | `"1+"`..`"4+"`, `"200+ sqft"`, `"500+ sqft"`, `"1,000+ sqft"`, `"2,000+ sqft"` | **Needs localized unit/number formatting** (`num()`) |
| `src/pages/Find.tsx:241,246` | `"500+ sqft"`..`"5,000+ sqft"`, `"1+"`, `"2+"`, `"4+"` | **Needs localized unit/number formatting** (`num()`) |
| `src/pages/Find.tsx:254,264` | `"5+ decimal"`, `"10+ decimal"`, `"25+ decimal"`, `"50+ decimal"` | **Needs localized unit/number formatting** (`num()`) |
| `src/pages/Find.tsx:301` | `{v}+` | Use `num(v) + "+"` |
| `src/pages/Find.tsx:319` | `{v}+ ft` | **Needs localized unit/number formatting** |
| `src/pages/Find.tsx:336` | `"optional"` | Has `auth.optional` |

### 4. `src/pages/Explore.tsx`
| File:Line | Hardcoded String / Expression | Existing Key in `en.ts`/`bn.ts` or Status |
|---|---|---|
| `src/pages/Explore.tsx:57` | `lead="Wander through what's on the platform — by area, by category, by what's just been added."` | Has `explore.lead` |
| `src/pages/Explore.tsx:68-69` | ``title={`Around ${requirements.area}`}``, `lead="Spaces in the area you last searched."` | **Needs new keys** (`explore.aroundArea`, `explore.aroundLead`) |
| `src/pages/Explore.tsx:79` | `lead="Garages, slots and godowns — the spaces nobody else lists properly."` | Has `explore.parkStoreLead` |
| `src/pages/Explore.tsx:103` | `"Where people are looking"` | **Needs new key** (`explore.wherePeopleLooking`) |
| `src/pages/Explore.tsx:112` | `{area.geography}` | Has `filter.${area.geography}` |
| `src/pages/Explore.tsx:113` | `{count} spaces` | Has `home.spacesCount` / `search.results` |
| `src/pages/Explore.tsx:155` | `"See all"` | Has `action.seeAll` |

### 5. `src/pages/Saved.tsx`
| File:Line | Hardcoded String / Expression | Existing Key in `en.ts`/`bn.ts` or Status |
|---|---|---|
| `src/pages/Saved.tsx:18` | `title="Saved spaces"` | Has `saved.title` |
| `src/pages/Saved.tsx:19` | `lead="Kept on this device, so they're still here when you come back."` | Has `saved.lead` |
| `src/pages/Saved.tsx:23` | `"Compare these"` | Has `saved.compareThese` |
| `src/pages/Saved.tsx:35` | `"Nothing saved yet."` | Has `saved.none` |
| `src/pages/Saved.tsx:37` | `"Tap the bookmark on any space while you browse and it waits for you here."` | Has `saved.noneBody` |
| `src/pages/Saved.tsx:40` | `"Start exploring"` | Has `saved.startExploring` |

### 6. `src/pages/Compare.tsx`
| File:Line | Hardcoded String / Expression | Existing Key in `en.ts`/`bn.ts` or Status |
|---|---|---|
| `src/pages/Compare.tsx:31` | `"Nothing to compare yet."` | Has `compare.none` |
| `src/pages/Compare.tsx:33` | `"Tap the scales icon on up to four spaces and they line up here, side by side."` | Has `compare.noneBody` |
| `src/pages/Compare.tsx:36` | `"Browse spaces"` | Has `action.browseSpaces` |
| `src/pages/Compare.tsx:73` | `` `${selected.length} space${selected.length > 1 ? "s" : ""} side by side. Green marks the strongest figure on a row.` `` | Has `compare.selected` |
| `src/pages/Compare.tsx:77` | `"Clear"` | Has `action.clear` |
| `src/pages/Compare.tsx:85` | `"Side-by-side comparison of the spaces you selected"` (sr-only) | **Needs new key** (`compare.captionAria`) |
| `src/pages/Compare.tsx:89` | `"Feature"` | Has `compare.feature` |
| `src/pages/Compare.tsx:95` | `{l.space.name}` (bypasses `spaceName()`) | Use `spaceName(l.space, language)` |
| `src/pages/Compare.tsx:98` | `SPACE_TYPE_LABEL[l.space.spaceType]` | Has `type.${l.space.spaceType}` |
| `src/pages/Compare.tsx:106` | `"Remove"` | Has `action.remove` |
| `src/pages/Compare.tsx:114,117` | `label="Match"`, `{scores.get(l.space.id)}%` | Has `compare.match` + `num()` |
| `src/pages/Compare.tsx:123,127` | `label="Price"`, `"/mo"` | Has `compare.price`, `transaction.perMonthShort` |
| `src/pages/Compare.tsx:132,138` | `label="Total monthly"`, `"Not disclosed"` | Has `compare.totalMonthly`, `compare.notDisclosed` |
| `src/pages/Compare.tsx:144,147` | `label="Transaction"`, `l.space.transaction === "rent" ? "Rent" : "Sale"` | **Needs new key** (`compare.transaction`), `transaction.rent`, `transaction.forSale` |
| `src/pages/Compare.tsx:153` | `label="Bedrooms"` | Has `compare.bedrooms` (+ `num()`) |
| `src/pages/Compare.tsx:161,164` | `label="Size"`, `sqft` | Has `compare.size`, `unit.sqft` |
| `src/pages/Compare.tsx:171,176` | `label="Slots"`, `${car} car · ${bike} bike` | Has `compare.slots` (**needs new key** for car/bike format) |
| `src/pages/Compare.tsx:184,187` | `label="Land area"`, `${d} decimal` | Has `compare.landArea`, `unit.decimal` |
| `src/pages/Compare.tsx:193,196` | ``label={`From ${requirements.area}`}``, `${km} km` | Has `compare.distance`, `unit.km` |
| `src/pages/Compare.tsx:208,213` | `"Yes"`, `"No"` (sr-only) | **Needs new keys** (`misc.yes`, `misc.no`) |
| `src/pages/Compare.tsx:221,224` | `label="Availability"`, `AVAILABILITY_LABEL[l.space.availability.status]` | Has `compare.availabilityRow`, `availability.${status}` |
| `src/pages/Compare.tsx:229` | `label="Free from"` | Has `compare.freeFrom` |
| `src/pages/Compare.tsx:237,248` | `label="Trust"`, `"Verified (demo)"` / `"In review"` / `"Not verified"` | Has `compare.trust`, `trust.verifiedDemo`, `trust.inReview`, `trust.unverified` |
| `src/pages/Compare.tsx:255` | `label="Updated"` | Has `compare.updated` |
| `src/pages/Compare.tsx:268` | `"Open"` | Has `action.open` |
| `src/pages/Compare.tsx:280` | `"Add one or two more and the differences become much easier to read."` | Has `compare.addMore` |

### 7. `src/pages/SpaceDetail.tsx`
| File:Line | Hardcoded String / Expression | Existing Key in `en.ts`/`bn.ts` or Status |
|---|---|---|
| `src/pages/SpaceDetail.tsx:46` | `"Loading space…"` | Has `misc.loading` |
| `src/pages/SpaceDetail.tsx:52-55` | `"That space isn't here."`, `"It may have been removed, or the link is out of date."`, `"Back to search"` | Has `space.notFound`, `space.notFoundBody`, `space.backToResults` |
| `src/pages/SpaceDetail.tsx:84` | `"Back to results"` | Has `space.backToResults` |
| `src/pages/SpaceDetail.tsx:103` | `{space.images[0].label} · view all` | **Needs new key** (`space.viewAllPhotos`) + image label translation |
| `src/pages/SpaceDetail.tsx:133-134` | `"Illustrative demo images — category placeholders, not photographs of this property."` / `"Photographs provided by the owner."` | Has `space.demoImages`, `space.ownerPhotos` |
| `src/pages/SpaceDetail.tsx:143` | `SPACE_TYPE_LABEL[space.spaceType]` | Has `type.${space.spaceType}` |
| `src/pages/SpaceDetail.tsx:145` | `"For sale"` | Has `transaction.forSale` |
| `src/pages/SpaceDetail.tsx:163` | `{property.geography}` | Has `filter.${property.geography}` |
| `src/pages/SpaceDetail.tsx:169` | `title="The space"` | Has `space.theSpace` |
| `src/pages/SpaceDetail.tsx:181` | `title="What's included"` | Has `space.included` |
| `src/pages/SpaceDetail.tsx:191` | `AMENITIES[key].label` | Has `amenity.${key}` |
| `src/pages/SpaceDetail.tsx:200` | `title="Who this is for"` | Has `space.whoFor` |
| `src/pages/SpaceDetail.tsx:202-214` | `"Families welcome"`, `"Not for families"`, `"Bachelors welcome"`, `"No bachelors"`, `"Student friendly"`, `"Men only"`, `"Women only"`, `"Up to ${count} people"` | Has `rules.familiesWelcome`, `rules.noFamilies`, `rules.bachelorsWelcome`, `rules.noBachelors`, `rules.studentsWelcome`, `rules.menOnly`, `rules.womenOnly`, `rules.maxOccupants` |
| `src/pages/SpaceDetail.tsx:220,225` | `title="Getting around"`, `{n.label}`, `{n.km} km` | Has `space.gettingAround`, `unit.km` + nearby label translation |
| `src/pages/SpaceDetail.tsx:233,243-244` | ``title={`More at ${property.name}`}``, `{s.name}`, `SPACE_TYPE_LABEL[s.spaceType]` | Has `space.moreAt`, `spaceName(s, language)`, `type.${s.spaceType}` |
| `src/pages/SpaceDetail.tsx:255` | `title="Owner"` | Has `space.owner` |
| `src/pages/SpaceDetail.tsx:271,273` | `{owner.role}`, `` `Replies to ${owner.responseRate}% of inquiries · usually within ${owner.responseHours}h` `` | Has `space.repliesTo` (**needs keys** for owner roles: individual, manager, business) |
| `src/pages/SpaceDetail.tsx:276-277` | `` `Owner state: ${owner.verification} (demo). Habito does not yet run identity or title checks.` `` | **Needs new key** (`space.ownerVerificationDemo`) |
| `src/pages/SpaceDetail.tsx:285,288` | `alert("Thanks — flagging is noted locally in this prototype.")`, `"Report this listing"` | Has `space.report` (**needs new key** `space.reportNoted`) |
| `src/pages/SpaceDetail.tsx:298,305-306` | `"Why this scores as it does"`, `"Weighted arithmetic over what you told us — budget, location, size, amenities and availability. No black box."` | Has `space.whyScores`, `match.method` |
| `src/pages/SpaceDetail.tsx:314` | `"/month"` | Has `transaction.perMonth` |
| `src/pages/SpaceDetail.tsx:323-370` | `"Monthly cost"`, `"Rent"`, `"Service charge"`, `"Utilities"`, `"Not listed"`, `"Estimated total"`, `"This owner hasn't listed every cost. Ask about service charge and utilities before you visit."`, `"Advance"`, `"month"/"months"`, `"Deposit"` | Has `space.monthlyCost`, `space.rent`, `space.serviceCharge`, `space.utilities`, `space.notListed`, `space.estimatedTotal`, `space.costHidden`, `space.advance`, `space.month`, `space.months`, `space.deposit` |
| `src/pages/SpaceDetail.tsx:402,406` | `"Saved"` / `"Save"`, `"Added"` / `"Compare"` | Has `action.saved`, `action.save`, `action.added`, `action.compare` |
| `src/pages/SpaceDetail.tsx:412` | `{lastUpdatedLabel} · {views} views · {inquiryCount} inquiries` | Has `misc.views` (**needs new key** `space.inquiriesCount`) |
| `src/pages/SpaceDetail.tsx:424,426` | `"/mo"`, `{score}% match` | Has `transaction.perMonthShort`, `match.percent` |
| `src/pages/SpaceDetail.tsx:498-547` | `specRows(listing)`: `"Bedrooms"`, `"Bathrooms"`, `"Size"`, `"Floor"`, `"Ground"`, `"Furnishing"`, `"Balcony"`, `"Yes"`, `"Frontage"`, `"Workstations"`, `"Meeting room"`, `"Suits"`, `"Storage area"`, `"Ceiling"`, `"Loading access"`, `"Vehicle access"`, `"Car slots"`, `"Motorcycle slots"`, `"Cover"`, `"Covered"`, `"Open"`, `"Access"`, `"Land area"`, `"Use"`, `"Road access"`, `"Water source"`, `"Lease"`, `${n} years`, `"Summary"` | **Needs new keys** (`spec.*`) for spec table labels and values |
| `src/pages/SpaceDetail.tsx:806-951` | `InquiryModal`: `"Hi, I'm interested in this space. Is it still available?"`, `"Your inquiry didn't send."`, `"Inquiry sent"`, `"Send an inquiry"`, `"Done"`, `"Open conversation"`, `"Cancel"`, `"Sending…"` / `"Send"`, `"{owner.name} now has your message..."`, `{listing.space.name}`, `"/month"`, `"Your name"`, `"So the owner knows who's asking"`, `"Message"`, `"When you'd move in"`, `"You'll need to sign in before an owner can reply to you."`, `"Sent with your inquiry"`, `"Budget ..."`, `"Moving ..."`, `"Your phone number isn't shared until you choose to."` | Has `inquiry.default`, `messages.sendFailed`, `inquiry.sent`, `inquiry.title`, `action.done`, `inquiry.openConversation`, `action.cancel`, `action.sending`, `action.send`, `inquiry.sentBody`, `auth.yourName`, `inquiry.yourMessage`, `inquiry.moveIn`, `inquiry.signInFirst`, `inquiry.sentWith`, `inquiry.budget`, `inquiry.moving`, `inquiry.phonePrivate` |

### 8. `src/pages/ListSpace.tsx`
| File:Line | Hardcoded String / Expression | Existing Key in `en.ts`/`bn.ts` or Status |
|---|---|---|
| `src/pages/ListSpace.tsx:25` | `STEPS = ["What", "Where", "Details", "Included", "Photos", "Price", "Review"]` | **Needs new keys** (`list.stepWhat`, `list.stepWhere`, `list.stepDetails`, `list.stepIncluded`, `list.stepPhotos`, `list.stepPrice`, `list.stepReview`) |
| `src/pages/ListSpace.tsx:365` | `SPACE_TYPE_LABEL[t]` | Has `type.${t}` |
| `src/pages/ListSpace.tsx:371,384` | `"Renting it out, or selling?"`, `tx === "rent" ? "Renting" : "Selling"` | Has `list.rentOrSell`, `transaction.renting`, `transaction.selling` |
| `src/pages/ListSpace.tsx:393,436,442,446,457` | `"Which property is this space in?"`, `"A new property"`, `"Property name"`, `"e.g. Rahman Villa"`, `"e.g. Mirpur 10"` | Has `list.whichProperty`, `list.newProperty`, `list.propertyName` + placeholders |
| `src/pages/ListSpace.tsx:480,481,501` | `` `About this ${SPACE_TYPE_LABEL[spaceType].toLowerCase()}` ``, `"Name it"`, `"Yes"` | Has `list.about`, `list.nameIt`, `misc.yes` |
| `src/pages/ListSpace.tsx:531,542,549` | `AMENITIES[key].label`, `"Only the options that make sense..."` | Has `amenity.${key}`, `list.onlyRelevant` |
| `src/pages/ListSpace.tsx:556,587,595-605` | `"This is the first thing most renters filter on..."`, `"Gender preference"`, `"No preference"`, `"Men only"`, `"Women only"`, `"Maximum occupants"`, `"No limit"` | Has `rules.menOnly`, `rules.womenOnly` (**needs new keys** for rules step helper & options) |
| `src/pages/ListSpace.tsx:638,643,646,651,657-664,676-677` | `"Monthly rent"`, `"Asking price"`, `"Service charge"`, `"Utilities"`, `"Status"`, `"Available"`..`"Maintenance"`, `"Available from"`, `"Listing every cost..."` | Has `list.monthlyRent`, `list.askingPrice`, `space.serviceCharge`, `space.utilities`, `list.status`, `availability.*`, `list.availableFrom`, `list.costTip` |
| `src/pages/ListSpace.tsx:740-764` | Review labels: `"Space"`, `"Property"`, `"New property"`, `"Rent"` / `"Price"`, `"about ... all in"`, `"Availability"`, `"Included"`, `"Nothing listed"`, `"Placeholder images are attached automatically..."` | **Needs new keys** (`list.review*`) |
| `src/pages/ListSpace.tsx:774,778,782` | `"Back"`, `` `Step ${step + 1} of ${STEPS.length}` ``, `"Continue"` | Has `action.back`, `list.step`, `action.continue` |
| `src/pages/ListSpace.tsx:844-900` | `fieldsFor(category)` labels/placeholders (`"Bedrooms"`, `"Bathrooms"`, `"Size (sqft)"`, `"Floor"`, `"Furnishing"`, `"Balcony"`, `"Frontage (ft)"`, `"Workstations"`, `"Meeting room"`, `"Suitable for"`, `"Ceiling height (ft)"`, `"Loading access"`, `"Vehicle access"`, `"Car slots"`, `"Motorcycle slots"`, `"Covered"`, `"Access hours"`, `"Area (decimal)"`, `"Current / suited use"`, `"Road access"`, `"Water source"`, `"Max lease (years)"`, `"Summary"`) | **Needs new keys** (`list.field*`) |
| `src/pages/ListSpace.tsx:959` | `placeholder="Not listed"` | Has `space.notListed` |

### 9. `src/pages/Portfolio.tsx`
| File:Line | Hardcoded String / Expression | Existing Key in `en.ts`/`bn.ts` or Status |
|---|---|---|
| `src/pages/Portfolio.tsx:81,86` | `lead="Every property you hold..."`, `"Add a space"` | Has `portfolio.lead`, `action.addSpace` |
| `src/pages/Portfolio.tsx:94-103` | `"Properties"`, `"Available"`, `"Occupied"`, `"Maintenance"`, `"Potential monthly"`, `hint="If every rentable space is filled"` | Has `portfolio.properties`, `portfolio.available`, `portfolio.occupied`, `portfolio.maintenance`, `portfolio.potential`, `portfolio.potentialHint` |
| `src/pages/Portfolio.tsx:108-109` | Stale space warning banner | Has `portfolio.staleWarning`, `portfolio.staleWarningOne` |
| `src/pages/Portfolio.tsx:121,128-131,136` | `"Properties"`, `"You haven't added a property yet."`, `"A property is the building, compound or plot..."`, `"Add your first space"` | Has `portfolio.properties`, `portfolio.empty`, `portfolio.emptyBody`, `action.addSpace` |
| `src/pages/Portfolio.tsx:161,165,166` | `"· added by you"`, `"{n} space(s)"`, `"{free} available"` | Has `portfolio.addedByYou`, `portfolio.spacesCount`, `portfolio.spaceCountOne`, `portfolio.availableCount` |
| `src/pages/Portfolio.tsx:179,181` | `"No spaces here yet."`, `"Add one"` | Has `portfolio.noSpaces`, `portfolio.addOne` |
| `src/pages/Portfolio.tsx:199` | `{s.name}` (bypasses `spaceName()`) | Use `spaceName(s, language)` |
| `src/pages/Portfolio.tsx:206-210` | Duplicate hardcoded `"Archived"` badge right after `t("edit.archive")` badge | Has `portfolio.archivedLabel` (remove duplicate badge) |
| `src/pages/Portfolio.tsx:212-213` | `SPACE_TYPE_LABEL[s.spaceType]`, `"/mo"` / `" sale"` | Has `type.${s.spaceType}`, `transaction.perMonthShort`, `transaction.forSale` |
| `src/pages/Portfolio.tsx:243` | `aria-label="Availability for ${s.name}"` | Use `spaceName(s, language)` |
| `src/pages/Portfolio.tsx:252` | `AVAILABILITY_LABEL[st]` | Has `availability.${st}` |
| `src/pages/Portfolio.tsx:270,272,278,289,291,295` | `"Inquiries"`, `"Each one arrives with what the seeker told us..."`, `"Open messages"`, `"No inquiries yet."`, `"Switch to seeker mode..."` | Has `portfolio.inquiries`, `portfolio.inquiriesLead`, `action.openMessages`, `portfolio.noInquiries`, `portfolio.noInquiriesBody` |
| `src/pages/Portfolio.tsx:309-310` | `"Everything you change here is stored on this device..."` | **Needs new key** (`portfolio.localNotice`) |
| `src/pages/Portfolio.tsx:365,381,391,394` | `"on ${space?.name}"`, inquiry status options (`"new"`, `"contacted"`, `"interested"`, `"closed"`), `"Budget ..."`, `"Moving ..."` | Has `inquiry.budget`, `inquiry.moving` (**needs new keys** for `inquiry.status.*` and `portfolio.onSpace`) |

### 10. `src/pages/Messages.tsx`
| File:Line | Hardcoded String / Expression | Existing Key in `en.ts`/`bn.ts` or Status |
|---|---|---|
| `src/pages/Messages.tsx:32` | `"Could not load your messages."` | **Needs new key** (`messages.loadFailed`) |
| `src/pages/Messages.tsx:55-56` | `"{totalUnread} unread message(s)."` / `"Every conversation is tied to the space it's about."` | Has `messages.unread`, `messages.unreadOne`, `messages.lead` |
| `src/pages/Messages.tsx:85,87` | `"Pick a conversation"`, `"Or open a space and send an inquiry to start a new one."` | Has `messages.pick`, `messages.pickBody` |
| `src/pages/Messages.tsx:117,119,123` | `"No conversations yet."`, `"Send an inquiry on a space..."`, `"Browse spaces"` | Has `messages.none`, `messages.noneBody`, `action.browseSpaces` |
| `src/pages/Messages.tsx:161` | `"No messages yet"` | Has `messages.noMessages` |
| `src/pages/Messages.tsx:202,240` | `"Could not load this conversation."`, `"Your message didn't send."` | Has `messages.sendFailed` (**needs new key** `messages.threadLoadFailed`) |
| `src/pages/Messages.tsx:260,263,271` | `"Conversation"`, `"Asking about ..."` / `"Your inquiry about ..."`, `"View space"` | Has `messages.askingAbout`, `messages.yourInquiry`, `action.viewSpace` |
| `src/pages/Messages.tsx:287` | `"No messages yet. Say hello and ask what you need to know."` | Has `messages.noMessages` |
| `src/pages/Messages.tsx:346` | `"Sign in to reply"` / `"Write a message"` | Has `messages.signInToReply`, `messages.write` |
| `src/pages/Messages.tsx:375-390` | `dayLabel` (`"Today"`, `"Yesterday"`), `whenShort` (`"now"`, `${mins}m`, `${h}h`, `${d}d`), hardcoded `"en-GB"` locale | Has `messages.today`, `messages.yesterday`, `time.now` + locale formatting |

### 11. `src/pages/Profile.tsx`
| File:Line | Hardcoded String / Expression | Existing Key in `en.ts`/`bn.ts` or Status |
|---|---|---|
| `src/pages/Profile.tsx:22-24` | `"Verified"`, `"Verification pending"`, `"Not verified"` | Has `trust.verified`, `account.verificationPending`, `trust.unverified` |
| `src/pages/Profile.tsx:54,56,67,69,81` | `"Profile updated"`, `"Could not save your profile"`, `"Demo data restored"`, `"Could not reset"`, `"Could not switch that on"` | Has `account.updated` (**needs new keys** for error/reset toasts) |
| `src/pages/Profile.tsx:92-93` | `"Your account"` / `"Your profile"`, `"Enough context for an owner to reply..."` | Has `account.title`, `nav.profile`, `account.lead` |
| `src/pages/Profile.tsx:99,105,110,114,125` | `"Profile"` / `"Demo profile"`, `"Signed in as ..."`, `"Name"`, `"Phone"`, `"Saving…"` / `"Save changes"` | Has `account.profile`, `account.signedInAs`, `account.name`, `auth.phone`, `edit.saving`, `action.saveChanges` |
| `src/pages/Profile.tsx:139-140` | `"Identity verification isn't switched on yet..."` | Has `account.verificationNote` |
| `src/pages/Profile.tsx:147,153,157,162-163` | `"Browsing as a ... without an account."`, `"Sign in"`, `"Create an account"`, `"This build isn't connected to the database..."` | Has `action.signIn`, `auth.createAccount` (**needs new keys** for guest profile banner) |
| `src/pages/Profile.tsx:198-209` | `"Category"`, `"Anything"`, `CATEGORY_LABEL[...]`, `"Area"`, `"Budget"`, `"Needed by"`, `"You haven't told us what you need yet."`, `"Tell us what you need"` | Has `filter.category`, `home.anything`, `category.*`, `filter.area`, `account.notStated`, `home.tellUs` |
| `src/pages/Profile.tsx:217-226` | `"Owner activity"`, `"Response rate"`, `"Usual reply"`, `"Within ${h}h"`, `"Member since"`, `"Open my spaces"` | Has `account.ownerActivity`, `account.responseRate`, `account.usualReply`, `account.memberSince`, `nav.portfolio` |
| `src/pages/Profile.tsx:238-257` | `"Your data"` / `"This device"`, `"Saved spaces"`, `"In compare"`, `"Inquiries"`, `"Requests posted"`, storage description, `"Resetting…"` / `"Reset demo data"` | Has `account.yourData`, `account.thisDevice`, `account.savedSpaces`, `account.inCompare`, `account.inquiries`, `account.requestsPosted`, `action.resetDemo` |

### 12. `src/pages/Requests.tsx`
| File:Line | Hardcoded String / Expression | Existing Key in `en.ts`/`bn.ts` or Status |
|---|---|---|
| `src/pages/Requests.tsx:53-57,62,73,75,78` | `"What people are asking for"` / `"Request a space"`, leads, `"Post a request"`, `"No open requests."`, `"Post one and it appears here..."` | Has `requests.titleOwner`, `requests.titleSeeker`, `requests.leadOwner`, `requests.leadSeeker`, `action.postRequest`, `requests.none`, `requests.noneBody` |
| `src/pages/Requests.tsx:94,97,105,110,111` | `"Any space"`, `CATEGORY_LABEL[r.category]`, `"Renting"` / `"Buying"`, `"Needed by ${r.neededBy}"`, `alert(...)`, `"I have something"` | Has `requests.anySpace`, `category.*`, `transaction.renting`, `transaction.buying`, `requests.neededBy`, `requests.haveSomething` |
| `src/pages/Requests.tsx:128-184` | Modal: `"Request a space"`, `"Cancel"`, `"Post"`, `"Your name"`, `"What kind of space"`, `"Anything"`, `"Renting or buying"`, `"Where"`, `"Budget from"`, `"Up to"`, `"Needed by"`, `"Anything else"`, placeholder | Has `requests.titleSeeker`, `action.cancel`, `action.post`, `auth.yourName`, `home.anything`, `requests.neededBy` (**needs new keys** for modal field labels) |

### 13. Other Pages (`Home.tsx`, `NotFound.tsx`) & Components & Helpers
| File:Line | Hardcoded String / Expression | Existing Key in `en.ts`/`bn.ts` or Status |
|---|---|---|
| `src/pages/Home.tsx:417,422` | `SPACE_TYPE_LABEL[l.space.spaceType]`, `"/mo"` | Has `type.${l.space.spaceType}`, `transaction.perMonthShort` |
| `src/pages/Home.tsx:465` | `{i + 1}` step number | Use `num(i + 1)` |
| `src/pages/Home.tsx:481-484` | `"About verification. Habito does not yet perform real identity or ownership checks..."` | **Needs new keys** (`home.aboutVerificationTitle`, `home.aboutVerificationBody`) |
| `src/pages/NotFound.tsx:11,13,16` | `"That page isn't here."`, `"The link may be out of date, or the page has moved."`, `"Explore spaces"` | Has `misc.notFound`, `misc.notFoundBody`, `home.exploreSpaces` |
| `src/components/layout/Footer.tsx:59-60` | `"Prototype built for the Innovation to Impact initiative, Independent University, Bangladesh."`, `"All seed data is synthetic. No real identity or ownership verification is performed."` | **Needs new keys** (`footer.prototypeCredit`, `footer.syntheticNote`) |
| `src/components/space/CompareTray.tsx:21,28,33,47,52` | `"Compare ${selected.length}"`, `{l.space.name}`, `"Clear"`, `"Compare"` | Has `action.compare`, `action.clear`, `spaceName(l.space, language)` |
| `src/components/space/MatchRing.tsx:81,87,88,91,101` | `{shown}`, `matchLabel(score)`, `"Habito Match"`, `` `${score}% match` `` | Has `match.*`, `num(shown)` |
| `src/components/space/SpaceCard.tsx:18-59` | `keySpec(listing)`: `"${n} bed"`, `"${n} bath"`, `"${n} sqft"`, `"${n} ft frontage"`, `"${n} desks"`, `"${n} ft ceiling"`, `"loading access"`, `"${n} car"`, `"${n} motorcycle"`, `"covered"`, `"open"`, `"${n} decimal"`, `"road access"` | **Needs new keys** (`card.spec*`) + `num()` |
| `src/components/onboarding/Onboarding.tsx:181` | `{area.geography}` | Has `filter.${area.geography}` |
| `src/components/ui/AreaPicker.tsx:122` | `{group.region}` (`"Dhaka Metro"`, `"Greater Dhaka"`, etc.) | **Needs new keys** (`region.*`) |
| `src/routes/Guard.tsx:23,25,37,47,48,59,61` | Guard screens: `"Not available in this build."`, `"Checking your session…"`, `"Your account is suspended."`, `"That page isn't for this account."` | **Needs new keys** (`guard.*`) |
| `src/lib/format.ts:38-45` | `lastUpdatedLabel`: `"Updated today"`, `"Updated yesterday"`, `"Updated ${d} days ago"`, `"Updated ${months} month(s) ago"` | Has `time.updatedToday`, `time.updatedDays` (**needs** `format.ts` to read active language) |
| `src/lib/format.ts:47-54` | `lastUpdatedShort`: `"Today"`, `"Yesterday"`, `"${d}d ago"`, `"${w}w ago"`, `"${m}mo ago"` | Has `time.today`, `time.yesterday`, `time.daysAgo`, `time.weeksAgo`, `time.monthsAgo` |
| `src/lib/format.ts:70-75` | `availabilityLine`: `"Available now"`, `"Available in ${diff} day(s)"`, `"Available from ${longDate(iso)}"` | Has `availability.now`, `availability.inDays`, `availability.fromDate` |
| `src/lib/matching.ts:70-311,344-349,377-385` | Match factor labels (`"Budget"`, `"Location"`, `"Space type"`, `"Availability"`, `"Size"`, `"Space"`, `"Capacity"`, `"Slots"`, `"Plot size"`, `"Amenities"`), factor `detail` strings, `matchLabel(score)`, and `nearbyAlternatives` `reason` strings | Has `match.excellent`, `match.strong`, `match.worthLook`, `match.loose` (**needs** `match.factor.*` & `match.detail.*` keys) |

---

## (b) Keys in `en.ts` Missing from `bn.ts` (and Reverse)

- **Total keys in `src/i18n/en.ts`:** `681`
- **Total keys in `src/i18n/bn.ts`:** `681`
- **Keys in `en.ts` missing from `bn.ts`:** **0** (`[]`)
- **Keys in `bn.ts` missing from `en.ts`:** **0** (`[]`)
- **Why:** `src/i18n/bn.ts` is typed as `export const bn: Record<keyof typeof en, string>`, enforcing 100% key parity at compile time. However, ~140 of these 681 keys were pre-added to `en.ts`/`bn.ts` without replacing the corresponding English literals in `src/pages/*`, `src/lib/format.ts`, and `src/lib/matching.ts`.

---

## (c) UTF-8 & Mojibake Verification of `src/i18n/bn.ts`

Checked directly at the byte level via Node `Buffer`:
- **Byte length:** `62,172` bytes
- **Round-trip UTF-8 check (`Buffer.from(buf.toString("utf8"), "utf8").equals(buf)`):** `true` (exact byte match)
- **UTF-8 BOM:** `false` (clean UTF-8 without BOM)
- **Replacement character (`U+FFFD` / ``):** `0` occurrences
- **Mojibake patterns (`Ã`, `à¦`, `à§`):** `0` occurrences
- **Bengali Unicode block characters (`U+0980`–`U+09FF`):** `13,574` characters

**Conclusion:** `src/i18n/bn.ts` is **100% valid UTF-8** and not mojibake.

---

## (d) Bilingual Seed Generator & `0009_bilingual.sql` Expectations

1. **Database Schema (`supabase/migrations/0009_bilingual.sql`):**
   - Adds `name_bn text` and `description_bn text` columns to `public.spaces`.
2. **Seed Generators (`scripts/generate-habito-data.mjs` & `scripts/generate-seed-sql.mjs`):**
   - `scripts/generate-habito-data.mjs` already generates `nameBn` and `descriptionBn` for all **235** spaces in `src/data/seed.json` (verified: 235/235 spaces have non-empty `nameBn` and `descriptionBn`).
   - `scripts/generate-seed-sql.mjs` already outputs `name_bn` and `description_bn` in the `insert into public.spaces` statement in `supabase/seed.sql`.
3. **Gaps Found in Bilingual Listing Pipeline:**
   - **Bug in `src/lib/supabase.ts` (`toSpace`, lines 174–232):** `SpaceRow` (lines 87, 95) includes `name_bn: string | null` and `description_bn: string | null`, but `toSpace(row)` **omits `nameBn: row.name_bn ?? undefined` and `descriptionBn: row.description_bn ?? undefined`**, causing Supabase-backed spaces to lose their Bangla title and description.
   - **Call sites bypassing `spaceName(space, language)`:** `Search.tsx:284`, `Compare.tsx:95`, `CompareTray.tsx:28,33`, `Portfolio.tsx:199,243,365`, and `SpaceDetail.tsx:243,893` access `.name` directly instead of `spaceName(space, language)`.
   - **Seed sub-fields still in English (`scripts/generate-habito-data.mjs`):**
     - `availability.note` (lines 341, 343, 345): e.g. `"2 car slots · 1 motorcycle slot free"`, `"600 sqft of 1000 sqft free"`, `"12 workstations"`.
     - `property.nearby[].label` (lines 467–470, 542–546): `"University"`, `"Bus stop"`, `"Hospital"`, `"Grocery"`, `"Metro station"`, `"Bazar"`.
     - `attributes.suitableFor` (lines 221, 247), `attributes.accessHours` (lines 258, 269), `attributes.landUse` (line 279), and image `label`s (line 375).

---

## (e) Estimated Count of Strings to Translate / Wire Up

| Category | Count | Details |
|---|---:|---|
| **Existing `en.ts`/`bn.ts` keys not yet wired in JSX/TS** | **~145 keys** | Already translated in `bn.ts`; need `t(...)` replacement across ~165 call sites in `src/pages/*`, `src/components/*`, `src/lib/format.ts`, and `src/lib/matching.ts` |
| **New UI keys to add to `en.ts` & translate in `bn.ts`** | **~125 keys** | Spec rows (`SpaceDetail.tsx`), card key-specs (`SpaceCard.tsx`), list wizard steps/fields/review (`ListSpace.tsx`), match factor details (`matching.ts`), route guards (`Guard.tsx`), footer credits (`Footer.tsx`), region headers (`AreaPicker.tsx`), and minor missing alerts/toasts |
| **Seed / attribute lookup translations** | **~35 strings** | Nearby landmark labels, image labels, `suitableFor`, `accessHours`, `landUse`, and `availability.note` localization |
| **Total strings to wire / translate** | **~305 strings** | (~145 existing keys to wire + ~160 new translations) |
