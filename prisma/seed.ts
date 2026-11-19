/**
 * Seeds the database with realistic demo data.
 *   npm run seed                (development)
 *   npm run seed -- --force     (required when NODE_ENV=production; this WIPES all data)
 */
import bcrypt from "bcrypt";
import {
  BookingStatus,
  NotificationType,
  PaymentStatus,
  PropertyType,
  ReviewTarget,
  Role,
} from "../src/generated/prisma/enums";
import { config } from "../src/app/config";
import { prisma } from "../src/app/lib/prisma";
import { BLOG_POSTS } from "./seed-data/blogs";
import {
  AGENT_REVIEWS,
  CONTACT_MESSAGES,
  DEALS,
  FAVORITES,
  INQUIRIES,
  NEWSLETTER_EMAILS,
  PROPERTY_REVIEWS,
  UNPAID_BOOKINGS,
  VIEWINGS,
} from "./seed-data/engagement";
import { IMAGES, TImage } from "./seed-data/images";
import { AGENTS, SEED_PASSWORD, USERS } from "./seed-data/people";
import { ISeedProperty, PROPERTIES } from "./seed-data/properties";

const DAY = 24 * 60 * 60 * 1000;
const DHAKA_UTC_OFFSET = 6;

const daysAgo = (days: number, hour = 12) => {
  const date = new Date(Date.now() - days * DAY);
  date.setUTCHours(hour - DHAKA_UTC_OFFSET, 0, 0, 0);
  return date;
};

const inDays = (days: number, hour = 12) => daysAgo(-days, hour);

const slugify = (text: string) =>
  text.toLowerCase().replace(/[^\w\s-]/g, "").trim().replace(/[\s_-]+/g, "-").slice(0, 80);

const log = (message: string) => process.stdout.write(`${message}\n`);

// ---------- image picking: every listing gets a distinct cover ----------

const counters: Record<string, number> = {};
const take = (group: TImage[], name: string) => {
  const index = counters[name] ?? 0;
  counters[name] = index + 1;
  return group[index % group.length];
};

const pickImages = (property: ISeedProperty): TImage[] => {
  switch (property.type) {
    case PropertyType.APARTMENT:
      return [
        take(IMAGES.apartmentExterior, "apt"),
        take(IMAGES.livingRoom, "living"),
        take(IMAGES.bedroom, "bed"),
        take(IMAGES.kitchen, "kitchen"),
        take(IMAGES.bathroom, "bath"),
      ];
    case PropertyType.HOUSE:
      return [
        take(IMAGES.houseExterior, "house"),
        take(IMAGES.livingRoom, "living"),
        take(IMAGES.bedroom, "bed"),
        take(IMAGES.bathroom, "bath"),
      ];
    case PropertyType.LAND:
      return [take(IMAGES.land, "land"), take(IMAGES.land, "land")];
    default:
      return property.retail
        ? [take(IMAGES.retail, "retail"), take(IMAGES.office, "office")]
        : [take(IMAGES.office, "office"), take(IMAGES.office, "office"), take(IMAGES.office, "office")];
  }
};

// ---------- helpers ----------

const requireEnv = (value: string | undefined, name: string) => {
  if (!value) throw new Error(`${name} is missing in .env`);
  return value;
};

const clearDatabase = async () => {
  await prisma.$transaction([
    prisma.notification.deleteMany(),
    prisma.inquiryReply.deleteMany(),
    prisma.inquiry.deleteMany(),
    prisma.viewing.deleteMany(),
    prisma.review.deleteMany(),
    prisma.favorite.deleteMany(),
    prisma.payment.deleteMany(),
    prisma.booking.deleteMany(),
    prisma.propertyImage.deleteMany(),
    prisma.property.deleteMany(),
    prisma.blogPost.deleteMany(),
    prisma.refreshToken.deleteMany(),
    prisma.agentProfile.deleteMany(),
    prisma.user.deleteMany(),
    prisma.contactMessage.deleteMany(),
    prisma.newsletterSubscriber.deleteMany(),
  ]);
};

