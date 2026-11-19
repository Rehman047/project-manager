def test_sprint_service_module_loads():
    from services.sprint_service import calculate_velocity
    assert calculate_velocity([]) == 0
