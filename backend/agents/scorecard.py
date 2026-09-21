"""
Scorecard extraction layer for FinUnity's AI debate pipeline.
Parses synthesis output text to extract structured verdict and key points.
No LLM calls — pure string parsing.
"""

import re


def extract_scorecard(synthesis_text: str) -> dict:
    """
    Extract a structured scorecard from the Synthesis agent's output text.
    
    Returns a dict with:
        - verdict: one of "APPROVE", "APPROVE_REDUCED", "NEEDS_EVIDENCE", "DECLINE", "UNKNOWN"
        - verdict_label: human-readable label
        - strong_points: list of strengths found in text
        - concerns: list of concerns found in text
        - missing_evidence: list of evidence gaps found in text
    
    Never raises exceptions — returns UNKNOWN with empty lists on parse failure.
    """
    try:
        if not synthesis_text or not isinstance(synthesis_text, str):
            return _empty_scorecard("UNKNOWN")
        
        text = synthesis_text
        
        # Extract verdict
        verdict, verdict_label = _extract_verdict(text)
        
        # Extract sections
        strong_points = _extract_section(text, [
            r"(?:what'?s?)?\s*strong(?:est)?\s*(?:points?)?",
            r"strengths?",
            r"positive\s*(?:factors?|aspects?|points?)?",
            r"arguments?\s*(?:for|in\s*favor)",
        ])
        
        concerns = _extract_section(text, [
            r"(?:what'?s?)?\s*concerning?",
            r"concerns?",
            r"negative\s*(?:factors?|aspects?|points?)?",
            r"risks?",
            r"weakness(?:es)?",
            r"arguments?\s*(?:against|opposing)",
        ])
        
        missing_evidence = _extract_section(text, [
            r"(?:data\s*)?gaps?",
            r"missing\s+evidence",
            r"gaps?\s+reducing\s+confidence",
            r"missing\s+(?:data|information|readings)",
            r"evidence\s+needed",
            r"further\s+(?:review|evidence)\s+required",
        ])
        
        return {
            "verdict": verdict,
            "verdict_label": verdict_label,
            "strong_points": strong_points,
            "concerns": concerns,
            "missing_evidence": missing_evidence,
        }
    
    except Exception:
        # Defensive: never crash the API
        return _empty_scorecard("UNKNOWN")


def _empty_scorecard(verdict: str) -> dict:
    """Return an empty scorecard with the given verdict."""
    labels = {
        "APPROVE": "Recommend Approval",
        "APPROVE_REDUCED": "Recommend Approval with Reduced Terms",
        "NEEDS_EVIDENCE": "Recommend Additional Evidence",
        "DECLINE": "Recommend Decline",
        "UNKNOWN": "Unable to Determine Recommendation",
    }
    return {
        "verdict": verdict,
        "verdict_label": labels.get(verdict, "Unable to Determine Recommendation"),
        "strong_points": [],
        "concerns": [],
        "missing_evidence": [],
    }


def _extract_verdict(text: str) -> tuple:
    """
    Extract verdict from text containing 'Recommendation level:' line.
    Returns (verdict_code, human_readable_label).
    """
    text_lower = text.lower()
    
    # Strip markdown bold markers for more robust matching
    text_stripped = re.sub(r'\*\*', '', text_lower)
    
    # Look for recommendation level line - use non-greedy match to end of line
    rec_pattern = r"recommendation\s*level\s*:\s*(.+?)$"
    match = re.search(rec_pattern, text_stripped, re.MULTILINE)
    
    if match:
        rec_line = match.group(1).strip()
    else:
        # Fallback: search entire text for verdict phrases
        rec_line = text_stripped
    
    # APPROVE_REDUCED patterns (check before generic "approval" to avoid false match)
    if "recommend approval with reduced" in rec_line:
        return "APPROVE_REDUCED", "Recommend Approval with Reduced Terms"
    
    # APPROVE patterns
    if any(phrase in rec_line for phrase in ["recommend approval", "approval with standard terms"]):
        return "APPROVE", "Recommend Approval"
    
    # Check DECLINE (before "further review" which could appear with decline)
    if "decline" in rec_line:
        return "DECLINE", "Recommend Decline"
    
    # NEEDS_EVIDENCE patterns
    if any(phrase in rec_line for phrase in ["additional evidence", "further review"]):
        return "NEEDS_EVIDENCE", "Recommend Additional Evidence"
    
    # Default unknown
    return "UNKNOWN", "Unable to Determine Recommendation"


def _extract_section(text: str, heading_patterns: list) -> list:
    """
    Extract bullet points or lines under a matching section heading.
    Returns a list of extracted items (max 5 to keep it concise).
    Stops when encountering any markdown bold heading (line starting with ** and containing **:).
    """
    lines = text.split('\n')
    
    # Pattern to detect markdown bold headings like **Heading:**
    bold_heading_pattern = r'^\s*\*\*[^*]+:\*\*'
    
    # Find the section start
    section_start = -1
    for i, line in enumerate(lines):
        line_lower = line.lower().strip()
        for pattern in heading_patterns:
            if re.search(pattern, line_lower):
                section_start = i + 1
                break
        if section_start > 0:
            break
    
    if section_start < 0:
        return []
    
    # Collect items until next section or end
    items = []
    bullet_pattern = r'^[\s]*[-•*]\s*(.+)$'
    numbered_pattern = r'^[\s]*\d+[.)]\s*(.+)$'
    
    for i in range(section_start, len(lines)):
        line = lines[i].strip()
        
        # Skip empty lines
        if not line:
            continue
        
        # Check if we hit another section heading (stop collecting)
        # This includes both our target patterns AND any bold markdown heading
        line_lower = line.lower()
        is_heading = False
        
        # Check for any bold markdown heading (**text:**)
        if re.match(bold_heading_pattern, line):
            is_heading = True
        
        # Also check against the heading patterns for other sections
        if not is_heading:
            for pattern in heading_patterns:
                if re.search(pattern, line_lower):
                    is_heading = True
                    break
        
        if is_heading:
            break  # Stop collecting at any new heading
        
        # Also stop at recommendation level line (it's not content)
        if 'recommendation level' in line_lower:
            break
        
        # Also stop at other common section markers
        if any(marker in line_lower for marker in ["synthesis", "conclusion", "summary"]):
            if not any(marker in line_lower for marker in ["what's concerning", "concerns", "missing"]):
                pass  # Only stop if it looks like a new major section
            else:
                continue
        
        # Try to extract as bullet point
        match = re.match(bullet_pattern, line) or re.match(numbered_pattern, line)
        if match:
            item = match.group(1).strip()
            if item and len(item) > 5:  # Avoid very short fragments
                items.append(item)
                if len(items) >= 5:  # Limit to 5 items max
                    break
        elif len(line) > 10 and len(line) < 200:
            # Accept plain lines that look like content (not headers)
            if not line.endswith(':') and not line.startswith('#'):
                items.append(line)
                if len(items) >= 5:
                    break
    
    return items
