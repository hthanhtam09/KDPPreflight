import { ObjectId, type Document, type Filter } from 'mongodb';
import {
  getFeedbackCollection,
  getFeatureFeedbackCollection,
  getPageViewsCollection,
} from '@/lib/mongodb';

export type FeatureStatus = 'new' | 'reviewing' | 'planned' | 'done' | 'ignored';
export const FEATURE_STATUSES: FeatureStatus[] = ['new', 'reviewing', 'planned', 'done', 'ignored'];

const DAY_MS = 24 * 60 * 60 * 1000;

function serializeDoc<T extends { _id?: unknown; createdAt?: unknown }>(doc: T) {
  return {
    ...doc,
    _id: String(doc._id),
    createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : String(doc.createdAt ?? ''),
  };
}

function searchRegex(search?: string) {
  const trimmed = search?.trim();
  return trimmed ? new RegExp(trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') : undefined;
}

export async function getAdminSummary() {
  const [feedback, featureFeedback, pageViews] = await Promise.all([
    getFeedbackCollection(),
    getFeatureFeedbackCollection(),
    getPageViewsCollection(),
  ]);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    totalPageViews,
    pageViewsToday,
    uniqueVisitorsToday,
    helpfulCounts,
    totalFeedbackMessages,
    openFeatureRequests,
    bugReports,
    topPages,
    recentFeedback,
    recentFeatureRequests,
    viewsByDay,
  ] = await Promise.all([
    pageViews.countDocuments(),
    pageViews.countDocuments({ createdAt: { $gte: today } }),
    pageViews.distinct('ipHash', { createdAt: { $gte: today }, ipHash: { $type: 'string' } }),
    feedback
      .aggregate<{ _id: string; count: number }>([
        { $group: { _id: '$type', count: { $sum: 1 } } },
      ])
      .toArray(),
    feedback.countDocuments({ message: { $exists: true, $nin: ['', null] } }),
    featureFeedback.countDocuments({ category: 'feature_request', status: { $nin: ['done', 'ignored'] } }),
    featureFeedback.countDocuments({ category: 'bug' }),
    pageViews
      .aggregate<{ _id: string; views: number; uniques: number }>([
        { $group: { _id: '$path', views: { $sum: 1 }, uniques: { $addToSet: '$ipHash' } } },
        { $project: { views: 1, uniques: { $size: '$uniques' } } },
        { $sort: { views: -1 } },
        { $limit: 8 },
      ])
      .toArray(),
    feedback.find().sort({ createdAt: -1 }).limit(6).toArray(),
    featureFeedback.find().sort({ createdAt: -1 }).limit(6).toArray(),
    pageViews
      .aggregate<{ _id: string; views: number }>([
        { $match: { createdAt: { $gte: new Date(Date.now() - 13 * DAY_MS) } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, views: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ])
      .toArray(),
  ]);

  const yes = helpfulCounts.find((item) => item._id === 'helpful_yes')?.count ?? 0;
  const no = helpfulCounts.find((item) => item._id === 'helpful_no')?.count ?? 0;
  const totalHelpfulVotes = yes + no;

  return {
    metrics: {
      totalPageViews,
      pageViewsToday,
      uniqueVisitorsToday: uniqueVisitorsToday.length,
      totalHelpfulVotes,
      helpfulRate: totalHelpfulVotes ? Math.round((yes / totalHelpfulVotes) * 100) : 0,
      totalFeedbackMessages,
      openFeatureRequests,
      bugReports,
    },
    helpfulCounts: { yes, no },
    topPages,
    recentFeedback: recentFeedback.map(serializeDoc),
    recentFeatureRequests: recentFeatureRequests.map(serializeDoc),
    viewsByDay: viewsByDay.map((item) => ({ date: item._id, views: item.views })),
  };
}

export async function getFeedbackList(params: {
  type?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}) {
  const collection = await getFeedbackCollection();
  const page = Math.max(params.page ?? 1, 1);
  const pageSize = Math.min(Math.max(params.pageSize ?? 20, 1), 100);
  const filter: Filter<Document> = {};
  const regex = searchRegex(params.search);

  if (params.type === 'helpful_yes' || params.type === 'helpful_no') filter.type = params.type;
  if (params.type === 'with_message') filter.message = { $exists: true, $nin: ['', null] };
  if (regex) filter.$or = [{ pageTitle: regex }, { message: regex }, { pageSlug: regex }];

  const [items, total] = await Promise.all([
    collection.find(filter).sort({ createdAt: -1 }).skip((page - 1) * pageSize).limit(pageSize).toArray(),
    collection.countDocuments(filter),
  ]);

  return { items: items.map(serializeDoc), total, page, pageSize, pages: Math.max(Math.ceil(total / pageSize), 1) };
}

export async function getFeatureFeedbackList(params: {
  category?: string;
  search?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}) {
  const collection = await getFeatureFeedbackCollection();
  const page = Math.max(params.page ?? 1, 1);
  const pageSize = Math.min(Math.max(params.pageSize ?? 20, 1), 100);
  const filter: Filter<Document> = {};
  const regex = searchRegex(params.search);

  if (['bug', 'feature_request', 'confusing_ux', 'other'].includes(params.category ?? '')) {
    filter.category = params.category;
  }
  if (FEATURE_STATUSES.includes(params.status as FeatureStatus)) filter.status = params.status;
  if (regex) filter.$or = [{ message: regex }, { email: regex }, { url: regex }];

  const [items, total] = await Promise.all([
    collection.find(filter).sort({ createdAt: -1 }).skip((page - 1) * pageSize).limit(pageSize).toArray(),
    collection.countDocuments(filter),
  ]);

  return {
    items: items.map((item) => serializeDoc({ status: 'new', ...item })),
    total,
    page,
    pageSize,
    pages: Math.max(Math.ceil(total / pageSize), 1),
  };
}

export async function updateFeatureFeedbackStatus(id: string, status: FeatureStatus) {
  if (!ObjectId.isValid(id)) return false;
  const collection = await getFeatureFeedbackCollection();
  const result = await collection.updateOne(
    { _id: new ObjectId(id) },
    { $set: { status, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
  );
  return result.matchedCount > 0;
}

export async function getAnalyticsOverview() {
  const pageViews = await getPageViewsCollection();
  const since = new Date(Date.now() - 29 * DAY_MS);
  const [viewsByDay, topPages, referrers, recentVisits] = await Promise.all([
    pageViews
      .aggregate<{ _id: string; views: number; uniques: string[] }>([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, views: { $sum: 1 }, uniques: { $addToSet: '$ipHash' } } },
        { $sort: { _id: 1 } },
      ])
      .toArray(),
    pageViews.aggregate<{ _id: string; views: number }>([
      { $group: { _id: '$path', views: { $sum: 1 } } },
      { $sort: { views: -1 } },
      { $limit: 20 },
    ]).toArray(),
    pageViews.aggregate<{ _id: string; views: number }>([
      { $match: { referrer: { $exists: true, $nin: ['', null] } } },
      { $group: { _id: '$referrer', views: { $sum: 1 } } },
      { $sort: { views: -1 } },
      { $limit: 20 },
    ]).toArray(),
    pageViews.find().sort({ createdAt: -1 }).limit(30).toArray(),
  ]);

  return {
    viewsByDay: viewsByDay.map((item) => ({ date: item._id, views: item.views, uniques: item.uniques.filter(Boolean).length })),
    topPages: topPages.map((item) => ({ path: item._id, views: item.views })),
    referrers: referrers.map((item) => ({ referrer: item._id, views: item.views })),
    recentVisits: recentVisits.map(serializeDoc),
  };
}

export async function getFeedbackExportRows() {
  const collection = await getFeedbackCollection();
  return collection.find().sort({ createdAt: -1 }).map((item) => ({
    id: String(item._id),
    type: item.type,
    pageSlug: item.pageSlug,
    pageTitle: item.pageTitle,
    message: item.message ?? '',
    url: item.url,
    ipHash: item.ipHash ?? '',
    createdAt: item.createdAt instanceof Date ? item.createdAt.toISOString() : item.createdAt,
  })).toArray();
}

export async function getFeatureFeedbackExportRows() {
  const collection = await getFeatureFeedbackCollection();
  return collection.find().sort({ createdAt: -1 }).map((item) => ({
    id: String(item._id),
    category: item.category,
    status: item.status ?? 'new',
    message: item.message,
    email: item.email ?? '',
    url: item.url,
    ipHash: item.ipHash ?? '',
    createdAt: item.createdAt instanceof Date ? item.createdAt.toISOString() : item.createdAt,
  })).toArray();
}

export async function ensureAdminIndexes() {
  const [feedback, featureFeedback, pageViews] = await Promise.all([
    getFeedbackCollection(),
    getFeatureFeedbackCollection(),
    getPageViewsCollection(),
  ]);

  await Promise.all([
    feedback.createIndex({ createdAt: -1 }),
    feedback.createIndex({ type: 1 }),
    feedback.createIndex({ pageSlug: 1 }),
    featureFeedback.createIndex({ createdAt: -1 }),
    featureFeedback.createIndex({ category: 1 }),
    featureFeedback.createIndex({ status: 1 }),
    pageViews.createIndex({ createdAt: -1 }),
    pageViews.createIndex({ path: 1 }),
    pageViews.createIndex({ ipHash: 1 }),
    pageViews.createIndex({ path: 1, createdAt: -1 }),
  ]);
}
