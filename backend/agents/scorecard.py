"""
Deterministic scorecard extraction from Synthesis agent output.
No AI/LLM calls — pure string parsing only.
"""

import re
from typing import List, Dict


def _extract_section_lines(text: str, headings: List[str]) -> List[str]:
    """
    Extract lines under a heading that matches one of the provided patterns.
    Looks for heading followed by bullet points or numbered lines.
    Returns empty list if no matching section found.
    """
    lines = text.split('\n')
    
    for i, line in enumerate(lines):
        line_lower = line.lower().strip()
        for heading in headings:
            # Check if this line contains the heading pattern
            if heading.lower() in line_lower:
                # Found the heading, now collect subsequent bullet/numbered items
                items = []
                j = i + 1
                while j < len(lines):
                    next_line = lines[j].strip()
                    if not next_line:
                        j += 1
                        continue
                    # Check if it's a bullet point or numbered item
                    if (next_line.startswith('- ') or 
                        next_line.startswith('* ') or 
                        next_line.startswith('• ') or
                        re.match(r'^\d+[\.\)]\s*', next_line)):
                        # Remove the bullet/number prefix
                        cleaned = re.sub(r'^[-*•]\s*', '', next_line)
                        cleaned = re.sub(r'^\d+[\.\)]\s*', '', cleaned)
                        items.append(cleaned)
                        j += 1
                    else:
                        # Hit a non-bullet line, stop collecting
                        break
                if items:
                    return items
    return []


def extract_scorecard(synthesis_text: str) -> dict:
    """
    Extract structured scorecard data from Synthesis agent output text.
    Uses plain string parsing (regex/text matching) — NO LLM calls.
    
    Returns a dict with:
    - verdict: one of APPROVE, APPROVE_REDUCED, NEEDS_EVIDENCE, DECLINE, UNKNOWN
    - verdict_label: human-readable label
    - strong_points: list of strength phrases
    - concerns: list of concern phrases  
    - missing_evidence: list of missing evidence items
    
    Defensive: returns UNKNOWN with empty lists on parse failure, never crashes.
    """
    try:
        text = synthesis_text or ""
        
        # === Extract Verdict ===
        verdict = "UNKNOWN"
        verdict_label = "Unable to Determine Recommendation"
        
        # Look for recommendation level line
        rec_pattern = r'(?:recommendation level|recommendation)[:\s]+(.+?)(?:\n|$)'
        match = re.search(rec_pattern, text, re.IGNORECASE)
        
        if match:
            rec_text = match.group(1).lower()
            
            # Check for approval patterns
            if 'recommend approval' in rec_text and 'reduced' not in rec_text:
                verdict = "APPROVE"
                verdict_label = "Recommend Approval"
            elif 'approval with standard terms' in rec_text:
                verdict = "APPROVE"
                verdict_label = "Recommend Approval with Standard Terms"
            elif 'recommend approval with reduced' in rec_text or 'approval with reduced' in rec_text:
                verdict = "APPROVE_REDUCED"
                verdict_label = "Recommend Approval with Reduced Amount"
            elif 'additional evidence' in rec_text or 'further review' in rec_text:
                verdict = "NEEDS_EVIDENCE"
                verdict_label = "Recommend Additional Evidence"
            elif 'decline' in rec_text:
                verdict = "DECLINE"
                verdict_label = "Recommend Decline"
        
        # If no explicit "Recommendation level:" found, try fallback patterns
        if verdict == "UNKNOWN":
            text_lower = text.lower()
            if 'recommend approval' in text_lower and 'reduced' not in text_lower:
                verdict = "APPROVE"
                verdict_label = "Recommend Approval"
            elif 'recommend approval with reduced' in text_lower:
                verdict = "APPROVE_REDUCED"
                verdict_label = "Recommend Approval with Reduced Amount"
            elif 'additional evidence' in text_lower or 'further review' in text_lower:
                verdict = "NEEDS_EVIDENCE"
                verdict_label = "Recommend Additional Evidence"
            elif 'decline' in text_lower:
                verdict = "DECLINE"
                verdict_label = "Recommend Decline"
        
        # === Extract Strong Points ===
        strong_point_headings = [
            "what's strong",
            "strengths",
            "strong points",
            "positive factors",
            "supporting evidence",
            "what supports approval",
        ]
        strong_points = _extract_section_lines(text, strong_point_headings)
        
        # === Extract Concerns ===
        concern_headings = [
            "what's concerning",
            "concerns",
            "weaknesses",
            "risk factors",
            "negative factors",
            "what suggests caution",
            "areas of concern",
        ]
        concerns = _extract_section_lines(text, concern_headings)
        
        # === Extract Missing Evidence ===
        missing_headings = [
            "data gaps",
            "missing evidence",
            "gaps reducing confidence",
            "missing data",
            "evidence gaps",
            "uncertainties",
            "what's missing",
            "further evidence needed",
        ]
        missing_evidence = _extract_section_lines(text, missing_headings)
        
        return {
            "verdict": verdict,
            "verdict_label": verdict_label,
            "strong_points": strong_points,
            "concerns": concerns,
            "missing_evidence": missing_evidence,
        }
        
    except Exception:
        # Defensive: never crash, return safe defaults
        return {
            "verdict": "UNKNOWN",
            "verdict_label": "Unable to Determine Recommendation",
            "strong_points": [],
            "concerns": [],
            "missing_evidence": [],
        }
