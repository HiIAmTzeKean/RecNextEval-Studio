import json
import logging as logger
import traceback
from datetime import datetime, timezone

import pandas as pd
import recnexteval.evaluators
import recnexteval.registries
import recnexteval.settings
from recnexteval.registries import ALGORITHM_REGISTRY
from sqlalchemy.orm import Session

from ..db.connection import get_database_manager
from ..db.schema import (
    MacroEvaluationResult,
    MicroEvaluationResult,
    StreamAlgorithm,
    StreamJob,
    UserEvaluationResult,
    WindowEvaluationResult,
)


logger = logger.getLogger(__name__)


def save_evaluation_results(db: Session, evaluator, stream_job_id: int) -> None:
    """Save evaluation results to appropriate tables based on result type."""
    try:
        # Get results using the proper evaluator API
        result_types = ["macro", "micro", "window", "user"]

        for result_type in result_types:
            try:
                # Get DataFrame for this result type
                df = evaluator.metric_results(result_type).reset_index()
                logger.info(f"Processing {result_type} results. DataFrame shape: {df.shape}")
                logger.info(f"Columns: {list(df.columns)}")

                if result_type == "macro":
                    save_macro_results_from_df(db, df, stream_job_id)
                elif result_type == "micro":
                    save_micro_results_from_df(db, df, stream_job_id)
                elif result_type == "window":
                    save_window_results_from_df(db, df, stream_job_id)
                elif result_type == "user":
                    save_user_results_from_df(db, df, stream_job_id)

            except Exception as e:
                logger.warning(f"No {result_type} results available or error accessing them: {e}")
                continue

    except Exception as e:
        logger.error(f"Error saving evaluation results: {e}")
        logger.error(f"Full traceback:\n{traceback.format_exc()}")


def save_macro_results_from_df(db: Session, df: pd.DataFrame, stream_job_id: int) -> None:
    """Save macro-level evaluation results from DataFrame."""
    logger.info(f"Saving macro results from DataFrame with shape: {df.shape}")
    try:
        for row in df.itertuples():
            algo_uuid = row.algorithm.split("_")[-1]
            # query to get algorithm name from StreamAlgorithm table
            stream_algorithm = (
                db.query(StreamAlgorithm)
                .filter(StreamAlgorithm.algorithm_uuid == algo_uuid)
                .first()
            )
            logger.debug(f"{row.metric} with {row.macro_score} and {row.num_window}")
            macro_result = MacroEvaluationResult(
                stream_job_id=stream_job_id,
                stream_algorithm_id=stream_algorithm.id,
                metric=row.metric,
                macro_score=row.macro_score,
                num_window=row.num_window,
            )
            db.add(macro_result)
        db.commit()
        logger.info(f"Macro results saved: {len(df)} records")
    except Exception as e:
        logger.error(f"Error saving macro results: {e}")
        db.rollback()


def save_micro_results_from_df(db: Session, df: pd.DataFrame, stream_job_id: int) -> None:
    """Save micro-level evaluation results from DataFrame."""
    try:
        for row in df.itertuples():
            algo_uuid = row.algorithm.split("_")[-1]
            # query to get algorithm name from StreamAlgorithm table
            stream_algorithm = (
                db.query(StreamAlgorithm)
                .filter(StreamAlgorithm.algorithm_uuid == algo_uuid)
                .first()
            )
            micro_result = MicroEvaluationResult(
                stream_job_id=stream_job_id,
                stream_algorithm_id=stream_algorithm.id,
                metric=row.metric,
                micro_score=row.micro_score,
                num_user=row.num_user,
            )
            db.add(micro_result)
        db.commit()
        logger.info(f"Micro results saved: {len(df)} records")
    except Exception as e:
        logger.error(f"Error saving micro results: {e}")
        db.rollback()


def save_window_results_from_df(db: Session, df: pd.DataFrame, stream_job_id: int) -> None:
    """Save window-based evaluation results from DataFrame."""
    try:
        for row in df.itertuples():
            algo_uuid = getattr(row, "algorithm", "").split("_")[-1] if hasattr(row, "algorithm") else ""
            # query to get algorithm name from StreamAlgorithm table
            stream_algorithm = (
                db.query(StreamAlgorithm)
                .filter(StreamAlgorithm.algorithm_uuid == algo_uuid)
                .first()
            )
            window_result = WindowEvaluationResult(
                stream_job_id=stream_job_id,
                stream_algorithm_id=stream_algorithm.id if stream_algorithm else None,
                metric=row.metric,
                window_score=float(getattr(row, "window_score", 0)),
                num_user=int(getattr(row, "num_user", 0)),
                timestamp=getattr(row, "timestamp", 0),
            )
            db.add(window_result)
        db.commit()
        logger.info(f"Window results saved: {len(df)} records")
    except Exception as e:
        logger.error(f"Error saving window results: {e}")
        db.rollback()


