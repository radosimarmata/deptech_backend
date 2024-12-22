import { JwtModule } from '@nestjs/jwt';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Gender } from './entities/gender.entity';
import { GenderSeeder } from './seeder/gender.seeder';
import { Admin } from './entities/admin.entitiy';
import { AdminService } from './admin/admin.service';
import { AdminController } from './admin/admin.controller'
import { Employee } from './entities/employee.entity';
import { EmployeeModule } from './employee/employee.module';
import { LeaveRequest } from './entities/leave-request.entity';
import { LeaveRequestService } from './leave-request/leave-request.service';
import { LeaveRequestController } from './leave-request/leave-request.controller';
import { JwtStrategy } from './auth/jwt.strategy';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env'
    }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRATION },
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT, 10),
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      entities: [Gender,Admin, Employee, LeaveRequest],
      synchronize: true
    }),
    TypeOrmModule.forFeature([Gender, Admin, Employee, LeaveRequest]),
    EmployeeModule
  ],
  controllers: [AppController, AdminController, LeaveRequestController],
  providers: [AppService, AdminService, GenderSeeder, LeaveRequestService, JwtStrategy],
})
export class AppModule {}
