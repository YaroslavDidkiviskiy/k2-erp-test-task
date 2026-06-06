from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    APP_NAME: str = "ERP Orders"
    APP_VERSION: str = "1.0.0"
    DATABASE_URL: str = "sqlite+aiosqlite:////data/erp_orders.db"

    model_config = SettingsConfigDict(env_file=".env")


settings = Settings()
