import { Router } from "express";
import { AuthRoutes } from "../module/auth/auth.route";
import { UserRoutes } from "../module/user/user.route";
import { AgentRoutes } from "../module/agent/agent.route";
import { PropertyRoutes } from "../module/property/property.route";
import { FavoriteRoutes } from "../module/favorite/favorite.route";
import { InquiryRoutes } from "../module/inquiry/inquiry.route";
import { ViewingRoutes } from "../module/viewing/viewing.route";
import { ReviewRoutes } from "../module/review/review.route";
import { BookingRoutes } from "../module/booking/booking.route";
import { PaymentRoutes } from "../module/payment/payment.route";
import { NotificationRoutes } from "../module/notification/notification.route";
import { ContactRoutes } from "../module/contact/contact.route";
import { NewsletterRoutes } from "../module/newsletter/newsletter.route";
import { BlogRoutes } from "../module/blog/blog.route";
import { DashboardRoutes } from "../module/dashboard/dashboard.route";

const router = Router();

const moduleRoutes = [
  { path: "/auth", route: AuthRoutes },
  { path: "/users", route: UserRoutes },
  { path: "/agents", route: AgentRoutes },
  { path: "/properties", route: PropertyRoutes },
  { path: "/favorites", route: FavoriteRoutes },
  { path: "/inquiries", route: InquiryRoutes },
  { path: "/viewings", route: ViewingRoutes },
  { path: "/reviews", route: ReviewRoutes },
  { path: "/bookings", route: BookingRoutes },
  { path: "/payments", route: PaymentRoutes },
  { path: "/notifications", route: NotificationRoutes },
  { path: "/contacts", route: ContactRoutes },
  { path: "/newsletter", route: NewsletterRoutes },
  { path: "/blogs", route: BlogRoutes },
  { path: "/dashboard", route: DashboardRoutes },
];

for (const { path, route } of moduleRoutes) {
  router.use(path, route);
}

export default router;
