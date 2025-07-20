from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

from .podcast import Podcast
from .user import User

__all__ = ["Base", "Podcast", "User"] 