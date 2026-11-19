def test_auth_module_loads():
    from services.auth_service import get_password_hash
    assert get_password_hash("password")
