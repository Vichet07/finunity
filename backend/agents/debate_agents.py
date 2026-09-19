"""
Advocate, Skeptic, and Synthesis agents for FinUnity's loan debate layer.
"""

from kimi_client import call_kimi

ADVOCATE_INSTRUCTIONS = """
## Your role right now: Advocate
Argue FOR approving this farmer's financing request, using the strongest
supporting evidence below. Acknowledge weaknesses but frame toward approval.
"""

SKEPTIC_INSTRUCTIONS = """
## Your role right now: Skeptic
Argue AGAINST approving this farmer's financing request, using the most
concerning evidence below. Acknowledge strengths but frame toward caution.
"""

SYNTHESIS_INSTRUCTIONS = """
## Your role right now: Synthesis
You will be given an Advocate argument and a Skeptic argument. Produce a
balanced summary and a recommendation level for human review. Do not make
a final decision.
"""

def run_advocate(evidence: str, mock_mode: bool = True) -> str:
    return call_kimi(ADVOCATE_INSTRUCTIONS, evidence, mock_mode)

def run_skeptic(evidence: str, mock_mode: bool = True) -> str:
    return call_kimi(SKEPTIC_INSTRUCTIONS, evidence, mock_mode)

def run_synthesis(advocate_output: str, skeptic_output: str, mock_mode: bool = True) -> str:
    combined = f"Advocate argued:\n{advocate_output}\n\nSkeptic argued:\n{skeptic_output}"
    return call_kimi(SYNTHESIS_INSTRUCTIONS, combined, mock_mode)