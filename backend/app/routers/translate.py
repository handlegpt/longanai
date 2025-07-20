from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import openai
import os
from app.core.config import settings

router = APIRouter()

class TranslationRequest(BaseModel):
    text: str
    targetLanguage: str = "cantonese"

class TranslationResponse(BaseModel):
    translatedText: str
    originalText: str
    targetLanguage: str

@router.post("/translate", response_model=TranslationResponse)
async def translate_text(request: TranslationRequest):
    """Translate text to Cantonese using GPT"""
    try:
        # Check if OpenAI API key is configured
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="OpenAI API key not configured")
        
        # Configure OpenAI client
        openai.api_key = api_key
        
        # Create prompt for Cantonese translation
        prompt = f"""请将以下内容翻译成粤语，适合朗读：

原文：{request.text}

请翻译成地道的粤语口语，保持原文的意思和情感，但要符合粤语的表达习惯。"""

        # Call OpenAI API
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "你是一个专业的粤语翻译专家，擅长将普通话翻译成地道的粤语口语。"},
                {"role": "user", "content": prompt}
            ],
            max_tokens=1000,
            temperature=0.7
        )
        
        translated_text = response.choices[0].message.content.strip()
        
        return TranslationResponse(
            translatedText=translated_text,
            originalText=request.text,
            targetLanguage=request.targetLanguage
        )
        
    except Exception as e:
        print(f"翻译失败: {str(e)}")
        raise HTTPException(status_code=500, detail=f"翻译失败: {str(e)}") 