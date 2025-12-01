import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

import { 
    Loader2, Sparkles, X, Layers, Film, ArrowUp, Settings2, 
    Palette, Image as ImageIcon, PlusCircle, Video as VideoIcon, 
    MonitorPlay, Wand2, FileSpreadsheet, Package, Check, Play,Copy, Mic, 
    Zap, Brain, Megaphone, Clapperboard 
    // ลบ layout ออกแล้วครับ
} from "lucide-react"; 

import { useState, useEffect, useRef } from 'react';

// --- CONFIG ---
const SERVER_URL = "http://119.59.103.159:5000"; 

// --- STYLES ---
const STYLE_OPTIONS = [
    { id: 'funny', label: '😂 ตลก / แกงตัวเอง', desc: 'เน้นฮา พากย์เสียงหลง', color: 'from-yellow-400 to-orange-500' },
    { id: 'lifestyle', label: '✨ ชีวิตดี๊ดี / Vlog', desc: 'อวดไลฟ์สไตล์ คุมโทน', color: 'from-sky-400 to-blue-500' },
    { id: 'hard-sell', label: '🔥 ขายดุดัน', desc: 'โปรแรง รีบตำ', color: 'from-red-500 to-rose-600' },
    { id: 'story', label: '🎬 เล่าเรื่อง / Story', desc: 'มีจุดพีค มีตอนจบ', color: 'from-purple-600 to-slate-900' },
    { id: 'soft-sell', label: '🤫 ป้ายยาเนียนๆ', desc: 'เหมือนเพื่อนมาบอก', color: 'from-pink-400 to-rose-400' },
    { id: 'expert', label: '🧠 ผู้เชี่ยวชาญ', desc: 'ความรู้แน่นๆ', color: 'from-emerald-500 to-teal-700' },
];

// --- Helpers ---
const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = (error) => reject(error);
    });
};

// --- COMPONENTS ---

// 1. Style Card
const StyleCard = ({ item, isSelected, onClick }) => (
    <div onClick={() => onClick(item.label)} className={`relative p-3 rounded-xl border-2 cursor-pointer transition-all duration-300 overflow-hidden group ${isSelected ? 'border-orange-500 bg-orange-50 scale-[1.02] shadow-md' : 'border-gray-200 bg-white hover:border-orange-300'}`}>
        <div className={`absolute top-0 right-0 w-12 h-12 bg-gradient-to-br ${item.color} opacity-20 rounded-bl-full -mr-2 -mt-2`}></div>
        <h3 className="font-bold text-gray-800 text-xs md:text-sm relative z-10">{item.label}</h3>
        <p className="text-[10px] text-gray-500 mt-0.5 relative z-10">{item.desc}</p>
        {isSelected && <div className="absolute top-1 right-1 text-orange-600"><Check size={12} /></div>}
    </div>
);

