/**
 * Coforma Integration
 *
 * Self-contained integration with Coforma Studio's CAB API.
 * No external npm dependencies - Cotiza owns this code completely.
 */

export {
  CoformaClient,
  CoformaConfig,
  CoformaError,
  getCoformaClient,
  createCoformaClient,
} from './client';

export type {
  FeedbackType,
  FeedbackStatus,
  FeedbackPriority,
  Feedback,
  SubmitFeedbackParams,
  ProductFeedbackSummary,
  RoadmapItem,
} from './types';
