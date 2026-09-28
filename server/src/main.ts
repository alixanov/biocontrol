import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { Logger } from "@nestjs/common";

async function bootstrap() {
  const logger = new Logger("BioControlGateway");
  const app = await NestFactory.create(AppModule);

  // Enable CORS for client Next.js app
  app.enableCors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    credentials: true,
  });

  const port = process.env.PORT || 4000;
  await app.listen(port);
  logger.log(`BioControl Gateway running on: http://localhost:${port}/api/v1/screening`);
}

bootstrap();
