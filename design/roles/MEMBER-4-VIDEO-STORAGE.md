# Member 4: Cloud & Video Engineer

**Branch Prefix:** `feature/video-*`

---

## Your Mission

Implement cloud storage integration (AWS S3 or Azure Blob), video upload/streaming functionality, and video player components.

---

## Your Territory (Files You Own)

```
backend/app/
├── api/
│   └── videos.py            ← YOU OWN
├── models/
│   └── video.py             ← YOU OWN
├── schemas/
│   └── video.py             ← YOU OWN
└── services/
    ├── video_service.py     ← YOU OWN
    └── storage_service.py   ← YOU OWN

frontend/src/components/
├── Video/                   ← YOU OWN ALL
│   ├── VideoPlayer.tsx
│   ├── VideoCard.tsx
│   ├── VideoList.tsx
│   └── VideoControls.tsx
└── Admin/
    └── VideoUploader.tsx    ← YOU OWN

frontend/src/services/
└── videoService.ts          ← YOU OWN
```

---

## Week 1 Tasks (Days 1-7)

### Day 1-2: Cloud Storage Setup
- [ ] **Choose cloud provider** (AWS S3 recommended, or Azure Blob)
- [ ] Create cloud storage account:

  **For AWS S3:**
  1. Create AWS account
  2. Create S3 bucket (e.g., `bsg-demo-videos`)
  3. Create IAM user with S3 permissions
  4. Get Access Key ID and Secret Access Key

  **For Azure:**
  1. Create Azure account
  2. Create Storage Account
  3. Create Blob container
  4. Get connection string

- [ ] Install cloud SDK in backend
  ```bash
  # For AWS
  pip install boto3

  # For Azure
  pip install azure-storage-blob
  ```
- [ ] Add credentials to `.env`:
  ```bash
  # AWS
  AWS_ACCESS_KEY_ID=your_access_key
  AWS_SECRET_ACCESS_KEY=your_secret_key
  AWS_REGION=us-east-1
  S3_BUCKET_NAME=bsg-demo-videos

  # OR Azure
  AZURE_STORAGE_CONNECTION_STRING=your_connection_string
  AZURE_CONTAINER_NAME=videos
  ```
- [ ] Create Git branch: `feature/video-storage-setup`

### Day 3-4: Storage Service Implementation
- [ ] Create `backend/app/services/storage_service.py`
  ```python
  import boto3
  from botocore.exceptions import ClientError
  import os

  class StorageService:
      def __init__(self):
          self.s3_client = boto3.client(
              's3',
              aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
              aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
              region_name=os.getenv('AWS_REGION')
          )
          self.bucket_name = os.getenv('S3_BUCKET_NAME')

      def upload_file(self, file, filename: str) -> str:
          """Upload file to S3 and return URL"""
          try:
              self.s3_client.upload_fileobj(
                  file,
                  self.bucket_name,
                  filename,
                  ExtraArgs={'ContentType': 'video/mp4'}
              )
              return f"https://{self.bucket_name}.s3.amazonaws.com/{filename}"
          except ClientError as e:
              raise Exception(f"Upload failed: {str(e)}")

      def generate_signed_url(self, filename: str, expiration: int = 3600) -> str:
          """Generate temporary signed URL for video streaming"""
          try:
              url = self.s3_client.generate_presigned_url(
                  'get_object',
                  Params={'Bucket': self.bucket_name, 'Key': filename},
                  ExpiresIn=expiration
              )
              return url
          except ClientError as e:
              raise Exception(f"URL generation failed: {str(e)}")

      def delete_file(self, filename: str):
          """Delete file from S3"""
          try:
              self.s3_client.delete_object(Bucket=self.bucket_name, Key=filename)
          except ClientError as e:
              raise Exception(f"Delete failed: {str(e)}")
  ```
- [ ] Test upload/download/delete operations
- [ ] Create Git branch: `feature/video-storage-service`

### Day 5-6: Video Model & API
- [ ] Create `backend/app/models/video.py`
  ```python
  from sqlalchemy import Column, Integer, String, Text, BigInteger, Boolean, DateTime
  from datetime import datetime
  from .base import Base

  class Video(Base):
      __tablename__ = "video"

      id = Column(Integer, primary_key=True, index=True)
      title = Column(String(255), nullable=False)
      description = Column(Text)
      cloud_storage_url = Column(String(500), nullable=False)
      thumbnail_url = Column(String(500))
      duration = Column(Integer)  # in seconds
      file_size = Column(BigInteger)  # in bytes
      format = Column(String(50))
      tags = Column(JSON)
      created_at = Column(DateTime, default=datetime.utcnow)
      uploaded_at = Column(DateTime, default=datetime.utcnow)
      published = Column(Boolean, default=False)
  ```
