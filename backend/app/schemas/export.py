from pydantic import BaseModel


class ExportRequest(BaseModel):
    title: str
    content: str
    author: str = "EduAssist"
