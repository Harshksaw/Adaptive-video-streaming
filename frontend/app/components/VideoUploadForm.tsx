'use client'

import { useState } from 'react'

export default function VideoUploadForm() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadStatus, setUploadStatus] = useState<string>('')
  const [isUploading, setIsUploading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]

      // Validate file type
      if (!file.type.startsWith('video/')) {
        setUploadStatus('Please select a valid video file')
        return
      }

      // Validate file size (max 100MB)
      const maxSize = 100 * 1024 * 1024 // 100MB in bytes
      if (file.size > maxSize) {
        setUploadStatus('File size exceeds 100MB limit')
        return
      }

      setSelectedFile(file)
      setUploadStatus('')
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedFile) {
      setUploadStatus('Please select a file first')
      return
    }

    const formData = new FormData()
    formData.append('video', selectedFile)

    try {
      setIsUploading(true)
      setUploadStatus('Uploading...')

      const response = await fetch('http://localhost:3000/api/video/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        setUploadStatus('Video uploaded successfully! Processing will begin shortly.')
        setSelectedFile(null)
        // Reset file input
        const fileInput = document.getElementById('video-upload') as HTMLInputElement
        if (fileInput) fileInput.value = ''
      } else {
        setUploadStatus(`Error: ${data.message || 'Upload failed'}`)
      }
    } catch (error) {
      setUploadStatus('Error uploading video. Please check if the backend server is running.')
      console.error('Upload error:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <form onSubmit={handleUpload} className="space-y-6">
      {/* Upload Area */}
      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors">
        <input
          type="file"
          accept="video/*"
          onChange={handleFileChange}
          className="hidden"
          id="video-upload"
          disabled={isUploading}
        />
        <label
          htmlFor="video-upload"
          className="cursor-pointer flex flex-col items-center"
        >
          <svg
            className="w-16 h-16 text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <span className="text-lg text-gray-700 dark:text-gray-300 mb-2 font-medium">
            {selectedFile ? selectedFile.name : 'Click to select video file'}
          </span>
          {selectedFile && (
            <span className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              {formatFileSize(selectedFile.size)}
            </span>
          )}
          <span className="text-sm text-gray-500 dark:text-gray-400">
            MP4, MOV, AVI, WebM up to 100MB
          </span>
        </label>
      </div>

      {/* File Info */}
      {selectedFile && (
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-300">File type:</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {selectedFile.type}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-300">Size:</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {formatFileSize(selectedFile.size)}
            </span>
          </div>
        </div>
      )}

      {/* Upload Button */}
      <button
        type="submit"
        disabled={!selectedFile || isUploading}
        className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        {isUploading ? (
          <>
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Uploading...
          </>
        ) : (
          <>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
              />
            </svg>
            Upload and Process
          </>
        )}
      </button>

      {/* Status Message */}
      {uploadStatus && (
        <div
          className={`p-4 rounded-lg ${
            uploadStatus.includes('Error') || uploadStatus.includes('exceeds') || uploadStatus.includes('Please')
              ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-200'
              : uploadStatus.includes('successfully')
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-200'
              : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {uploadStatus.includes('successfully') ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            ) : uploadStatus.includes('Error') ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            <span>{uploadStatus}</span>
          </div>
        </div>
      )}
    </form>
  )
}
