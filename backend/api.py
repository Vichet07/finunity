from fastapi import FastAPI
from pydantic import BaseModel
from agents.debate_agents import run_advocate, run_skeptic, run_synthesis
from agents.scorecard import extract_scorecard

app = FastAPI()


class EvidenceInput(BaseModel):
    evidence: str
    mock_mode: bool = False


@app.post("/api/debate")
def get_debate(input: EvidenceInput):
    advocate = run_advocate(input.evidence, mock_mode=input.mock_mode)
    skeptic = run_skeptic(input.evidence, mock_mode=input.mock_mode)
    synthesis = run_synthesis(
        input.evidence,
        skeptic,
        mock_mode=input.mock_mode
    )

    scorecard = extract_scorecard(synthesis)

    return {
        "advocate": advocate,
        "skeptic": skeptic,
        "synthesis": synthesis,
        "scorecard": scorecard
    }