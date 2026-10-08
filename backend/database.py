import os
import json
import time
import logging
import re
from typing import List, Dict, Any, Optional
import motor.motor_asyncio
from pymongo.errors import PyMongoError, ServerSelectionTimeoutError

from .config import settings

logger = logging.getLogger("aegis.database")

def mask_mongo_uri(uri: str) -> str:
    """Mask credentials in MongoDB URI for safe logging and UI display."""
    if not uri:
        return ""
    # Pattern to match :password@
    return re.sub(r':([^/@]+)@', r':••••••@', uri)

class DatabaseManager:
    def __init__(self):
        self.client: Optional[motor.motor_asyncio.AsyncIOMotorClient] = None
        self.db: Optional[motor.motor_asyncio.AsyncIOMotorDatabase] = None
        self.is_connected: bool = False
        self.last_error: Optional[str] = None
        self.latency_ms: Optional[float] = None
        self.uri: str = settings.mongodb_uri
        self.db_name: str = settings.mongodb_db_name

        # Local flat-file fallback paths
        is_vercel = bool(os.environ.get("VERCEL"))
        self.records_file = "/tmp/records.json" if is_vercel else os.path.join(os.path.dirname(os.path.abspath(__file__)), "records.json")
        self.heuristics_file = settings.heuristics_path

    # --------------------------------------------------------------------------
    # Lifecycle & Connection Management
    # --------------------------------------------------------------------------
    async def connect(self, uri: Optional[str] = None, db_name: Optional[str] = None) -> bool:
        """Connect to MongoDB with fallback capability and heartbeat test."""
        target_uri = uri or self.uri
        target_db_name = db_name or self.db_name

        self.uri = target_uri
        self.db_name = target_db_name

        if not target_uri:
            self.is_connected = False
            self.last_error = "No MongoDB URI configured. Running in local file storage mode."
            logger.info("MongoDB URI not provided. Using local file storage fallback.")
            return False

        try:
            # Configure asynchronous Motor client with tight timeouts to prevent blocking
            self.client = motor.motor_asyncio.AsyncIOMotorClient(
                target_uri,
                serverSelectionTimeoutMS=2500,
                connectTimeoutMS=2500,
                socketTimeoutMS=3000,
                appname="AegisComplianceAuditor"
            )
            self.db = self.client[target_db_name]

            # Test connection latency via ping
            t_start = time.perf_counter()
            await self.client.admin.command('ping')
            t_end = time.perf_counter()
            self.latency_ms = round((t_end - t_start) * 1000, 2)

            self.is_connected = True
            self.last_error = None
            logger.info(f"Connected to MongoDB ({target_db_name}) at {mask_mongo_uri(target_uri)} [ping: {self.latency_ms}ms]")

            # Ensure optimal indexes asynchronously
            await self._ensure_indexes()
            return True

        except (ServerSelectionTimeoutError, PyMongoError, Exception) as e:
            self.is_connected = False
            self.latency_ms = None
            self.last_error = str(e)
            logger.warning(f"Could not connect to MongoDB ({mask_mongo_uri(target_uri)}): {e}. Fallback to file storage is active.")
            return False

    async def _ensure_indexes(self):
        """Create database indexes for fast query resolution."""
        if not self.is_connected or self.db is None:
            return
        try:
            # Audit records: unique id index, and timestamp sorting index
            await self.db.audit_records.create_index("id", unique=True)
            await self.db.audit_records.create_index([("timestamp", -1)])
            
            # Heuristics: lookup index on vendor and command_pattern
            await self.db.heuristics.create_index([("command_pattern", 1), ("vendor", 1)])
        except Exception as e:
            logger.warning(f"Failed to create MongoDB indexes: {e}")

    async def close(self):
        """Cleanly close MongoDB connection client."""
        if self.client:
            self.client.close()
            self.is_connected = False
            self.client = None
            self.db = None
            logger.info("MongoDB client connection closed.")

    async def test_connection(self, test_uri: str) -> Dict[str, Any]:
        """Test a candidate MongoDB URI without changing the current active connection."""
        if not test_uri:
            return {"success": False, "message": "URI cannot be empty"}
        
        test_client = None
        try:
            t_start = time.perf_counter()
            test_client = motor.motor_asyncio.AsyncIOMotorClient(
                test_uri,
                serverSelectionTimeoutMS=3000,
                connectTimeoutMS=3000,
                socketTimeoutMS=3000
            )
            await test_client.admin.command('ping')
            t_end = time.perf_counter()
            latency = round((t_end - t_start) * 1000, 2)
            return {
                "success": True,
                "latency_ms": latency,
                "message": f"Successfully connected to MongoDB cluster! (Ping: {latency}ms)"
            }
        except Exception as e:
            return {
                "success": False,
                "message": f"Connection test failed: {str(e)}"
            }
        finally:
            if test_client:
                test_client.close()

    # --------------------------------------------------------------------------
    # Health and Status
    # --------------------------------------------------------------------------
    async def get_status(self) -> Dict[str, Any]:
        """Fetch current database connection status, metrics, and document counts."""
        records_count = 0
        heuristics_count = 0

        # Attempt quick ping if marked connected to ensure live heartbeat
        if self.is_connected and self.client:
            try:
                t_start = time.perf_counter()
                await self.client.admin.command('ping')
                self.latency_ms = round((time.perf_counter() - t_start) * 1000, 2)
                records_count = await self.db.audit_records.count_documents({})
                heuristics_count = await self.db.heuristics.count_documents({})
            except Exception as e:
                self.is_connected = False
                self.last_error = str(e)
                self.latency_ms = None

        if not self.is_connected:
            # Fallback file counts
            records_count = len(self._load_records_file())
            heuristics_count = len(self._load_heuristics_file())

        return {
            "connected": self.is_connected,
            "mode": "mongodb" if self.is_connected else "file_fallback",
            "database": self.db_name,
            "uri_masked": mask_mongo_uri(self.uri),
            "latency_ms": self.latency_ms,
            "stats": {
                "records_count": records_count,
                "heuristics_count": heuristics_count
            },
            "last_error": self.last_error
        }

    # --------------------------------------------------------------------------
    # Audit Records Operations (Dual Mode / Fallback)
    # --------------------------------------------------------------------------
    def _load_records_file(self) -> List[Dict[str, Any]]:
        """Read fallback records.json file."""
        if os.path.exists(self.records_file):
            try:
                with open(self.records_file, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception:
                return []
        return []

    def _save_records_file(self, records: List[Dict[str, Any]]):
        """Write fallback records.json file."""
        try:
            with open(self.records_file, "w", encoding="utf-8") as f:
                json.dump(records, f, indent=4)
        except Exception as e:
            logger.error(f"Failed to write to fallback records.json: {e}")

    async def get_all_records(self) -> List[Dict[str, Any]]:
        """Retrieve all audit records either from MongoDB or local JSON fallback."""
        if self.is_connected and self.db is not None:
            try:
                cursor = self.db.audit_records.find({}, {"_id": 0}).sort("timestamp", -1)
                records = await cursor.to_list(length=1000)
                return records
            except Exception as e:
                logger.warning(f"Error reading from MongoDB audit_records, falling back to local file: {e}")

        # Fallback
        return self._load_records_file()

    async def get_record_by_id(self, record_id: str) -> Optional[Dict[str, Any]]:
        """Fetch a specific audit report record by ID."""
        if self.is_connected and self.db is not None:
            try:
                doc = await self.db.audit_records.find_one({"id": record_id}, {"_id": 0})
                if doc:
                    return doc
            except Exception as e:
                logger.warning(f"Error reading record {record_id} from MongoDB: {e}")

        # Fallback search in local file
        for r in self._load_records_file():
            if r.get("id") == record_id:
                return r
        return None

    async def save_record(self, record: Dict[str, Any]) -> bool:
        """Upsert an audit report record into MongoDB and sync to local file fallback."""
        # Always maintain backup in local file for redundancy
        local_records = self._load_records_file()
        updated_local = [r for r in local_records if r.get("id") != record.get("id")]
        updated_local.insert(0, record)
        self._save_records_file(updated_local)

        if self.is_connected and self.db is not None:
            try:
                # Upsert into MongoDB
                clean_record = {k: v for k, v in record.items() if k != "_id"}
                await self.db.audit_records.replace_one(
                    {"id": record["id"]},
                    clean_record,
                    upsert=True
                )
                return True
            except Exception as e:
                logger.error(f"Failed to upsert record {record.get('id')} to MongoDB: {e}")
                return False
        return True

    async def delete_record(self, record_id: str) -> bool:
        """Delete an audit record from MongoDB and fallback file."""
        # Update local file
        local_records = self._load_records_file()
        updated_local = [r for r in local_records if r.get("id") != record_id]
        self._save_records_file(updated_local)

        if self.is_connected and self.db is not None:
            try:
                await self.db.audit_records.delete_one({"id": record_id})
                return True
            except Exception as e:
                logger.error(f"Failed to delete record {record_id} from MongoDB: {e}")
                return False
        return True

    async def clear_all_records(self) -> bool:
        """Clear all audit records from MongoDB and fallback file."""
        self._save_records_file([])
        if self.is_connected and self.db is not None:
            try:
                await self.db.audit_records.delete_many({})
                return True
            except Exception as e:
                logger.error(f"Failed to clear audit records from MongoDB: {e}")
                return False
        return True

    # --------------------------------------------------------------------------
    # Dynamic Heuristics Operations
    # --------------------------------------------------------------------------
    def _load_heuristics_file(self) -> List[Dict[str, Any]]:
        """Read fallback heuristics.json."""
        if os.path.exists(self.heuristics_file):
            try:
                with open(self.heuristics_file, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception:
                return []
        return []

    def _save_heuristics_file(self, mappings: List[Dict[str, Any]]):
        """Save fallback heuristics.json."""
        try:
            with open(self.heuristics_file, "w", encoding="utf-8") as f:
                json.dump(mappings, f, indent=4)
        except Exception as e:
            logger.error(f"Failed to write heuristics.json: {e}")

    async def get_all_heuristics(self) -> List[Dict[str, Any]]:
        """Fetch all dynamic learned mappings."""
        if self.is_connected and self.db is not None:
            try:
                cursor = self.db.heuristics.find({}, {"_id": 0})
                return await cursor.to_list(length=5000)
            except Exception as e:
                logger.warning(f"Error reading heuristics from MongoDB: {e}")
        return self._load_heuristics_file()

    async def save_heuristic(self, mapping: Dict[str, Any]) -> bool:
        """Upsert a dynamic mapping in MongoDB and sync local file."""
        # Local file sync
        local_mappings = self._load_heuristics_file()
        found = False
        for m in local_mappings:
            if m.get("command_pattern") == mapping.get("command_pattern") and m.get("parameter") == mapping.get("parameter"):
                m["value"] = mapping.get("value")
                m["vendor"] = mapping.get("vendor", "Generic")
                found = True
                break
        if not found:
            local_mappings.append(mapping)
        self._save_heuristics_file(local_mappings)

        if self.is_connected and self.db is not None:
            try:
                clean_mapping = {k: v for k, v in mapping.items() if k != "_id"}
                await self.db.heuristics.replace_one(
                    {
                        "command_pattern": mapping["command_pattern"],
                        "parameter": mapping["parameter"]
                    },
                    clean_mapping,
                    upsert=True
                )
                return True
            except Exception as e:
                logger.error(f"Failed to save heuristic mapping in MongoDB: {e}")
                return False
        return True

    async def delete_heuristic(self, command_pattern: str, parameter: str) -> bool:
        """Remove a heuristic mapping from local storage and MongoDB."""
        local_mappings = self._load_heuristics_file()
        updated = [
            m for m in local_mappings 
            if not (m.get("command_pattern") == command_pattern and m.get("parameter") == parameter)
        ]
        self._save_heuristics_file(updated)

        if self.is_connected and self.db is not None:
            try:
                await self.db.heuristics.delete_one({
                    "command_pattern": command_pattern,
                    "parameter": parameter
                })
                return True
            except Exception as e:
                logger.error(f"Failed to delete heuristic from MongoDB: {e}")
                return False
        return True

    # --------------------------------------------------------------------------
    # Settings Operations
    # --------------------------------------------------------------------------
    async def get_setting(self, key: str, default: Any = None) -> Any:
        """Fetch an application setting from MongoDB."""
        if self.is_connected and self.db is not None:
            try:
                doc = await self.db.app_settings.find_one({"key": key})
                if doc:
                    return doc.get("value", default)
            except Exception:
                pass
        return default

    async def set_setting(self, key: str, value: Any) -> bool:
        """Persist an application setting to MongoDB."""
        if self.is_connected and self.db is not None:
            try:
                await self.db.app_settings.replace_one(
                    {"key": key},
                    {"key": key, "value": value},
                    upsert=True
                )
                return True
            except Exception as e:
                logger.error(f"Failed to set setting in MongoDB: {e}")
        return False

    # --------------------------------------------------------------------------
    # One-Click Migration
    # --------------------------------------------------------------------------
    async def migrate_local_data_to_mongo(self) -> Dict[str, Any]:
        """Migrate existing records.json and heuristics.json into MongoDB."""
        if not self.is_connected or self.db is None:
            return {
                "success": False,
                "message": "Cannot migrate: MongoDB is not connected."
            }

        migrated_records = 0
        migrated_heuristics = 0

        try:
            # 1. Migrate Records
            local_records = self._load_records_file()
            for rec in local_records:
                clean_rec = {k: v for k, v in rec.items() if k != "_id"}
                if "id" in clean_rec:
                    await self.db.audit_records.replace_one(
                        {"id": clean_rec["id"]},
                        clean_rec,
                        upsert=True
                    )
                    migrated_records += 1

            # 2. Migrate Heuristics
            local_heuristics = self._load_heuristics_file()
            for item in local_heuristics:
                clean_item = {k: v for k, v in item.items() if k != "_id"}
                if "command_pattern" in clean_item and "parameter" in clean_item:
                    await self.db.heuristics.replace_one(
                        {
                            "command_pattern": clean_item["command_pattern"],
                            "parameter": clean_item["parameter"]
                        },
                        clean_item,
                        upsert=True
                    )
                    migrated_heuristics += 1

            return {
                "success": True,
                "migrated_records": migrated_records,
                "migrated_heuristics": migrated_heuristics,
                "message": f"Successfully migrated {migrated_records} audit records and {migrated_heuristics} heuristics into MongoDB."
            }
        except Exception as e:
            logger.error(f"Migration error: {e}")
            return {
                "success": False,
                "message": f"Migration failed: {str(e)}"
            }

# Global database manager instance
db_manager = DatabaseManager()
