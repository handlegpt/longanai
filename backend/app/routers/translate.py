from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import openai
import google.generativeai as genai
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
    """Translate text to Cantonese using GPT-4 with fallback to Gemini Pro"""
    try:
        # Check if API keys are configured
        openai_api_key = os.getenv("OPENAI_API_KEY")
        gemini_api_key = os.getenv("GOOGLE_API_KEY")
        
        if not openai_api_key and not gemini_api_key:
            raise HTTPException(status_code=500, detail="No translation API keys configured")
        
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

        translated_text = None
        
        # Try GPT-4 first
        if openai_api_key:
            try:
                print("尝试使用 GPT-4 进行翻译...")
                openai.api_key = openai_api_key
                
                response = openai.ChatCompletion.create(
                    model="gpt-4",
                    messages=[
                        {"role": "system", "content": "你是一个专业的粤语翻译专家，精通粤语口语表达。你的任务是准确地将各种语言翻译成地道的粤语口语，保持原文的意思和情感，同时符合粤语的表达习惯。"},
                        {"role": "user", "content": prompt}
                    ],
                    max_tokens=1500,
                    temperature=0.3,
                    top_p=0.9
                )
                
                translated_text = response.choices[0].message.content.strip()
                print("使用 GPT-4 翻译成功")
                
            except Exception as e:
                print(f"使用 GPT-4 翻译失败: {str(e)}")
        
        # Try Gemini Pro if GPT-4 failed
        if not translated_text and gemini_api_key:
            try:
                print("尝试使用 Gemini Pro 进行翻译...")
                genai.configure(api_key=gemini_api_key)
                
                model = genai.GenerativeModel('gemini-pro')
                response = model.generate_content(prompt)
                
                translated_text = response.text.strip()
                print("使用 Gemini Pro 翻译成功")
                
            except Exception as e:
                print(f"使用 Gemini Pro 翻译失败: {str(e)}")
        
        if not translated_text:
            raise HTTPException(status_code=500, detail="所有翻译模型都失败了")
        
        return TranslationResponse(
            translatedText=translated_text,
            originalText=request.text,
            targetLanguage=request.targetLanguage
        )
        
    except Exception as e:
        print(f"翻译失败: {str(e)}")
        raise HTTPException(status_code=500, detail=f"翻译失败: {str(e)}")