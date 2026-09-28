import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { Logger } from "@nestjs/common";

async function bootstrap() {
  const logger = new Logger("BioControlGateway");
  const app = await NestFactory.create(AppModule);

  // Enable CORS for client Next.js app and Render web environments
  app.enableCors({
    origin: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    credentials: true,
  });

  const port = process.env.PORT || 4000;
  await app.listen(port, "0.0.0.0");
  logger.log(`BioControl Gateway running on port ${port}`);
}

bootstrap();
