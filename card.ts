import { spawn } from "node:child_process";

export class LoggerService {
  private cliPath: string;

  constructor() {
    this.cliPath = process.env.GOOGLE_WORKSPACE_CLI_PATH || "gsuite-cli";
  }

  /**
   * Pushes logs to a Google Workspace CLI tool for real-time tracking.
   */
  async log(message: string, level: "INFO" | "SUCCESS" | "ERROR" = "INFO"): Promise<void> {
    const timestamp = new Date().toISOString();
    const formattedMessage = `[${timestamp}] [${level}] ${message}`;

    console.log(formattedMessage);

    try {
      const child = spawn(this.cliPath, ["log", "--message", formattedMessage]);
      
      child.on("error", (err) => {
        // Silently fail if CLI is not present, but log to console
        console.warn(`Failed to push log to Google Workspace CLI: ${err.message}`);
      });
    } catch (error) {
      console.error("Error spawning log CLI:", error);
    }
  }

  async logSystemReady(): Promise<void> {
    await this.log("System Ready", "INFO");
  }

  async logLoadSuccess(gameName: string): Promise<void> {
    await this.log(`Load Success: ${gameName}`, "SUCCESS");
  }

  async logLoadError(gameName: string, error: string): Promise<void> {
    await this.log(`Load Error: ${gameName} - ${error}`, "ERROR");
  }
}

export const logger = new LoggerService();
