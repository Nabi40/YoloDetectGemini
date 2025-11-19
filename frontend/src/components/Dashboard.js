'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const DETECT_ENDPOINT = process.env.NEXT_PUBLIC_DETECT_API || 'http://127.0.0.1:8000/api/detect/';

const annotatedPlaceholder =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'%3E%3Crect fill='%23f1f5f9' width='600' height='400'/%3E%3Crect x='80' y='120' width='180' height='160' fill='none' stroke='%2310b981' stroke-width='3' stroke-dasharray='8 4'/%3E%3Ctext x='90' y='145' font-family='Arial' font-size='14' font-weight='bold' fill='%2310b981'%3ECar (0.94)%3C/text%3E%3Crect x='340' y='80' width='140' height='180' fill='none' stroke='%232563eb' stroke-width='3' stroke-dasharray='8 4'/%3E%3Ctext x='350' y='105' font-family='Arial' font-size='14' font-weight='bold' fill='%232563eb'%3EPerson (0.89)%3C/text%3E%3Crect x='150' y='260' width='100' height='80' fill='none' stroke='%23f59e0b' stroke-width='3' stroke-dasharray='8 4'/%3E%3Ctext x='160' y='285' font-family='Arial' font-size='14' font-weight='bold' fill='%23f59e0b'%3EBike (0.87)%3C/text%3E%3Crect x='380' y='280' width='120' height='90' fill='none' stroke='%23ec4899' stroke-width='3' stroke-dasharray='8 4'/%3E%3Ctext x='390' y='305' font-family='Arial' font-size='14' font-weight='bold' fill='%23ec4899'%3ESign (0.76)%3C/text%3E%3Crect x='20' y='30' width='80' height='60' fill='none' stroke='%238b5cf6' stroke-width='3' stroke-dasharray='8 4'/%3E%3Ctext x='30' y='55' font-family='Arial' font-size='14' font-weight='bold' fill='%238b5cf6'%3ETree (0.82)%3C/text%3E%3C/svg%3E";

const defaultDetections = [
  { id: 'car', label: 'Car', confidence: 94, bbox: '(80, 120, 260, 280)', color: 'emerald' },
  { id: 'person', label: 'Person', confidence: 89, bbox: '(340, 80, 480, 260)', color: 'blue' },
  { id: 'bike', label: 'Bike', confidence: 87, bbox: '(150, 260, 250, 340)', color: 'amber' },
  { id: 'tree', label: 'Tree', confidence: 82, bbox: '(20, 30, 100, 90)', color: 'violet' },
  { id: 'sign', label: 'Sign', confidence: 76, bbox: '(380, 280, 500, 370)', color: 'pink' },
];

const initialChat = [
  {
    id: 1,
    author: 'user',
    text: 'What is the confidence score of the largest object?',
  },
  {
    id: 2,
    author: 'ai',
    text: 'Based on the detection results, the largest object is the Car with a bounding box of (80, 120, 260, 280), which has a confidence score of 94%.',
  },
  {
    id: 3,
    author: 'user',
    text: 'How many objects were detected with confidence above 85%?',
  },
  {
    id: 4,
    author: 'ai',
    text: 'There are 3 objects detected with confidence above 85%: Car (94%), Person (89%), and Bike (87%).',
  },
];

const gradientMap = {
  emerald: 'from-emerald-400 to-emerald-500',
  blue: 'from-blue-500 to-blue-600',
  amber: 'from-amber-400 to-amber-500',
  violet: 'from-violet-500 to-violet-600',
  pink: 'from-pink-500 to-pink-600',
};

const badgeMap = {
  emerald: 'bg-emerald-50 text-emerald-600',
  blue: 'bg-blue-50 text-blue-600',
  amber: 'bg-amber-50 text-amber-600',
  violet: 'bg-violet-50 text-violet-600',
  pink: 'bg-pink-50 text-pink-600',
};

const paletteKeys = Object.keys(gradientMap);

const tableHeaders = [
  { key: 'label', title: 'Object' },
  { key: 'confidence', title: 'Confidence' },
  { key: 'bbox', title: 'Bounding Box' },
];

