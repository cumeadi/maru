from sqlalchemy import Column, Integer, String, Float, Boolean, JSON, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class Prompt(Base):
    __tablename__ = "prompts"
    id = Column(String, primary_key=True, index=True)
    content = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class GoldenDataset(Base):
    __tablename__ = "datasets"
    id = Column(String, primary_key=True, index=True)
    name = Column(String)
    data = Column(JSON)  # List of inputs/expected outputs

class EvaluationRun(Base):
    __tablename__ = "evaluation_runs"
    id = Column(String, primary_key=True, index=True)
    prompt_id = Column(String, ForeignKey("prompts.id"), nullable=True)
    dataset_id = Column(String, ForeignKey("datasets.id"), nullable=True)
    judge_model = Column(String)
    overall_score = Column(Float)
    passed = Column(Boolean)
    details = Column(JSON)      # Detailed criteria results
    latency_ms = Column(Float)
    cost = Column(Float, nullable=True)
    pii_redacted = Column(Boolean, default=False)
    is_shadow = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class FeedbackLog(Base):
    """Persists implicit user feedback events correlated to evaluation runs."""
    __tablename__ = "feedback_log"
    id = Column(Integer, primary_key=True, autoincrement=True)
    run_id = Column(String, index=True, nullable=False)
    action = Column(String, nullable=False)   # accepted | rejected | regenerated | edited
    note = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
