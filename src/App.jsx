import React, { useState } from 'react';

// 💡 API Key จะถูกดึงมาจากไฟล์ .env.local โดยใช้ Vite
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const MODEL_NAME = "gemini-2.0-flash";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;


const App = () => {
    const [prompt, setPrompt] = useState('สร้างสโลแกนขายมือถือสั้นๆ');
    const [result, setResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // --- Helper Function: การโทรหา Gemini API ---
    const callGeminiAPI = async () => {
        if (!API_KEY) {
            setError("❌ API Key ไม่ถูกโหลด! กรุณาตรวจสอบ .env.local");
            return;
        }
        if (!prompt.trim()) {
            setError("❌ กรุณาป้อนข้อความก่อน");
            return;
        }

        setIsLoading(true);
        setError(null);
        setResult('');

        const payload = {
            contents: [{ parts: [{ text: prompt }] }],
            // เราจะขอให้ AI ตอบกลับเป็นข้อความธรรมดา ไม่ใช่ JSON
            systemInstruction: {
                parts: [{ text: "คุณคือผู้เชี่ยวชาญด้านการตลาด ตอบกลับด้วยคำตอบที่กระชับและสร้างสรรค์ในภาษาไทยเท่านั้น" }]
            }
        };

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                // หากเกิดข้อผิดพลาด HTTP (เช่น 400, 403, 500)
                const errorBody = await response.json();
                throw new Error(`HTTP Error ${response.status}: ${errorBody.error?.message || response.statusText}`);
            }

            const data = await response.json();
            
            const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
            
            if (generatedText) {
                setResult(generatedText);
            } else {
                setResult('⚠️ ไม่พบการตอบกลับที่ถูกต้องจาก AI (อาจเป็นเพราะ Safety Block)');
            }

        } catch (e) {
            console.error("API Call Error:", e);
            if (e.message.includes("400")) {
                setError(`⛔️ ข้อผิดพลาด 400: API Key อาจผิดพลาด หรือ Request ไม่ถูกต้อง`);
            } else {
                setError(`⚠️ ข้อผิดพลาด: ${e.message}`);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 font-sans p-6 md:p-12">
            <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-2xl border border-gray-200">
                
                <h1 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3 text-orange-600">
                    🔬 API Connection Smoke Test
                </h1>

                {/* Input Section */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">ป้อนคำสั่ง (Prompt)</label>
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        rows="3"
                        placeholder="เช่น: สร้างสคริปต์วิดีโอ 15 วินาที สำหรับขายมือถือรุ่นใหม่"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-gray-900"
                    />
                </div>

                {/* Action Button */}
                <button
                    onClick={callGeminiAPI}
                    disabled={isLoading}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-3 text-lg font-bold rounded-xl transition-all shadow-md active:scale-[0.98] ${
                        isLoading
                            ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                            : 'bg-orange-600 text-white hover:bg-orange-700 shadow-orange-300/50'
                    }`}
                >
                    {isLoading ? (
                        <>
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            กำลังเชื่อมต่อ...
                        </>
                    ) : (
                        "ส่งคำสั่งไป API"
                    )}
                </button>

                {/* Result Section */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-800 mb-3">ผลลัพธ์จากเซิร์ฟเวอร์:</h2>

                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded-lg mb-4">
                            {error}
                        </div>
                    )}
                    
                    {result && (
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 whitespace-pre-wrap text-gray-900 leading-relaxed">
                            {result}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default App;