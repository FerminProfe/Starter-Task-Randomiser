/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { GoogleGenAI } from "@google/genai";
import Markdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Upload, 
  FileText, 
  X, 
  Loader2, 
  Sparkles, 
  GraduationCap, 
  Clock,
  RefreshCw,
  CheckCircle2,
  MessageSquare
} from 'lucide-react';

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface FileWithPreview extends File {
  preview?: string;
  content?: string;
  base64?: string;
}

const YEAR_GROUPS = [
  { label: 'Year 7 (11-12)', value: '7', age: '11-12' },
  { label: 'Year 8 (12-13)', value: '8', age: '12-13' },
  { label: 'Year 9 (13-14)', value: '9', age: '13-14' },
  { label: 'Year 10 (14-15)', value: '10', age: '14-15' },
  { label: 'Year 11 (15-16)', value: '11', age: '15-16' },
  { label: 'Year 12 (16-17)', value: '12', age: '16-17' },
  { label: 'Year 13 (17-18)', value: '13', age: '17-18' },
];

export default function App() {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [yearGroup, setYearGroup] = useState('7');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTask, setGeneratedTask] = useState<string | null>(null);
  const [customDescription, setCustomDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const newFiles = await Promise.all(
      acceptedFiles.map(async (file) => {
        const fileWithPreview = file as FileWithPreview;
        
        // Read file content
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          const base64Promise = new Promise<string>((resolve) => {
            reader.onload = () => {
              const base64 = (reader.result as string).split(',')[1];
              resolve(base64);
            };
            reader.readAsDataURL(file);
          });
          fileWithPreview.base64 = await base64Promise;
          fileWithPreview.preview = URL.createObjectURL(file);
        } else if (file.type === 'application/pdf' || file.type.startsWith('text/')) {
          // For simplicity in this demo, we'll try to read text files. 
          // PDF parsing usually requires a library, but Gemini can handle some text extraction if we send it.
          // Here we'll just read text files.
          if (file.type.startsWith('text/')) {
            const text = await file.text();
            fileWithPreview.content = text;
          }
        }
        return fileWithPreview;
      })
    );
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
      'text/*': ['.txt', '.md', '.csv'],
      'application/pdf': ['.pdf']
    }
  });

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const generateTask = async () => {
    if (files.length === 0) {
      setError("Please upload at least one file to generate a task.");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedTask(null);

    try {
      const selectedYear = YEAR_GROUPS.find(y => y.value === yearGroup);
      
      // Prepare parts for Gemini
      const parts: any[] = [
        { text: `You are an expert teacher. Based on the uploaded lesson materials, generate a starter task for students in Year ${yearGroup} (approx. ${selectedYear?.age} years old).
        The task must:
        1. Be engaging, appealing, and creative.
        2. Be completed in 10 minutes or less.
        3. Be relevant to the uploaded content.
        4. Be a 'starter' task (e.g., a hook, a quick recall quiz, a brain teaser, or a short application problem).
        5. Be formatted clearly in Markdown with a catchy title.
        6. Include clear instructions for the students.
        7. If there are multiple files, synthesize the key themes.
        ${customDescription ? `\nSPECIAL TEACHER REQUEST: The teacher has requested the following specific type of activity or focus: "${customDescription}". Please prioritize this request while still using the uploaded materials.` : ''}` }
      ];

      // Add file contents
      files.forEach(file => {
        if (file.base64) {
          parts.push({
            inlineData: {
              data: file.base64,
              mimeType: file.type
            }
          });
        } else if (file.content) {
          parts.push({ text: `Content from file ${file.name}:\n${file.content}` });
        } else {
          parts.push({ text: `Uploaded file: ${file.name} (Type: ${file.type})` });
        }
      });

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: { parts },
      });

      setGeneratedTask(response.text || "Failed to generate task. Please try again.");
    } catch (err) {
      console.error("Generation error:", err);
      setError("An error occurred while generating the task. Please check your connection and try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-[#1a1a1a] font-sans p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-12 text-center">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center justify-center p-3 bg-white rounded-2xl shadow-sm mb-4"
          >
            <Sparkles className="w-8 h-8 text-blue-600" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-bold tracking-tight mb-2"
          >
            Starter Task Randomiser
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-[#666] text-lg"
          >
            Upload your lesson materials and get a custom 10-minute starter.
          </motion.p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls Column */}
          <div className="lg:col-span-5 space-y-6">
            {/* Year Group Selection */}
            <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-4 text-blue-600">
                <GraduationCap className="w-5 h-5" />
                <h2 className="font-semibold uppercase tracking-wider text-xs">Target Year Group</h2>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {YEAR_GROUPS.map((yg) => (
                  <button
                    key={yg.value}
                    onClick={() => setYearGroup(yg.value)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      yearGroup === yg.value
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-100'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {yg.label}
                  </button>
                ))}
              </div>
            </section>

            {/* Custom Description */}
            <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-4 text-blue-600">
                <MessageSquare className="w-5 h-5" />
                <h2 className="font-semibold uppercase tracking-wider text-xs">Activity Preferences (Optional)</h2>
              </div>
              <textarea
                value={customDescription}
                onChange={(e) => setCustomDescription(e.target.value)}
                placeholder="e.g., 'Make it a quick debate', 'Focus on vocabulary', 'A multiple choice quiz'..."
                className="w-full h-24 p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
              />
            </section>

            {/* File Upload */}
            <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-4 text-blue-600">
                <Upload className="w-5 h-5" />
                <h2 className="font-semibold uppercase tracking-wider text-xs">Lesson Materials</h2>
              </div>
              
              <div 
                {...getRootProps()} 
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors ${
                  isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-2">
                    <Upload className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-sm font-medium">Drop files here or click to upload</p>
                  <p className="text-xs text-gray-400">PDF, Images, or Text files</p>
                </div>
              </div>

              {/* File List */}
              <AnimatePresence>
                {files.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 space-y-2"
                  >
                    {files.map((file, index) => (
                      <motion.div 
                        key={`${file.name}-${index}`}
                        initial={{ x: -10, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          {file.preview ? (
                            <img src={file.preview} alt="preview" className="w-8 h-8 rounded object-cover" />
                          ) : (
                            <FileText className="w-8 h-8 text-blue-500 p-1.5 bg-blue-50 rounded" />
                          )}
                          <span className="text-xs font-medium truncate">{file.name}</span>
                        </div>
                        <button 
                          onClick={() => removeFile(index)}
                          className="p-1 hover:bg-gray-200 rounded-full text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

            {/* Action Button */}
            <button
              onClick={generateTask}
              disabled={isGenerating || files.length === 0}
              className={`w-full py-4 rounded-3xl font-bold text-lg flex items-center justify-center gap-3 transition-all ${
                isGenerating || files.length === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200 active:scale-[0.98]'
              }`}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Generating Task...
                </>
              ) : (
                <>
                  <Sparkles className="w-6 h-6" />
                  Generate Starter Task
                </>
              )}
            </button>

            {error && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-500 text-sm text-center font-medium"
              >
                {error}
              </motion.p>
            )}
          </div>

          {/* Result Column */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 min-h-[500px] flex flex-col overflow-hidden">
              <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold uppercase tracking-wider text-xs">10-Minute Starter Task</span>
                </div>
                {generatedTask && (
                  <button 
                    onClick={generateTask}
                    className="p-2 hover:bg-white rounded-xl text-gray-400 hover:text-blue-600 transition-all"
                    title="Regenerate"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="flex-1 p-8 overflow-y-auto">
                <AnimatePresence mode="wait">
                  {isGenerating ? (
                    <motion.div 
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="h-full flex flex-col items-center justify-center text-center space-y-4"
                    >
                      <div className="relative">
                        <div className="w-16 h-16 border-4 border-blue-100 rounded-full animate-pulse" />
                        <Loader2 className="w-8 h-8 text-blue-600 animate-spin absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                      </div>
                      <div>
                        <p className="font-semibold text-lg">Analyzing your materials...</p>
                        <p className="text-sm text-gray-400">Crafting a perfect starter for Year {yearGroup}</p>
                      </div>
                    </motion.div>
                  ) : generatedTask ? (
                    <motion.div 
                      key="result"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="prose prose-blue max-w-none markdown-content"
                    >
                      <div className="flex items-center gap-2 text-green-600 mb-6 bg-green-50 w-fit px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                        <CheckCircle2 className="w-3 h-3" />
                        Task Ready
                      </div>
                      <Markdown>
                        {generatedTask}
                      </Markdown>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="h-full flex flex-col items-center justify-center text-center space-y-4 text-gray-300"
                    >
                      <Sparkles className="w-16 h-16 opacity-20" />
                      <div>
                        <p className="font-medium text-lg">No task generated yet</p>
                        <p className="text-sm">Upload materials and click generate to start.</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .markdown-content h1 {
          font-size: 2rem;
          font-weight: 800;
          margin-bottom: 1.5rem;
          color: #1a1a1a;
          line-height: 1.2;
        }
        .markdown-content h2 {
          font-size: 1.25rem;
          font-weight: 700;
          margin-top: 2rem;
          margin-bottom: 1rem;
          color: #2563eb;
        }
        .markdown-content p {
          margin-bottom: 1rem;
          line-height: 1.6;
          color: #4b5563;
        }
        .markdown-content ul, .markdown-content ol {
          margin-bottom: 1.5rem;
          padding-left: 1.5rem;
        }
        .markdown-content li {
          margin-bottom: 0.5rem;
          color: #4b5563;
        }
        .markdown-content blockquote {
          border-left: 4px solid #e5e7eb;
          padding-left: 1rem;
          font-style: italic;
          color: #6b7280;
          margin: 1.5rem 0;
        }
        .markdown-content strong {
          color: #111827;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}