- [ ] Create `backend/app/schemas/video.py`
  ```python
  from pydantic import BaseModel
  from typing import Optional, List
  from datetime import datetime

  class VideoBase(BaseModel):
      title: str
      description: Optional[str] = None
      thumbnail_url: Optional[str] = None
      duration: Optional[int] = None
      format: Optional[str] = None
      tags: Optional[List[str]] = []
      published: bool = False

  class VideoCreate(VideoBase):
      pass

  class VideoResponse(VideoBase):
      id: int
      cloud_storage_url: str
      file_size: Optional[int] = None
      created_at: datetime
      uploaded_at: datetime

      class Config:
          from_attributes = True
  ```
- [ ] Create Git branch: `feature/video-model`

### Day 7: Video Upload API
- [ ] Create `backend/app/services/video_service.py`
  ```python
  from sqlalchemy.orm import Session
  from ..models.video import Video
  from ..schemas.video import VideoCreate
  from .storage_service import StorageService
  import uuid

  class VideoService:
      def __init__(self, db: Session):
          self.db = db
          self.storage = StorageService()

      def create_video(self, video_data: VideoCreate, file):
          # Generate unique filename
          file_extension = file.filename.split('.')[-1]
          unique_filename = f"{uuid.uuid4()}.{file_extension}"

          # Upload to cloud storage
          cloud_url = self.storage.upload_file(file.file, unique_filename)

          # Save metadata to database
          db_video = Video(
              **video_data.dict(),
              cloud_storage_url=cloud_url,
              file_size=file.size
          )
          self.db.add(db_video)
          self.db.commit()
          self.db.refresh(db_video)
          return db_video
  ```
- [ ] Create `backend/app/api/videos.py`
  ```python
  from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
  from sqlalchemy.orm import Session
  from typing import List

  from ..database.session import get_db
  from ..schemas.video import VideoCreate, VideoResponse
  from ..services.video_service import VideoService
  from ..api.deps import get_current_admin

  router = APIRouter(prefix="/videos", tags=["videos"])

  @router.get("/", response_model=List[VideoResponse])
  def get_all_videos(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
      videos = db.query(Video).offset(skip).limit(limit).all()
      return videos

  @router.post("/", response_model=VideoResponse)
  async def upload_video(
      file: UploadFile = File(...),
      title: str = Form(...),
      description: str = Form(None),
      tags: str = Form(None),
      db: Session = Depends(get_db),
      admin = Depends(get_current_admin)
  ):
      video_service = VideoService(db)
      video_data = VideoCreate(
          title=title,
          description=description,
          tags=tags.split(',') if tags else []
      )
      return video_service.create_video(video_data, file)

  @router.get("/{video_id}/stream")
  def get_video_stream(video_id: int, db: Session = Depends(get_db)):
      video = db.query(Video).filter(Video.id == video_id).first()
      if not video:
          raise HTTPException(status_code=404, detail="Video not found")

      storage = StorageService()
      signed_url = storage.generate_signed_url(video.cloud_storage_url.split('/')[-1])
      return {"stream_url": signed_url, "expires_in": 3600}
  ```
- [ ] Update `backend/app/api/router.py` to include video routes (coordinate with Member 2)
- [ ] Test video upload with Postman
- [ ] Create Git branch: `feature/video-upload-api`

---

## Week 2 Tasks (Days 8-14)

### Day 8-9: Frontend Video Player
- [ ] Install video player library
  ```bash
  cd frontend
  npm install react-player
  # OR
  npm install video.js react-video-js-player
  ```
- [ ] Create `frontend/src/components/Video/VideoPlayer.tsx`
  ```typescript
  import React from 'react';
  import ReactPlayer from 'react-player';

  interface VideoPlayerProps {
    url: string;
    thumbnail?: string;
  }

  export const VideoPlayer: React.FC<VideoPlayerProps> = ({ url, thumbnail }) => {
    return (
      <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
        <ReactPlayer
          url={url}
          controls
          width="100%"
          height="100%"
          className="absolute top-0 left-0"
          light={thumbnail}
        />
      </div>
    );
  };
  ```
