import { Module } from "@nestjs/common";
import { ScreeningController } from "./screening.controller";
import { ScreeningService } from "./screening.service";
import { StorageModule } from "../storage/storage.module";

@Module({
  imports: [StorageModule],
  controllers: [ScreeningController],
  providers: [ScreeningService],
  exports: [ScreeningService],
})
export class ScreeningModule {}
