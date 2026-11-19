import re
import uuid
from models.work_item import WorkItem
from ai.base import BaseAIService
from ai.schemas import *

class FallbackAIService(BaseAIService):
    def create_task(self, prompt: str, *args, **kwargs) -> AITaskCreateResponse:
        lower = prompt.lower()
        priority = "urgent" if any(x in lower for x in ("urgent", "asap", "critical")) else ("high" if any(x in lower for x in ("important", "high priority")) else "medium")
        kind = "bug" if any(x in lower for x in ("bug", "fix", "crash", "error")) else ("story" if "user" in lower else "task")
        points = max(1, min(13, (len(prompt) // 80) + 1))
        labels = re.findall(r"#([a-zA-Z0-9_-]+)", prompt)
        return AITaskCreateResponse(title=prompt.strip()[:80], description=prompt.strip(), type=kind, priority=priority, story_points=points, labels=labels, source="fallback")

    def breakdown_epic(self, work_item: WorkItem, *args, **kwargs) -> AIBreakdownResponse:
        parent_id = work_item.id
        names = [("Specification", "Define acceptance criteria and edge cases.", 2), ("Backend Implementation", "Implement the API and persistence changes.", 5), ("Frontend UI", "Build the user-facing interface and states.", 5), ("Testing and QA", "Add automated coverage and perform regression testing.", 3)]
        return AIBreakdownResponse(parent_id=parent_id, items=[AIBreakdownItem(title=f"{name}: {work_item.title}", description=desc, type="task", priority=work_item.priority if work_item.priority in ("low","medium","high","urgent") else "medium", story_points=points, labels=["ai-breakdown"]) for name, desc, points in names], source="fallback")

    def plan_sprint(self, items: list[WorkItem], capacity_points: int, *args, **kwargs) -> AISprintPlanResponse:
        weights = {"urgent": 4, "high": 3, "medium": 2, "low": 1}
        selected, total = [], 0
        for item in sorted(items, key=lambda x: (weights.get(x.priority, 2), -(x.story_points or 0)), reverse=True):
            points = item.story_points or 1
            if total + points <= capacity_points:
                selected.append(AISprintSuggestionItem(work_item_id=item.id, title=item.title, story_points=points, priority=item.priority, reason="Priority-weighted fit within capacity"))
                total += points
        return AISprintPlanResponse(recommended_items=selected, total_points=total, rationale="Selected highest-priority items using a capacity-bounded greedy strategy.", source="fallback")

    def detect_risks(self, items: list[WorkItem], *args, **kwargs) -> AIRiskResponse:
        risks = []
        for item in items:
            if item.assignee_id is None and item.priority in ("high", "urgent"):
                risks.append(AIRiskFlag(severity="high", category="ownership", title="Unassigned priority item", description=item.title, affected_item_ids=[item.id], mitigation="Assign an owner."))
            if (item.story_points or 0) >= 8:
                risks.append(AIRiskFlag(severity="medium", category="scope", title="Oversized story", description=item.title, affected_item_ids=[item.id], mitigation="Split into smaller items."))
        return AIRiskResponse(risks=risks, health_score=max(0, 100 - len(risks) * 10), source="fallback")

    def generate_summary(self, items: list[WorkItem], *args, **kwargs) -> AISummaryResponse:
        done = [i.title for i in items if i.status == "done"]
        active = [i.title for i in items if i.status == "in_progress"]
        blocked = [i.title for i in items if i.status == "review" or i.priority == "urgent"]
        lines = ["## Stand-up summary", f"**Completed:** {', '.join(done) or 'None'}", f"**In progress:** {', '.join(active) or 'None'}", f"**Blockers:** {', '.join(blocked) or 'None'}"]
        return AISummaryResponse(headline=f"{len(done)} completed, {len(active)} in progress", completed_highlights=done, in_progress_highlights=active, blockers=blocked, standup_markdown="\n".join(lines), source="fallback")
