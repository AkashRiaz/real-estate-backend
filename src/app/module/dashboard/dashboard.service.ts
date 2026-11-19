import {
  ApprovalStatus,
  BookingStatus,
  ContactStatus,
  InquiryStatus,
  PaymentStatus,
  PropertyStatus,
  Role,
  ViewingStatus,
} from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { propertyCardSelect, publicPropertyWhere } from "../property/property.utils";
import { IMonthlyRow, chartStartDate, fillMonthlySeries, groupCount } from "./dashboard.utils";

const ACTIVE_VIEWINGS: ViewingStatus[] = [
  ViewingStatus.PENDING,
  ViewingStatus.APPROVED,
  ViewingStatus.RESCHEDULED,
];

const getPublicStats = async () => {
  const [
    availableListings,
    verifiedAgents,
    cities,
    closedDeals,
    happyClients,
    typeGroups,
    topCities,
  ] = await prisma.$transaction([
    prisma.property.count({ where: { ...publicPropertyWhere, status: PropertyStatus.AVAILABLE } }),
    prisma.agentProfile.count({
      where: { isVerified: true, user: { isDeleted: false, status: "ACTIVE" } },
    }),
    prisma.property.groupBy({
      by: ["city"],
      where: publicPropertyWhere,
      orderBy: { city: "asc" },
    }),
    prisma.property.count({
      where: {
        ...publicPropertyWhere,
        status: { in: [PropertyStatus.SOLD, PropertyStatus.RENTED] },
      },
    }),
    prisma.booking.groupBy({
      by: ["userId"],
      where: { status: BookingStatus.CONFIRMED },
      orderBy: { userId: "asc" },
    }),
    prisma.property.groupBy({
      by: ["type"],
      where: publicPropertyWhere,
      orderBy: { type: "asc" },
      _count: { _all: true },
    }),
    prisma.property.groupBy({
      by: ["city"],
      where: publicPropertyWhere,
      orderBy: { _count: { city: "desc" } },
      take: 6,
      _count: { city: true },
    }),
  ]);

  return {
    totals: {
      availableListings,
      verifiedAgents,
      cities: cities.length,
      closedDeals,
      happyClients: happyClients.length,
    },
    propertyTypes: typeGroups.map((group) => ({ type: group.type, count: groupCount(group) })),
    topCities: topCities.map((group) => ({
      city: group.city,
      count: (group._count as { city: number }).city,
    })),
  };
};

const getAdminOverview = async () => {
  const since = chartStartDate();

  const [
    totalUsers,
    totalAgents,
    totalProperties,
    pendingApprovals,
    confirmedBookings,
    revenue,
    totalInquiries,
    openInquiries,
    activeViewings,
    newContactMessages,
    typeGroups,
    approvalGroups,
    bookingGroups,
    recentPendingProperties,
    recentPayments,
  ] = await prisma.$transaction([
    prisma.user.count({ where: { role: Role.USER, isDeleted: false } }),
    prisma.user.count({ where: { role: Role.AGENT, isDeleted: false } }),
    prisma.property.count({ where: { isDeleted: false } }),
    prisma.property.count({ where: { isDeleted: false, approvalStatus: ApprovalStatus.PENDING } }),
    prisma.booking.count({ where: { status: BookingStatus.CONFIRMED } }),
    prisma.payment.aggregate({
      where: { status: PaymentStatus.SUCCESS },
      _sum: { amount: true },
    }),
    prisma.inquiry.count(),
    prisma.inquiry.count({
      where: { status: { in: [InquiryStatus.NEW, InquiryStatus.IN_PROGRESS] } },
    }),
    prisma.viewing.count({
      where: { status: { in: ACTIVE_VIEWINGS }, scheduledAt: { gte: new Date() } },
    }),
    prisma.contactMessage.count({ where: { status: ContactStatus.NEW } }),
    prisma.property.groupBy({
      by: ["type"],
      where: { isDeleted: false },
      orderBy: { type: "asc" },
      _count: { _all: true },
    }),
    prisma.property.groupBy({
      by: ["approvalStatus"],
      where: { isDeleted: false },
      orderBy: { approvalStatus: "asc" },
      _count: { _all: true },
    }),
    prisma.booking.groupBy({
      by: ["status"],
      orderBy: { status: "asc" },
      _count: { _all: true },
    }),
    prisma.property.findMany({
      where: { isDeleted: false, approvalStatus: ApprovalStatus.PENDING },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: propertyCardSelect,
    }),
    prisma.payment.findMany({
      where: { status: PaymentStatus.SUCCESS },
      orderBy: { paidAt: "desc" },
      take: 5,
      select: {
        id: true,
        transactionId: true,
        amount: true,
        paidAt: true,
        user: { select: { name: true } },
        booking: { select: { property: { select: { title: true } } } },
      },
    }),
  ]);

  const [monthlyRevenue, monthlyListings, monthlyUsers] = await Promise.all([
    prisma.$queryRaw<IMonthlyRow[]>`
      SELECT date_trunc('month', "paidAt") AS month, COUNT(*) AS count, SUM(amount) AS total
      FROM payments
      WHERE status = 'SUCCESS' AND "paidAt" >= ${since}
      GROUP BY 1 ORDER BY 1`,
    prisma.$queryRaw<IMonthlyRow[]>`
      SELECT date_trunc('month', "createdAt") AS month, COUNT(*) AS count
      FROM properties
      WHERE "isDeleted" = false AND "createdAt" >= ${since}
      GROUP BY 1 ORDER BY 1`,
    prisma.$queryRaw<IMonthlyRow[]>`
      SELECT date_trunc('month', "createdAt") AS month, COUNT(*) AS count
      FROM users
      WHERE "isDeleted" = false AND role <> 'ADMIN' AND "createdAt" >= ${since}
      GROUP BY 1 ORDER BY 1`,
  ]);

  const usersSeries = fillMonthlySeries(monthlyUsers);

  return {
    totals: {
      totalUsers,
      totalAgents,
      totalProperties,
      pendingApprovals,
      confirmedBookings,
      totalRevenue: Number(revenue._sum.amount ?? 0),
      totalInquiries,
      openInquiries,
      upcomingViewings: activeViewings,
      newContactMessages,
    },
    charts: {
      monthlyRevenue: fillMonthlySeries(monthlyRevenue).map(({ month, label, total, count }) => ({
        month,
        label,
        revenue: total,
        payments: count,
      })),
      monthlyGrowth: fillMonthlySeries(monthlyListings).map(({ month, label, count }, index) => ({
        month,
        label,
        listings: count,
        signups: usersSeries[index].count,
      })),
      propertiesByType: typeGroups.map((group) => ({ name: group.type, value: groupCount(group) })),
      propertiesByApproval: approvalGroups.map((group) => ({
        name: group.approvalStatus,
        value: groupCount(group),
      })),
      bookingsByStatus: bookingGroups.map((group) => ({
        name: group.status,
        value: groupCount(group),
      })),
    },
    recent: {
      pendingProperties: recentPendingProperties,
      payments: recentPayments,
    },
  };
};

