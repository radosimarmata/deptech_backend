import { Controller, Get, Post, Body, Param, Put, Delete, UsePipes, ValidationPipe, UseGuards } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { Employee } from '../entities/employee.entity';
import { CreateEmployeeDto } from 'src/dtos/create-employee.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('employees')
@UseGuards(JwtAuthGuard)
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async createEmployee(@Body() employeeData: CreateEmployeeDto): Promise<Employee> {
    return this.employeeService.createEmployee(employeeData);
  }

  @Get()
  async getAllEmployees(): Promise<Employee[]> {
    return this.employeeService.getAllEmployees();
  }

  @Get(':id')
  async getEmployeeById(@Param('id') id: number): Promise<Employee> {
    return this.employeeService.getEmployeeById(id);
  }

  @Put(':id')
  async updateEmployee(
    @Param('id') id: number,
    @Body() employeeData: Partial<Employee>,
  ): Promise<Employee> {
    return this.employeeService.updateEmployee(id, employeeData);
  }

  @Delete(':id')
  async deleteEmployee(@Param('id') id: number): Promise<void> {
    return this.employeeService.deleteEmployee(id);
  }
}
