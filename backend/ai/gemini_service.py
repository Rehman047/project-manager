import json
import logging
import uuid

import requests

from ai.cache import get_cached_response, hash_prompt, save_cached_response
from ai.base import BaseAIService
from ai.fallback_service import FallbackAIService
from ai.schemas import (
    AIBreakdownItem,
    AIBreakdownResponse,
    AIRiskResponse,
    AISprintPlanResponse,
    AISummaryResponse,
    AITaskCreateResponse,
)
from config import settings

logger = logging.getLogger(__name__)

class GeminiAIService(BaseAIService):
    """Gemini-backed provider with cache and deterministic fallback."""
    def __init__(self, db=None, project_id: uuid.UUID | None = None, fallback=None):
        self.db = db
        self.project_id = project_id
        self.fallback = fallback or FallbackAIService()

    def _call(self, feature: str, payload: dict, response_model, prompt: str, fallback_result):
        prompt_hash = hash_prompt(feature, payload)
        if self.db is not None and self.project_id is not None:
            cached = get_cached_response(self.db, self.project_id, feature, prompt_hash)
            if cached:
                try:
                    parsed = response_model.model_validate(cached)
                    parsed.source = "cache"
                    return parsed
                except Exception:
                    logger.warning("Ignoring invalid cached response for %s", feature)

        if not settings.GEMINI_API_KEY:
            return fallback_result

        try:
            response = requests.post(
                "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent",
                params={"key": settings.GEMINI_API_KEY},
                json={
                    "contents": [{"parts": [{"text": prompt}]}],
                    "generationConfig": {"responseMimeType": "application/json", "temperature": 0.2},
                },
                timeout=20,
            )
            if not response.ok:
                raise RuntimeError(f"Gemini API returned {response.status_code}: {response.text[:200]}")
            data = response.json()
            text = data["candidates"][0]["content"]["parts"][0]["text"].strip()
            if text.startswith("```"):
                text = text.split("\n", 1)[1].rsplit("```", 1)[0].strip()
            parsed = response_model.model_validate(json.loads(text))
            parsed.source = "gemini"
            if self.db is not None and self.project_id is not None:
                save_cached_response(
                    self.db,
                    self.project_id,
                    feature,
                    prompt_hash,
                    parsed.model_dump(mode="json"),
                )
                self.db.commit()
            return parsed
        except Exception as exc:
            logger.warning("Gemini %s failed: %s", feature, exc)
            return fallback_result

    def create_task(self, prompt: str, *args, **kwargs):
        fallback = self.fallback.create_task(prompt)
        instruction = (
            "Convert this request into one project work item. Return strict JSON with title, description, "
            "type (epic/story/task/bug), priority (low/medium/high/urgent), story_points (integer), "
            "labels (string array), and source ('gemini'). Request: " + prompt
        )
        return self._call("create-task", {"prompt": prompt}, AITaskCreateResponse, instruction, fallback)

    def breakdown_epic(self, work_item, *args, **kwargs):
        fallback = self.fallback.breakdown_epic(work_item)
        payload = {"work_item_id": str(work_item.id)}
        instruction = (
            "Break this project work item into 4-5 actionable subtasks. Return strict JSON with parent_id "
            f"'{work_item.id}', items containing title, description, type, priority, story_points, labels, "
            f"and source 'gemini'. Work item title: {work_item.title}. Description: {work_item.description or ''}"
        )
        return self._call("breakdown-epic", payload, AIBreakdownResponse, instruction, fallback)

    def plan_sprint(self, items, capacity_points: int, *args, **kwargs):
        fallback = self.fallback.plan_sprint(items, capacity_points)
        payload = {"capacity_points": capacity_points, "item_ids": [str(item.id) for item in items]}
        work_items = [{"id": str(item.id), "title": item.title, "priority": item.priority, "story_points": item.story_points} for item in items]
        instruction = (
            f"Plan a sprint for capacity {capacity_points}. Choose items greedily by priority and fit. "
            "Return strict JSON with recommended_items (work_item_id, title, story_points, priority, reason), "
            "total_points, rationale, and source 'gemini'. Available items: " + json.dumps(work_items)
        )
        return self._call("plan-sprint", payload, AISprintPlanResponse, instruction, fallback)

    def detect_risks(self, items, *args, **kwargs):
        fallback = self.fallback.detect_risks(items)
        payload = {"item_ids": [str(item.id) for item in items]}
        work_items = [{
            "id": str(item.id), "title": item.title, "status": item.status, "priority": item.priority,
            "assignee_id": str(item.assignee_id) if item.assignee_id else None,
            "story_points": item.story_points, "due_date": str(item.due_date) if item.due_date else None,
        } for item in items]
        instruction = (
            "Detect delivery risks from these work items. Return strict JSON with risks (severity "
            "low/medium/high, category, title, description, affected_item_ids, mitigation), health_score "
            "(0-100), and source 'gemini'. Items: " + json.dumps(work_items)
        )
        return self._call("detect-risks", payload, AIRiskResponse, instruction, fallback)

    def generate_summary(self, items, *args, **kwargs):
        fallback = self.fallback.generate_summary(items)
        payload = {"item_ids": [str(item.id) for item in items]}
        work_items = [{"title": item.title, "status": item.status, "priority": item.priority} for item in items]
        instruction = (
            "Generate a concise stand-up summary from these work items. Return strict JSON with headline, "
            "completed_highlights, in_progress_highlights, blockers, standup_markdown, and source 'gemini'. "
            "Items: " + json.dumps(work_items)
        )
        return self._call("generate-summary", payload, AISummaryResponse, instruction, fallback)