const main = async () => {
  if (config.node_env === "production" && !process.argv.includes("--force")) {
    throw new Error("Refusing to wipe a production database. Re-run with: npm run seed -- --force");
  }

  const saltRounds = Number(config.bcrypt_salt_rounds);
  const seedPasswordHash = await bcrypt.hash(SEED_PASSWORD, saltRounds);

  log("Clearing existing data...");
  await clearDatabase();

  // ---------- users ----------
  log("Creating accounts...");

  const admin = await prisma.user.create({
    data: {
      name: requireEnv(config.demo_admin_name, "DEMO_ADMIN_NAME"),
      email: requireEnv(config.demo_admin_email, "DEMO_ADMIN_EMAIL"),
      password: await bcrypt.hash(requireEnv(config.demo_admin_password, "DEMO_ADMIN_PASSWORD"), saltRounds),
      role: Role.ADMIN,
      phone: "01700000001",
      createdAt: daysAgo(365),
    },
  });

  const agentIds: Record<string, string> = {};
  for (const agent of AGENTS) {
    const isDemo = agent.key === "demo";
    const created = await prisma.user.create({
      data: {
        name: isDemo ? requireEnv(config.demo_agent_name, "DEMO_AGENT_NAME") : agent.name,
        email: isDemo ? requireEnv(config.demo_agent_email, "DEMO_AGENT_EMAIL") : agent.email,
        password: isDemo
          ? await bcrypt.hash(requireEnv(config.demo_agent_password, "DEMO_AGENT_PASSWORD"), saltRounds)
          : seedPasswordHash,
        phone: agent.phone,
        role: Role.AGENT,
        createdAt: daysAgo(agent.joinedDaysAgo),
        lastLoginAt: daysAgo(1),
        agentProfile: {
          create: {
            agencyName: agent.agencyName,
            licenseNumber: agent.licenseNumber,
            bio: agent.bio,
            experienceYears: agent.experienceYears,
            serviceAreas: agent.serviceAreas,
            isVerified: agent.isVerified,
          },
        },
      },
    });
    agentIds[agent.key] = created.id;
  }

  const userIds: Record<string, string> = {};
  for (const user of USERS) {
    const isDemo = user.key === "demo";
    const created = await prisma.user.create({
      data: {
        name: isDemo ? requireEnv(config.demo_user_name, "DEMO_USER_NAME") : user.name,
        email: isDemo ? requireEnv(config.demo_user_email, "DEMO_USER_EMAIL") : user.email,
        password: isDemo
          ? await bcrypt.hash(requireEnv(config.demo_user_password, "DEMO_USER_PASSWORD"), saltRounds)
          : seedPasswordHash,
        phone: user.phone,
        role: Role.USER,
        createdAt: daysAgo(user.joinedDaysAgo),
        lastLoginAt: daysAgo(Math.min(user.joinedDaysAgo, 3)),
      },
    });
    userIds[user.key] = created.id;
  }

  // ---------- properties ----------
  log("Creating properties...");

  const properties: Record<string, { id: string; agentId: string; title: string; bookingFee: number }> = {};
  for (const property of PROPERTIES) {
    const { key, agent, createdDaysAgo, retail: _retail, ...data } = property;
    const images = pickImages(property);

    const created = await prisma.property.create({
      data: {
        ...data,
        slug: `${slugify(property.title)}-${key.slice(0, 6)}`,
        agentId: agentIds[agent],
        createdAt: daysAgo(createdDaysAgo, 10),
        images: {
          create: images.map((image, index) => ({
            url: image.url,
            publicId: image.publicId,
            isCover: index === 0,
            sortOrder: index,
          })),
        },
      },
    });

    properties[key] = {
      id: created.id,
      agentId: created.agentId,
      title: created.title,
      bookingFee: property.bookingFee,
    };
  }

  // ---------- bookings & payments ----------
  log("Creating bookings and payments...");

  for (const [index, deal] of DEALS.entries()) {
    const property = properties[deal.property];
    const paidAt = daysAgo(deal.paidDaysAgo, 15);

    await prisma.booking.create({
      data: {
        propertyId: property.id,
        userId: userIds[deal.user],
        agentId: property.agentId,
        amount: property.bookingFee,
        status: BookingStatus.CONFIRMED,
        confirmedAt: paidAt,
        createdAt: new Date(paidAt.getTime() - 20 * 60 * 1000),
        payments: {
          create: {
            transactionId: `PAY-${paidAt.getTime()}-${1000 + index}`,
            userId: userIds[deal.user],
            amount: property.bookingFee,
            status: PaymentStatus.SUCCESS,
            gatewayPaymentId: `TR0011SEED${String(index).padStart(4, "0")}`,
            gatewayTrxId: deal.trxID,
            paidAt,
            createdAt: new Date(paidAt.getTime() - 5 * 60 * 1000),
          },
        },
      },
    });
  }

  for (const [index, unpaid] of UNPAID_BOOKINGS.entries()) {
    const property = properties[unpaid.property];
    const createdAt = daysAgo(unpaid.daysAgo, 13);

    await prisma.booking.create({
      data: {
        propertyId: property.id,
        userId: userIds[unpaid.user],
        agentId: property.agentId,
        amount: property.bookingFee,
        status: BookingStatus.CANCELLED,
        cancelledAt: new Date(createdAt.getTime() + 60 * 60 * 1000),
        createdAt,
        payments: {
          create: {
            transactionId: `PAY-${createdAt.getTime()}-${2000 + index}`,
            userId: userIds[unpaid.user],
            amount: property.bookingFee,
            status: unpaid.paymentStatus,
            gatewayPaymentId: `TR0011SEEDX${String(index).padStart(3, "0")}`,
            createdAt,
          },
        },
      },
    });
  }

  // ---------- viewings ----------
  log("Creating viewings...");

  for (const viewing of VIEWINGS) {
    const property = properties[viewing.property];
    const scheduledAt =
      viewing.inDays !== undefined
        ? inDays(viewing.inDays, viewing.hour)
        : daysAgo(viewing.daysAgo ?? 0, viewing.hour);
    const createdAt =
      viewing.inDays !== undefined ? daysAgo(1, 10) : new Date(scheduledAt.getTime() - 3 * DAY);

    await prisma.viewing.create({
      data: {
        propertyId: property.id,
        userId: userIds[viewing.user],
        agentId: property.agentId,
        scheduledAt,
        status: viewing.status,
        message: viewing.message,
        agentNote: viewing.agentNote,
        cancelReason: viewing.cancelReason,
        cancelledById:
          viewing.cancelledBy === "user"
            ? userIds[viewing.user]
            : viewing.cancelledBy === "agent"
              ? property.agentId
              : undefined,
        createdAt,
      },
    });
  }

  // ---------- inquiries ----------
  log("Creating inquiries...");

  for (const inquiry of INQUIRIES) {
    const property = properties[inquiry.property];
    const createdAt = daysAgo(inquiry.daysAgo, 11);

    await prisma.inquiry.create({
      data: {
        propertyId: property.id,
        userId: userIds[inquiry.user],
        agentId: property.agentId,
        subject: inquiry.subject,
        message: inquiry.message,
        phone: USERS.find((user) => user.key === inquiry.user)?.phone,
        status: inquiry.status,
        createdAt,
        replies: {
          create: (inquiry.replies ?? []).map((reply) => ({
            senderId: reply.from === "agent" ? property.agentId : userIds[inquiry.user],
            message: reply.message,
            createdAt: new Date(createdAt.getTime() + reply.hoursLater * 60 * 60 * 1000),
          })),
        },
      },
    });
  }

  // ---------- reviews ----------
  log("Creating reviews...");

  for (const review of PROPERTY_REVIEWS) {
    await prisma.review.create({
      data: {
        target: ReviewTarget.PROPERTY,
        propertyId: properties[review.property].id,
        userId: userIds[review.user],
        rating: review.rating,
        comment: review.comment,
        createdAt: daysAgo(review.daysAgo, 20),
      },
    });
  }

  for (const review of AGENT_REVIEWS) {
    await prisma.review.create({
      data: {
        target: ReviewTarget.AGENT,
        agentId: agentIds[review.agent],
        userId: userIds[review.user],
        rating: review.rating,
        comment: review.comment,
        createdAt: daysAgo(review.daysAgo, 21),
      },
    });
  }

  // Cache average ratings from the real review rows.
  const propertyStats = await prisma.review.groupBy({
    by: ["propertyId"],
    where: { target: ReviewTarget.PROPERTY },
    _avg: { rating: true },
    _count: { _all: true },
  });
  for (const stat of propertyStats) {
    if (!stat.propertyId) continue;
    await prisma.property.update({
      where: { id: stat.propertyId },
      data: {
        avgRating: Math.round((stat._avg.rating ?? 0) * 10) / 10,
        totalReviews: stat._count._all,
      },
    });
  }

  const agentStats = await prisma.review.groupBy({
    by: ["agentId"],
    where: { target: ReviewTarget.AGENT },
    _avg: { rating: true },
    _count: { _all: true },
  });
  for (const stat of agentStats) {
    if (!stat.agentId) continue;
    await prisma.agentProfile.update({
      where: { userId: stat.agentId },
      data: {
        avgRating: Math.round((stat._avg.rating ?? 0) * 10) / 10,
        totalReviews: stat._count._all,
      },
    });
  }

  // ---------- favorites ----------
  await prisma.favorite.createMany({
    data: Object.entries(FAVORITES).flatMap(([userKey, propertyKeys]) =>
      propertyKeys.map((propertyKey, index) => ({
        userId: userIds[userKey],
        propertyId: properties[propertyKey].id,
        createdAt: daysAgo(index * 4 + 2),
      })),
    ),
  });

  // ---------- notifications for the demo accounts ----------
  log("Creating notifications...");

  const demoAgentId = agentIds.demo;
  const demoUserId = userIds.demo;

  await prisma.notification.createMany({
    data: [
      {
        userId: demoAgentId,
        type: NotificationType.INQUIRY_RECEIVED,
        title: "New inquiry received",
        message: `Arif Chowdhury asked about "${properties["baridhara-duplex"].title}": Interested for an embassy residence`,
        link: "/dashboard/agent/inquiries",
        createdAt: daysAgo(1, 11),
      },
      {
        userId: demoAgentId,
        type: NotificationType.VIEWING_REQUESTED,
        title: "New viewing request",
        message: `Ayesha Siddiqua wants to visit "${properties["banani-furnished-rent"].title}".`,
        link: "/dashboard/agent/viewings",
        createdAt: daysAgo(1, 10),
      },
      {
        userId: demoAgentId,
        type: NotificationType.INQUIRY_RECEIVED,
        title: "New inquiry received",
        message: `Zahid Hossain asked about "${properties["bashundhara-3bed-sale"].title}": Bank loan for this flat`,
        link: "/dashboard/agent/inquiries",
        createdAt: daysAgo(3, 11),
      },
      {
        userId: demoAgentId,
        type: NotificationType.PROPERTY_APPROVAL,
        title: "Your listing needs changes",
        message: `"${properties["baridhara-studio"].title}" was not approved. Reason: Please add photos of the actual unit and the building's trade licence for serviced apartments.`,
        link: "/dashboard/agent/properties",
        isRead: true,
        createdAt: daysAgo(10, 16),
      },
      {
        userId: demoUserId,
        type: NotificationType.INQUIRY_REPLIED,
        title: "New reply from your agent",
        message: `Your agent replied about "${properties["gulshan-lake-apartment"].title}".`,
        link: "/dashboard/user/inquiries",
        createdAt: daysAgo(5, 13),
      },
      {
        userId: demoUserId,
        type: NotificationType.VIEWING_STATUS_CHANGED,
        title: "Viewing confirmed",
        message: `Your viewing for "${properties["gulshan-lake-apartment"].title}" is confirmed.`,
        link: "/dashboard/user/viewings",
        createdAt: daysAgo(1, 9),
      },
      {
        userId: demoUserId,
        type: NotificationType.VIEWING_STATUS_CHANGED,
        title: "Viewing rescheduled",
        message: `Your viewing for "${properties["baridhara-duplex"].title}" was moved to the weekend.`,
        link: "/dashboard/user/viewings",
        createdAt: daysAgo(1, 15),
      },
      {
        userId: demoUserId,
        type: NotificationType.PAYMENT_SUCCESS,
        title: "Payment successful",
        message: `We received your booking fee for "${properties["inani-villa-rent"].title}". Your booking is confirmed.`,
        link: "/dashboard/user/payments",
        isRead: true,
        createdAt: daysAgo(80, 15),
      },
    ],
  });

  // ---------- content ----------
  log("Creating contact messages, newsletter and blog...");

  await prisma.contactMessage.createMany({
    data: CONTACT_MESSAGES.map(({ daysAgo: age, ...message }) => ({
      ...message,
      createdAt: daysAgo(age, 14),
    })),
  });

  await prisma.newsletterSubscriber.createMany({
    data: NEWSLETTER_EMAILS.map(({ email, daysAgo: age }) => ({ email, createdAt: daysAgo(age) })),
  });

  for (const post of BLOG_POSTS) {
    const words = post.content.trim().split(/\s+/).length;
    await prisma.blogPost.create({
      data: {
        title: post.title,
        slug: slugify(post.title),
        excerpt: post.excerpt,
        content: post.content,
        category: post.category,
        coverImageUrl: `https://images.unsplash.com/photo-${post.coverImageId}?w=1600&q=80&auto=format&fit=crop`,
        coverImagePublicId: `external:unsplash-${post.coverImageId}`,
        readingMinutes: Math.max(1, Math.round(words / 200)),
        isPublished: post.isPublished,
        publishedAt: post.isPublished ? daysAgo(post.publishedDaysAgo, 9) : null,
        authorId: admin.id,
        createdAt: daysAgo(post.publishedDaysAgo + 2, 9),
      },
    });
  }

  log("\nSeed completed:");
  log(`  ${AGENTS.length} agents, ${USERS.length} users, 1 admin`);
  log(`  ${PROPERTIES.length} properties, ${DEALS.length + UNPAID_BOOKINGS.length} bookings`);
  log(`  ${VIEWINGS.length} viewings, ${INQUIRIES.length} inquiries`);
  log(`  ${PROPERTY_REVIEWS.length + AGENT_REVIEWS.length} reviews, ${BLOG_POSTS.length} blog posts`);
  log("\nDemo logins:");
  log(`  ADMIN  ${config.demo_admin_email} / ${config.demo_admin_password}`);
  log(`  AGENT  ${config.demo_agent_email} / ${config.demo_agent_password}`);
  log(`  USER   ${config.demo_user_email} / ${config.demo_user_password}`);
  log(`  Other seeded accounts use the password: ${SEED_PASSWORD}`);
};

main()
  .catch((error) => {
    process.stderr.write(`Seed failed: ${error instanceof Error ? error.stack : String(error)}\n`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
