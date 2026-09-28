import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { ScreeningService } from "./screening.service";
import { CreateScreeningTaskDto } from "./dto/create-screening.dto";

@Controller("api/v1/screening")
export class ScreeningController {
  constructor(private readonly screeningService: ScreeningService) {}

  @Post("task")
  @HttpCode(HttpStatus.ACCEPTED)
  async createTask(@Body() dto: CreateScreeningTaskDto) {
    return this.screeningService.createScreeningTask(dto);
  }

  @Get("session/:id")
  async getSession(@Param("id") id: string) {
    return this.screeningService.getScreeningSession(id);
  }

  @Get("recent")
  async listRecent() {
    return this.screeningService.listRecentSessions();
  }
}
