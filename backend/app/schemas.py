from pydantic import BaseModel


class AnalyzeRequest(BaseModel):
    text: str


class SessionOut(BaseModel):
    session_id: str
