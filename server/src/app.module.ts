import { Module } from "@nestjs/common";
import { ScreeningModule } from "./modules/screening/screening.module";
import { StorageModule } from "./modules/storage/storage.module";

@Module({
  imports: [ScreeningModule, StorageModule],
})
export class AppModule {}