- [ ] Create `VideoCard.tsx` - Video preview card
- [ ] Create `VideoList.tsx` - Grid of video cards
- [ ] Create `VideoControls.tsx` - Additional video controls (optional)
- [ ] Create Git branch: `feature/video-player`

### Day 10-11: Video Uploader Component
- [ ] Create `frontend/src/components/Admin/VideoUploader.tsx`
  ```typescript
  import React, { useState } from 'react';
  import { videoService } from '../../services/videoService';

  export const VideoUploader: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);

    const handleUpload = async () => {
      if (!file || !title) return;

      setUploading(true);
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', title);
        formData.append('description', description);

        await videoService.upload(formData, (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgress(percentCompleted);
        });

        alert('Video uploaded successfully!');
        // Reset form
      } catch (error) {
        alert('Upload failed: ' + error.message);
      } finally {
        setUploading(false);
      }
    };

    return (
      <div className="p-6 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Upload Video</h2>

        <input
          type="file"
          accept="video/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="mb-4"
        />

        <input
          type="text"
          placeholder="Video Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full mb-4 p-2 border rounded"
        />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full mb-4 p-2 border rounded"
          rows={4}
        />

        {uploading && (
          <div className="mb-4">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-1">{progress}% uploaded</p>
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={!file || !title || uploading}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          {uploading ? 'Uploading...' : 'Upload Video'}
        </button>
      </div>
    );
  };
  ```
- [ ] Create `frontend/src/services/videoService.ts`
  ```typescript
  import { api } from './api';

  export const videoService = {
    getAll: async (page: number = 1, limit: number = 10) => {
      const response = await api.get(`/videos?skip=${(page-1)*limit}&limit=${limit}`);
      return response.data;
    },

    getById: async (id: number) => {
      const response = await api.get(`/videos/${id}`);
      return response.data;
    },

    getStreamUrl: async (id: number) => {
      const response = await api.get(`/videos/${id}/stream`);
      return response.data.stream_url;
    },

    upload: async (formData: FormData, onProgress?: (progressEvent: any) => void) => {
      const response = await api.post('/videos', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: onProgress
      });
      return response.data;
    },

    delete: async (id: number) => {
      await api.delete(`/videos/${id}`);
    }
  };
  ```
- [ ] Create Git branch: `feature/video-uploader`

### Day 12: Complete CRUD Operations
- [ ] Implement GET `/videos/{id}` - Get video by ID
- [ ] Implement PUT `/videos/{id}` - Update video metadata
- [ ] Implement DELETE `/videos/{id}` - Delete video (also delete from S3)
  ```python
  @router.delete("/{video_id}")
  def delete_video(
      video_id: int,
      db: Session = Depends(get_db),
      admin = Depends(get_current_admin)
  ):
      video = db.query(Video).filter(Video.id == video_id).first()
      if not video:
          raise HTTPException(status_code=404, detail="Video not found")

      # Delete from cloud storage
      storage = StorageService()
      filename = video.cloud_storage_url.split('/')[-1]
      storage.delete_file(filename)

      # Delete from database
      db.delete(video)
      db.commit()
      return {"message": "Video deleted successfully"}
  ```
- [ ] Create Git branch: `feature/video-crud`

### Day 13-14: Polish & Integration
- [ ] Add video metadata extraction (duration, format) - optional
- [ ] Add thumbnail generation - optional
- [ ] Implement video pagination in frontend
- [ ] Add error handling for failed uploads
- [ ] Test full video workflow (upload, view, delete)
- [ ] Write tests for storage service
- [ ] Fix integration bugs
- [ ] Update documentation

---

## Dependencies & Coordination

### You Depend On:
- **Member 1** (Frontend): Common components (Card, Button, Modal)
- **Member 2** (Backend): Auth middleware, base API structure, router.py
- **Cloud Provider**: AWS/Azure account with credentials

### Others Depend On You:
- **Member 1**: Needs your VideoPlayer for VideoPage
- **All**: Storage service can be reused for other file uploads

### Coordination Points:
- **Day 7**: Coordinate with Member 2 on router.py (add video routes)
- **Day 10**: Integration testing with Member 1

---

## Git Workflow

