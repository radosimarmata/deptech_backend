import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from '../entities/employee.entity';
import { EmployeeService } from './employee.service';
import { EmployeeController } from './employee.controller';
import { Gender } from 'src/entities/gender.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Employee, Gender])],
  providers: [EmployeeService],
  controllers: [EmployeeController],
})
export class EmployeeModule {}
