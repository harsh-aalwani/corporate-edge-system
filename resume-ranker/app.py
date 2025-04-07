import os
import json
import torch
import re
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from fastapi import FastAPI, Form, Body, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from typing import List, Dict, Optional
import uvicorn

# Define model directory
MODEL_NAME = "microsoft/deberta-v3-small"
MODEL_DIR = "models/deberta-v3-small"

# Ensure model directory exists
os.makedirs(MODEL_DIR, exist_ok=True)

# Load or Download Model
MODEL_PATH = os.path.join(MODEL_DIR, "model")

if not os.path.exists(MODEL_PATH):
    print("🔹 Downloading DeBERTa v3 Small model...")
    model = SentenceTransformer(MODEL_NAME)
    model.save(MODEL_PATH)
else:
    print("✅ Loading DeBERTa v3 Small model from local directory...")
    model = SentenceTransformer(MODEL_PATH)

print("✅ Model Loaded Successfully!")

# Initialize FastAPI app
app = FastAPI(title="Resume Ranking API", description="Ranks candidates based on job match similarity.")

UPLOAD_DIR = "uploads/Candidate/Evaluation"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Global Exception Handler for Validation Errors
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    print("Validation error:", exc.errors())
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors(), "body": exc.body},
    )

# Weight distribution for candidate fields
WEIGHTS = {
    "skills": 0.40,
    "specialization": 0.20,
    "educationQualification": 0.15,
    "responsibilities": 0.10,
    "totalYearsOfExperience": 0.15
}

# Function to check education qualification match
def match_education(candidate_education: str, required_education: str) -> float:
    required_list = required_education.lower().split(", ")
    candidate_text = candidate_education.lower()
    match_count = sum(1 for req in required_list if re.search(rf"\b{req.strip()}\b", candidate_text))
    return (match_count / max(1, len(required_list))) * 100

# Function to compare candidate data with job requirements
def compare_candidate_to_job(job_position: str, job_description: str, candidate_data: Dict[str, str]) -> Dict:
    job_text = f"{job_position} {job_description}".lower()
    detailed_scores = []
    overall_score = 0.0

    for field, weight in WEIGHTS.items():
        if field == "educationQualification":
            education_score = match_education(candidate_data["educationQualification"], candidate_data["educationQualificationRequired"])
            weighted_score = round(education_score * weight, 2)
        else:
            text = candidate_data.get(field, "").lower()
            if not text:
                weighted_score = 0.0
            else:
                job_embedding = model.encode([job_text], convert_to_tensor=True)
                candidate_embedding = model.encode([text], convert_to_tensor=True)
                similarity_score = cosine_similarity(
                    job_embedding.cpu().detach().numpy(),
                    candidate_embedding.cpu().detach().numpy()
                )[0][0] * 100
                weighted_score = round(similarity_score * weight, 2)

        detailed_scores.append({"criteria": field, "weightedScore": weighted_score})
        overall_score += weighted_score

    return {
        "candidateEvaluation": round(overall_score, 2),
        "detailedEvaluation": detailed_scores
    }

# Update API Endpoint to return detailed evaluation and exclude email
@app.post("/rank_candidate/")
async def rank_candidate(
    job_position: str = Form(...),
    job_description: str = Form(...),
    skills: str = Form(...),
    specialization: str = Form(...),
    responsibilities: Optional[str] = Form("Not Specified"),
    totalYearsOfExperience: Optional[str] = Form("Not Specified"),
    requiredExperience: Optional[str] = Form("Not Specified"),
    skillsRequired: Optional[str] = Form("Not Specified"),
    educationQualificationRequired: Optional[str] = Form("Not Specified"),
    educationQualification: str = Form("Not Specified")
):
    candidate_data = {
        "skills": skills,
        "specialization": specialization,
        "educationQualification": educationQualification,
        "responsibilities": responsibilities,
        "totalYearsOfExperience": totalYearsOfExperience,
        "requiredExperience": requiredExperience,
        "skillsRequired": skillsRequired,
        "educationQualificationRequired": educationQualificationRequired
    }
    evaluation_results = compare_candidate_to_job(job_position, job_description, candidate_data)

    evaluation_result = {
        "job_position": job_position,
        "candidateEvaluation": evaluation_results["candidateEvaluation"],
        "detailedEvaluation": evaluation_results["detailedEvaluation"]
    }
    
    return evaluation_result

@app.get("/health")
async def health_check():
    try:
        return {"status": "ok", "message": "API is live"}
    except Exception as e:
        return {"status": "error", "message": f"Health check failed: {str(e)}"}

# Run FastAPI
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
