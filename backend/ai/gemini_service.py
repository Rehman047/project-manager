import logging
from ai.base import BaseAIService
from ai.fallback_service import FallbackAIService

logger = logging.getLogger(__name__)

class GeminiAIService(BaseAIService):
    """Provider boundary; fallback remains available when Gemini is unavailable."""
    def __init__(self, fallback=None):
        self.fallback = fallback or FallbackAIService()

    def create_task(self, *args, **kwargs):
        return self.fallback.create_task(*args, **kwargs)
    def breakdown_epic(self, *args, **kwargs):
        return self.fallback.breakdown_epic(*args, **kwargs)
    def plan_sprint(self, *args, **kwargs):
        return self.fallback.plan_sprint(*args, **kwargs)
    def detect_risks(self, *args, **kwargs):
        return self.fallback.detect_risks(*args, **kwargs)
    def generate_summary(self, *args, **kwargs):
        return self.fallback.generate_summary(*args, **kwargs)
