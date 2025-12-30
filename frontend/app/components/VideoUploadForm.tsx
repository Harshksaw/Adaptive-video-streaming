'use client'

import { useState } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'

export default function VideoUploadForm() {
  const router = useRouter()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadStatus, setUploadStatus] = useState<string>('')
  const [isUploading, setIsUploading] = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]

      // Validate file type
      if (!file.type.startsWith('video/')) {
        setUploadStatus('Please select a valid video file')
        return
      }

      // Validate file size (max 100MB)
      const maxSize = 200 * 1024 * 1024 // 100MB in bytes
      if (file.size > maxSize) {
        setUploadStatus('File size exceeds 100MB limit')
        return
      }

      setSelectedFile(file)
      setUploadStatus('')

      // Auto-upload the file
      await handleUpload(file)
    }
  }

  const handleUpload = async (file: File) => {
    const formData = new FormData()
    formData.append('video', file)

    try {
      setIsUploading(true)
      setUploadStatus('Uploading...')

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const response = await axios.post(`${apiUrl}/api/video/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      if (response.status === 200 || response.status === 201 || response.status === 202) {
        const { videoId } = response.data
        setUploadStatus('Video uploaded successfully! Processing has started. Redirecting to player...')

        // Redirect to video player after 2 seconds
        setTimeout(() => {
          if (videoId) {
            router.push(`/stream/${videoId}`)
          }
        }, 2000)
      } else {
        setUploadStatus(`Error: ${response.data.message || 'Upload failed'}`)
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          setUploadStatus(`Error: ${error.response.data.message || 'Upload failed'}`)
        } else if (error.request) {
          setUploadStatus('Error uploading video. Please check if the backend server is running.')
        } else {
          setUploadStatus('Error uploading video. Please try again.')
        }
      } else {
        setUploadStatus('Error uploading video. Please try again.')
      }
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
    <div className="space-y-6">
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
    </div>
  )
}
