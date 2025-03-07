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
MODEL_NAME = "microsoft/deberta-v3-large"
MODEL_DIR = "models/deberta-v3-large"

# Ensure model directory exists
os.makedirs(MODEL_DIR, exist_ok=True)

# Load or Download Model
MODEL_PATH = os.path.join(MODEL_DIR, "model")

if not os.path.exists(MODEL_PATH):
    print("🔹 Downloading DeBERTa v3 Large model...")
    model = SentenceTransformer(MODEL_NAME)
    model.save(MODEL_PATH)
else:
    print("✅ Loading DeBERTa v3 Large model from local directory...")
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
def compare_candidate_to_job(job_position: str, job_description: str, candidate_data: Dict[str, str]) -> float:
    job_text = f"{job_position} {job_description}".lower()
    overall_score = 0.0
    for field, weight in WEIGHTS.items():
        if field == "educationQualification":
            education_score = match_education(candidate_data["educationQualification"], candidate_data["educationQualificationRequired"])
            overall_score += education_score * weight
            continue
        text = candidate_data.get(field, "").lower()
        if not text:
            continue  
        job_embedding = model.encode([job_text], convert_to_tensor=True)
        candidate_embedding = model.encode([text], convert_to_tensor=True)
        similarity_score = cosine_similarity(
            job_embedding.cpu().detach().numpy(),
            candidate_embedding.cpu().detach().numpy()
        )[0][0] * 100
        overall_score += similarity_score * weight
    return round(overall_score, 2)

# Save candidate evaluation results
def save_evaluation_data(candidate_email: str, evaluation_data: Dict[str, str]):
    eval_file_path = os.path.join(UPLOAD_DIR, f"{candidate_email}_evaluation.json")
    with open(eval_file_path, "w") as f:
        json.dump(evaluation_data, f, indent=4)

# Endpoint for FormData (for example, used by your frontend)
@app.post("/rank_candidate/")
async def rank_candidate(
    job_position: str = Form(...),
    job_description: str = Form(...),
    candidate_email: str = Form(...),
    skills: str = Form(...),
    specialization: str = Form(...),
    responsibilities: Optional[str] = Form("Not Specified"),
    totalYearsOfExperience: Optional[str] = Form("Not Specified"),
    requiredExperience: Optional[str] = Form("Not Specified"),
    skillsRequired: Optional[str] = Form("Not Specified"),
    educationQualificationRequired: Optional[str] = Form("Not Specified"),
    educationQualification: str = Form("Not Specified")
):
    # Debug: Log all incoming form fields
    print("----- Received Form Data -----")
    print("job_position:", job_position)
    print("job_description:", job_description)
    print("candidate_email:", candidate_email)
    print("skills:", skills)
    print("specialization:", specialization)
    print("responsibilities:", responsibilities)
    print("totalYearsOfExperience:", totalYearsOfExperience)
    print("requiredExperience:", requiredExperience)
    print("skillsRequired:", skillsRequired)
    print("educationQualificationRequired:", educationQualificationRequired)
    print("educationQualification:", educationQualification)
    print("----- End Received Form Data -----")
    
    candidate_data = {
        "email": candidate_email,
        "skills": skills,
        "specialization": specialization,
        "educationQualification": educationQualification,
        "responsibilities": responsibilities,
        "totalYearsOfExperience": totalYearsOfExperience,
        "requiredExperience": requiredExperience,
        "skillsRequired": skillsRequired,
        "educationQualificationRequired": educationQualificationRequired
    }
    candidate_evaluation = compare_candidate_to_job(job_position, job_description, candidate_data)
    evaluation_result = {
        "email": candidate_email,
        "job_position": job_position,
        "similarity_score": candidate_evaluation
    }
    save_evaluation_data(candidate_email, evaluation_result)
    return {"candidateEvaluation": candidate_evaluation, "educationQualification": educationQualification}

# Endpoint for JSON-based input (if needed)
@app.post("/rank_candidate_json/")
async def rank_candidate_json(
    job_position: str,
    job_description: str,
    candidate_email: str,
    skills: str,
    specialization: str,
    responsibilities: Optional[str] = "Not Specified",
    totalYearsOfExperience: Optional[str] = "Not Specified",
    requiredExperience: Optional[str] = "Not Specified",
    skillsRequired: Optional[str] = "Not Specified",
    educationQualificationRequired: Optional[str] = "Not Specified",
    educationQualification: List[Dict[str, str]] = Body([])
):
    formatted_education = ", ".join([
        f"{edu['field']} in {edu.get('fieldOfStudy', 'N/A')} ({edu['schoolName']}, {edu['yearOfPassing']})"
        for edu in educationQualification
    ])
    candidate_data = {
        "email": candidate_email,
        "skills": skills,
        "specialization": specialization,
        "educationQualification": formatted_education,
        "responsibilities": responsibilities,
        "totalYearsOfExperience": totalYearsOfExperience,
        "requiredExperience": requiredExperience,
        "skillsRequired": skillsRequired,
        "educationQualificationRequired": educationQualificationRequired
    }
    candidate_evaluation = compare_candidate_to_job(job_position, job_description, candidate_data)
    return {"candidateEvaluation": candidate_evaluation, "formattedEducation": formatted_education}

# Run FastAPI
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
