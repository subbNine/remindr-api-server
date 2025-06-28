import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";

export interface HealthCheckResult {
  status: "ok" | "error";
  timestamp: string;
  uptime: number;
  environment: string;
  version: string;
  database?: {
    status: "connected" | "disconnected";
    responseTime?: number;
  };
}

@Injectable()
export class HealthService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource
  ) {}

  async check(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    let dbStatus: "connected" | "disconnected" = "disconnected";
    let responseTime: number | undefined;

    try {
      // Test database connection
      await this.dataSource.query("SELECT 1");
      dbStatus = "connected";
      responseTime = Date.now() - startTime;
    } catch (error) {
      dbStatus = "disconnected";
    }

    return {
      status: dbStatus === "connected" ? "ok" : "error",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
      version: process.env.npm_package_version || "1.0.0",
      database: {
        status: dbStatus,
        responseTime,
      },
    };
  }

  async ready(): Promise<HealthCheckResult> {
    // Readiness check - includes database connectivity
    return this.check();
  }

  async live(): Promise<{ status: "ok"; timestamp: string }> {
    // Liveness check - just basic app status
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
    };
  }
}