// 2. Scene Card (Updated: ตัวหนังสือใหญ่ + ปุ่ม Copy Prompt)
const SceneCard = ({ scene, index, userImages, onRegenImage }) => {
    const isUserAsset = scene.asset_type === 'user_image';
    const assetIndex = scene.asset_index - 1; 
    const displayImage = (isUserAsset && userImages[assetIndex]) ? userImages[assetIndex] : null;

    // ฟังก์ชัน Copy Prompt ภาษาอังกฤษ
    const handleCopyPrompt = () => {
        if (scene.visual_prompt_en) {
            navigator.clipboard.writeText(scene.visual_prompt_en);
            alert(`คัดลอก Prompt แล้ว: \n"${scene.visual_prompt_en}"`);
        } else {
            alert("ไม่มี Prompt ภาษาอังกฤษสำหรับ Scene นี้");
        }
    };

    return (
        <div className="min-w-[280px] w-[280px] bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm flex flex-col hover:shadow-md transition-all group">
            {/* Header */}
            <div className="bg-gray-800 px-3 py-2 flex justify-between items-center">
                <span className="text-xs font-bold text-white">SCENE {index + 1}</span>
                <span className="text-xs text-gray-300">{(index * 3)}s - {(index * 3) + 3}s</span>
            </div>
            
            {/* Visual Area */}
            <div className="aspect-video bg-slate-50 relative border-b border-gray-100 overflow-hidden flex items-center justify-center group/visual">
                 {displayImage ? (
                     <>
                        <img src={displayImage} className="w-full h-full object-cover" />
                        <div className="absolute top-2 right-2 bg-black/70 text-white text-[10px] px-2 py-1 rounded-md backdrop-blur-sm shadow-sm border border-white/20">
                            รูป User #{scene.asset_index}
                        </div>
                     </>
                 ) : (
                     <div className="p-4 text-center w-full h-full flex flex-col items-center justify-center relative">
                        {/* Prompt Text (ขยายใหญ่ขึ้น) */}
                        <Wand2 size={24} className="text-orange-400 mb-2 opacity-50" />
                        <p className="text-xs text-gray-600 font-medium line-clamp-3 italic leading-relaxed px-2">
                            "{scene.visual_prompt_th}"
                        </p>
                        
                        {/* ปุ่ม Action */}
                        <div className="flex gap-2 mt-3">
                            <button 
                                onClick={() => onRegenImage(index, scene.visual_prompt_en)} 
                                className="bg-orange-600 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-orange-700 transition-colors shadow-sm font-bold flex items-center gap-1"
                            >
                                <Zap size={12} className="fill-white"/> สร้างภาพ (VPS)
                            </button>
                        </div>

                        {/* ปุ่ม Copy Prompt (ลอยอยู่มุมขวาบน) */}
                        <button 
                            onClick={handleCopyPrompt}
                            className="absolute top-2 right-2 bg-white/90 hover:bg-blue-50 text-gray-500 hover:text-blue-600 p-1.5 rounded-lg border border-gray-200 shadow-sm transition-all"
                            title="Copy English Prompt"
                        >
                            <Copy size={14} />
                        </button>
                     </div>
                 )}
            </div>

            {/* Script Area */}
            <div className="p-4 bg-white flex-1 flex flex-col justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Mic size={14} className="text-orange-600" />
                        <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">บทพากย์ (TH)</span>
                    </div>
                    {/* Voiceover Text (ขยายใหญ่ขึ้น) */}
                    <p className="text-sm text-gray-900 font-medium leading-relaxed font-sans">
                        "{scene.voiceover}"
                    </p>
                </div>
            </div>
        </div>
    );
};

