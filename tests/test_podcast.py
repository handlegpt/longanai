import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root():
    """Test root endpoint"""
    response = client.get("/")
    assert response.status_code == 200
    assert "龙眼AI" in response.json()["message"]

def test_health():
    """Test health check endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_generate_podcast():
    """Test podcast generation"""
    data = {
        "text": "你好，这是一个测试播客。",
        "voice": "young-lady",
        "emotion": "normal",
        "speed": 1.0
    }
    response = client.post("/api/podcast/generate", json=data)
    assert response.status_code == 200
    assert "audioUrl" in response.json()

def test_get_history():
    """Test getting podcast history"""
    response = client.get("/api/podcast/history")
    assert response.status_code == 200
    assert "history" in response.json()

def test_invalid_voice():
    """Test invalid voice selection"""
    data = {
        "text": "测试文本",
        "voice": "invalid-voice",
        "emotion": "normal",
        "speed": 1.0
    }
    response = client.post("/api/podcast/generate", json=data)
    assert response.status_code == 400 