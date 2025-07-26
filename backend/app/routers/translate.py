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
        prompt = f"""请将以下内容【强制翻译成粤语口语】，适合朗读：

原文：{request.text}

要求：
1. 只输出粤语翻译结果，不能输出英文或普通话原文。
2. 必须使用粤语口语表达，不能夹杂英文或普通话。
3. 保持原文意思和情感。
4. 适合朗读，语言流畅自然。
5. 只输出翻译后的粤语内容，不要任何解释或其它语言。

【粤语翻译】：
"""

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
                
                # 验证翻译结果是否包含粤语特征
                if translated_text:
                    cantonese_indicators = ['嘅', '咗', '咁', '唔', '係', '喺', '嘅', '喇', '嘢', '咩', '點', '邊', '乜']
                    has_cantonese = any(indicator in translated_text for indicator in cantonese_indicators)
                    
                    if not has_cantonese:
                        print(f"警告：GPT-4翻译结果可能不是粤语: {translated_text}")
                
            except Exception as e:
                print(f"使用 GPT-4 翻译失败: {str(e)}")
        
        # Try Gemini Pro if GPT-4 failed
        if not translated_text and gemini_api_key:
            try:
                print("尝试使用 Gemini Pro 进行翻译...")
                genai.configure(api_key=gemini_api_key)
                
                model = genai.GenerativeModel('gemini-pro')
                response = model.generate_content([
                    "你是一个专业的粤语翻译专家，只能用粤语回答。",
                    prompt
                ])
                
                translated_text = response.text.strip()
                print("使用 Gemini Pro 翻译成功")
                
                # 验证翻译结果是否包含粤语特征
                if translated_text:
                    cantonese_indicators = ['嘅', '咗', '咁', '唔', '係', '喺', '嘅', '喇', '嘢', '咩', '點', '邊', '乜']
                    has_cantonese = any(indicator in translated_text for indicator in cantonese_indicators)
                    
                    if not has_cantonese:
                        print(f"警告：Gemini Pro翻译结果可能不是粤语: {translated_text}")
                
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