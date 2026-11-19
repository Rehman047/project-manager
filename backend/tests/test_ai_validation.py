def test_ai_validation_module_loads():
    from ai.schemas import AITaskCreateRequest
    assert AITaskCreateRequest(prompt="task").prompt == "task"