const getAgentOverview = async (agentId: string) => {
  const since = chartStartDate();
  const myProperties = { agentId, isDeleted: false };

  const [
    totalListings,
    activeListings,
    pendingApproval,
    closedDeals,
    viewsSum,
    newInquiries,
    upcomingViewings,
    confirmedBookings,
    earnings,
    profile,
    statusGroups,
    topViewed,
    recentInquiries,
  ] = await prisma.$transaction([
    prisma.property.count({ where: myProperties }),
    prisma.property.count({
      where: {
        ...myProperties,
        approvalStatus: ApprovalStatus.APPROVED,
        status: PropertyStatus.AVAILABLE,
      },
    }),
    prisma.property.count({ where: { ...myProperties, approvalStatus: ApprovalStatus.PENDING } }),
    prisma.property.count({
      where: { ...myProperties, status: { in: [PropertyStatus.SOLD, PropertyStatus.RENTED] } },
    }),
    prisma.property.aggregate({ where: myProperties, _sum: { views: true } }),
    prisma.inquiry.count({ where: { agentId, status: InquiryStatus.NEW } }),
    prisma.viewing.count({
      where: { agentId, status: { in: ACTIVE_VIEWINGS }, scheduledAt: { gte: new Date() } },
    }),
    prisma.booking.count({ where: { agentId, status: BookingStatus.CONFIRMED } }),
    prisma.payment.aggregate({
      where: { status: PaymentStatus.SUCCESS, booking: { agentId } },
      _sum: { amount: true },
    }),
    prisma.agentProfile.findUnique({
      where: { userId: agentId },
      select: { avgRating: true, totalReviews: true, isVerified: true },
    }),
    prisma.property.groupBy({
      by: ["status"],
      where: myProperties,
      orderBy: { status: "asc" },
      _count: { _all: true },
    }),
    prisma.property.findMany({
      where: myProperties,
      orderBy: { views: "desc" },
      take: 5,
      select: { id: true, title: true, slug: true, views: true, _count: { select: { inquiries: true, favorites: true } } },
    }),
    prisma.inquiry.findMany({
      where: { agentId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        subject: true,
        status: true,
        createdAt: true,
        user: { select: { name: true, imageUrl: true } },
        property: { select: { title: true, slug: true } },
      },
    }),
  ]);

  const [monthlyInquiries, monthlyViewings, monthlyEarnings] = await Promise.all([
    prisma.$queryRaw<IMonthlyRow[]>`
      SELECT date_trunc('month', "createdAt") AS month, COUNT(*) AS count
      FROM inquiries WHERE "agentId" = ${agentId} AND "createdAt" >= ${since}
      GROUP BY 1 ORDER BY 1`,
    prisma.$queryRaw<IMonthlyRow[]>`
      SELECT date_trunc('month', "createdAt") AS month, COUNT(*) AS count
      FROM viewings WHERE "agentId" = ${agentId} AND "createdAt" >= ${since}
      GROUP BY 1 ORDER BY 1`,
    prisma.$queryRaw<IMonthlyRow[]>`
      SELECT date_trunc('month', p."paidAt") AS month, COUNT(*) AS count, SUM(p.amount) AS total
      FROM payments p JOIN bookings b ON b.id = p."bookingId"
      WHERE p.status = 'SUCCESS' AND b."agentId" = ${agentId} AND p."paidAt" >= ${since}
      GROUP BY 1 ORDER BY 1`,
  ]);

  const viewingSeries = fillMonthlySeries(monthlyViewings);

  return {
    totals: {
      totalListings,
      activeListings,
      pendingApproval,
      closedDeals,
      totalViews: viewsSum._sum.views ?? 0,
      newInquiries,
      upcomingViewings,
      confirmedBookings,
      totalEarnings: Number(earnings._sum.amount ?? 0),
      avgRating: profile?.avgRating ?? 0,
      totalReviews: profile?.totalReviews ?? 0,
      isVerified: profile?.isVerified ?? false,
    },
    charts: {
      listingsByStatus: statusGroups.map((group) => ({
        name: group.status,
        value: groupCount(group),
      })),
      monthlyActivity: fillMonthlySeries(monthlyInquiries).map(({ month, label, count }, index) => ({
        month,
        label,
        inquiries: count,
        viewings: viewingSeries[index].count,
      })),
      monthlyEarnings: fillMonthlySeries(monthlyEarnings).map(({ month, label, total }) => ({
        month,
        label,
        earnings: total,
      })),
      topViewedListings: topViewed.map((property) => ({
        id: property.id,
        title: property.title,
        slug: property.slug,
        views: property.views,
        inquiries: property._count.inquiries,
        favorites: property._count.favorites,
      })),
    },
    recent: { inquiries: recentInquiries },
  };
};