function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-linear-to-br from-blue-600 to-blue-900 text-white">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M3 7V5a2 2 0 012-2h3l2-2h4l2 2h3a2 2 0 012 2v2" />
              <path d="M3 7h18v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              <circle cx="12" cy="13" r="3" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">AI Vision</p>
            <h1 className="text-xl font-bold text-slate-900">Realtime Detection Console</h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50">
            Logout
          </button>
          <div className="flex items-center gap-3 rounded-full border border-slate-100 bg-slate-50/80 px-3 py-2 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-pink-500 to-rose-600 text-sm font-semibold text-white">
              JD
            </div>
            <div className="hidden text-sm sm:block">
              <p className="font-semibold text-slate-900">John Doe</p>
              <p className="text-slate-500">john.doe@example.com</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default function Dashboard() {
  const [preview, setPreview] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [annotatedImage, setAnnotatedImage] = useState(annotatedPlaceholder);
  const [annotatedImageError, setAnnotatedImageError] = useState('');
  const [outputImage, setOutputImage] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'confidence', direction: 'desc' });
  const [messages, setMessages] = useState(initialChat);
  const [question, setQuestion] = useState('');
  const [customDetections, setCustomDetections] = useState(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionError, setDetectionError] = useState('');
  const fileInputRef = useRef(null);
  const chatEndRef = useRef(null);

  // Keep the detection results blank until the backend returns detections
  const detectionDataset = customDetections ?? [];

  const sortedResults = useMemo(() => {
    const data = [...detectionDataset];
    data.sort((a, b) => {
      const { key, direction } = sortConfig;
      const compare =
        key === 'confidence'
          ? a.confidence - b.confidence
          : key === 'label'
          ? a.label.localeCompare(b.label)
          : a.bbox.localeCompare(b.bbox);
      return direction === 'asc' ? compare : -compare;
    });
    return data;
  }, [detectionDataset, sortConfig]);

  const detectionCount = detectionDataset.length;
  const confidentObjects = detectionDataset.filter((item) => item.confidence >= 85).length;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFile = useCallback((file) => {
    if (!file?.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreview(event.target?.result?.toString() ?? '');
    };
    reader.readAsDataURL(file);
    setSelectedFile(file);
    setDetectionError('');
    setCustomDetections(null);
    setAnnotatedImage(annotatedPlaceholder);
  }, []);

  const handleDrop = useCallback(
    (event) => {
      event.preventDefault();
      setIsDragOver(false);
      const file = event.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'desc' };
    });
  };

  const normalizeDetections = useCallback((payload = []) => {
    return payload.map((item, index) => {
      // Handle confidence (backend may return 0-1 floats or 0-100 values)
      const rawConfidence = Number(item.confidence ?? 0);
      const percentage = rawConfidence > 1 ? rawConfidence : rawConfidence * 100;

      // label: prefer `class` (backend), then `label`, otherwise fallback
      const rawClass = item.class ?? item.label ?? `Object ${index + 1}`;
      const label = typeof rawClass === 'string' && rawClass.length > 0 ? `${rawClass.charAt(0).toUpperCase()}${rawClass.slice(1)}` : rawClass;

      // bbox: backend uses bbox_xyxy (array). Fall back to item.bbox if present.
      const rawBbox = item.bbox_xyxy ?? item.bbox ?? null;
      const bbox = Array.isArray(rawBbox) ? `(${rawBbox.map((n) => Math.round(Number(n) || 0)).join(', ')})` : rawBbox ?? 'N/A';

      const colorKey = gradientMap[item.color] ? item.color : paletteKeys[index % paletteKeys.length];

      return {
        id: item.id ?? `${label}-${index}`,
        label,
        confidence: Math.round(Math.max(0, Math.min(percentage, 100))),
        bbox,
        color: colorKey,
      };
    });
  }, []);

  const handleDetect = useCallback(async () => {
    if (!selectedFile) {
      setDetectionError('Please upload an image before running detection.');
      return;
    }

    try {
      setIsDetecting(true);
      setDetectionError('');

      const formData = new FormData();
      formData.append('image', selectedFile);

      const response = await fetch(DETECT_ENDPOINT, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(errorBody || 'Failed to run detection. Please try again.');
      }

      const data = await response.json();

      if (Array.isArray(data?.detections)) {
        setCustomDetections(normalizeDetections(data.detections));
      }

      if (typeof data?.annotated_image === 'string') {
        const annotated =
          data.annotated_image.startsWith('data:') || data.annotated_image.startsWith('http')
            ? data.annotated_image
            : `data:image/png;base64,${data.annotated_image}`;
        setAnnotatedImage(annotated);
        setAnnotatedImageError('');
      }
      if (typeof data?.output_image === 'string') {
        setOutputImage(data.output_image);
      }
    } catch (error) {
      setDetectionError(error instanceof Error ? error.message : 'Unexpected error while contacting the API.');
    } finally {
      setIsDetecting(false);
    }
  }, [normalizeDetections, selectedFile]);

  const handleQuestionSubmit = (event) => {
    event.preventDefault();
    if (!question.trim()) return;
    const trimmed = question.trim();
    const nextId = messages.length + 1;
    const topDetection = sortedResults[0];
    const aiReply = `The highest confidence object is ${topDetection.label} at ${topDetection.confidence}%. I can help you analyze coordinates ${topDetection.bbox}.`;

    setMessages((prev) => [
      ...prev,
      { id: nextId, author: 'user', text: trimmed },
      { id: nextId + 1, author: 'ai', text: aiReply },
    ]);
    setQuestion('');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-[family:'Inter',sans-serif] text-slate-900">
      <Header />

      <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8 lg:px-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-8 flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-blue-600 to-blue-800 text-white">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M3 7V5a2 2 0 012-2h14a2 2 0 012 2v2" />
                  <path d="M3 7h18v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                  <path d="M12 10v6" />
                  <path d="M9 13h6" />
                    </svg>
                </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Upload Image for Detection</h2>
                <p className="text-sm text-slate-500">PNG, JPG, JPEG up to 10MB supported.</p>
                </div>
            </div>
        </div>

          <div
            className={`rounded-2xl border-2 border-dashed p-10 text-center transition ${
              isDragOver ? 'border-blue-500 bg-blue-50/50' : 'border-slate-200 bg-slate-50'
            }`}
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-lg shadow-blue-500/20">
              <svg className="h-8 w-8 stroke-blue-600" viewBox="0 0 24 24" fill="none" strokeWidth={1.8}>
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                </div>
            <p className="text-lg font-semibold text-slate-900">Drop your image here</p>
            <p className="mt-1 text-sm text-slate-500">or click to browse from your device</p>
            <button
              type="button"
              title="Select image"
              aria-label="Select image"
              className="mt-6 rounded-xl bg-linear-to-r from-blue-600 to-blue-800 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition hover:-translate-y-0.5"
            >
                    Select Image
                </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              title="Upload image file"
              aria-label="Upload image file"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) handleFile(file);
              }}
            />
            </div>

          {preview && (
            <>
              <div className="mt-8 flex flex-col gap-6 lg:flex-row">
                <div className="flex-1 rounded-2xl border border-slate-200 bg-slate-100/60 p-4">
                  <img src={preview} alt="Preview" className="w-full rounded-xl object-contain" />
                </div>
                <div className="flex w-full flex-col gap-4 lg:w-64">
                  <button
                    type="button"
                    onClick={handleDetect}
                    disabled={isDetecting}
                    title="Detect objects"
                    aria-label="Detect objects"
                    className={`rounded-2xl px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition ${
                      isDetecting
                        ? 'cursor-not-allowed bg-emerald-400/70'
                        : 'bg-linear-to-r from-emerald-500 to-emerald-600 hover:-translate-y-0.5'
                    }`}
                  >
                    {isDetecting ? 'Detecting…' : 'Detect Objects'}
                  </button>
                  <button
                    title="Remove image"
                    aria-label="Remove image"
                    className="rounded-2xl border border-rose-200/80 bg-white px-6 py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
                    onClick={() => {
                      setPreview('');
                      setSelectedFile(null);
                      setCustomDetections(null);
                      setAnnotatedImage(annotatedPlaceholder);
                      setDetectionError('');
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                  >
                    Remove Image
                  </button>
                </div>
              </div>
              {detectionError && (
                <p
                  className="mt-4 rounded-2xl border border-rose-200 bg-rose-50/80 px-4 py-3 text-sm font-semibold text-rose-700"
                  aria-live="assertive"
                >
                  {detectionError}
                </p>
              )}
            </>
          )}
        </section>

        <section className="space-y-8">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Annotated Image</h3>
                  <p className="text-sm text-slate-500">{detectionCount} objects detected</p>
                </div>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-600">
                  Live Preview
                </span>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-100/60 p-3">
                {annotatedImage ? (
                  <img
                    src={annotatedImage}
                    alt="Annotated"
                    className="w-full rounded-xl object-contain"
                    onError={() => {
                      setAnnotatedImageError('Annotated image not available at this URL');
                    }}
                    onLoad={() => setAnnotatedImageError('')}
                  />
                ) : (
                  <div className="h-40 flex items-center justify-center text-sm text-slate-500">No annotated image</div>
                )}

                {annotatedImageError ? (
                  <p className="mt-2 text-sm text-rose-600">
                    {annotatedImageError}. You can try the output image instead:{' '}
                    {outputImage ? (
                      <a href={outputImage} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                        {outputImage}
                      </a>
                    ) : (
                      <span className="text-slate-500">(no output image URL provided)</span>
                    )}
                  </p>
                ) : (
                  annotatedImage && annotatedImage !== annotatedPlaceholder && (
                    <p className="mt-2 text-sm text-slate-500">
                      Annotated image:{' '}
                      <a href={annotatedImage} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                        {annotatedImage.startsWith('data:') ? 'Open annotated image' : annotatedImage}
                      </a>
                      {outputImage && (
                        <span className="ml-2 text-xs text-slate-400">(output image: {' '})</span>
                      )}
                    </p>
                  )
                )}
              </div>
                    </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Detection Results</h3>
                  <p className="text-sm text-slate-500">Sortable with confidence bars</p>
                </div>
                <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                  {confidentObjects} above 85%
                    </div>
                </div>

              <div className="overflow-hidden rounded-2xl border border-slate-100">
                <table className="w-full text-sm text-slate-600">
                  <thead className="bg-slate-50 text-[12px] uppercase tracking-wide text-slate-500">
                    <tr>
                      {tableHeaders.map(({ key, title }) => {
                        const isActive = sortConfig.key === key;
                        const direction = isActive ? (sortConfig.direction === 'asc' ? '▲' : '▼') : '↕';
                        return (
                          <th
                            key={key}
                            scope="col"
                            className="cursor-pointer px-4 py-3 text-left font-semibold"
                            onClick={() => handleSort(key)}
                          >
                            <span className="inline-flex items-center gap-2">
                              {title}
                              <span className={`text-xs ${isActive ? 'text-blue-600' : 'text-slate-400'}`}>
                                {direction}
                              </span>
                            </span>
                          </th>
                        );
                      })}
                                </tr>
                            </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {sortedResults.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/70">
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center rounded-lg px-3 py-1 text-xs font-semibold ${badgeMap[item.color]}`}>
                            {item.label}
                          </span>
                                    </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                              <div
                                className={`absolute inset-y-0 left-0 rounded-full bg-linear-to-r ${gradientMap[item.color]}`}
                                style={{ width: `${item.confidence}%` }}
                              />
                                            </div>
                            <span className="text-sm font-semibold text-slate-900">{item.confidence}%</span>
                                        </div>
                                    </td>
                        <td className="px-4 py-3 font-mono text-xs text-slate-500">{item.bbox}</td>
                                </tr>
                    ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Ask Questions About Results</h3>
              <p className="text-sm text-slate-500">Powered by Gemini 2.5 Flash</p>
                    </div>
            <div className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-600">
              {detectionCount} detections
                    </div>
                </div>

          <div className="flex flex-col gap-6 lg:flex-row">
            <div className="flex-1">
              <div className="max-h-[320px] overflow-y-auto rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`mb-4 flex gap-3 ${message.author === 'user' ? 'flex-row-reverse text-right' : ''}`}
                  >
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-white ${
                        message.author === 'user' ? 'bg-linear-to-br from-pink-500 to-rose-600' : 'bg-linear-to-br from-violet-500 to-violet-600'
                      }`}
                    >
                      {message.author === 'user' ? 'JD' : 'AI'}
                    </div>
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        message.author === 'user'
                          ? 'bg-linear-to-r from-blue-600 to-blue-700 text-white'
                          : 'border border-slate-100 bg-white text-slate-700'
                      }`}
                    >
                      {message.text}
                    </div>
                </div>
                ))}
                <span ref={chatEndRef} />
                </div>
            </div>

            <form className="w-full space-y-4 lg:w-80" onSubmit={handleQuestionSubmit}>
              <label htmlFor="questionInput" className="text-sm font-semibold text-slate-700">Ask a question</label>
              <textarea
                id="questionInput"
                name="question"
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                placeholder="Ask a question about the detected objects..."
                title="Ask a question about the detected objects"
                className="min-h-[140px] w-full rounded-2xl border border-slate-200 bg-slate-50/60 p-4 text-sm text-slate-700 transition focus:border-violet-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-violet-500/10"
              />
              <button
                type="submit"
                className="w-full rounded-2xl bg-linear-to-r from-violet-500 to-violet-700 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/30 transition hover:-translate-y-0.5"
              >
                Send
              </button>
            </form>
        </div>
        </section>
    </main>
    </div>
  );
}