// 3. Script Row
const ResultRow = ({ script, index, userImages, onExportCSV }) => {
    return (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden mb-6 animate-slide-up">
            <div className="p-4 bg-white border-b border-gray-100 flex justify-between items-start gap-3">
                <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center font-bold text-sm shadow-md">
                        #{index + 1}
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 text-base">{script.concept_name}</h3>
                        <p className="text-xs text-orange-600 font-bold mt-0.5">🔥 Hook: {script.hook}</p>
                    </div>
                </div>
                <button onClick={() => onExportCSV(script, index)} className="text-gray-500 hover:text-green-600 transition-colors">
                    <FileSpreadsheet size={18} />
                </button>
            </div>

            <div className="px-4 py-2 bg-slate-50 border-b border-gray-100 text-xs text-gray-600 flex gap-2 items-center">
                <Brain size={14} className="text-indigo-500 shrink-0"/>
                <span className="italic truncate">"{script.insight}"</span>
            </div>

            <div className="p-4 bg-white overflow-x-auto custom-scrollbar">
                <div className="flex gap-3 items-stretch">
                    <div className="min-w-[60px] flex flex-col justify-center items-center opacity-30">
                        <Play size={16} className="text-gray-400 mb-1"/>
                        <span className="text-[9px] font-bold text-gray-400">START</span>
                    </div>

                    {(script.scenes || []).map((scene, i) => (
                        <SceneCard 
                            key={i} 
                            scene={scene} 
                            index={i} 
                            userImages={userImages}
                            onRegenImage={(idx, prompt) => alert(`[VPS REQUEST]\nGenerating Scene ${idx+1}...\nPrompt: ${prompt}`)} 
                        />
                    ))}

                    <div className="min-w-[60px] flex flex-col justify-center items-center opacity-30">
                        <Package size={16} className="text-gray-400 mb-1"/>
                        <span className="text-[9px] font-bold text-gray-400">END</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- MAIN APP ---
const App = () => {
    const [topic, setTopic] = useState('');
    const [style, setStyle] = useState(''); 
    const [selectedImages, setSelectedImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [videoFile, setVideoFile] = useState(null);
    const [videoPreview, setVideoPreview] = useState(null);
    const [processedVideoUrl, setProcessedVideoUrl] = useState(null);
    const [scriptList, setScriptList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState(0); 
    const [error, setError] = useState(null);
    const [statusText, setStatusText] = useState('');

    const fileInputRef = useRef(null);
    const videoInputRef = useRef(null);
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY; 

    const handleImageSelect = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + selectedImages.length > 5) return alert("สูงสุด 5 รูป");
        setSelectedImages([...selectedImages, ...files]);
        setImagePreviews([...imagePreviews, ...files.map(f => URL.createObjectURL(f))]);
    };

    const handleVideoSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setVideoFile(file);
        setVideoPreview(URL.createObjectURL(file));
        setProcessedVideoUrl(null);
    };

    const handleExportCSV = (script, index) => {
        let csvContent = "\uFEFFShot_ID,Visual_Instruction,Voiceover_TH\n";
        script.scenes.forEach((scene, i) => {
            const visual = scene.asset_type === 'user_image' ? `ใช้รูป User ที่ ${scene.asset_index}` : `Gen ใหม่: ${scene.visual_prompt_th}`;
            csvContent += `${i+1},"${visual}","${scene.voiceover}"\n`;
        });
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `storyboard_${index+1}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
const handleGenerateScript = async () => {
        if (!apiKey) return setError('⚠️ API Key ไม่ถูกต้อง');
        if (!topic.trim() && selectedImages.length === 0 && !videoFile) return setError('กรุณาใส่ข้อมูล: ข้อความ, รูปภาพ หรือ วิดีโอ อย่างใดอย่างหนึ่ง');
        
        setScriptList([]); setError(null); setIsLoading(true); setProgress(0);
        
        try {
            const hasText = !!topic.trim();
            const hasImages = selectedImages.length > 0;
            const hasVideo = !!videoFile;
            
            let scenarioMode = "TEXT_ONLY";
            if (hasImages && hasVideo) scenarioMode = "MIXED_MEDIA";
            else if (hasImages) scenarioMode = "IMAGES_ONLY";
            else if (hasVideo) scenarioMode = "VIDEO_ONLY";

            setStatusText(`กำลังสร้าง Storyboard ที่ดีที่สุด...`); // เปลี่ยนข้อความให้ดู Exclusive

            // ปรับ Progress Bar ให้สมูทขึ้นสำหรับ 1 คลิป
            const interval = setInterval(() => setProgress(p => p < 90 ? p + 10 : p), 500);

            const contentParts = [{ text: `โหมดการทำงาน: ${scenarioMode}\nหัวข้อ/โจทย์: "${topic}"\nสไตล์: "${style || 'ทั่วไป'}"` }];
            for (const file of selectedImages) {
                contentParts.push({ inline_data: { mime_type: file.type, data: await fileToBase64(file) } });
            }
            if (hasVideo) {
                 contentParts.push({ text: "[USER UPLOADED A VIDEO FILE - Treat as a primary footage asset]" });
            }

            const systemPrompt = `
                คุณคือ AI Creative Director มือหนึ่ง หน้าที่คือ "สร้าง Storyboard คลิปสั้น" ที่ดีที่สุดเพียง 1 แบบ
                
                **เงื่อนไขสำคัญ (Rules):**
                1. **Focus:** ขอ Storyboard แค่ 1 ชุด (1 Concept) ที่คุณคิดว่า "ปังที่สุด" และ "ตรงโจทย์ที่สุด" ห้ามทำเผื่อเลือก
                2. **Strict Flow:** ต้องมีการเรียงลำดับภาพ (Sequencing) ตัดสลับฉาก 3-5 Scenes ห้ามแช่ภาพเดียวนานๆ
                3. **Assets:**
                   - มีรูป/วิดีโอมา: ต้องระบุว่าจะใช้รูปไหนในวินาทีไหน
                   - ไม่มีรูป: ต้องเขียน Prompt (EN) สำหรับสร้างภาพให้ละเอียด
                
                **กระบวนการคิด (The 3-Role Brain):**
                1. **Analyst:** หาจุดขายที่แข็งแรงที่สุดเพียงจุดเดียว
                2. **Marketer:** คิด Hook ประโยคเดียวที่หยุดคนดูได้ทันที
                3. **Director:** กำกับภาพและเสียง เขียนบทพากย์ภาษาพูด (Thai Spoken Language) ที่ลื่นไหล เป็นธรรมชาติที่สุด

                **Output Structure (JSON Array with 1 Item):**
                [
                  {
                    "concept_name": "ชื่อคอนเซปต์",
                    "insight": "จุดขายหลัก",
                    "hook": "ประโยคเปิด",
                    "scenes": [ ... ],
                    "hashtags": [ ... ]
                  }
                ]
            `;

            const responseSchema = {
                type: SchemaType.ARRAY,
                items: {
                    type: SchemaType.OBJECT,
                    properties: {
                        concept_name: { type: SchemaType.STRING },
                        insight: { type: SchemaType.STRING },
                        hook: { type: SchemaType.STRING },
                        scenes: { 
                            type: SchemaType.ARRAY, 
                            items: {
                                type: SchemaType.OBJECT,
                                properties: {
                                    asset_type: { type: SchemaType.STRING, enum: ["user_image", "user_video", "generated"] },
                                    asset_index: { type: SchemaType.NUMBER, description: "ลำดับรูป User (เริ่มที่ 1)" },
                                    visual_prompt_th: { type: SchemaType.STRING },
                                    visual_prompt_en: { type: SchemaType.STRING },
                                    voiceover: { type: SchemaType.STRING }
                                },
                                required: ["asset_type", "voiceover"]
                            }
                        },
                        hashtags: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }
                    },
                    required: ["concept_name", "insight", "hook", "scenes"]
                }
            };

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify({
                    contents: [{ role: "user", parts: contentParts }],
                    generationConfig: { 
                        responseMimeType: "application/json", 
                        responseSchema: responseSchema,
                        maxOutputTokens: 8192,
                        temperature: 0.8 // ลดความมั่วลงนิดนึง เพื่อให้ได้ผลลัพธ์ที่แม่นยำที่สุด
                    },
                    systemInstruction: { parts: [{ text: systemPrompt }] }
                })
            });
            
            clearInterval(interval);
            const result = await response.json();
            const jsonText = result.candidates[0].content?.parts[0]?.text.replace(/```json|```/g, '').trim();
            
            // Logic: ตัดให้เหลือแค่ 1 อันเสมอ (กันเหนียว)
            const fullList = JSON.parse(jsonText);
            setScriptList(fullList.slice(0, 1)); 
            
            setProgress(100);

        } catch (error) {
            console.error(error);
            setError("Error: " + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8F9FA] font-sans text-gray-900 pb-20">
            <header className="bg-white sticky top-0 z-30 shadow-sm border-b border-gray-200">
                <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="bg-gradient-to-br from-orange-500 to-red-600 text-white p-2 rounded-xl"><Sparkles size={18}/></div>
                        <h1 className="text-lg font-black text-gray-900 tracking-tight">CONTENT <span className="text-orange-600">FACTORY</span> AI</h1>
                    </div>
                    <div className="text-[10px] font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded border border-gray-200">
                        VER 4.0: STORYTELLING MODE
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto p-4 md:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    <div className="lg:col-span-5 space-y-6">
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 space-y-5">
                            <h2 className="font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-3">
                                <Settings2 size={18} className="text-orange-500"/> ข้อมูลตั้งต้น (Input)
                            </h2>

                            <div>
                                <label className="text-xs font-bold text-gray-500 mb-1.5 block">1. โจทย์ / สินค้า / เรื่องที่อยากเล่า</label>
                                <textarea 
                                    value={topic} onChange={e => setTopic(e.target.value)}
                                    placeholder="เช่น รีวิวคอลลาเจนผิวใส, เที่ยวเชียงใหม่คนเดียว, บ่นเรื่องงาน..."
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-orange-500 outline-none h-24 resize-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-500 mb-1.5 block">2. รูปภาพประกอบ (ถ้ามี)</label>
                                <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                                    {imagePreviews.map((src, i) => (
                                        <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200 shrink-0">
                                            <img src={src} className="w-full h-full object-cover" />
                                            <button onClick={() => {
                                                const newImgs = [...selectedImages]; newImgs.splice(i, 1); setSelectedImages(newImgs);
                                                const newPrevs = [...imagePreviews]; newPrevs.splice(i, 1); setImagePreviews(newPrevs);
                                            }} className="absolute top-0 right-0 bg-red-500 text-white p-0.5"><X size={10}/></button>
                                        </div>
                                    ))}
                                    <button onClick={() => fileInputRef.current.click()} className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-orange-500 hover:text-orange-500 hover:bg-orange-50 transition-all shrink-0">
                                        <PlusCircle size={18} />
                                    </button>
                                </div>
                                <input type="file" multiple ref={fileInputRef} className="hidden" onChange={handleImageSelect} accept="image/*" />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-500 mb-1.5 block">3. วิดีโอ (ถ้ามี)</label>
                                {!videoFile ? (
                                    <div onClick={() => videoInputRef.current.click()} className="border-2 border-dashed border-blue-100 bg-blue-50/50 rounded-xl p-4 text-center cursor-pointer hover:bg-blue-50 transition-colors">
                                        <VideoIcon size={20} className="mx-auto text-blue-400 mb-1"/>
                                        <span className="text-xs text-blue-600 font-bold">คลิกอัปโหลดวิดีโอ</span>
                                    </div>
                                ) : (
                                    <div className="relative rounded-xl overflow-hidden bg-black border border-gray-200">
                                        <video src={videoPreview} className="w-full max-h-32 object-contain" />
                                        <button onClick={() => {setVideoFile(null); setVideoPreview(null)}} className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full"><X size={12}/></button>
                                    </div>
                                )}
                                <input type="file" ref={videoInputRef} onChange={handleVideoSelect} className="hidden" accept="video/*" />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-500 mb-1.5 block">4. สไตล์ (Mood)</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {STYLE_OPTIONS.map((opt) => (
                                        <StyleCard key={opt.id} item={opt} isSelected={style === opt.label} onClick={setStyle} />
                                    ))}
                                </div>
                            </div>

                            <button onClick={handleGenerateScript} disabled={isLoading} className="w-full py-3 bg-gray-900 text-white font-bold rounded-xl shadow-lg hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-70">
                                {isLoading ? <Loader2 className="animate-spin"/> : <Sparkles className="text-yellow-400 fill-yellow-400"/>}
                                {isLoading ? 'AI กำลังทำงาน...' : 'เริ่มสร้าง Storyboard'}
                            </button>
                        </div>
                    </div>

                    <div className="lg:col-span-7 space-y-6">
                        {scriptList.length > 0 ? (
                            <div className="animate-fade-in">
                                <div className="flex items-center gap-2 mb-4">
                                    <Clapperboard className="text-orange-600" size={24}/>
                                    <h2 className="text-xl font-black text-gray-900">STORYBOARD RESULTS</h2>
                                </div>
                                {scriptList.map((script, idx) => (
                                    <ResultRow 
                                        key={idx} 
                                        script={script} 
                                        index={idx} 
                                        userImages={imagePreviews}
                                        onExportCSV={handleExportCSV} 
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl min-h-[400px]">
                                <LayoutIcon size={48} className="mb-4 opacity-20"/>
                                <p className="text-sm font-medium">รอข้อมูลเพื่อสร้าง Storyboard...</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {isLoading && (
                <div className="fixed inset-0 bg-white/90 backdrop-blur-md z-50 flex flex-col items-center justify-center p-4">
                    <Loader2 size={48} className="text-orange-600 animate-spin mb-4" />
                    <h3 className="text-xl font-bold text-gray-900">AI Director Working...</h3>
                    <p className="text-sm text-gray-500 mt-1 mb-6 animate-pulse">{statusText}</p>
                    <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-orange-600 transition-all duration-300" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>
            )}
        </div>
    );
};

const LayoutIcon = ({size, className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
);

export default App;