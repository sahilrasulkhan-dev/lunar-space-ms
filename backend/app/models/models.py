from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    images = relationship("Image", back_populates="owner")

class Image(Base):
    __tablename__ = "images"
    
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    upload_time = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    user_id = Column(Integer, ForeignKey("users.id"))
    
    owner = relationship("User", back_populates="images")
    analysis = relationship("Analysis", back_populates="image", uselist=False)

class Analysis(Base):
    __tablename__ = "analysis"
    
    id = Column(Integer, primary_key=True, index=True)
    image_id = Column(Integer, ForeignKey("images.id"))
    safe_percentage = Column(Float)
    unsafe_percentage = Column(Float)
    landing_score = Column(Float)
    confidence = Column(Float)
    terrain_type = Column(String)
    processed_image_path = Column(String)
    analyzed_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    image = relationship("Image", back_populates="analysis")

class Navigation(Base):
    __tablename__ = "navigations"
    
    id = Column(Integer, primary_key=True, index=True)
    image_id = Column(Integer, ForeignKey("images.id"))
    start_x = Column(Integer)
    start_y = Column(Integer)
    end_x = Column(Integer)
    end_y = Column(Integer)
    distance = Column(Float)
    risk_score = Column(Float)
    energy_estimation = Column(Float)
    path_coordinates = Column(String) # JSON string of coordinates
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class Report(Base):
    __tablename__ = "reports"
    
    id = Column(Integer, primary_key=True, index=True)
    analysis_id = Column(Integer, ForeignKey("analysis.id"))
    summary = Column(String)
    generated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
