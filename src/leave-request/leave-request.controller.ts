import { Controller, Get, Post, Body, Param, Put, Delete, UsePipes, ValidationPipe } from '@nestjs/common';
import { LeaveRequestService } from './leave-request.service';
import { CreateLeaveRequestDto } from 'src/dtos/create-leave-request.dto';
import { UpdateLeaveRequestDto } from 'src/dtos/update-leave-request.dto';
import { LeaveRequest } from '../entities/leave-request.entity';

@Controller('leave-requests')
export class LeaveRequestController {
  constructor(private readonly leaveRequestService: LeaveRequestService) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async createLeaveRequest(@Body() leaveRequestData: CreateLeaveRequestDto): Promise<LeaveRequest> {
    return this.leaveRequestService.createLeaveRequest(leaveRequestData);
  }

  @Get()
  async getAllLeaveRequests(): Promise<LeaveRequest[]> {
    return this.leaveRequestService.getAllLeaveRequests();
  }

  @Get(':id')
  async getLeaveRequestById(@Param('id') id: number): Promise<LeaveRequest> {
    return this.leaveRequestService.getLeaveRequestById(id);
  }

  @Get('employee/:employeeId')
  async getLeaveRequestsByEmployeeId(@Param('employeeId') employeeId: number): Promise<LeaveRequest[]> {
    return this.leaveRequestService.getLeaveRequestByEmployeeId(employeeId);
  }

  @Put(':id')
  async updateLeaveRequest(
    @Param('id') id: number,
    @Body() leaveRequestData: UpdateLeaveRequestDto,
  ): Promise<LeaveRequest> {
    return this.leaveRequestService.updateLeaveRequest(id, leaveRequestData);
  }

  @Delete(':id')
  async deleteLeaveRequest(@Param('id') id: number): Promise<void> {
    return this.leaveRequestService.deleteLeaveRequest(id);
  }
}
