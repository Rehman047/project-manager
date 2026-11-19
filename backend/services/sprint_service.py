from models.work_item import WorkItem

def calculate_velocity(items: list[WorkItem]) -> int:
    return sum(item.story_points or 0 for item in items if item.status == "done")

def calculate_burndown(items: list[WorkItem]) -> int:
    return sum(item.story_points or 0 for item in items if item.status != "done")
