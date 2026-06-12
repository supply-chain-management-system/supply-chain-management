import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import api from '../../../api/api';

export default function OutputLogs() {
  const [docContent, setDocContent] = useState("");
  const [metaData, setMetaData] = useState(null); // To store ID, Name, Date etc.
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/production/factory/productall/doc')
      .then((response) => {
        const rawData = response.data;
        
        // 1. Handle Array Response: Take the first item
        let item = null;
        if (Array.isArray(rawData)) {
          item = rawData[0]; // Get the first production record
        } else if (typeof rawData === 'object' && rawData !== null) {
          item = rawData; // Fallback if it's a single object
        }

        if (item && item.doc) {
          setDocContent(item.doc); // Set the markdown string
          setMetaData({
            name: item.product_name,
            id: item.id,
            date: item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A',
            status: item.status
          });
        } else {
          setError("No document content found in the response.");
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching docs:", err);
        setError("Failed to load production report.");
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    api.get("factory_analytics/factory/production-report")
      .then((res) => console.log(res.data, 'hai aima'))
      .catch((err) => console.error(err));
  }, []);

  // Helper to convert Markdown to Word-friendly HTML
  const convertToWordHTML = (md) => {
    if (!md) return "";
    return md.split('\n').map(line => {
      const trimmed = line.trim();
      if (!trimmed) return `<br/>`;
      
      // Headers
      if (trimmed.startsWith('### ')) 
        return `<h2 style="margin:16px 0 8px; font-weight:bold; font-size:18px; color:#1e293b;">${trimmed.slice(4)}</h2>`;
      
      // List Items
      if (trimmed.startsWith('* ') || trimmed.startsWith('+ ')) 
        return `<li style="margin-left:24px; list-style-type:disc; margin-bottom:4px;">${trimmed.slice(2)}</li>`;
      
      // Bold Text Replacement
      const withBold = trimmed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      return `<p style="margin:6px 0; line-height:1.6; color:#334155;">${withBold}</p>`;
    }).join('\n');
  };

  const handleDownload = () => {
    if (!docContent) return;

    const htmlBody = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset="utf-8">
        <title>Production Report - ${metaData?.name || 'Export'}</title>
        <style>
          body { font-family: 'Calibri', 'Arial', sans-serif; padding: 40px; color: #333; }
          h1 { color: #2563eb; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; }
        </style>
      </head>
      <body>
        <h1>Production Completion Report: ${metaData?.name || 'Unknown'}</h1>
        <p><strong>ID:</strong> ${metaData?.id} | <strong>Date:</strong> ${metaData?.date} | <strong>Status:</strong> ${metaData?.status}</p>
        <hr style="border:0; border-top:1px solid #ccc; margin:20px 0;" />
        ${convertToWordHTML(docContent)}
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', htmlBody], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Report_${metaData?.name}_${metaData?.id}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
        <p>Loading production data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto mt-10 p-6 bg-red-50 border-l-4 border-red-500 text-red-700 rounded shadow-sm">
        <p className="font-bold">Error</p>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-xl overflow-hidden">
        
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-6 text-white">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Production Report</h1>
              <p className="mt-1 text-blue-100 opacity-90">
                ID: #{metaData?.id} • {metaData?.name} • {metaData?.date}
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${
              metaData?.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {metaData?.status}
            </span>
          </div>
        </div>

        {/* Toolbar */}
        <div className="border-b border-gray-200 px-8 py-4 bg-gray-50 flex justify-end">
          <button
            onClick={handleDownload}
            className="group flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
          >
            <svg className="w-4 h-4 mr-2 text-gray-500 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download .doc
          </button>
        </div>

        {/* Content Area */}
        <div className="p-8 md:p-12">
          <div className="prose prose-slate max-w-none 
            prose-headings:text-slate-800 prose-headings:font-bold 
            prose-p:text-slate-600 prose-li:text-slate-600
            prose-strong:text-slate-900">
            <ReactMarkdown>{docContent}</ReactMarkdown>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-8 py-4 border-t border-gray-200 text-center text-sm text-gray-500">
          Generated automatically from Production System • {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
}