---
sidebar_position: 5
title: Findings and evidence
description: Interpret request occurrences, evidence sampling, attack evidence, and version-specific Security events.
---

# Findings and evidence

A finding records a bounded modeled source-to-sink observation or candidate code
risk. It does not confirm a vulnerability, malicious intent, or successful
exploitation. The following behavior is backed by released Java, Node.js, and
Python versions; it does not imply equivalent analysis in PHP or .NET. See
[.NET Security](dotnet.md) for the released .NET scope.

## Released versions and event formats

| Language | Per-request occurrences and attack evidence introduced | Schema v2 introduced | Version used by this guide |
| --- | --- | --- | --- |
| Java | [1.3.0](https://github.com/beacon-observability/beacon-java/releases/tag/v1.3.0) | [1.3.3](https://github.com/beacon-observability/beacon-java/releases/tag/v1.3.3) | [1.3.4](https://github.com/beacon-observability/beacon-java/releases/tag/v1.3.4) |
| Node.js | [1.3.0](https://github.com/beacon-observability/beacon-nodejs/releases/tag/v1.3.0) | [2.0.0](https://github.com/beacon-observability/beacon-nodejs/releases/tag/v2.0.0) | [2.0.1](https://github.com/beacon-observability/beacon-nodejs/releases/tag/v2.0.1) |
| Python | [1.2.0](https://github.com/beacon-observability/beacon-python/releases/tag/v1.2.0) | [1.2.3](https://github.com/beacon-observability/beacon-python/releases/tag/v1.2.3) | [1.2.4](https://github.com/beacon-observability/beacon-python/releases/tag/v1.2.4) |

Read `schema_version` before interpreting a record. The event name remains
`beacon.security.finding` and fingerprint version remains `1`. A shared schema
does not establish runtime coverage. Older producers may omit optional occurrence,
sampling, or attack-evidence fields; missing fields are not `no_evidence`.

## Code risk, request evidence, and outcome

In schema v1, `assessment=observation` or `candidate_risk` describes code risk,
`validation=unvalidated` says it has not been validated, and the optional
`attack_evidence` describes this request. These are separate dimensions.

| `attack_evidence.status` | Meaning |
| --- | --- |
| `unknown` | Analysis is unavailable, unsupported, imprecise, over budget, or needs missing boundary policy. |
| `no_evidence` | Supported analysis found no attack evidence. This is not a safety verdict and does not remove a code risk. |
| `suspected` | Supported analysis found possible exploitation evidence. This proves neither intent nor success. |

`attack_evidence.reason` is a bounded machine-readable explanation, without raw
request values. In v1, `attack_evidence.outcome=not_assessed`. Schema v2 omits
fixed assessment/validation placeholders and the constant outcome field; their
omission does not promote the finding to confirmed exploitation. An invocation,
normal return, or HTTP status alone cannot establish successful exploitation.

With precise taint tracking and supported ANSI SQL analysis, these examples have
different meanings. They describe sink context, not rules for matching keywords:

| Scenario | Interpretation |
| --- | --- |
| Ordinary input concatenated inside a quoted value in dynamic SQL | A candidate code risk can remain even when supported analysis returns `no_evidence`. |
| Fixed SQL template with separately bound values | Ordinary bound values do not create SQL-template injection findings. Building an untrusted template before preparation is different. |
| Untrusted input controls supported SQL structural operators or comment delimiters | May yield `suspected`; it does not establish that the database executed an exploit. |
| Unconfigured dialect, unsupported syntax, imprecise taint, or exhausted analysis budget | Remains `unknown`, rather than being declared safe. |

See the language pages for the opt-in ANSI setting and analysis limits. Network
allowlists and filesystem-root policies are not implemented by the versions
listed above; boundary-dependent attack assessment remains `unknown`.
Normalization alone does not establish path safety.

## One finding, several requests

`finding_id` groups a stable code-risk fingerprint. `occurrence_id` identifies a
request's detection of that finding. In Java 1.3.0 schema v1 it equals that
request's `evidence_id`. Repeated detections of the same fingerprint in one
request count once. Stronger evidence can update that occurrence with the same ID.

This symbolic Java 1.3.0 example assumes aggregation is available and all three
requests occur inside one full-evidence interval. IDs below are labels, not a
literal event payload. Each request has its own current trace/span context.

| Request | `finding_id` | `evidence_id` = `occurrence_id` | Trace / span | Evidence retained | `occurrences_total` |
| --- | --- | --- | --- | --- | --- |
| A | F | A1 | trace-A / span-A | Yes, first sample | 1 |
| B | F | B1 | trace-B / span-B | No, interval sampling | 2 |
| C | F | C1 | trace-C / span-C | No, interval sampling | 3 |

Detailed evidence sampling is independent of request-occurrence export and
OpenTelemetry trace sampling. Sampling out B's details does not remove B's
detection. A missing or unsampled trace does not prevent a finding; a trace ID
in a finding does not guarantee that the trace reached or remains in the backend.

Within one request, evidence precedence is `suspected > unknown > no_evidence`.
An upgrade moves that request's status bucket without adding an occurrence and
can bypass the ordinary evidence interval. Across requests, classification stays
independent: ordinary → suspected → ordinary does not make the last request
suspected. A retained strongest representative can describe the middle request
while `last_trace_id` describes the latest one. In v2, full representatives and
cumulative local counters require explicit local diagnostic output.

V1 `attack_evidence_counts` partitions aggregate request occurrences into the
three statuses. Those are evidence-status counts, never confirmed attack counts.
The v2 online body has no cumulative occurrence total; consumers deduplicate
received records by `instance_id + occurrence_id` and group by `finding_id`,
merging same-occurrence upgrades rather than counting each update as a request.

## Sampling and migration

| Detail | Java 1.3.0–1.3.2 schema v1 | Schema v2 versions listed above |
| --- | --- | --- |
| Occurrence identity | `evidence_id` and its alias `occurrence_id` | `occurrence_id`; `evidence_id` removed |
| Sampled-out evidence | `evidence_sampled=false`, required `sources`, `propagation`, `ranges`, `stack` arrays empty | `evidence_sampled=false`; empty evidence arrays omitted |
| Sampling reason | `evidence_sample_reason`, with `truncated=true`, `truncation_reason=evidence_sampled_out` for omitted details | `evidence_sample_reason`; sampling alone does not mean truncation |
| Collection limits | Truncation fields describe incomplete evidence | `collection_complete` describes observation quality; `truncated=true` denotes actual collection or encoding truncation |
| Aggregation | `aggregation_status=tracked` with process-local `occurrences_total`; `capacity_exceeded` omits the total while bounded occurrence export continues | Online totals and independent summary/health/loss/truncated-record events removed; backend aggregates received occurrences |

Empty or omitted evidence arrays never prove absence of taint. A v1 process-local
counter is not a cluster-wide or durable total. Do not require a v1 event schema
to validate v2 records. See the released [Java v1 reference](https://github.com/beacon-observability/beacon-java/blob/v1.3.0/extensions/security/README.md)
and [Java v2 reference](https://github.com/beacon-observability/beacon-java/blob/v1.3.3/extensions/security/README.md).

## Export policy and delivery limits

Java 1.3.4, Node.js 2.0.1, and Python 1.2.4 exclude `no_evidence` findings from OpenTelemetry
Logs and evidence JSONL by default. Set
`BEACON_SECURITY_EXPORT_NO_EVIDENCE_ENABLED=true` to restore their export.
`unknown` and `suspected` remain eligible, and SBOM is unaffected. Filtering
happens before queue admission, consumes no queue or export-rate budget, and is not export loss. Internal detection,
deduplication, and same-request upgrades still run. Java 1.3.3 predates the switch; Java 1.3.4 adds it. The A/B/C v1 example above predates this export policy.

Repeated findings can increase log volume even when details are sampled.
Queues, memory, record bytes, and rate budgets remain bounded. V1 has observable
loss counters and may use a minimal truncation envelope when a normal record
cannot fit; that envelope need not retain occurrence or trace fields. V2 removes
those separate diagnostic events and does not generate replay events to replace
lost occurrences. Missing records may reflect policy, collection limits, queue
loss, transport failure, or retention. Counts from received records describe
received observations, not a complete census. Neither an occurrence nor an
OpenTelemetry API call guarantees durable delivery or backend acknowledgement.
