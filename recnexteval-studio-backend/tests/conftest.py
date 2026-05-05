import json
import uuid
from datetime import datetime, timezone

import pytest

# SQLite compile hooks — make PG-specific and generic column types work in tests
from sqlalchemy import (
    ARRAY as SA_ARRAY,
    create_engine,
    event,
)
from sqlalchemy.dialects.postgresql import (
    ARRAY as PG_ARRAY,
    UUID as PG_UUID,
)
from sqlalchemy.ext.compiler import compiles
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool


@compiles(SA_ARRAY, "sqlite")
def _sqlite_array(elem, compiler, **kw):
    return "TEXT"


@compiles(PG_ARRAY, "sqlite")
def _sqlite_pg_array(elem, compiler, **kw):
    return "TEXT"


@compiles(PG_UUID, "sqlite")
def _sqlite_uuid(elem, compiler, **kw):
    return "TEXT"


from recnexteval_studio_backend.db.schema import Base, StreamAlgorithm, StreamJob, StreamUser


@pytest.fixture(scope="session")
def engine():
    eng = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(eng)

    # SQLite cannot bind Python list values for ARRAY columns compiled to TEXT.
    # Serialise any list parameter to JSON before the cursor executes.
    @event.listens_for(eng, "before_cursor_execute", retval=True)
    def _serialize_list_params(conn, cursor, statement, parameters, context, executemany):
        if parameters:
            parameters = tuple(
                json.dumps(p) if isinstance(p, list) else p
                for p in parameters
            )
        return statement, parameters

    yield eng
    Base.metadata.drop_all(eng)


@pytest.fixture(scope="session")
def session_factory(engine):
    return sessionmaker(bind=engine, autocommit=False, autoflush=True)


@pytest.fixture
def db(session_factory):
    sess = session_factory()
    try:
        yield sess
    finally:
        sess.rollback()
        sess.close()


@pytest.fixture
def stream_user(db):
    u = StreamUser(username=f"user-{uuid.uuid4().hex[:8]}", password="hashed")
    db.add(u)
    db.commit()
    db.refresh(u)
    return u


@pytest.fixture
def stream_job_factory(db, stream_user):
    def make(
        *,
        dataset: str = "movielens",
        algorithms: list[dict] | None = None,
        metrics: tuple[str, ...] = ("ndcg",),
        top_k: int = 10,
    ) -> StreamJob:
        job = StreamJob(
            name=f"job-{uuid.uuid4().hex}",
            dataset=dataset,
            top_k=top_k,
            metrics=json.dumps(list(metrics)),  # stored as TEXT in SQLite
            timestamp_split_start=datetime(2024, 1, 1, tzinfo=timezone.utc),
            window_size=7,
            user_id=stream_user.id,
        )
        db.add(job)
        db.flush()
        for spec in algorithms or []:
            raw_uuid = spec.get("uuid", uuid.uuid4())
            algo_uuid_obj = uuid.UUID(str(raw_uuid)) if not isinstance(raw_uuid, uuid.UUID) else raw_uuid
            db.add(
                StreamAlgorithm(
                    stream_job_id=job.id,
                    algorithm_name=spec["name"],
                    algorithm_uuid=algo_uuid_obj,
                    parameters=json.dumps(spec.get("params", {})) if spec.get("params") else None,
                )
            )
        db.commit()
        db.refresh(job)
        return job

    return make
