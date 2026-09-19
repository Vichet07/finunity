"""
Test the debate pipeline end-to-end using fake evidence.
Run this FIRST with mock_mode=True (zero cost) before touching the real API.
"""

from debate_agents import run_advocate, run_skeptic, run_synthesis

FAKE_EVIDENCE = """
Farmer: Sok Dara, rice farmer, 1.2 hectares, Battambang province
Soil moisture: 28% (last reading 3 hours ago)
Battery: 3.9V (healthy)
Weather forecast: 15mm rain expected in next 7 days (below seasonal average)
NDVI trend: stable
Data quality: all sources fresh, no conflicts
"""

if __name__ == "__main__":
    MOCK = True  # set to False only once ready to spend real API credit

    print("=== ADVOCATE ===")
    advocate_result = run_advocate(FAKE_EVIDENCE, mock_mode=MOCK)
    print(advocate_result)

    print("\n=== SKEPTIC ===")
    skeptic_result = run_skeptic(FAKE_EVIDENCE, mock_mode=MOCK)
    print(skeptic_result)

    print("\n=== SYNTHESIS ===")
    synthesis_result = run_synthesis(advocate_result, skeptic_result, mock_mode=MOCK)
    print(synthesis_result)