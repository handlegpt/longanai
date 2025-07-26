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
    """Translate text to Cantonese using GPT-4"""
    try:
        # Check if OpenAI API key is configured
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="OpenAI API key not configured")
        
        # Configure OpenAI client
        openai.api_key = api_key
        
        # Create improved prompt for Cantonese translation
        prompt = f"""请将以下内容翻译成地道的粤语口语，适合朗读：

原文：{request.text}

要求：
1. 翻译成地道的粤语口语，不是普通话
2. 保持原文的意思和情感
3. 使用粤语特有的词汇和表达方式
4. 适合朗读，语言流畅自然
5. 如果是英文，请翻译成粤语；如果是普通话，请翻译成粤语

请直接输出翻译结果，不要添加任何解释。"""

        # Call OpenAI API with GPT-4
        response = openai.ChatCompletion.create(
            model="gpt-4",  # 升级到GPT-4
            messages=[
                {"role": "system", "content": "你是一个专业的粤语翻译专家，精通粤语口语表达。你的任务是准确地将各种语言翻译成地道的粤语口语，保持原文的意思和情感，同时符合粤语的表达习惯。"},
                {"role": "user", "content": prompt}
            ],
            max_tokens=1500,  # 增加token数量
            temperature=0.3,   # 降低温度以获得更稳定的翻译
            top_p=0.9
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