const getUserOverview = async (userId: string) => {
  const since = chartStartDate();

  const [
    favorites,
    totalInquiries,
    openInquiries,
    upcomingViewingsCount,
    confirmedBookings,
    spent,
    viewingGroups,
    inquiryGroups,
    upcomingViewings,
    recentBookings,
  ] = await prisma.$transaction([
    prisma.favorite.count({ where: { userId, property: publicPropertyWhere } }),
    prisma.inquiry.count({ where: { userId } }),
    prisma.inquiry.count({
      where: { userId, status: { in: [InquiryStatus.NEW, InquiryStatus.IN_PROGRESS] } },
    }),
    prisma.viewing.count({
      where: { userId, status: { in: ACTIVE_VIEWINGS }, scheduledAt: { gte: new Date() } },
    }),
    prisma.booking.count({ where: { userId, status: BookingStatus.CONFIRMED } }),
    prisma.payment.aggregate({
      where: { userId, status: PaymentStatus.SUCCESS },
      _sum: { amount: true },
    }),
    prisma.viewing.groupBy({
      by: ["status"],
      where: { userId },
      orderBy: { status: "asc" },
      _count: { _all: true },
    }),
    prisma.inquiry.groupBy({
      by: ["status"],
      where: { userId },
      orderBy: { status: "asc" },
      _count: { _all: true },
    }),
    prisma.viewing.findMany({
      where: { userId, status: { in: ACTIVE_VIEWINGS }, scheduledAt: { gte: new Date() } },
      orderBy: { scheduledAt: "asc" },
      take: 3,
      select: {
        id: true,
        scheduledAt: true,
        status: true,
        property: { select: { title: true, slug: true, area: true, city: true } },
        agent: { select: { name: true, phone: true } },
      },
    }),
    prisma.booking.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: {
        id: true,
        amount: true,
        status: true,
        createdAt: true,
        property: { select: { title: true, slug: true } },
      },
    }),
  ]);

  const monthlySpending = await prisma.$queryRaw<IMonthlyRow[]>`
    SELECT date_trunc('month', "paidAt") AS month, COUNT(*) AS count, SUM(amount) AS total
    FROM payments WHERE "userId" = ${userId} AND status = 'SUCCESS' AND "paidAt" >= ${since}
    GROUP BY 1 ORDER BY 1`;

  return {
    totals: {
      favorites,
      totalInquiries,
      openInquiries,
      upcomingViewings: upcomingViewingsCount,
      confirmedBookings,
      totalSpent: Number(spent._sum.amount ?? 0),
    },
    charts: {
      monthlySpending: fillMonthlySeries(monthlySpending).map(({ month, label, total }) => ({
        month,
        label,
        amount: total,
      })),
      viewingsByStatus: viewingGroups.map((group) => ({
        name: group.status,
        value: groupCount(group),
      })),
      inquiriesByStatus: inquiryGroups.map((group) => ({
        name: group.status,
        value: groupCount(group),
      })),
    },
    recent: { upcomingViewings, bookings: recentBookings },
  };
};

export const DashboardService = {
  getPublicStats,
  getAdminOverview,
  getAgentOverview,
  getUserOverview,
};
