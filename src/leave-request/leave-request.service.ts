import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeaveRequest } from '../entities/leave-request.entity';
import { Employee } from '../entities/employee.entity';
import { CreateLeaveRequestDto } from 'src/dtos/create-leave-request.dto';
import { UpdateLeaveRequestDto } from 'src/dtos/update-leave-request.dto';
import { HttpException, HttpStatus } from '@nestjs/common';

@Injectable()
export class LeaveRequestService {
  constructor(
    @InjectRepository(LeaveRequest)
    private leaveRequestRepository: Repository<LeaveRequest>,
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
  ) {}

  async createLeaveRequest(data: CreateLeaveRequestDto): Promise<LeaveRequest> {
    const { employeeId, startDate, endDate } = data;

    const employee = await this.employeeRepository.findOne({ where: { id: employeeId } });
    if (!employee) {
      throw new HttpException('Employee not found', HttpStatus.NOT_FOUND);
    }

    const yearStart = new Date(new Date(startDate).getFullYear(), 0, 1);
    const yearEnd = new Date(new Date(startDate).getFullYear(), 11, 31);
    const totalLeaveInYear = await this.leaveRequestRepository
      .createQueryBuilder('leave')
      .where('leave.employeeId = :employeeId', { employeeId })
      .andWhere('leave.startDate BETWEEN :yearStart AND :yearEnd', {
        yearStart,
        yearEnd,
      })
      .getCount();

    const requestedDays = (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 3600 * 24) + 1;

    if (requestedDays > 1) {
      throw new HttpException('You can only take 1 leave day at a time', HttpStatus.BAD_REQUEST);
    }

    if (totalLeaveInYear + requestedDays > 12) {
      throw new HttpException('Maximum leave days exceeded in a year', HttpStatus.BAD_REQUEST);
    }

    const existingLeaveInMonth = await this.leaveRequestRepository
      .createQueryBuilder('leave')
      .where('leave.employeeId = :employeeId', { employeeId })
      .andWhere('MONTH(leave.startDate) = MONTH(:startDate)', { startDate })
      .getCount();

    if (existingLeaveInMonth > 0) {
      throw new HttpException('You can only take 1 leave per month', HttpStatus.BAD_REQUEST);
    }

    const leaveRequest = this.leaveRequestRepository.create({ ...data, employee });
    return await this.leaveRequestRepository.save(leaveRequest);
  }

  async getAllLeaveRequests(): Promise<LeaveRequest[]> {
    return this.leaveRequestRepository.find({ relations: ['employee'] });
  }

  async getLeaveRequestById(id: number): Promise<LeaveRequest> {
    const leaveRequest = await this.leaveRequestRepository.findOne({ where: { id }, relations: ['employee'] });
    if (!leaveRequest) {
      throw new HttpException('Leave request not found', HttpStatus.NOT_FOUND);
    }
    return leaveRequest;
  }

  async getLeaveRequestByEmployeeId(employeeId: number): Promise<LeaveRequest[]> {
    const leaveRequests = await this.leaveRequestRepository.find({ 
      where: { employee: { id: employeeId } },
      relations: ['employee'] 
    });
  
    if (!leaveRequests || leaveRequests.length === 0) {
      throw new HttpException('No leave requests found for this employee', HttpStatus.NOT_FOUND);
    }
  
    return leaveRequests;
  }
  

  async updateLeaveRequest(id: number, data: UpdateLeaveRequestDto): Promise<LeaveRequest> {
    const leaveRequest = await this.leaveRequestRepository.findOne({ where: { id } });
    if (!leaveRequest) {
      throw new HttpException('Leave request not found', HttpStatus.NOT_FOUND);
    }

    await this.leaveRequestRepository.update(id, data);
    return this.leaveRequestRepository.findOne({ where: { id } });
  }

  async deleteLeaveRequest(id: number): Promise<void> {
    const leaveRequest = await this.leaveRequestRepository.findOne({ where: { id } });
    if (!leaveRequest) {
      throw new HttpException('Leave request not found', HttpStatus.NOT_FOUND);
    }

    await this.leaveRequestRepository.delete(id);
  }
}