def save_user_results_from_df(db: Session, df: pd.DataFrame, stream_job_id: int) -> None:
    """Save user-specific evaluation results from DataFrame."""
    try:
        for row in df.itertuples():
            algo_uuid = getattr(row, "algorithm", "").split("_")[-1] if hasattr(row, "algorithm") else ""
            # query to get algorithm name from StreamAlgorithm table
            stream_algorithm = (
                db.query(StreamAlgorithm)
                .filter(StreamAlgorithm.algorithm_uuid == algo_uuid)
                .first()
            )
            user_result = UserEvaluationResult(
                stream_job_id=stream_job_id,
                stream_algorithm_id=stream_algorithm.id if stream_algorithm else None,
                metric=row.metric,
                user_score=float(getattr(row, "user_score", 0)),
                user_id=int(getattr(row, "user_id", 0)),
                timestamp=getattr(row, "timestamp", 0),
            )
            db.add(user_result)
        db.commit()
        logger.info(f"User results saved: {len(df)} records")
    except Exception as e:
        logger.error(f"Error saving user results: {e}")
        db.rollback()


def run_evaluation(stream_job_id: int) -> None:
    db = get_database_manager().get_session()
    try:
        stream_job = db.query(StreamJob).filter(StreamJob.id == stream_job_id).first()
        if not stream_job:
            logger.error(f"Stream job {stream_job_id} not found")
            return

        logger.info(f"Starting evaluation for stream job {stream_job_id}")
        logger.info(
            f"Dataset: {stream_job.dataset}, timestamp_split_start: {stream_job.timestamp_split_start}, window_size: {stream_job.window_size}, top_k: {stream_job.top_k}"
        )

        try:
            dataset_cls = recnexteval.registries.DATASET_REGISTRY.get(stream_job.dataset)
            logger.info(f"Dataset class: {dataset_cls}")
            dataset = dataset_cls()
            logger.info("Loading dataset...")
            data = dataset.load()
            logger.info(f"Dataset loaded successfully. Data type: {type(data)}")
        except Exception as e:
            logger.error(f"Error loading dataset: {e}")
            raise

        try:
            logger.info("Setting up sliding window...")
            # Convert datetime to epoch timestamp
            background_t_epoch = stream_job.timestamp_split_start.timestamp()
            setting_window = recnexteval.settings.SlidingWindowSetting(
                background_t=background_t_epoch,
                window_size=stream_job.window_size,
                top_K=stream_job.top_k,
            )
            logger.info("Splitting data...")
            setting_window.split(data)
            logger.info("Window setup completed")
        except Exception as e:
            logger.error(f"Error setting up window: {e}")
            raise

        try:
            logger.info("Building evaluator pipeline...")
            builder = recnexteval.evaluators.EvaluatorPipelineBuilder()
            builder.add_setting(setting_window)
            builder.set_metric_K(stream_job.top_k)

            for metric_name in stream_job.metrics:
                logger.info(f"Adding metric: {metric_name}")
                builder.add_metric(metric_name)

            for sa in stream_job.stream_algorithms:
                logger.info(f"Adding algorithm: {sa.algorithm_name}")
                algorithm_cls = ALGORITHM_REGISTRY.get(sa.algorithm_name)
                if not algorithm_cls:
                    logger.error(f"Algorithm {sa.algorithm_name} not found in recnexteval registry")
                    continue
                params = json.loads(sa.parameters) if sa.parameters else {}
                logger.info(f"Algorithm params: {params}")
                builder.add_algorithm(algorithm=algorithm_cls, params=params, algo_uuid=sa.algorithm_uuid)
            evaluator = builder.build()
            logger.info("Evaluator built successfully")
        except Exception as e:
            logger.error(f"Error building evaluator: {e}")
            raise

        try:
            logger.info("Running evaluator...")
            evaluator.run()
            logger.info("Evaluator run completed successfully")

            # Save evaluation results
            logger.info("Saving evaluation results...")
            save_evaluation_results(db, evaluator, stream_job_id)
            logger.info("Evaluation results saved successfully")
        except Exception as e:
            logger.error(f"Error during evaluator.run(): {e}")
            logger.error(f"Full traceback:\n{traceback.format_exc()}")
            raise

        stream_job.completed_at = datetime.now(timezone.utc)
        db.commit()
        logger.info(f"Evaluation completed for stream job {stream_job_id}")
    except Exception as e:
        logger.error(f"Error running evaluation for stream job {stream_job_id}: {e}")
        logger.error(f"Full traceback:\n{traceback.format_exc()}")
        stream_job.completed_at = datetime.now(timezone.utc)
        stream_job.error_message = str(e)
        db.commit()
    finally:
        db.close()

