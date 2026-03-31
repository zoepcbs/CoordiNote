import React, { useEffect, useState } from "react";
import axios from "axios";

function GroupFiles({ groupId }) {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const token = localStorage.getItem("token");

  const fetchFiles = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/groups/${groupId}/files`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFiles(res.data);
    } catch (err) {
      console.error("Error fetching files", err.response?.data || err.message);
    }
  };

  useEffect(() => {
    if (groupId) {
      fetchFiles();
    }
  }, [groupId]); // Added the dependency array with groupId

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      await axios.post(
        `http://localhost:5000/api/groups/${groupId}/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setSelectedFile(null);
      const fileInput = document.getElementById('file-upload');
      if (fileInput) fileInput.value = '';
      await fetchFiles();
      setIsUploading(false);
    } catch (err) {
      console.error("Upload failed", err.response?.data || err.message);
      setUploadError(err.response?.data?.message || "Upload failed. Please try again.");
      setIsUploading(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setUploadError(null);
    } else {
      setSelectedFile(null);
    }
  };

  

  const handleDelete = async (fileId, fileName) => {
    // Add confirmation dialog before deleting
    const isConfirmed = window.confirm(`Are you sure you want to delete this file: ${fileName}?`);
    
    if (!isConfirmed) {
      return; // User cancelled the deletion
    }
    
    try {
      await axios.delete(`http://localhost:5000/api/groups/${groupId}/files/${fileId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchFiles(); // Added await here to ensure fetch happens after delete completes
    } catch (err) {
      console.error("Delete failed", err.response?.data || err.message);
      alert("Failed to delete file.");
    }
  };

  return (
    <div className="group-files">
      <h4>Shared Files</h4>

      <form onSubmit={handleUpload} className="upload-form">
        <div className="file-input-wrapper">
          <input 
            id="file-upload" 
            type="file" 
            onChange={handleFileChange} 
            disabled={isUploading}
          />
          <button 
            type="submit" 
            disabled={!selectedFile || isUploading} 
            className={`upload-button ${isUploading ? 'uploading' : ''}`}
          >
            {isUploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
        {uploadError && <p className="error-message">{uploadError}</p>}
        {selectedFile && <p className="selected-file">Selected: {selectedFile.name}</p>}
      </form>

      {files.length > 0 ? (
        <ul className="files-list">
          {files.map((file) => (
            <li key={file._id} className="file-item">
              <a 
                href={`http://localhost:5000/api/public-download/${encodeURIComponent(file.filename)}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="file-link"
              >
                {file.originalName}
              </a>

              <span className="uploader-info">
                — uploaded by {file.uploader?.username || "unknown"}
              </span>
              <button 
                className="delete-button" 
                onClick={() => handleDelete(file._id, file.originalName)}
                style={{ marginLeft: "1rem" }}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="no-files">No files uploaded yet.</p>
      )}
    </div>
  );
}

export default GroupFiles;
