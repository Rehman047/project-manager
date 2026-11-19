import hashlib
import json
import uuid
from sqlalchemy.orm import Session
from models.ai_log import AILog

def hash_prompt(feature: str, payload: object) -> str:
    return hashlib.sha256(json.dumps({"feature": feature, "payload": payload}, sort_keys=True, default=str).encode()).hexdigest()

def get_cached_response(db: Session, project_id: uuid.UUID, feature: str, prompt_hash: str) -> dict | None:
    log = db.query(AILog).filter(AILog.project_id == project_id, AILog.feature == feature,
                                 AILog.prompt_hash == prompt_hash).order_by(AILog.created_at.desc()).first()
    return log.response_json if log else None

def save_cached_response(db: Session, project_id: uuid.UUID, feature: str, prompt_hash: str, response_dict: dict) -> AILog:
    log = AILog(project_id=project_id, feature=feature, prompt_hash=prompt_hash, response_json=response_dict)
    db.add(log)
    db.flush()
    return log
