# Market Brief Playbook (Finance Pack)

This playbook defines a repeatable process to generate a daily/weekly market brief from multiple sources.

## Inputs
- Source pages (e.g., dashboards, newsletters, blogs)
- Extracted text artifacts captured in Playwright case folders

## Process
1) Collect source artifacts
   - Use Playwright to log in, navigate, and extract text
   - Save outputs to case folders via `playwright_run_case.sh`

2) Normalize
   - Convert extracted text into a consistent structure:
     - date/time
     - key levels
     - themes
     - risk events
     - actionable takeaways

3) Synthesize
   - Combine per-source analysis into a final brief

## Output
- 10-bullet executive summary
- Key levels table (support/resistance/pivots)
- Risk calendar (next 3–7 days)
- Trades/positioning ideas mentioned by sources (if any)

## Validation
- Include URLs/screenshots in artifacts folder for traceability.
- If extraction fails twice, trigger HITL (ask human to confirm correct nav clicks/cues).
