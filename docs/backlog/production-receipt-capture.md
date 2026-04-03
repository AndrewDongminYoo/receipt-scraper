# Production Receipt Capture Pipeline

> **Status:** Deferred. Day 5 closes the prototype that uses image-library
> selection. This document records the agreed design decisions for the
> follow-up production capture feature so they are not re-litigated later.

## Goal

Replace the `react-native-image-picker` gallery flow with a dedicated camera
capture flow that produces a flat, readable receipt image and feeds it into an
OCR pipeline before upload.

## Non-negotiable design decisions

### OCR strategy

- **On-device OCR first.** Prefer a library that runs inference locally with no
  external API call. Research candidates in cost order before reaching for a
  cloud OCR API.
- **Accuracy is the primary success criterion.** Latency and bundle size are
  secondary. Accept a larger native binary over a less accurate output.
- **Native module bridging is allowed** if no JS-only library meets the accuracy
  bar.

### Failure handling

Show immediate inline feedback for each of these four failure cases. Do not
navigate away. Do not batch failures into a single generic error.

| Failure                                   | Message to user                                               |
| ----------------------------------------- | ------------------------------------------------------------- |
| Camera capture fails or is cancelled      | Return to previous screen silently                            |
| On-device OCR fails or returns empty text | "We couldn't read the receipt. Try again in better lighting." |
| Server: receipt already registered        | "This receipt has already been submitted."                    |
| Server: not a grocery/supermarket receipt | "Only grocery and supermarket receipts are accepted."         |

### Backend upload contract

The upload payload is limited to:

- Flattened receipt image (JPEG, perspective-corrected)
- OCR extracted text
- Capture date (device clock, no additional permissions needed)
- Device locale

Explicitly excluded:

- Location data (requires permission we do not want to request)
- OCR confidence scores or bounding-box coordinates
- Camera metadata beyond capture date

### Feature flag

The image-library fallback path (the current prototype flow) must be
controllable via a **Firebase Remote Config boolean flag** at runtime.

- Flag name: `receipt_upload_use_library_picker`
- Default when Remote Config is unreachable: `false` (camera capture path)
- Purpose: emergency rollback if the camera/OCR pipeline produces bad data in
  production without requiring an app release

Remote Config integration is **not** part of this backlog item. The flag
design is recorded here so the name and semantics are fixed before
implementation begins.

## Out of scope for this backlog item

- Document corner detection and perspective flattening UI
- Batch or multi-receipt capture
- Receipt deduplication logic (server-side concern)
- Any form of cloud-side ML or vision API
