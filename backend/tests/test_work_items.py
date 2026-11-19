def test_work_item_schema_loads():
    from schemas.work_item import WorkItemCreate
    assert WorkItemCreate(type="task", title="Example").title == "Example"
