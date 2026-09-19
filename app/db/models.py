import uuid
from sqlalchemy import Column, String, Integer, Float, DateTime, Text, Enum as SQLEnum, Boolean
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy import JSON
from datetime import datetime, timedelta
import enum
from app.db.session import Base

class JobStatus(str, enum.Enum):
    queued = "queued"
    extracting = "extracting"
    chunking = "chunking"
    analyzing = "analyzing"
    merging = "merging"
    generating_files = "generating_files"
    completed = "completed"
    failed = "failed"

class Job(Base):
    __tablename__ = "jobs"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String, nullable=False, index=True)
    youtube_url = Column(String, nullable=False)
    video_id = Column(String, nullable=False, index=True)
    video_title = Column(String, nullable=True)
    duration_seconds = Column(Integer, nullable=True)
    language = Column(String, nullable=True, default="en")
    
    status = Column(String, nullable=False, default=JobStatus.queued.value)
    progress_percent = Column(Integer, default=0)
    current_step = Column(String, nullable=True)
    current_step_number = Column(Integer, default=1)
    
    chunk_count = Column(Integer, default=0)
    chunks_done = Column(Integer, default=0)
    
    transcript_text = Column(Text, nullable=True)
    transcript_segments = Column(JSON, nullable=True)
    
    chunks = Column(JSON, nullable=True)
    chunk_results = Column(JSON, nullable=True)
    
    final_notes_markdown = Column(Text, nullable=True)
    final_notes_ref = Column(String, nullable=True)
    
    pdf_key = Column(String, nullable=True)
    docx_key = Column(String, nullable=True)
    
    error_code = Column(String, nullable=True)
    error_message = Column(String, nullable=True)
    
    token_usage = Column(JSON, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    
    def set_expires(self, hours: int):
        self.expires_at = datetime.utcnow() + timedelta(hours=hours)
    
    @property
    def duration_minutes(self):
        if self.duration_seconds:
            return self.duration_seconds / 60.0
        return None
