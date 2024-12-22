import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from '../entities/employee.entity';
import { Gender } from '../entities/gender.entity';
import { CreateEmployeeDto } from '../dtos/create-employee.dto';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
    @InjectRepository(Gender)
    private genderRepository: Repository<Gender>,
  ) {}


  async createEmployee(data: CreateEmployeeDto): Promise<Employee> {
    try {
      const gender = await this.genderRepository.findOne({ where: { id: data.genderId } });
      if (!gender) {
        throw new NotFoundException('Gender not found');
      }

      const existingEmail = await this.employeeRepository.findOne({ where: { email: data.email } });
      if (existingEmail) {
        throw new HttpException('Email already exists', HttpStatus.CONFLICT);
      }

      const existingPhoneNumber = await this.employeeRepository.findOne({ where: { phoneNumber: data.phoneNumber } });
      if (existingPhoneNumber) {
        throw new HttpException('Phone number already exists', HttpStatus.CONFLICT);
      }

      const existingName = await this.employeeRepository.findOne({
        where: { firstName: data.firstName, lastName: data.lastName },
      });
      if (existingName) {
        throw new HttpException('Employee with this name already exists', HttpStatus.CONFLICT);
      }
      const employee = this.employeeRepository.create({
        ...data,
        gender,
      });
      return await this.employeeRepository.save(employee);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'An unexpected error occurred while creating employee',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAllEmployees(): Promise<Employee[]> {
    try {
      return this.employeeRepository.find();
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve employees',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getEmployeeById(id: number): Promise<Employee> {
    try {
      const employee = await this.employeeRepository.findOne({ where: { id } });
      if (!employee) {
        throw new HttpException('Employee not found', HttpStatus.NOT_FOUND);
      }
      return employee;
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve employee',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateEmployee(id: number, data: Partial<Employee>, genderId?: number): Promise<Employee> {
    try {
      const employee = await this.getEmployeeById(id)
      employee.firstName = data.firstName || employee.firstName;
      employee.lastName = data.lastName || employee.lastName;
      employee.address = data.address || employee.address;
      employee.email = data.email || employee.email;
      employee.phoneNumber = data.phoneNumber || employee.phoneNumber;

      if (genderId) {
        const genderEntity = await this.genderRepository.findOne({ where: { id: genderId } });
        if (!genderEntity) {
          throw new Error('Invalid gender ID');
        }
        employee.gender = genderEntity;
      }

      if (data.email && data.email !== employee.email) {
        const existingEmail = await this.employeeRepository.findOne({ where: { email: data.email } });
        if (existingEmail) {
          throw new HttpException('Email already exists', HttpStatus.CONFLICT);
        }
        employee.email = data.email;
      }

      if (data.phoneNumber && data.phoneNumber !== employee.phoneNumber) {
        const existingphoneNumber = await this.employeeRepository.findOne({ where: { phoneNumber: data.phoneNumber } });
        if (existingphoneNumber) {
          throw new HttpException('Phone number already exists', HttpStatus.CONFLICT);
        }
        employee.phoneNumber = data.phoneNumber;
      }

      if((data.firstName && data.firstName !== employee.firstName) || 
      (data.lastName && data.lastName !== employee.lastName)){
        const existingName = await this.employeeRepository.findOne({
          where: { firstName: data.firstName, lastName: data.lastName },
        });
        if (existingName) {
          throw new HttpException('Employee with this name already exists', HttpStatus.CONFLICT);
        }
        employee.firstName = data.firstName;
        employee.lastName = data.lastName;
      }
      return this.employeeRepository.save(employee);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to update employee',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteEmployee(id: number): Promise<void> {
    try {
      const result = await this.employeeRepository.delete(id);
      if (result.affected === 0) {
        throw new HttpException('Employee not found', HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to delete employee',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