### Create Feature Branch
```bash
git checkout develop
git pull origin develop
git checkout -b feature/video-your-feature-name
```

### Daily Work
```bash
# Make changes
git add .
git commit -m "feat: description of what you did"
git push origin feature/video-your-feature-name
```

### Coordinate on router.py
```bash
# Member 2 creates router.py, you add video routes
git checkout develop
git pull origin develop
git checkout -b feature/video-api-routes

# Edit backend/app/api/router.py
# Add:
# from .videos import router as videos_router
# api_router.include_router(videos_router)

git add backend/app/api/router.py
git commit -m "feat: add video routes to API router"
git push origin feature/video-api-routes

# Create PR, notify Member 2 in Slack
```

---

## Code Style & Best Practices

### Secure File Uploads
- Validate file types (only allow video formats)
- Limit file size (e.g., 100MB max)
- Generate unique filenames (use UUID)
- Scan for malware (optional, for production)

```python
ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/mpeg', 'video/quicktime']
MAX_FILE_SIZE = 100 * 1024 * 1024  # 100MB

if file.content_type not in ALLOWED_VIDEO_TYPES:
    raise HTTPException(400, "Invalid file type")

if file.size > MAX_FILE_SIZE:
    raise HTTPException(400, "File too large")
```

### Use Signed URLs for Security
- Never expose direct S3 URLs
- Always use signed URLs with expiration
- Regenerate URLs for each request

---

## Tools & Extensions

### Required VS Code Extensions
- Python (backend)
- Thunder Client (API testing)
- AWS Toolkit (if using AWS)

### Required Libraries

**Backend:**
```bash
pip install boto3              # AWS S3
# OR
pip install azure-storage-blob # Azure
```

**Frontend:**
```bash
npm install react-player
# OR
npm install video.js react-video-js-player
```

---

## Cloud Provider Comparison

| Feature | AWS S3 | Azure Blob Storage |
|---------|--------|-------------------|
| **Cost** | ~$0.023/GB | ~$0.018/GB |
| **Ease of Setup** | Easy | Easy |
| **SDK Quality** | Excellent (boto3) | Good (azure-storage-blob) |
| **Signed URLs** | Yes (presigned URLs) | Yes (SAS tokens) |
| **CDN Integration** | CloudFront | Azure CDN |

**Recommendation:** Use AWS S3 (more widely used, better documentation)

---

## Communication

### Daily Standup Template
```
Member 4 (Video/Cloud):
✅ Yesterday: [what you completed]
🔨 Today: [what you're working on]
⚠️  Blockers: [any issues or dependencies]
```

### When to Share Updates
- **Day 2**: Confirm cloud storage account is set up
- **Day 4**: Notify when storage service is ready (others can use it)
- **Day 7**: Notify when video API is ready
- **Day 11**: Notify when video uploader is ready for testing

---

## Success Checklist

### Week 1 Done When:
- [ ] Cloud storage account set up (AWS S3 or Azure)
- [ ] Storage service working (upload, download, delete)
- [ ] Video model and schema created
- [ ] Video upload API endpoint functional
- [ ] Can upload a video via Postman and access it

### Week 2 Done When:
- [ ] Video player component working
- [ ] Video uploader component in admin panel
- [ ] Full CRUD operations complete
- [ ] Signed URLs working for secure streaming
- [ ] Integration with frontend successful

---

## Quick Reference

### Project Structure You Create

**Backend:**
```
backend/app/
├── api/
│   └── videos.py
├── models/
│   └── video.py
├── schemas/
│   └── video.py
└── services/
    ├── video_service.py
    └── storage_service.py
```

**Frontend:**
```
frontend/src/
├── components/
│   ├── Video/
│   │   ├── VideoPlayer.tsx
│   │   ├── VideoCard.tsx
│   │   ├── VideoList.tsx
│   │   └── VideoControls.tsx
│   └── Admin/
│       └── VideoUploader.tsx
├── services/
│   └── videoService.ts
└── types/
    └── video.ts
```

### Environment Variables
```bash
# AWS S3
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_REGION=us-east-1
S3_BUCKET_NAME=bsg-demo-videos

# OR Azure Blob
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=...
AZURE_CONTAINER_NAME=videos
```

---

**Remember:** You're handling file storage - make it secure and reliable!

**Questions?** Ask in #backend or ping @Member2 or @Member5

**Good luck! 🚀**
