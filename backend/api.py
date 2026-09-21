"""
FinUnity API — Decision support endpoint for loan evaluation dashboard.
Integrates Advocate/Skeptic/Synthesis debate pipeline with scorecard extraction.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any

from agents.debate_agents import run_advocate, run_skeptic, run_synthesis
from agents.scorecard import extract_scorecard

app = FastAPI(title="FinUnity API")

# CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class EvidenceInput(BaseModel):
    """Input payload containing agricultural evidence for evaluation."""
    farmer_profile: Dict[str, Any]
    sensor_readings: Dict[str, Any]
    weather_data: Dict[str, Any]
    ndvi_data: Dict[str, Any]
    # Additional fields as needed


@app.post("/evaluate")
async def evaluate_farmer(evidence: EvidenceInput):
    """
    Run the full debate pipeline (Advocate → Skeptic → Synthesis)
    and extract a deterministic scorecard from the synthesis output.
    
    Returns:
    {
        "advocate": str,
        "skeptic": str,
        "synthesis": str,
        "scorecard": {
            "verdict": str,
            "verdict_label": str,
            "strong_points": List[str],
            "concerns": List[str],
            "missing_evidence": List[str],
        }
    }
    """
    try:
        # Format evidence for agent consumption
        evidence_text = _format_evidence(evidence)
        
        # Run debate pipeline
        advocate_output = run_advocate(evidence_text, mock_mode=True)
        skeptic_output = run_skeptic(evidence_text, mock_mode=True)
        synthesis_output = run_synthesis(advocate_output, skeptic_output, mock_mode=True)
        
        # Extract deterministic scorecard from synthesis text
        # This does NOT make any new LLM calls — pure string parsing
        scorecard = extract_scorecard(synthesis_output)
        
        return {
            "advocate": advocate_output,
            "skeptic": skeptic_output,
            "synthesis": synthesis_output,
            "scorecard": scorecard,
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Evaluation failed: {str(e)}")


def _format_evidence(evidence: EvidenceInput) -> str:
    """Format structured evidence into text for agent prompts."""
    lines = ["=== Farmer Profile ==="]
    for k, v in evidence.farmer_profile.items():
        lines.append(f"{k}: {v}")
    
    lines.append("\n=== Sensor Readings ===")
    for k, v in evidence.sensor_readings.items():
        lines.append(f"{k}: {v}")
    
    lines.append("\n=== Weather Data ===")
    for k, v in evidence.weather_data.items():
        lines.append(f"{k}: {v}")
    
    lines.append("\n=== NDVI Data ===")
    for k, v in evidence.ndvi_data.items():
        lines.append(f"{k}: {v}")
    
    return "\n".join(lines)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
