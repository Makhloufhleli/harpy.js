import { JsxRender } from "@hepta-solutions/harpy-core";
import { Controller, Get } from "@nestjs/common";
import { DashboardService } from "./dashboard.service";
import DashboardPage, { type DashboardPageProps } from "./views/dashboard-page";
import AnalyticsPage from "./views/analytics-page";
import DashboardLayout from "../../layouts/dashboard-layout";

@Controller("dashboard")
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @JsxRender(DashboardPage, {
    layout: DashboardLayout,
    meta: {
      title: "Dashboard - Harpy App",
      description: "Your dashboard overview",
    },
  })
  dashboard(): DashboardPageProps {
    return {
      stats: this.dashboardService.getStats(),
    };
  }

  @Get("analytics")
  @JsxRender(AnalyticsPage, {
    layout: DashboardLayout,
    meta: {
      title: "Analytics - Dashboard",
      description: "View your analytics data",
    },
  })
  analytics() {
    return {};
  }
}
